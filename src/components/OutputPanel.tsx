"use client";

import { useState } from "react";
import type { CalculatorOutput, ProposalStatus } from "@/lib/calculator";
import { Icon } from "@iconify/react";
import { PROPOSAL_STATUSES } from "@/lib/constants";

function fmt(n: number): string {
  return "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 0 });
}

interface OutputPanelProps {
  result: CalculatorOutput;
  status: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
  invoices: { label: string; percentage: number; status: string }[];
}

export default function OutputPanel({ 
  result, 
  status,
  onStatusChange,
  invoices
}: OutputPanelProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const currentStatus = PROPOSAL_STATUSES.find(s => s.value === status) || PROPOSAL_STATUSES[0];

  return (
    <div className="space-y-6">
      {/* Status Tracker */}
      <div className="border border-nw-graphite/20 p-4 bg-nw-bone/50">
        <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-3 flex items-center justify-between">
          <span>Lifecycle Status</span>
          <span className="flex items-center gap-1.5 text-nw-black">
            <Icon icon={currentStatus.icon} className={currentStatus.color} />
            {currentStatus.label}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {PROPOSAL_STATUSES.map((s, idx) => {
            const isPastOrCurrent = PROPOSAL_STATUSES.findIndex(x => x.value === status) >= idx;
            return (
              <button
                key={s.value}
                onClick={() => onStatusChange(s.value as ProposalStatus)}
                title={s.label}
                className={`h-1.5 transition-all duration-300 ${
                  isPastOrCurrent ? "bg-nw-acid" : "bg-nw-graphite/20"
                } hover:h-2.5`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <select 
            value={status} 
            onChange={(e) => onStatusChange(e.target.value as ProposalStatus)}
            className="bg-transparent font-mono text-[10px] uppercase track-widest text-nw-black outline-none cursor-pointer hover:text-nw-acid transition-colors"
          >
            {PROPOSAL_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="font-mono text-[9px] text-nw-graphite italic">
            {status === 'viewed' ? '“Did they see it?” — Yes.' : 
             status === 'approved' ? 'Marriage, basically.' :
             status === 'paid' ? 'Hope → Receivables.' : ''}
          </div>
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
            {fmt(result.baseCost)}
          </div>
        </div>
      </div>

      {/* FINAL PRICE — highlighted */}
      <div className="bg-nw-black text-nw-bone p-6 clip-button relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-nw-acid/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="relative z-10">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-acid mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse"></span>
            {status === 'paid' ? 'Total Paid' : 'Project Investment'}
          </div>
          <div className="font-display font-bold text-[clamp(2rem,4vw,3rem)] track-tightest leading-none">
            {fmt(result.roundedPrice)}
          </div>
          <div className="mt-2 font-mono text-[9px] text-nw-bone/50 uppercase tracking-[0.2em]">
            {status === 'paid' ? 'Transaction Completed' : 'One-time Development Fee'}
          </div>
        </div>
      </div>

      {/* Managed Hosting (Monthly) */}
      {result.hostingPrice > 0 && (
        <div className="border border-nw-graphite/20 p-5 bg-nw-bone">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
            Managed Hosting & Maintenance
          </div>
          <div className="font-display font-bold text-2xl track-tighter text-nw-black">
            {fmt(result.hostingPrice)} <span className="text-nw-graphite text-lg">/ month</span>
          </div>
        </div>
      )}

      {/* Payment Schedule Summary */}
      {invoices && invoices.length > 0 && (
        <div className="border border-nw-graphite/20 p-5">
          <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-4 flex items-center justify-between">
            <span>Payment Schedule</span>
            <Icon icon="solar:bill-list-linear" className="text-nw-acid" />
          </div>
          <div className="space-y-3">
            {invoices.map((inv, idx) => (
              <div key={idx} className="flex justify-between items-center text-[10px] font-mono uppercase track-widest">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${inv.status === 'paid' ? 'bg-nw-emerald' : 'bg-nw-graphite/30'}`}></div>
                  <span className={inv.status === 'paid' ? 'text-nw-emerald line-through opacity-60' : 'text-nw-black'}>{inv.label}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-nw-graphite">{inv.percentage}%</span>
                  <span className="font-bold text-nw-black">{fmt((result.roundedPrice * inv.percentage) / 100)}</span>
                </div>
              </div>
            ))}
          </div>
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
          <Row label="Complexity" value={`×${result.complexityMultiplier}`} />
          <Row label="Adjusted Hours" value={`${result.adjustedHours} hrs`} accent />
          <Row label="Base Cost" value={fmt(result.baseCost)} />
          <Row label="+ Project Buffer" value={fmt(result.finalPrice + result.discountAmount - result.baseCost)} />
          {result.discountAmount > 0 && (
            <Row label="- Discount Applied" value={`-${fmt(result.discountAmount)}`} accent />
          )}
          <Row label="Final (unrounded)" value={fmt(result.finalPrice)} />
          <Row label="Rounded Price" value={fmt(result.roundedPrice)} accent />
          {result.hostingPrice > 0 && (
            <Row label="Hosting / Month" value={fmt(result.hostingPrice)} accent />
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
