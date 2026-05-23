"use client";

import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";

export type PdfExportTab = "calculator" | "proposal" | "contract";

export function usePdfExport() {
  const exportToPdf = useCallback(async (activeTab: PdfExportTab) => {
    const element = document.getElementById("quote-template");
    if (!element) return;

    element.style.position = "static";
    element.style.top = "0";
    element.style.left = "0";

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const innerHeightMm = pdfHeight - margin * 2;
      const pxPerMm = canvas.width / pdfWidth;
      const innerHeightPx = innerHeightMm * pxPerMm;

      let currentY = 0;
      let isFirstPage = true;

      while (currentY < canvas.height) {
        if (!isFirstPage) pdf.addPage();

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        const remainingHeight = canvas.height - currentY;
        pageCanvas.height = Math.min(innerHeightPx, remainingHeight);

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            currentY,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height
          );
        }

        const pageData = pageCanvas.toDataURL("image/png");
        const displayHeight = pageCanvas.height / pxPerMm;
        pdf.addImage(pageData, "PNG", 0, margin, pdfWidth, displayHeight);

        currentY += innerHeightPx;
        isFirstPage = false;
      }

      const prefix =
        activeTab === "calculator"
          ? "Quotation"
          : activeTab === "proposal"
            ? "Proposal"
            : "Contract";
      pdf.save(`NW-${prefix}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast.error("PDF generation failed. Use browser print.");
      window.print();
    } finally {
      element.style.position = "fixed";
      element.style.top = "-9999px";
      element.style.left = "-9999px";
    }
  }, []);

  return { exportToPdf };
}
