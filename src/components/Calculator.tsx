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
  const [config, setConfig] = useState<CalculatorInput>(DEFAULTS);
  const [isClientMode, setIsClientMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'proposal' | 'contract' | 'invoice'>('calculator');

  const updateConfig = (updates: Partial<CalculatorInput>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateProposal = (updates: Partial<typeof DEFAULTS.proposal>) => {
    setConfig(prev => ({
      ...prev,
      proposal: { ...prev.proposal, ...updates }
    }));
  };

  const applyTemplate = (templateConfig: Partial<CalculatorInput>) => {
    setConfig(prev => ({ ...prev, ...templateConfig }));
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
      
      const margin = 0; // Use 0 margin as QuoteTemplate has its own padding
      const innerHeightMm = pdfHeight;
      
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
        
        pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, displayHeight);
        
        currentY += innerHeightPx;
        isFirstPage = false;
      }

      const prefix = activeTab === 'calculator' ? 'Quotation' : 
                     activeTab === 'proposal' ? 'Proposal' :
                     activeTab === 'contract' ? 'Contract' : 'Invoice';
      pdf.save(`NW-${prefix}-${new Date().toISOString().split('T')[0]}.pdf`);
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
    updateConfig({
      features: config.features.includes(f)
        ? config.features.filter((x) => x !== f)
        : [...config.features, f]
    });
  };

  const result = useMemo(
    () => calculate(config),
    [config]
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
            {activeTab === 'calculator' ? 'Calculate project scope.' : 
             activeTab === 'proposal' ? 'Craft the proposal.' :
             activeTab === 'contract' ? 'Finalize the contract.' : 'Generate the invoice.'}
          </h1>
          <p className="font-body text-[clamp(0.95rem,1.2vw,1.125rem)] text-nw-graphite max-w-[55ch]">
            {activeTab === 'calculator' ? 'Configure inputs below. The output updates in real-time — no guesswork, no ambiguity.' :
             activeTab === 'proposal' ? 'Add the narrative that sells. Detail the vision, goals, and terms.' :
             activeTab === 'contract' ? 'The legal foundation. Protecting both parties with clear boundaries.' :
             'Hope transforms into receivables. Finalize the numbers for payment.'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex border-b border-nw-graphite/20 no-print">
          {(['calculator', 'proposal', 'contract', 'invoice'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-mono text-[10px] uppercase track-widest transition-all border-b-2 ${
                activeTab === tab 
                  ? "border-nw-acid text-nw-black bg-nw-acid/5" 
                  : "border-transparent text-nw-graphite hover:text-nw-black hover:bg-nw-bone"
              }`}
            >
              {tab}
            </button>
          ))}
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
                activeTab={activeTab}
                config={config}
                updateConfig={updateConfig}
                updateProposal={updateProposal}
                toggleFeature={toggleFeature}
              />
            </div>
          </div>

          {/* Output Column */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl">
                <OutputPanel 
                  result={result} 
                  isClientMode={isClientMode} 
                  status={config.status}
                  onStatusChange={(s) => updateConfig({ status: s })}
                />
              </div>

              {/* Quick summary bar */}
              <div className="mt-4 bg-nw-black text-nw-bone p-4 font-mono text-[10px] uppercase track-widest flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse"></span>
                  Live calculation
                </span>
                <span className="text-nw-acid">
                  {result.adjustedHours}h · {config.features.length} features
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden template for PDF generation */}
        <QuoteTemplate 
          mode={activeTab === 'calculator' ? 'quote' : activeTab}
          input={config} 
          result={result} 
        />
      </div>
    </section>
  );
}
