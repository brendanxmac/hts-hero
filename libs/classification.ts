import {
  Classification,
  ClassificationRecord,
  Classifier,
  Importer,
} from "../interfaces/hts";
import apiClient from "./api";
import jsPDF from "jspdf";
import { getElementWithTariffDataFromClassification } from "./hts";
import { UserProfile } from "./supabase/user";
import { fetchLogo } from "./supabase/storage";

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
  classifier_id?: string
) => {
  const response = await apiClient.post("/classification/update", {
    id,
    classification,
    importer_id,
    classifier_id,
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

const getImageFormatFromFilename = (filename: string): string => {
  const extension = filename.split(".").pop();

  if (extension === "png") {
    return "PNG";
  } else if (extension === "jpg" || extension === "jpeg") {
    return "JPEG";
  }

  return "PNG";
};

export const generateClassificationReport = async (
  classification: Classification,
  userProfile: UserProfile,
  importer?: Importer,
  classifier?: Classifier
): Promise<jsPDF> => {
  const elementWithTariffData =
    getElementWithTariffDataFromClassification(classification);
  // 1. Create a new PDF document with proper margins
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // 3. Add HTS Hero logo or users company logo with correct aspect ratio and centered
  const logo = new Image();
  const companyLogo = await fetchLogo();
  const companyLogoFormat = getImageFormatFromFilename(
    userProfile.company_logo || ""
  );
  logo.src = companyLogo.signedUrl || "/pdf-report-default-logo.png";

  // Wait for image to load to get actual dimensions
  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = reject;
  });

  const targetHeight = 40; // Set your desired height here
  const aspectRatio = logo.width / logo.height;
  const logoWidth = targetHeight * aspectRatio;
  const logoHeight = targetHeight;
  const logoX = (pageWidth - logoWidth) / 2; // Center horizontally

  doc.addImage(
    logo,
    companyLogoFormat || "PNG",
    logoX,
    10,
    logoWidth,
    logoHeight,
    undefined,
    "FAST"
  ); // Add quality parameter

  // 4. Add a classification Details header
  let yPosition = logoHeight + margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Import Classification Advisory", margin, yPosition); // TODO: consider adding "& Tariff"
  yPosition += 6;

  // 2. Add date/time header
  const now = new Date();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
    margin,
    yPosition
  );
  yPosition += 10;

  // Add importer, if it exists
  if (importer) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Importer/Client:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(importer.name, margin, yPosition);
    yPosition += 10;
  }

  // Add classifier, if it exists
  if (classifier) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Advisory Opinion Provided By:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(classifier.name, margin, yPosition);
    yPosition += 5;
    doc.text(userProfile.email, margin, yPosition);
    yPosition += 5;
    doc.text(userProfile.company_address, margin, yPosition);
    yPosition += 10;
  }

  // Add item description section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Item Description:", margin, yPosition);
  yPosition += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const descriptionLines = doc.splitTextToSize(
    classification.articleDescription,
    contentWidth
  );
  doc.text(descriptionLines, margin, yPosition);
  yPosition += descriptionLines.length * 6;

  // 6. Add final HTS Code and Tariff Data section
  yPosition += 5;

  const finalLevel =
    classification.levels[classification.levels.length - 1].selection;

  if (finalLevel) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    // HTS Code
    doc.setFont("helvetica", "bold");
    doc.text("HTS Code:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    doc.text(formatHtsNumber(finalLevel.htsno), margin, yPosition);
    yPosition += 10;

    // Tariff Data
    // if (elementWithTariffData.general) {
    //   doc.setFont("helvetica", "bold");
    //   doc.text("General Tariff:", margin, yPosition);
    //   yPosition += 5;
    //   doc.setFont("helvetica", "normal");
    //   const generalLines = doc.splitTextToSize(
    //     elementWithTariffData.general,
    //     contentWidth
    //   );
    //   doc.text(generalLines, margin, yPosition);
    //   yPosition += generalLines.length * 6 + 5;
    // }

    // if (elementWithTariffData.special) {
    //   doc.setFont("helvetica", "bold");
    //   doc.text("Special Tariff:", margin, yPosition);
    //   yPosition += 5;
    //   doc.setFont("helvetica", "normal");
    //   const specialLines = doc.splitTextToSize(
    //     elementWithTariffData.special,
    //     contentWidth
    //   );
    //   doc.text(specialLines, margin, yPosition);
    //   yPosition += specialLines.length * 6 + 5;
    // }

    // if (elementWithTariffData.other) {
    //   doc.setFont("helvetica", "bold");
    //   doc.text("Other Tariff:", margin, yPosition);
    //   yPosition += 5;
    //   doc.setFont("helvetica", "normal");
    //   const otherLines = doc.splitTextToSize(
    //     elementWithTariffData.other,
    //     contentWidth
    //   );
    //   doc.text(otherLines, margin, yPosition);
    //   yPosition += otherLines.length * 6 + 5;
    // }
  }

  doc.setFont("helvetica", "bold");
  doc.text("Advisor Notes:", margin, yPosition);
  yPosition += 6;
  doc.setFont("helvetica", "normal");
  const notesLines = doc.splitTextToSize(classification.notes, contentWidth);
  doc.text(notesLines, margin, yPosition);
  yPosition += notesLines.length * 6 + 15;

  // Show Classification - Professional Design
  doc.addPage();
  yPosition = margin;

  // Enhanced Classification Header with decorative line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0); // Black color
  doc.text("Classification Breakdown", margin, yPosition);
  yPosition += 4;

  // Add decorative line under header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 6;

  classification.levels.forEach((level, index) => {
    const description = level.selection?.description;
    const htsno = level.selection?.htsno;

    if (description) {
      // Check if we need a page break
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;

        // Add continuation header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Classification Breakdown (continued)", margin, yPosition);
        yPosition += 12;
      }

      // Calculate background height based on content with consistent padding
      const textWidth = contentWidth - 16; // Account for internal padding
      const tempDescLines = doc.splitTextToSize(description, textWidth);
      const backgroundHeight = htsno
        ? tempDescLines.length * 2.5 + 16 // Extra height for HTS code + padding
        : tempDescLines.length * 2.5 + 12; // Padding for description only

      // Create consistent gray background for every level
      doc.setFillColor(248, 249, 250); // Light gray background for all levels
      doc.rect(margin - 4, yPosition, contentWidth + 8, backgroundHeight, "F");

      if (htsno) {
        // HTS number in prominent display with internal padding
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); // Black color for HTS codes
        doc.text(htsno, margin + 4, yPosition + 8);

        // Description with internal padding
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0); // Black color
        const descLines = doc.splitTextToSize(description, textWidth);
        doc.text(descLines, margin + 4, yPosition + 16);

        // Move to end of this level's content
        yPosition += backgroundHeight;
      } else {
        // For levels without HTS numbers - description only with internal padding
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0); // Black color
        const descLines = doc.splitTextToSize(description, textWidth);
        doc.text(descLines, margin + 4, yPosition + 6);

        // Move to end of this level's content
        yPosition += backgroundHeight;
      }

      // Add consistent spacing between levels
      yPosition += 6;
    }
  });

  // Add a final decorative element
  yPosition += 10;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Add enhanced summary box at the end
  const finalClassificationLevel =
    classification.levels[classification.levels.length - 1].selection;
  if (finalClassificationLevel && finalClassificationLevel.htsno) {
    // Check if we need space for the summary box
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Final Classification Summary Box with shadow effect
    // Shadow effect
    doc.setFillColor(200, 200, 200);
    doc.rect(margin + 2, yPosition + 2, contentWidth, 35, "F");

    // Main box
    doc.setFillColor(248, 249, 250); // Light gray background to match other levels
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.5);
    doc.rect(margin, yPosition, contentWidth, 35, "FD"); // Fill and Draw

    yPosition += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Full 10-digit HTS Code", margin + 12, yPosition);

    yPosition += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(finalClassificationLevel.htsno, margin + 12, yPosition);

    yPosition += 25;
  }

  // doc.addPage();
  // yPosition = margin;

  // 7. Add classification selections section
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(20);
  // doc.text("Classification Selections", margin, yPosition);
  // yPosition += 14;

  // Process each level - show only selections
  // classification.levels.forEach((level, index) => {
  //   // Only show levels that have a selection
  //   if (level.selection) {
  //     // HTS Code (show partial or full code)
  //     doc.setFont("helvetica", "bold");
  //     doc.setFontSize(12);
  //     doc.text(formatHtsNumber(level.selection.htsno), margin, yPosition);
  //     yPosition += 8;

  //     // Description
  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(11);
  //     const descriptionLines = doc.splitTextToSize(
  //       level.selection.description,
  //       contentWidth
  //     );
  //     doc.text(descriptionLines, margin, yPosition);
  //     yPosition += descriptionLines.length * 6 + 12;

  //     // Add subtle visual separation between selections (except for last one)
  //     if (index < classification.levels.length - 1) {
  //       doc.setDrawColor(230, 230, 230);
  //       doc.line(margin, yPosition, pageWidth - margin, yPosition);
  //       yPosition += 12;
  //     }

  //     // Check if we need a page break (if content would exceed page)
  //     if (yPosition > pageHeight - 60) {
  //       doc.addPage();
  //       yPosition = margin;
  //     }
  //   }
  // });

  if (userProfile.company_disclaimer) {
    doc.addPage();
    yPosition = margin;

    // Professional disclaimer header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Disclaimer:", margin, yPosition);
    yPosition += 5;

    // Professional disclaimer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const disclaimerLines = doc.splitTextToSize(
      userProfile.company_disclaimer,
      contentWidth
    );
    doc.text(disclaimerLines, margin, yPosition);
    yPosition += disclaimerLines.length * 5 + 5;
  }

  return doc;
};
