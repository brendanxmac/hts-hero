import {
  Classification,
  ClassificationRecord,
  ClassificationStatus,
  Importer,
} from "../interfaces/hts";
import apiClient from "./api";
import jsPDF from "jspdf";
import { getElementWithTariffDataFromClassification } from "./hts";
import { fetchUser, UserProfile } from "./supabase/user";
import { fetchTeamLogo, fetchUserLogo } from "./supabase/storage";
import { fetchTeam, Team } from "./supabase/teams";

const formatHtsNumber = (htsno: string | undefined | null): string => {
  return htsno?.trim() || "-";
};

export const createClassification = async (
  classification: Classification
): Promise<ClassificationRecord> => {
  const classificationRecord = await apiClient.post<
    Classification,
    ClassificationRecord
  >("/classification/create", {
    classification,
  });

  return classificationRecord;
};

export const updateClassification = async (
  id: string,
  classification?: Classification,
  importer_id?: string,
  classifier_id?: string,
  status?: ClassificationStatus,
  country_of_origin?: string
) => {
  const response = await apiClient.post("/classification/update", {
    id,
    classification,
    importer_id,
    classifier_id,
    status,
    country_of_origin,
  });

  return response.data;
};

export const fetchClassifications = async (): Promise<
  ClassificationRecord[]
> => {
  const classifications: ClassificationRecord[] = await apiClient.get(
    "/classification/fetch"
  );

  return classifications;
};

export const deleteClassification = async (id: string): Promise<void> => {
  await apiClient.post("/classification/delete", { id });
};

const getImageFormatFromFilename = (filename: string): string => {
  const extension = filename.split(".").pop();

  if (extension === "png") {
    return "PNG";
  } else if (extension === "jpg" || extension === "jpeg") {
    return "JPEG";
  }

  return "PNG";
};

const getCompanyLogo = async (
  userProfile: UserProfile,
  team?: Team
): Promise<{ logoUrl: string; logoFormat: string }> => {
  if (userProfile.team_id) {
    const team = await fetchTeam(userProfile.team_id);
    if (team && team.logo) {
      const companyLogo = await fetchTeamLogo(team.id);
      const companyLogoFormat = getImageFormatFromFilename(team.logo);
      return { logoUrl: companyLogo.signedUrl, logoFormat: companyLogoFormat };
    }
  } else {
    const companyLogo = await fetchUserLogo();
    const companyLogoFormat = getImageFormatFromFilename(
      userProfile.company_logo || ""
    );
    return { logoUrl: companyLogo.signedUrl, logoFormat: companyLogoFormat };
  }
};

export const generateClassificationReport = async (
  classificationRecord: ClassificationRecord,
  userProfile: UserProfile,
  importer?: Importer
): Promise<jsPDF> => {
  const { classification, user_id } = classificationRecord;
  const team = userProfile.team_id
    ? await fetchTeam(userProfile.team_id)
    : undefined;

  const elementWithTariffData =
    getElementWithTariffDataFromClassification(classification);

  // Initialize PDF document with professional settings
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - 2 * margin;

  // Typography constants for consistency
  const fonts = {
    title: { size: 20, weight: "bold" },
    header: { size: 16, weight: "bold" },
    subheader: { size: 12, weight: "bold" },
    body: { size: 10, weight: "normal" },
    caption: { size: 8, weight: "normal" },
    htsCode: { size: 18, weight: "bold" }, // Larger HTS code
    htsCodeLabel: { size: 14, weight: "bold" },
  };

  // Color scheme
  const colors = {
    primary: [0, 0, 0], // Black
    secondary: [100, 100, 100], // Dark gray
    accent: [248, 249, 250], // Light gray background
    border: [200, 200, 200], // Light border
  };

  let yPosition = margin;

  // Helper function to set typography
  const setTypography = (fontConfig: typeof fonts.title) => {
    doc.setFont("helvetica", fontConfig.weight as any);
    doc.setFontSize(fontConfig.size);
  };

  // Helper function to set text color
  const setTextColor = (color: number[]) => {
    doc.setTextColor(color[0], color[1], color[2]);
  };

  // Add company logo with proper error handling and improved sizing
  try {
    const logo = new Image();
    // if user is part of a team, use the teams logo
    const { logoUrl, logoFormat } = await getCompanyLogo(userProfile, team);
    logo.src = logoUrl || "/pdf-report-default-logo.png";

    await new Promise<void>((resolve, reject) => {
      logo.onload = () => resolve();
      logo.onerror = () => reject(new Error("Logo failed to load"));
    });

    // Cap height at 80px and ensure proper centering regardless of dimensions
    const logoMaxHeight = 80;
    const logoMaxWidth = pageWidth * 0.8; // Allow more width for wide logos
    const aspectRatio = logo.width / logo.height;

    let logoWidth = logoMaxHeight * aspectRatio;
    let logoHeight = logoMaxHeight;

    // If the logo would be too wide, scale it down proportionally
    if (logoWidth > logoMaxWidth) {
      logoWidth = logoMaxWidth;
      logoHeight = logoMaxWidth / aspectRatio;
    }

    // Center the logo horizontally
    const logoX = (pageWidth - logoWidth) / 2;

    doc.addImage(
      logo,
      logoFormat || "PNG",
      logoX,
      yPosition - 20,
      logoWidth,
      logoHeight,
      undefined,
      "FAST"
    );

    yPosition += logoHeight + 10; // More space after logo
  } catch (error) {
    console.warn("Logo could not be loaded, continuing without logo");
    yPosition += 20;
  }

  // Main document title with improved spacing
  setTypography(fonts.title);
  setTextColor(colors.primary);
  const title = "HTS Classification Advisory";
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(title, titleX, yPosition);
  yPosition += 12;
  // Document metadata with better spacing
  const now = new Date();
  setTypography(fonts.caption);
  setTextColor(colors.secondary);
  const dateText = `Generated ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`;
  const dateTextWidth = doc.getTextWidth(dateText);
  const dateTextX = (pageWidth - dateTextWidth) / 2;
  doc.text(dateText, dateTextX, yPosition);
  yPosition += 10;

  // Decorative line under title
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // Client and Advisory provider information side by side with enhanced styling
  const boxHeight = 80;
  const padding = 15;

  // Determine layout based on whether importer is defined
  const hasImporter = !!importer;
  const columnWidth = hasImporter ? (contentWidth - 20) / 2 : contentWidth; // Half width with gap if importer exists, full width otherwise
  const leftColumnX = margin;
  const rightColumnX = hasImporter ? margin + columnWidth + 20 : margin; // 20pt gap between columns if importer exists

  // Importer/Client section (left column) - only show if importer is defined
  if (importer) {
    // Draw background box for Advisory Provided To
    doc.setFillColor(248, 250, 252); // Very light blue-gray (same as item box)
    doc.setDrawColor(226, 232, 240); // Light border
    doc.setLineWidth(1);
    doc.roundedRect(leftColumnX, yPosition, columnWidth, boxHeight, 6, 6, "FD");

    // Section header
    setTypography({ size: 12, weight: "bold" });
    setTextColor([30, 41, 59]); // Dark slate
    doc.text("ADVISORY PROVIDED TO", leftColumnX + padding, yPosition + 18);

    // Client name
    setTypography({ size: 10, weight: "normal" });
    setTextColor([51, 65, 85]); // Slate gray
    doc.text(importer.name, leftColumnX + padding, yPosition + 35);
  }

  // Get the classifiers name & email
  const classifier =
    userProfile.id === user_id ? userProfile : await fetchUser(user_id);

  // Advisory provider information (right column if importer exists, full width otherwise)
  // Draw background box for Advisory Provided By
  doc.setFillColor(248, 250, 252); // Very light blue-gray (same as item box)
  doc.setDrawColor(226, 232, 240); // Light border
  doc.setLineWidth(1);
  doc.roundedRect(rightColumnX, yPosition, columnWidth, boxHeight, 6, 6, "FD");

  // Section header
  setTypography({ size: 12, weight: "bold" });
  setTextColor([30, 41, 59]); // Dark slate
  doc.text("ADVISORY PROVIDED BY", rightColumnX + padding, yPosition + 18);

  let textY = yPosition + 35;

  // Classifier name
  setTypography({ size: 10, weight: "normal" });
  setTextColor([51, 65, 85]); // Slate gray
  doc.text(classifier.name, rightColumnX + padding, textY);
  textY += 12;

  if (classifier.email) {
    doc.text(classifier.email, rightColumnX + padding, textY);
    textY += 12;
  }

  const address = team ? team.address || "" : userProfile.company_address || "";
  if (address) {
    const addressLines = doc.splitTextToSize(
      address,
      columnWidth - padding * 2
    );
    doc.text(addressLines, rightColumnX + padding, textY);
  }

  yPosition += boxHeight + 20; // Move down after both boxes

  // === MAIN CLASSIFICATION SECTION ===
  // Item to Classify section with enhanced visual design
  const sectionPadding = 15;
  const clssifierBoxPadding = 20;

  // Item Description Box
  const itemBoxHeight = 60;

  // Draw background box for item description
  doc.setFillColor(248, 250, 252); // Very light blue-gray (same as advisory sections)
  doc.setDrawColor(226, 232, 240); // Light border (same as advisory sections)
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, itemBoxHeight, 6, 6, "FD");

  // Item section header
  setTypography({ size: 12, weight: "bold" });
  setTextColor([30, 41, 59]); // Dark slate (same as advisory sections)
  doc.text("ITEM TO CLASSIFY", margin + clssifierBoxPadding, yPosition + 20);

  // Item description
  setTypography({ size: 11, weight: "normal" });
  setTextColor([51, 65, 85]); // Slate gray
  const itemDescLines = doc.splitTextToSize(
    classification.articleDescription,
    contentWidth - clssifierBoxPadding * 2
  );
  doc.text(itemDescLines, margin + clssifierBoxPadding, yPosition + 38);

  yPosition += itemBoxHeight + sectionPadding;

  const finalLevel =
    classification.levels[classification.levels.length - 1].selection;

  if (finalLevel) {
    // === HTS CODE SECTION ===
    const htsBoxHeight = 85;

    // Draw prominent background box for HTS code
    doc.setFillColor(239, 246, 255); // Light blue
    doc.setDrawColor(147, 197, 253); // Blue border
    doc.setLineWidth(2);
    doc.roundedRect(margin, yPosition, contentWidth, htsBoxHeight, 8, 8, "FD");

    // HTS section header
    setTypography({ size: 12, weight: "bold" });
    setTextColor([30, 58, 138]); // Dark blue
    doc.text(
      "SUGGESTED CLASSIFICATION",
      margin + clssifierBoxPadding,
      yPosition + 22
    );

    // HTS Code - large and prominent, left-aligned
    setTypography({ size: 24, weight: "bold" });
    setTextColor([30, 58, 138]); // Dark blue
    const htsCodeText = formatHtsNumber(finalLevel.htsno);
    doc.text(htsCodeText, margin + clssifierBoxPadding, yPosition + 60);

    // HTS description if available
    // if (finalLevel.description) {
    //   setTypography({ size: 9, weight: "normal" });
    //   setTextColor([51, 65, 85]);
    //   const htsDescLines = doc.splitTextToSize(
    //     finalLevel.description,
    //     contentWidth - boxPadding * 2
    //   );
    //   doc.text(htsDescLines, margin + boxPadding, yPosition + 72);
    // }

    yPosition += htsBoxHeight + sectionPadding;
  }

  // === ADVISORY NOTES SECTION ===

  // Calculate dynamic height based on notes content
  setTypography({ size: 10, weight: "normal" }); // Set font for measurement
  const notesLines = doc.splitTextToSize(
    classification.notes || "No additional notes provided.",
    contentWidth - clssifierBoxPadding * 2
  );
  const notesBoxHeight = Math.max(80, notesLines.length * 12 + 45);

  // Check if we need to split the BASIS FOR CLASSIFICATION section
  const remainingPageSpace = pageHeight - yPosition - 60; // 60pt margin for footer
  const lineHeight = 12;
  const headerSpace = 45; // Space needed for header and padding
  const maxLinesOnCurrentPage = Math.floor(
    (remainingPageSpace - headerSpace) / lineHeight
  );

  if (notesLines.length > maxLinesOnCurrentPage && maxLinesOnCurrentPage > 3) {
    // Split content: some on current page, rest on next page
    const firstPageLines = notesLines.slice(0, maxLinesOnCurrentPage);
    const secondPageLines = notesLines.slice(maxLinesOnCurrentPage);

    // First section on current page
    const firstBoxHeight = Math.max(
      80,
      firstPageLines.length * lineHeight + headerSpace
    );

    // Draw background box for first section
    doc.setFillColor(239, 246, 255); // Light blue
    doc.setDrawColor(147, 197, 253); // Blue border
    doc.setLineWidth(1.5);
    doc.roundedRect(
      margin,
      yPosition,
      contentWidth,
      firstBoxHeight,
      6,
      6,
      "FD"
    );

    // First section header
    setTypography({ size: 12, weight: "bold" });
    setTextColor([30, 58, 138]); // Dark blue
    doc.text(
      "BASIS FOR CLASSIFICATION",
      margin + clssifierBoxPadding,
      yPosition + 22
    );

    // First section content
    setTypography({ size: 10, weight: "normal" });
    setTextColor([51, 65, 85]); // Slate gray
    doc.text(firstPageLines, margin + clssifierBoxPadding, yPosition + 42);

    // Move to next page for second section
    doc.addPage();
    yPosition = margin;

    // Second section on new page
    const secondBoxHeight = Math.max(
      80,
      secondPageLines.length * lineHeight + headerSpace
    );

    // Draw background box for second section
    doc.setFillColor(239, 246, 255); // Light blue
    doc.setDrawColor(147, 197, 253); // Blue border
    doc.setLineWidth(1.5);
    doc.roundedRect(
      margin,
      yPosition,
      contentWidth,
      secondBoxHeight,
      6,
      6,
      "FD"
    );

    // Second section header with (continued) suffix
    setTypography({ size: 14, weight: "bold" });
    setTextColor([30, 58, 138]); // Dark blue
    doc.text(
      "BASIS FOR CLASSIFICATION (continued)",
      margin + clssifierBoxPadding,
      yPosition + 22
    );

    // Second section content
    setTypography({ size: 10, weight: "normal" });
    setTextColor([51, 65, 85]); // Slate gray
    doc.text(secondPageLines, margin + clssifierBoxPadding, yPosition + 42);

    yPosition += secondBoxHeight + 30;
  } else {
    // Fits on current page or move entire section to next page
    if (notesBoxHeight > remainingPageSpace) {
      // Move entire section to next page
      doc.addPage();
      yPosition = margin;
    }

    // Draw background box for advisory notes
    doc.setFillColor(239, 246, 255); // Light blue
    doc.setDrawColor(147, 197, 253); // Blue border
    doc.setLineWidth(1.5);
    doc.roundedRect(
      margin,
      yPosition,
      contentWidth,
      notesBoxHeight,
      6,
      6,
      "FD"
    );

    // Notes section header
    setTypography({ size: 14, weight: "bold" });
    setTextColor([30, 58, 138]); // Dark blue
    doc.text(
      "BASIS FOR CLASSIFICATION",
      margin + clssifierBoxPadding,
      yPosition + 22
    );

    // Advisory notes content
    setTypography({ size: 10, weight: "normal" });
    setTextColor([51, 65, 85]); // Slate gray
    doc.text(notesLines, margin + clssifierBoxPadding, yPosition + 42);

    yPosition += notesBoxHeight + 30;
  }

  // Classification breakdown on new page
  doc.addPage();
  yPosition = margin;

  // Page header
  setTypography(fonts.title);
  setTextColor(colors.primary);
  const breakdownTitle = "Classification Breakdown";
  const breakdownTitleWidth = doc.getTextWidth(breakdownTitle);
  const breakdownTitleX = (pageWidth - breakdownTitleWidth) / 2;
  doc.text(breakdownTitle, breakdownTitleX, yPosition);
  yPosition += 10;

  // Decorative line
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;

  classification.levels.forEach((level) => {
    const description = level.selection?.description;
    const htsno = level.selection?.htsno;

    if (description) {
      // Check if we need a page break
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;

        // Add continuation header
        setTypography(fonts.header);
        setTextColor(colors.primary);
        doc.text("Classification Breakdown (continued)", margin, yPosition);
        yPosition += 30;
      }

      // DEBUG: Let's see the actual values
      // A4 page width is 595.28pt, with 40pt margins on each side = 515.28pt content width
      // We want to use almost all of this width for text

      const horizontalPadding = 10; // Nice comfortable padding from edges
      const verticalPadding = 10; // Nice comfortable padding from top/bottom
      const availableTextWidth = contentWidth - 2 * horizontalPadding;

      // Use the full available width for text wrapping
      setTypography(fonts.body); // Set typography BEFORE splitTextToSize
      const descLines = doc.splitTextToSize(description, availableTextWidth);
      const lineHeight = 12;
      const boxHeight = htsno
        ? descLines.length * lineHeight + 2 * verticalPadding + 15 // Extra space for HTS code
        : descLines.length * lineHeight + 2 * verticalPadding;

      // Draw the background box with rounded corners and thicker border
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(1.5);
      doc.roundedRect(margin, yPosition, contentWidth, boxHeight, 6, 6, "FD");

      // Position text with comfortable padding from edges
      const textX = margin + horizontalPadding;
      const textY = yPosition + verticalPadding;

      if (htsno) {
        // HTS code
        setTypography(fonts.subheader);
        setTextColor(colors.primary);
        doc.text(htsno, textX, textY + 10);

        // Description - using nearly full width
        setTypography(fonts.body);
        setTextColor(colors.primary);
        doc.text(descLines, textX, textY + 22);
      } else {
        // Description only - using nearly full width
        setTypography(fonts.body);
        setTextColor(colors.primary);
        doc.text(descLines, textX, textY + 10);
      }

      yPosition += boxHeight + 15;
    }
  });

  // Add disclaimer if provided
  if (userProfile.company_disclaimer) {
    // Add new page
    doc.addPage();
    yPosition = margin;

    // Disclaimer section
    setTypography(fonts.body);
    setTextColor(colors.primary);
    doc.text("Disclaimer:", margin, yPosition);
    yPosition += 10;

    setTypography(fonts.caption);
    setTextColor(colors.secondary);
    const disclaimerLines = doc.splitTextToSize(
      userProfile.company_disclaimer,
      contentWidth
    );
    doc.text(disclaimerLines, margin, yPosition);
  }

  // Add page numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    setTypography(fonts.caption);
    setTextColor(colors.secondary);

    // Page number at bottom center
    const pageText = `Page ${i} of ${totalPages}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    const pageTextX = (pageWidth - pageTextWidth) / 2;
    doc.text(pageText, pageTextX, pageHeight - 20);
  }

  return doc;
};
