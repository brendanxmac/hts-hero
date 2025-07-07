import { Classification, FetchedClassification } from "../interfaces/hts";
import apiClient from "./api";
import jsPDF from "jspdf";
import { getElementWithTariffDataFromClassification } from "./hts";
import { UserProfile } from "./supabase/user";
import { fetchLogo } from "./supabase/storage";

const formatHtsNumber = (htsno: string | undefined | null): string => {
  return htsno?.trim() || "-";
};

export const createClassification = async (classification: Classification) => {
  const response = await apiClient.post("/classification/create", {
    classification: classification,
  });

  return response.data;
};

export const fetchClassifications = async (): Promise<
  FetchedClassification[]
> => {
  const classifications: FetchedClassification[] = await apiClient.get(
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
  userProfile: UserProfile
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
  logo.src = companyLogo.signedUrl || "/hts-hero-logo-with-text.png";

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
  doc.text("Classification Summary", margin, yPosition);
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

  // 5. Add item description section
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
    if (elementWithTariffData.general) {
      doc.setFont("helvetica", "bold");
      doc.text("General Tariff:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      const generalLines = doc.splitTextToSize(
        elementWithTariffData.general,
        contentWidth
      );
      doc.text(generalLines, margin, yPosition);
      yPosition += generalLines.length * 6 + 5;
    }

    if (elementWithTariffData.special) {
      doc.setFont("helvetica", "bold");
      doc.text("Special Tariff:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      const specialLines = doc.splitTextToSize(
        elementWithTariffData.special,
        contentWidth
      );
      doc.text(specialLines, margin, yPosition);
      yPosition += specialLines.length * 6 + 5;
    }

    if (elementWithTariffData.other) {
      doc.setFont("helvetica", "bold");
      doc.text("Other Tariff:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      const otherLines = doc.splitTextToSize(
        elementWithTariffData.other,
        contentWidth
      );
      doc.text(otherLines, margin, yPosition);
      yPosition += otherLines.length * 6 + 5;
    }
  }

  doc.setFont("helvetica", "bold");
  doc.text("Classifier Notes:", margin, yPosition);
  yPosition += 6;
  doc.setFont("helvetica", "normal");
  const notesLines = doc.splitTextToSize(classification.notes, contentWidth);
  doc.text(notesLines, margin, yPosition);
  yPosition += notesLines.length * 6 + 15;

  // Add progression descriptions
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(12);
  // doc.text("Selections:", margin, yPosition);
  // yPosition += 7;

  // classification.levels.forEach((level, index) => {
  //   const description = level.selection?.description;
  //   const htsno = level.selection?.htsno;
  //   // Add indentation dashes based on level
  //   const indentation = "-".repeat(index + 1);
  //   const prefix = `${indentation} `;
  //   if (description) {
  //     doc.setFont("helvetica", "normal");
  //     doc.setFontSize(10);

  //     if (htsno) {
  //       // Draw the prefix in normal weight
  //       doc.setFont("helvetica", "normal");
  //       doc.text(prefix, margin, yPosition);
  //       const prefixWidth = doc.getTextWidth(prefix);

  //       // Draw the HTS number in bold
  //       doc.setFont("helvetica", "bold");
  //       doc.text(htsno + ": ", margin + prefixWidth, yPosition);
  //       const htsnoWidth = doc.getTextWidth(htsno + ": ");

  //       // Move to next line for description
  //       yPosition += 6;

  //       // Draw the description in normal weight, indented to align with HTS number
  //       doc.setFont("helvetica", "normal");
  //       const descLines = doc.splitTextToSize(
  //         description,
  //         contentWidth - prefixWidth - htsnoWidth
  //       );
  //       doc.text(descLines, margin + prefixWidth, yPosition);
  //       yPosition += descLines.length * 6 + 2;
  //     } else {
  //       // If no HTS number, just draw the description
  //       const descLines = doc.splitTextToSize(
  //         prefix + " " + description,
  //         contentWidth
  //       );
  //       doc.text(descLines, margin, yPosition);
  //       yPosition += descLines.length * 6 + 2;
  //     }
  //   }
  // });

  doc.addPage();
  yPosition = margin;

  // 7. Add classification levels section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Classification Details", margin, yPosition);
  yPosition += 14;

  // Process each level
  classification.levels.forEach((level, index) => {
    // Level header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Level ${index + 1}`, margin, yPosition);
    yPosition += 4;

    // Add visual separation
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Selected Element Section
    if (level.selection) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Selection:", margin, yPosition);

      yPosition += 10;
      doc.setFontSize(12);

      // HTS Code
      doc.setFont("helvetica", "bold");
      doc.text(formatHtsNumber(level.selection.htsno), margin, yPosition);
      yPosition += 6;

      // Description
      doc.setFont("helvetica", "normal");
      const descriptionLines = doc.splitTextToSize(
        level.selection.description,
        contentWidth
      );
      doc.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 6 + 6;

      // Classifier Notes
      if (level.notes) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Classifier Notes:", margin, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        const notesLines = doc.splitTextToSize(level.notes, contentWidth);
        doc.text(notesLines, margin, yPosition);
        yPosition += notesLines.length * 6 + 15;
      }

      // Recommendation Reason
      // if (level.analysisReason) {
      //   doc.setFont("helvetica", "bold");
      //   doc.text("HTS Hero Analysis:", margin, yPosition);
      //   yPosition += 6;
      //   doc.setFont("helvetica", "normal");
      //   const reasonLines = doc.splitTextToSize(
      //     level.analysisReason,
      //     contentWidth
      //   );
      //   doc.text(reasonLines, margin, yPosition);
      //   yPosition += reasonLines.length * 6 + 5;
      // }
    }

    // Other Candidates Section
    if (level.candidates && level.candidates.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Candidates:", margin, yPosition);
      yPosition += 7;

      level.candidates.forEach((candidate) => {
        doc.setFontSize(10);
        doc.text(formatHtsNumber(candidate.htsno), margin, yPosition);
        yPosition += 4;

        if (candidate.htsno === level.selection?.htsno) {
          doc.setTextColor(34, 197, 94);
        } else {
          doc.setTextColor(0, 0, 0);
        }

        // Description
        const candidateLines = doc.splitTextToSize(
          candidate.description,
          contentWidth - 10
        );
        doc.setFont("helvetica", "bold");
        doc.text(candidateLines, margin, yPosition);
        yPosition += candidateLines.length * 6 + 2;
        doc.setTextColor(0, 0, 0);
      });
    }

    // If not last page, add a page break
    if (index < classification.levels.length - 1) {
      doc.addPage();
      yPosition = margin;
    }
  });

  if (userProfile.company_disclaimer) {
    doc.addPage();
    yPosition = margin;

    doc.setFont("helvetica", "bold");
    doc.text("Company Disclaimer:", margin, margin);
    yPosition += 6;
    doc.setFont("helvetica", "normal");
    const disclaimerLines = doc.splitTextToSize(
      userProfile.company_disclaimer,
      contentWidth
    );
    doc.text(disclaimerLines, margin, yPosition);
    yPosition += disclaimerLines.length * 6 + 5;
  }

  return doc;
};
