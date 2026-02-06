import {
  ClassificationI,
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

/**
 * Sanitizes text for jsPDF rendering by replacing Unicode characters
 * that aren't supported in WinAnsiEncoding (jsPDF's default encoding).
 * Without this, characters like em-dashes or box-drawing characters
 * appear as "%" or other garbage.
 */
const sanitizeTextForPdf = (text: string | undefined | null): string => {
  if (!text) return "";

  return (
    text
      // Replace box-drawing characters (U+2500 to U+257F) with standard hyphen
      .replace(/[\u2500-\u257F]/g, "-")
      // Replace various dash types with standard hyphen
      .replace(/[\u2012-\u2015\u2212]/g, "-") // Figure dash, en-dash, em-dash, horizontal bar, minus sign
      // Replace smart/curly quotes with straight quotes
      .replace(/[\u2018\u2019\u201A]/g, "'") // Single quotes
      .replace(/[\u201C\u201D\u201E]/g, '"') // Double quotes
      // Replace ellipsis with three dots
      .replace(/\u2026/g, "...")
      // Replace non-breaking space with regular space
      .replace(/\u00A0/g, " ")
      // Replace bullet point with asterisk
      .replace(/\u2022/g, "*")
      // Replace other common problematic characters
      .replace(/\u2019/g, "'") // Right single quotation mark (apostrophe)
      .replace(/\u00B7/g, "-") // Middle dot
      .replace(/\u2013/g, "-") // En dash (explicit for clarity)
      .replace(/\u2014/g, "-") // Em dash (explicit for clarity)
  );
};

export const createClassification = async (
  classification: ClassificationI,
): Promise<ClassificationRecord> => {
  const classificationRecord = await apiClient.post<
    ClassificationI,
    ClassificationRecord
  >("/classification/create", {
    classification,
  });

  return classificationRecord;
};

export const updateClassification = async (
  id: string,
  classification?: ClassificationI,
  importer_id?: string,
  classifier_id?: string,
  status?: ClassificationStatus,
  country_of_origin?: string,
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
    "/classification/fetch",
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
  team?: Team,
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
      userProfile.company_logo || "",
    );
    return { logoUrl: companyLogo.signedUrl, logoFormat: companyLogoFormat };
  }
};

export const generateClassificationReport = async (
  classificationRecord: ClassificationRecord,
  userProfile: UserProfile,
  importer?: Importer,
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
      "FAST",
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
    doc.text(sanitizeTextForPdf(importer.name), leftColumnX + padding, yPosition + 35);
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
  doc.text(sanitizeTextForPdf(classifier.name), rightColumnX + padding, textY);
  textY += 12;

  if (classifier.email) {
    doc.text(sanitizeTextForPdf(classifier.email), rightColumnX + padding, textY);
    textY += 12;
  }

  const address = team ? team.address || "" : userProfile.company_address || "";
  if (address) {
    const addressLines = doc.splitTextToSize(
      sanitizeTextForPdf(address),
      columnWidth - padding * 2,
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
    sanitizeTextForPdf(classification.articleDescription),
    contentWidth - clssifierBoxPadding * 2,
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
      yPosition + 22,
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

  // === BASIS FOR CLASSIFICATION SECTION ===

  // Calculate dynamic height based on notes content
  setTypography({ size: 10, weight: "normal" }); // Set font for measurement
  const notesLines: string[] = doc.splitTextToSize(
    sanitizeTextForPdf(classification.notes) || "No additional notes provided.",
    contentWidth - clssifierBoxPadding * 2,
  );

  const lineHeight = 12;
  const headerSpace = 45; // Space needed for header and padding
  const footerMargin = 60; // Margin for footer at bottom of page

  let remainingLines = [...notesLines];
  let isFirstSection = true;

  while (remainingLines.length > 0) {
    // Calculate available space on current page
    const availableHeight = pageHeight - yPosition - footerMargin;
    const maxLinesOnPage = Math.floor(
      (availableHeight - headerSpace) / lineHeight,
    );

    // If we can't fit at least a few lines, move to next page
    if (maxLinesOnPage < 3) {
      doc.addPage();
      yPosition = margin;
      continue;
    }

    // Determine how many lines to render on this page
    const linesToRender = remainingLines.slice(0, maxLinesOnPage);
    remainingLines = remainingLines.slice(maxLinesOnPage);

    // Calculate box height for this section
    const sectionBoxHeight = Math.max(
      80,
      linesToRender.length * lineHeight + headerSpace,
    );

    // Draw background box
    doc.setFillColor(239, 246, 255); // Light blue
    doc.setDrawColor(147, 197, 253); // Blue border
    doc.setLineWidth(1.5);
    doc.roundedRect(
      margin,
      yPosition,
      contentWidth,
      sectionBoxHeight,
      6,
      6,
      "FD",
    );

    // Section header
    setTypography({ size: 14, weight: "bold" });
    setTextColor([30, 58, 138]); // Dark blue
    const headerText = isFirstSection
      ? "BASIS FOR CLASSIFICATION"
      : "BASIS FOR CLASSIFICATION (continued)";
    doc.text(headerText, margin + clssifierBoxPadding, yPosition + 22);

    // Section content
    setTypography({ size: 10, weight: "normal" });
    setTextColor([51, 65, 85]); // Slate gray
    doc.text(linesToRender, margin + clssifierBoxPadding, yPosition + 42);

    yPosition += sectionBoxHeight + 30;
    isFirstSection = false;

    // If there are more lines, add a new page
    if (remainingLines.length > 0) {
      doc.addPage();
      yPosition = margin;
    }
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
      const descLines = doc.splitTextToSize(sanitizeTextForPdf(description), availableTextWidth);
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
        doc.text(sanitizeTextForPdf(htsno), textX, textY + 10);

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
      sanitizeTextForPdf(userProfile.company_disclaimer),
      contentWidth,
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
