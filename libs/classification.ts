import { Classification, FetchedClassification } from "../interfaces/hts";
import apiClient from "./api";
import jsPDF from "jspdf";
import {
  getElementWithTariffDataFromClassification,
  getProgressionDescriptions,
} from "./hts";

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

export const generateClassificationReport = async (
  classification: Classification
): Promise<jsPDF> => {
  const elementWithTariffData =
    getElementWithTariffDataFromClassification(classification);
  // 1. Create a new PDF document with proper margins
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // 3. Add HTS Hero logo with correct aspect ratio and centered
  const logo = new Image();
  logo.src = "/hts-hero-logo-with-text.png";
  const logoWidth = 45; // Keep the same display size
  const logoHeight = (logoWidth * 106) / 499; // Use new image dimensions for aspect ratio
  const logoX = (pageWidth - logoWidth) / 2; // Center horizontally
  doc.addImage(
    logo,
    "PNG",
    logoX,
    margin + 5,
    logoWidth,
    logoHeight,
    undefined,
    "FAST"
  ); // Add quality parameter

  // 4. Add a classification Details header
  let yPosition = margin + logoHeight + 20;
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
  doc.text("Item Description", margin, yPosition);
  yPosition += 7;

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
    yPosition += 7;
    doc.setFont("helvetica", "normal");
    doc.text(formatHtsNumber(finalLevel.htsno), margin, yPosition);
    yPosition += 10;

    // Tariff Data
    if (elementWithTariffData.general) {
      doc.setFont("helvetica", "bold");
      doc.text("General Tariff:", margin, yPosition);
      yPosition += 7;
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
      yPosition += 7;
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
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      const otherLines = doc.splitTextToSize(
        elementWithTariffData.other,
        contentWidth
      );
      doc.text(otherLines, margin, yPosition);
      yPosition += otherLines.length * 6 + 5;
    }
  }

  // Add progression descriptions
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Selection Progression:", margin, yPosition);
  yPosition += 7;

  classification.levels.forEach((level, index) => {
    const description = level.selection?.description;
    const htsno = level.selection?.htsno;
    // Add indentation dashes based on level
    const indentation = "-".repeat(index + 1);
    const prefix = `${indentation} `;
    if (description) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      if (htsno) {
        // Draw the prefix in normal weight
        doc.setFont("helvetica", "normal");
        doc.text(prefix, margin, yPosition);
        const prefixWidth = doc.getTextWidth(prefix);

        // Draw the HTS number in bold
        doc.setFont("helvetica", "bold");
        doc.text(htsno + ": ", margin + prefixWidth, yPosition);
        const htsnoWidth = doc.getTextWidth(htsno + ": ");

        // Move to next line for description
        yPosition += 6;

        // Draw the description in normal weight, indented to align with HTS number
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(
          description,
          contentWidth - prefixWidth - htsnoWidth
        );
        doc.text(descLines, margin + prefixWidth, yPosition);
        yPosition += descLines.length * 6 + 2;
      } else {
        // If no HTS number, just draw the description
        const descLines = doc.splitTextToSize(
          prefix + " " + description,
          contentWidth
        );
        doc.text(descLines, margin, yPosition);
        yPosition += descLines.length * 6 + 2;
      }
    }
  });

  doc.addPage();
  yPosition = margin;

  // 7. Add classification levels section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Classification Levels", margin, yPosition);
  yPosition += 14;

  // Process each level
  classification.levels.forEach((level, index) => {
    // Level header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Level ${index + 1}`, margin, yPosition);
    yPosition += 4;

    // Add visual separation
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Selected Element Section
    if (level.selection) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Selected Element:", margin, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      // HTS Code
      doc.setFont("helvetica", "bold");
      doc.text("HTS Code:", margin, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.text(formatHtsNumber(level.selection.htsno), margin, yPosition);
      yPosition += 12;

      // Description
      doc.setFont("helvetica", "bold");
      doc.text("Description:", margin, yPosition);
      yPosition += 6;
      doc.setFont("helvetica", "normal");
      const descriptionLines = doc.splitTextToSize(
        level.selection.description,
        contentWidth
      );
      doc.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 6 + 6;

      // Recommendation Reason
      if (level.suggestionReason) {
        doc.setFont("helvetica", "bold");
        doc.text("Recommendation Reason:", margin, yPosition);
        yPosition += 6;
        doc.setFont("helvetica", "normal");
        const reasonLines = doc.splitTextToSize(
          level.suggestionReason,
          contentWidth
        );
        doc.text(reasonLines, margin, yPosition);
        yPosition += reasonLines.length * 6 + 5;
      }
    }

    // Other Candidates Section
    if (level.candidates && level.candidates.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Other Candidates:", margin, yPosition);
      yPosition += 7;

      level.candidates.forEach((candidate) => {
        if (candidate.htsno !== level.selection?.htsno) {
          // HTS Code
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text(formatHtsNumber(candidate.htsno), margin, yPosition);
          yPosition += 4;

          // Description
          const candidateLines = doc.splitTextToSize(
            candidate.description,
            contentWidth - 10
          );
          doc.setFont("helvetica", "bold");
          doc.text(candidateLines, margin + 5, yPosition);
          yPosition += candidateLines.length * 6 + 2;
        }
      });
    }

    // If not last page, add a page break
    if (index < classification.levels.length - 1) {
      doc.addPage();
      yPosition = margin;
    }
  });

  return doc;
};
