"use client";

import { useState, useMemo } from "react";
import { calculate } from "@/lib/calculator";
import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode, CalculatorInput, HostingPlan } from "@/lib/calculator";
import { DEFAULTS, TEMPLATES } from "@/lib/constants";
import InputPanel from "./InputPanel";
import OutputPanel from "./OutputPanel";
import QuoteTemplate from "./QuoteTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Icon } from "@iconify/react";

export default function Calculator() {
  const [projectType, setProjectType] = useState<ProjectType>(DEFAULTS.projectType);
  const [pages, setPages] = useState(DEFAULTS.pages);
  const [designLevel, setDesignLevel] = useState<DesignLevel>(DEFAULTS.designLevel);
  const [complexity, setComplexity] = useState<Complexity>(DEFAULTS.complexity);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hourlyRate, setHourlyRate] = useState(DEFAULTS.hourlyRate);
  const [bufferPercent, setBufferPercent] = useState(DEFAULTS.bufferPercent);
  const [roundingMode, setRoundingMode] = useState<RoundingMode>(DEFAULTS.roundingMode);
  const [hostingPlan, setHostingPlan] = useState<HostingPlan>(DEFAULTS.hostingPlan);
  const [discountPercent, setDiscountPercent] = useState(DEFAULTS.discountPercent);
  const [isClientMode, setIsClientMode] = useState(false);

  const applyTemplate = (config: Partial<CalculatorInput>) => {
    if (config.projectType) setProjectType(config.projectType);
    if (config.pages !== undefined) setPages(config.pages);
    if (config.designLevel) setDesignLevel(config.designLevel);
    if (config.complexity) setComplexity(config.complexity);
    if (config.features) setFeatures(config.features as Feature[]);
    if (config.hostingPlan) setHostingPlan(config.hostingPlan as HostingPlan);
    if (config.discountPercent !== undefined) setDiscountPercent(config.discountPercent);
  };

  const exportToPDF = async () => {
    const element = document.getElementById("quote-template");
    if (!element) return;

    // Temporarily bring it into view but hidden from user visually
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
      
      const margin = 10; // 10mm
      const innerHeightMm = pdfHeight - (margin * 2);
      
      // Calculate pixels per mm based on the captured canvas
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
            0, currentY, canvas.width, pageCanvas.height, // Source
            0, 0, canvas.width, pageCanvas.height         // Destination
          );
        }
        
        const pageData = pageCanvas.toDataURL("image/png");
        const displayHeight = pageCanvas.height / pxPerMm;
        
        pdf.addImage(pageData, "PNG", 0, margin, pdfWidth, displayHeight);
        
        currentY += innerHeightPx;
        isFirstPage = false;
      }

      pdf.save(`NW-Quotation-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to generate PDF. Falling back to print dialog.");
      window.print();
    } finally {
      // Put it back
      element.style.position = "fixed";
      element.style.top = "-9999px";
      element.style.left = "-9999px";
    }
  };

  const toggleFeature = (f: Feature) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const result = useMemo(
    () =>
      calculate({
        projectType,
        pages,
        designLevel,
        complexity,
        features,
        hourlyRate,
        bufferPercent,
        roundingMode,
        hostingPlan,
        discountPercent,
      }),
    [projectType, pages, designLevel, complexity, features, hourlyRate, bufferPercent, roundingMode, hostingPlan, discountPercent]
  );

  return (
    <section className="py-[clamp(3rem,6vw,6rem)] relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-40 pointer-events-none"></div>

      <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <div className="font-mono text-[10px] md:text-xs uppercase track-widest text-nw-graphite mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-px before:bg-nw-acid">
            [PRICING ENGINE]
          </div>
          <h1 className="font-display font-bold text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] track-tightest text-nw-black mb-4">
            Calculate project scope.
          </h1>
          <p className="font-body text-[clamp(0.95rem,1.2vw,1.125rem)] text-nw-graphite max-w-[55ch]">
            Configure inputs below. The output updates in real-time — no guesswork, no ambiguity.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-nw-graphite/20 pb-6 no-print">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite">
              Project Presets
            </div>
            <select
              onChange={(e) => applyTemplate(JSON.parse(e.target.value))}
              className="bg-transparent border border-nw-graphite/20 px-3 py-2 font-mono text-xs text-nw-black uppercase track-widest cursor-pointer hover:border-nw-acid transition-colors"
              defaultValue=""
            >
              <option value="" disabled>Select a Template...</option>
              {TEMPLATES.map((t) => (
                <option key={t.label} value={JSON.stringify(t.config)} className="bg-nw-bone">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsClientMode(!isClientMode)}
              className={`flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 border transition-all ${
                isClientMode 
                  ? "bg-nw-acid text-white border-nw-acid" 
                  : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
              }`}
            >
              <Icon icon={isClientMode ? "solar:eye-linear" : "solar:eye-closed-linear"} />
              Client Mode: {isClientMode ? "ON" : "OFF"}
            </button>

            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-nw-black text-nw-bone border border-nw-black hover:bg-nw-acid hover:border-nw-acid transition-all"
            >
              <Icon icon="solar:download-minimalistic-linear" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div id="calculator-content" className="grid grid-cols-12 gap-[clamp(1.5rem,3vw,2.5rem)]">
          {/* Input Column */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-nw-graphite/20 pb-4">
                <div className="font-mono text-xs text-nw-black uppercase track-widest flex items-center gap-2">
                  <Icon icon="solar:settings-linear" />
                  scope.config
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-nw-emerald rounded-full animate-pulse"></div>
                </div>
              </div>

              <InputPanel
                projectType={projectType}
                setProjectType={setProjectType}
                pages={pages}
                setPages={setPages}
                designLevel={designLevel}
                setDesignLevel={setDesignLevel}
                complexity={complexity}
                setComplexity={setComplexity}
                features={features}
                toggleFeature={toggleFeature}
                hourlyRate={hourlyRate}
                setHourlyRate={setHourlyRate}
                bufferPercent={bufferPercent}
                setBufferPercent={setBufferPercent}
                roundingMode={roundingMode}
                setRoundingMode={setRoundingMode}
                hostingPlan={hostingPlan}
                setHostingPlan={setHostingPlan}
                discountPercent={discountPercent}
                setDiscountPercent={setDiscountPercent}
              />
            </div>
          </div>

          {/* Output Column */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl">
                <OutputPanel result={result} isClientMode={isClientMode} />
              </div>

              {/* Quick summary bar */}
              <div className="mt-4 bg-nw-black text-nw-bone p-4 font-mono text-[10px] uppercase track-widest flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse"></span>
                  Live calculation
                </span>
                <span className="text-nw-acid">
                  {result.adjustedHours}h · {features.length} features
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden template for PDF generation */}
        <QuoteTemplate 
          input={{ projectType, pages, designLevel, complexity, features, hourlyRate, bufferPercent, roundingMode, hostingPlan, discountPercent }} 
          result={result} 
        />
      </div>
    </section>
  );
}
