"use client";

import { useState } from "react";
import type { CalculatorOutput, CurrencyCode } from "@/lib/calculator";
import { CURRENCIES } from "@/lib/constants";
import { Icon } from "@iconify/react";

function fmt(n: number, currencyCode: CurrencyCode): string {
  const currency = CURRENCIES.find(c => c.value === currencyCode) || CURRENCIES[0];
  return currency.symbol + n.toLocaleString(currency.locale, { maximumFractionDigits: 0 });
}

interface OutputPanelProps {
  result: CalculatorOutput;
  currency: CurrencyCode;
  invoices: { label: string; percentage: number; status: string }[];
}

export default function OutputPanel({ 
  result, 
  currency,
  invoices
}: OutputPanelProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);


  return (
    <div className="space-y-6">

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

      {/* Estimated Hours & Base Cost */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-nw-graphite/20 p-5">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
            Estimated Hours
          </div>
          <div className="font-display font-bold text-2xl track-tighter text-nw-black">
            {result.adjustedHours}<span className="text-nw-graphite text-base ml-1">hrs</span>
          </div>
        </div>

        <div className="border border-nw-graphite/20 p-5">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
            Base Cost
          </div>
          <div className="font-display font-bold text-2xl track-tighter text-nw-black">
            {fmt(result.baseCost, currency)}
          </div>
        </div>
      </div>
      {/* FINAL PRICE — highlighted */}
      <div className="bg-nw-black text-nw-bone p-6 clip-button relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-nw-acid/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-acid mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse"></span>
            Project Investment
          </div>
          <div className="font-display font-bold text-[clamp(2rem,4vw,3rem)] track-tightest leading-none">
            {fmt(result.roundedPrice, currency)}
          </div>
          <div className="mt-2 font-mono text-[9px] text-nw-bone/50 uppercase tracking-[0.2em]">
            One-time development fee (hosting &amp; SEO billed separately)
          </div>
        </div>
      </div>

      {/* Managed Hosting (Monthly) */}
      {(result.hostingPrice > 0 || result.seoPrice > 0) && (
        <div className="space-y-3">
          {result.hostingPrice > 0 && (
            <div className="border border-nw-graphite/20 p-5 bg-nw-bone">
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
                Managed Hosting &amp; Maintenance
              </div>
              <div className="font-display font-bold text-2xl track-tighter text-nw-black">
                {fmt(result.hostingPrice, currency)}{" "}
                <span className="text-nw-graphite text-lg">/ month</span>
              </div>
            </div>
          )}
          {result.seoPrice > 0 && (
            <div className="border border-nw-graphite/20 p-5 bg-nw-bone">
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
                SEO Retainer
              </div>
              <div className="font-display font-bold text-2xl track-tighter text-nw-black">
                {fmt(result.seoPrice, currency)}{" "}
                <span className="text-nw-graphite text-lg">/ month</span>
              </div>
            </div>
          )}
          <p className="font-mono text-[9px] text-nw-graphite uppercase tracking-wide">
            Monthly recurring — not included in project investment above
          </p>
        </div>
      )}

      {/* Breakdown Toggle */}
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
          <Row label="Project Type" value={`×${result.projectTypeMultiplier}`} />
          <Row label="Complexity" value={`×${result.complexityMultiplier}`} />
          <Row label="Adjusted Hours" value={`${result.adjustedHours} hrs`} accent />
          <Row label="Base Cost" value={fmt(result.baseCost, currency)} />
          <Row label="+ Project Buffer" value={fmt(result.finalPrice + result.discountAmount - result.baseCost, currency)} />
          {result.discountAmount > 0 && (
            <Row label="- Discount Applied" value={`-${fmt(result.discountAmount, currency)}`} accent />
          )}
          <Row label="Final (unrounded)" value={fmt(result.finalPrice, currency)} />
          <Row label="Rounded Price" value={fmt(result.roundedPrice, currency)} accent />
          {result.hostingPrice > 0 && (
            <Row label="Hosting / Month" value={fmt(result.hostingPrice, currency)} accent />
          )}
          {result.seoPrice > 0 && (
            <Row label="SEO / Month" value={fmt(result.seoPrice, currency)} accent />
          )}
        </div>
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
