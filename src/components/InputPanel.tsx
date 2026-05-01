"use client";

import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode, HostingPlan, CalculatorInput, ProposalContent } from "@/lib/calculator";
import { PROJECT_TYPES, DESIGN_LEVELS, COMPLEXITIES, FEATURES, ROUNDING_MODES, HOSTING_PLANS } from "@/lib/constants";
import { Icon } from "@iconify/react";

interface InputPanelProps {
  activeTab: 'calculator' | 'proposal' | 'contract' | 'invoice';
  config: CalculatorInput;
  updateConfig: (updates: Partial<CalculatorInput>) => void;
  updateProposal: (updates: Partial<ProposalContent>) => void;
  toggleFeature: (f: Feature) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-3">
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, textarea = false }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, textarea?: boolean }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">{label}</div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent border border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm text-nw-black p-3 transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm text-nw-black py-2 transition-colors"
        />
      )}
    </div>
  );
}

export default function InputPanel({ activeTab, config, updateConfig, updateProposal, toggleFeature }: InputPanelProps) {
  const ProjectInfo = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-8 border-b border-nw-graphite/20">
      <InputField 
        label="Client Name / Company" 
        value={config.proposal.clientName} 
        onChange={(v) => updateProposal({ clientName: v })} 
        placeholder="e.g. Acme Corp"
      />
      <InputField 
        label="Project Name" 
        value={config.proposal.projectName} 
        onChange={(v) => updateProposal({ projectName: v })} 
        placeholder="e.g. Website Redesign 2024"
      />
    </div>
  );

  if (activeTab === 'calculator') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {ProjectInfo}
        {/* Project Type */}
        <div>
          <Label>Project Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {PROJECT_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => updateConfig({ projectType: pt.value })}
                className={`group relative font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 text-left ${
                  config.projectType === pt.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                }`}
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
            onChange={(e) => updateConfig({ pages: Number(e.target.value) })}
            className="w-full accent-nw-acid h-1 bg-nw-graphite/20 rounded-none appearance-none cursor-pointer"
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
                onClick={() => updateConfig({ designLevel: dl.value })}
                className={`font-mono text-xs uppercase track-widest px-3 py-3 border transition-all duration-200 ${
                  config.designLevel === dl.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                }`}
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
                onClick={() => updateConfig({ complexity: c.value })}
                className={`font-mono text-xs uppercase track-widest px-3 py-3 border transition-all duration-200 ${
                  config.complexity === c.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                }`}
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
                  onClick={() => toggleFeature(f.value)}
                  className={`flex items-center justify-between font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 ${
                    active
                      ? "bg-nw-black text-nw-bone border-nw-black"
                      : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                  }`}
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
        <div className="border-t border-nw-graphite/20 pt-6">
          <Label>Advanced Settings</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Hourly Rate (₱)</div>
              <input
                type="number"
                value={config.hourlyRate}
                onChange={(e) => updateConfig({ hourlyRate: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Project Buffer (%)</div>
              <input
                type="number"
                value={config.bufferPercent}
                onChange={(e) => updateConfig({ bufferPercent: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Discount (%)</div>
              <input
                type="number"
                value={config.discountPercent}
                onChange={(e) => updateConfig({ discountPercent: Number(e.target.value) })}
                className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Rounding</div>
              <select
                value={config.roundingMode}
                onChange={(e) => updateConfig({ roundingMode: e.target.value as RoundingMode })}
                className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors cursor-pointer"
              >
                {ROUNDING_MODES.map((rm) => (
                  <option key={rm.value} value={rm.value} className="bg-nw-bone">{rm.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Managed Hosting */}
        <div className="border-t border-nw-graphite/20 pt-6">
          <Label>Managed Hosting & Maintenance</Label>
          <div className="grid grid-cols-1 gap-2">
            {HOSTING_PLANS.map((hp) => (
              <button
                key={hp.value}
                type="button"
                onClick={() => updateConfig({ hostingPlan: hp.value })}
                className={`flex flex-col font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 text-left ${
                  config.hostingPlan === hp.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold">{hp.label}</span>
                  <span className={config.hostingPlan === hp.value ? "text-nw-acid" : "text-nw-graphite"}>
                    {hp.price > 0 ? `₱${hp.price.toLocaleString()}/mo` : "FREE"}
                  </span>
                </div>
                <div className="mt-1 text-[10px] opacity-60 normal-case tracking-normal">
                  {hp.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'proposal' || activeTab === 'contract' || activeTab === 'invoice') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {ProjectInfo}

        {activeTab === 'proposal' && (
          <>
            <InputField 
              label="Project Overview" 
              value={config.proposal.projectOverview} 
              onChange={(v) => updateProposal({ projectOverview: v })} 
              textarea
            />
            <InputField 
              label="Business Goals" 
              value={config.proposal.businessGoals} 
              onChange={(v) => updateProposal({ businessGoals: v })} 
              textarea
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Scope of Work" 
                value={config.proposal.scopeOfWork} 
                onChange={(v) => updateProposal({ scopeOfWork: v })} 
                textarea
              />
              <InputField 
                label="Deliverables" 
                value={config.proposal.deliverables} 
                onChange={(v) => updateProposal({ deliverables: v })} 
                textarea
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Timeline" 
                value={config.proposal.timeline} 
                onChange={(v) => updateProposal({ timeline: v })} 
              />
              <InputField 
                label="Validity Period" 
                value={config.proposal.validityPeriod} 
                onChange={(v) => updateProposal({ validityPeriod: v })} 
              />
            </div>
          </>
        )}

        {activeTab === 'contract' && (
          <>
            <InputField 
              label="Exclusions" 
              value={config.proposal.exclusions} 
              onChange={(v) => updateProposal({ exclusions: v })} 
              textarea
            />
            <InputField 
              label="Assumptions" 
              value={config.proposal.assumptions} 
              onChange={(v) => updateProposal({ assumptions: v })} 
              textarea
            />
          </>
        )}

        {(activeTab === 'contract' || activeTab === 'invoice') && (
          <InputField 
            label="Payment Terms" 
            value={config.proposal.paymentTerms} 
            onChange={(v) => updateProposal({ paymentTerms: v })} 
            textarea
          />
        )}

        <div className="p-4 bg-nw-bone border-l-4 border-nw-acid">
          <div className="flex items-start gap-3">
            <Icon icon="solar:info-circle-linear" className="text-nw-acid mt-0.5 text-lg shrink-0" />
            <div className="text-[11px] text-nw-graphite leading-relaxed">
              <strong>Tip:</strong> Use the Calculator tab to adjust the technical scope and pricing. 
              The Proposal, Contract, and Invoice tabs are for the narrative and legal specifics.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
