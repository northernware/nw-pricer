"use client";

import { useState } from "react";
import type { CalculatorOutput } from "@/lib/calculator";
import { Icon } from "@iconify/react";

function fmt(n: number): string {
  return "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 0 });
}

export default function OutputPanel({ 
  result, 
  isClientMode 
}: { 
  result: CalculatorOutput, 
  isClientMode?: boolean 
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div className="space-y-6">
      {/* Print-only branding */}
      <div className="hidden print:flex justify-between items-start mb-10 border-b-2 border-nw-black pb-6">
        <div>
          <div className="font-display font-bold text-2xl track-tightest text-nw-black mb-1">
            NORTHERNWARE<span className="text-nw-acid">®</span>
          </div>
          <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite">
            Project Quotation &middot; {new Date().toLocaleDateString('en-PH')}
          </div>
        </div>
        <div className="text-right font-mono text-[10px] uppercase track-widest text-nw-graphite">
          Northern Luzon, PH<br />
          www.northernware.ph
        </div>
      </div>

      {/* Terminal-style header */}
      <div className="flex justify-between items-center border-b border-nw-graphite/20 pb-4 no-print">
        <div className="font-mono text-xs text-nw-black uppercase track-widest flex items-center gap-2">
          <Icon icon="solar:calculator-linear" />
          output.log
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
          <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
          <div className="w-3 h-3 bg-nw-acid rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Estimated Hours */}
      {!isClientMode && (
        <div className="border border-nw-graphite/20 p-5">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
            Estimated Hours
          </div>
          <div className="font-display font-bold text-3xl track-tighter text-nw-black">
            {result.adjustedHours} <span className="text-nw-graphite text-lg">hrs</span>
          </div>
        </div>
      )}

      {/* Base Cost */}
      {!isClientMode && (
        <div className="border border-nw-graphite/20 p-5">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
            Base Cost
          </div>
          <div className="font-display font-bold text-2xl track-tighter text-nw-black">
            {fmt(result.baseCost)}
          </div>
        </div>
      )}

      {/* FINAL PRICE — highlighted */}
      <div className="bg-nw-black text-nw-bone p-6 clip-button relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-nw-acid/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-acid mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse"></span>
            Final Price
          </div>
          <div className="font-display font-bold text-[clamp(2rem,4vw,3rem)] track-tightest leading-none">
            {fmt(result.roundedPrice)}
          </div>
        </div>
      </div>

      {/* Suggested Range */}
      <div className="border border-nw-acid/30 bg-nw-acid/5 p-5">
        <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
          Suggested Price Range
        </div>
        <div className="font-display font-bold text-xl track-tighter text-nw-black">
          {fmt(result.priceRange[0])} — {fmt(result.priceRange[1])}
        </div>
      </div>

      {/* Breakdown Toggle */}
      {!isClientMode && (
        <>
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="w-full flex items-center justify-between font-mono text-[10px] uppercase track-widest text-nw-graphite border border-nw-graphite/20 px-4 py-3 hover:border-nw-acid hover:text-nw-black transition-all duration-200"
          >
            <span>{showBreakdown ? "Hide" : "Show"} Breakdown</span>
            <Icon
              icon="solar:alt-arrow-down-linear"
              className={`text-base transition-transform duration-300 ${showBreakdown ? "rotate-180" : ""}`}
            />
          </button>

          {showBreakdown && (
            <div className="border border-nw-graphite/20 divide-y divide-nw-graphite/10 font-mono text-xs uppercase track-widest animate-[fadeIn_0.3s_ease]">
              <Row label="Pages → Hours" value={`${result.pagesHours} hrs`} />
              <Row label="Design → Hours" value={`${result.designHours} hrs`} />
              <Row label="Features → Hours" value={`${result.featureHours} hrs`} />
              <Row label="Base Hours" value={`${result.baseHours} hrs`} accent />
              <Row label="Complexity" value={`×${result.complexityMultiplier}`} />
              <Row label="Adjusted Hours" value={`${result.adjustedHours} hrs`} accent />
              <Row label="Base Cost" value={fmt(result.baseCost)} />
              <Row label="+ Project Buffer" value={fmt(result.finalPrice - result.baseCost)} />
              <Row label="Final (unrounded)" value={fmt(result.finalPrice)} />
              <Row label="Rounded Price" value={fmt(result.roundedPrice)} accent />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${accent ? "bg-nw-acid/5" : ""}`}>
      <span className="text-nw-graphite">{label}</span>
      <span className={accent ? "text-nw-acid font-bold" : "text-nw-black"}>{value}</span>
    </div>
  );
}
