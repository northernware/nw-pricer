"use client";

import type { InputPanelProps } from "./types";
import type { RoundingMode, CurrencyCode } from "@/lib/calculator";
import { FEATURES, ROUNDING_MODES, HOSTING_PLANS, PROJECT_TYPES, DESIGN_LEVELS, COMPLEXITIES, CURRENCIES } from "@/lib/constants";
import { Icon } from "@iconify/react";
import { Label, LockedBanner, ProjectInfoFields } from "./shared";

export default function CalculatorTab({
  config,
  updateConfig,
  updateProposal,
  toggleFeature,
  isLocked,
  onUnlock,
}: InputPanelProps) {
  return (
  
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLocked && onUnlock && <LockedBanner onUnlock={onUnlock} />}
        <ProjectInfoFields config={config} updateProposal={updateProposal} isLocked={isLocked} />
        {/* Project Type */}
        <div>
          <Label>Project Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {PROJECT_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                disabled={isLocked}
                onClick={() => updateConfig({ projectType: pt.value })}
                className={`group relative font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 text-left ${
                  config.projectType === pt.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="text-nw-acid text-[10px] mr-1.5">[{pt.code}]</span>
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pages */}
        <div>
          <Label>
            Number of Pages
            <span className="text-nw-acid ml-2 font-bold">{config.pages}</span>
          </Label>
          <input
            type="range"
            min={1}
            max={30}
            value={config.pages}
            disabled={isLocked}
            onChange={(e) => updateConfig({ pages: Number(e.target.value) })}
            className={`w-full accent-nw-acid h-1 bg-nw-graphite/20 rounded-none appearance-none cursor-pointer ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          <div className="flex justify-between font-mono text-[10px] text-nw-graphite mt-1">
            <span>1</span>
            <span className="text-nw-acid">
              {10 + (config.pages * 6)} hrs
            </span>
            <span>30</span>
          </div>
        </div>

        {/* Design Level */}
        <div>
          <Label>Design Level</Label>
          <div className="grid grid-cols-3 gap-2">
            {DESIGN_LEVELS.map((dl) => (
              <button
                key={dl.value}
                type="button"
                disabled={isLocked}
                onClick={() => updateConfig({ designLevel: dl.value })}
                className={`font-mono text-xs uppercase track-widest px-3 py-3 border transition-all duration-200 ${
                  config.designLevel === dl.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div>{dl.label}</div>
                <div className="text-[10px] mt-1 opacity-60">+{dl.hours}h</div>
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <Label>Complexity</Label>
          <div className="grid grid-cols-2 gap-2">
            {COMPLEXITIES.map((c) => (
              <button
                key={c.value}
                type="button"
                disabled={isLocked}
                onClick={() => updateConfig({ complexity: c.value })}
                className={`font-mono text-xs uppercase track-widest px-3 py-3 border transition-all duration-200 ${
                  config.complexity === c.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div>{c.label}</div>
                <div className="text-[10px] mt-1 opacity-60">{c.multiplier}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <Label>Features</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEATURES.map((f) => {
              const active = config.features.includes(f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  disabled={isLocked}
                  onClick={() => toggleFeature(f.value)}
                  className={`flex items-center justify-between font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 ${
                    active
                      ? "bg-nw-black text-nw-bone border-nw-black"
                      : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] ${active ? "text-nw-acid" : "opacity-50"}`}>
                    +{f.hours}h
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="pt-2">
          <Label>Advanced Settings</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Currency</div>
              <select
                value={config.currency}
                disabled={isLocked}
                onChange={(e) => updateConfig({ currency: e.target.value as CurrencyCode })}
                className={`w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors cursor-pointer ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-nw-bone">{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
                Hourly Rate ({CURRENCIES.find(c => c.value === config.currency)?.symbol})
              </div>
              <input
                type="number"
                value={config.hourlyRate}
                disabled={isLocked}
                onChange={(e) => updateConfig({ hourlyRate: Number(e.target.value) })}
                className={`w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Project Buffer (%)</div>
              <input
                type="number"
                value={config.bufferPercent}
                disabled={isLocked}
                onChange={(e) => updateConfig({ bufferPercent: Number(e.target.value) })}
                className={`w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Discount (%)</div>
              <input
                type="number"
                value={config.discountPercent}
                disabled={isLocked}
                onChange={(e) => updateConfig({ discountPercent: Number(e.target.value) })}
                className={`w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Rounding</div>
              <select
                value={config.roundingMode}
                disabled={isLocked}
                onChange={(e) => updateConfig({ roundingMode: e.target.value as RoundingMode })}
                className={`w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors cursor-pointer ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {ROUNDING_MODES.map((rm) => (
                  <option key={rm.value} value={rm.value} className="bg-nw-bone">{rm.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Managed Hosting */}
        <div className="pt-2">
          <Label>Managed Hosting &amp; Maintenance</Label>
          <div className="space-y-2">
            {/* Free option - full width */}
            {HOSTING_PLANS.filter(hp => hp.value === 'none').map((hp) => (
              <button
                key={hp.value}
                type="button"
                disabled={isLocked}
                onClick={() => updateConfig({ hostingPlan: hp.value })}
                className={`w-full flex justify-between items-center font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 text-left ${
                  config.hostingPlan === hp.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="font-bold">{hp.label}</span>
                <span className={config.hostingPlan === hp.value ? "text-nw-acid" : "text-nw-graphite"}>FREE</span>
              </button>
            ))}
            {/* Paid plans - 3-column grid */}
            <div className="grid grid-cols-3 gap-2">
              {HOSTING_PLANS.filter(hp => hp.value !== 'none').map((hp) => (
                <button
                  key={hp.value}
                  type="button"
                  disabled={isLocked}
                  onClick={() => updateConfig({ hostingPlan: hp.value })}
                  className={`flex flex-col font-mono text-xs uppercase track-widest px-3 py-3 border transition-all duration-200 text-left ${
                    config.hostingPlan === hp.value
                      ? "bg-nw-black text-nw-bone border-nw-black"
                      : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="font-bold text-[10px] leading-tight">{hp.label}</span>
                  <span className={`mt-1 text-[10px] ${config.hostingPlan === hp.value ? "text-nw-acid" : "text-nw-graphite"}`}>
                    {`${CURRENCIES.find(c => c.value === config.currency)?.symbol}${hp.price.toLocaleString()}/mo`}
                  </span>
                  <span className="mt-1 text-[9px] opacity-60 normal-case tracking-normal leading-tight">
                    {hp.description}
                  </span>
                  {hp.includes && hp.includes.length > 0 && (
                    <ul className="mt-3 space-y-1 w-full grow flex flex-col justify-end">
                      {hp.includes.map((item, i) => (
                        <li key={i} className="text-[8px] normal-case opacity-75 flex gap-1 items-start">
                          <Icon icon="solar:check-circle-linear" className={`mt-0.5 shrink-0 ${config.hostingPlan === hp.value ? "text-nw-acid" : "text-nw-graphite"}`} />
                          <span className="leading-tight">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    
);
}
