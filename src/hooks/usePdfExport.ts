"use client";

import { useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";
import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import type { PdfDocKind } from "@/lib/pdf/QuotePdfDocument";
import { downloadVectorQuotePdf } from "@/lib/pdf/export-quote-pdf";

export type PdfExportTab = "calculator" | "proposal" | "contract";

function tabToKind(tab: PdfExportTab): PdfDocKind {
  if (tab === "proposal") return "Proposal";
  if (tab === "contract") return "Contract";
  return "Quotation";
}

export function usePdfExport(
  input?: CalculatorInput,
  result?: CalculatorOutput,
  projectId?: string | null
) {
  const exportRasterPdf = useCallback(async (activeTab: PdfExportTab) => {
    const elementId = activeTab === "contract" ? "contract-export-template" : "quote-template";
    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Missing PDF export target: ${elementId}`);

    const wrapper = document.createElement("div");
    const clone = element.cloneNode(true) as HTMLElement;

    wrapper.style.position = "fixed";
    wrapper.style.inset = "0 auto auto 0";
    wrapper.style.width = activeTab === "contract" ? "900px" : "800px";
    wrapper.style.background = "#FFFFFF";
    wrapper.style.zIndex = "2147483647";
    wrapper.style.pointerEvents = "none";
    wrapper.style.opacity = "1";

    clone.style.position = "static";
    clone.style.top = "auto";
    clone.style.left = "auto";
    clone.style.zIndex = "auto";
    clone.style.width = "100%";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(clone, {
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

      const prefix = tabToKind(activeTab);
      pdf.save(`NW-${prefix}-${new Date().toISOString().split("T")[0]}.pdf`);
    } finally {
      wrapper.remove();
    }
  }, []);

  const exportToPdf = useCallback(
    async (activeTab: PdfExportTab) => {
      if (activeTab === "contract" && projectId) {
        window.open(`/p/${projectId}?mode=contract&print=1`, "_blank", "noopener,noreferrer");
        toast.success("Opening printable contract");
        return;
      }

      if (input && result && activeTab !== "contract") {
        try {
          await downloadVectorQuotePdf(tabToKind(activeTab), input, result, projectId);
          toast.success("Vector PDF downloaded");
          return;
        } catch (error) {
          console.warn("Vector PDF failed, falling back to raster:", error);
        }
      }

      try {
        await exportRasterPdf(activeTab);
        toast.success("PDF downloaded");
      } catch (error) {
        console.error("PDF Export failed:", error);
        toast.error("PDF generation failed. Please try again.");
      }
    },
    [input, result, projectId, exportRasterPdf]
  );

  return { exportToPdf };
}
