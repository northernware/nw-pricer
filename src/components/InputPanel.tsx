"use client";

import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode, HostingPlan, CalculatorInput, ProposalContent } from "@/lib/calculator";
import { FEATURES, ROUNDING_MODES, HOSTING_PLANS, PROJECT_TYPES, DESIGN_LEVELS, COMPLEXITIES } from "@/lib/constants";
import { Icon } from "@iconify/react";
import RichTextEditor from "./RichTextEditor";
import InvoiceManager from "./InvoiceManager";

interface InputPanelProps {
  activeTab: 'calculator' | 'proposal' | 'contract' | 'invoice';
  config: CalculatorInput;
  updateConfig: (updates: Partial<CalculatorInput>) => void;
  updateProposal: (updates: Partial<ProposalContent>) => void;
  toggleFeature: (f: Feature) => void;
  totalPrice: number;
  projectId: string | null;
  onPromoteToContract?: () => void;
  isLocked?: boolean;
  onUnlock?: () => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-3">
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, textarea = false, disabled = false }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, textarea?: boolean, disabled?: boolean }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">{label}</div>
      {textarea ? (
        <div className={disabled ? "pointer-events-none opacity-60" : ""}>
          <RichTextEditor
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm text-nw-black py-2 transition-colors ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      )}
    </div>
  );
}

export default function InputPanel({ 
  activeTab, 
  config, 
  updateConfig, 
  updateProposal, 
  toggleFeature, 
  totalPrice, 
  projectId,
  onPromoteToContract,
  isLocked,
  onUnlock
}: InputPanelProps) {
  const ProjectInfo = (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField 
          label="Project Name" 
          value={config.proposal.projectName} 
          onChange={(v) => updateProposal({ projectName: v })} 
          placeholder="e.g. Website Redesign 2024"
          disabled={isLocked}
        />
        <InputField
          label="Company / Organization"
          value={config.proposal.clientCompany || ""}
          onChange={(v) => updateProposal({ clientCompany: v })}
          placeholder="e.g. Acme Corp (leave blank if individual)"
          disabled={isLocked}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          label="Client First Name"
          value={config.proposal.clientFirstName || ""}
          onChange={(v) => updateProposal({ clientFirstName: v, clientName: `${v} ${config.proposal.clientLastName || ""}`.trim() })}
          placeholder="e.g. Juan"
          disabled={isLocked}
        />
        <InputField
          label="Client Last Name"
          value={config.proposal.clientLastName || ""}
          onChange={(v) => updateProposal({ clientLastName: v, clientName: `${config.proposal.clientFirstName || ""} ${v}`.trim() })}
          placeholder="e.g. dela Cruz"
          disabled={isLocked}
        />
        <InputField
          label="Signer Title / Role"
          value={config.proposal.clientSignerTitle || ""}
          onChange={(v) => updateProposal({ clientSignerTitle: v })}
          placeholder="e.g. Director"
          disabled={isLocked}
        />
      </div>
    </div>
  );

  const LockedBanner = isLocked && (
    <div className="mb-8 p-4 bg-nw-black text-nw-bone border-l-4 border-nw-acid flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <Icon icon="solar:lock-bold" className="text-nw-acid" />
        <div className="font-mono text-[10px] uppercase track-widest">
          This project is officially signed and locked.
        </div>
      </div>
      <button 
        onClick={onUnlock}
        className="font-mono text-[10px] uppercase track-widest px-3 py-1.5 border border-nw-bone/20 hover:bg-nw-acid hover:text-nw-black hover:border-nw-acid transition-all"
      >
        Unlock for Revision
      </button>
    </div>
  );

  if (activeTab === 'calculator') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {LockedBanner}
        {ProjectInfo}
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
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Hourly Rate (₱)</div>
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
          <Label>Managed Hosting & Maintenance</Label>
          <div className="grid grid-cols-1 gap-2">
            {HOSTING_PLANS.map((hp) => (
              <button
                key={hp.value}
                type="button"
                disabled={isLocked}
                onClick={() => updateConfig({ hostingPlan: hp.value })}
                className={`flex flex-col font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 text-left ${
                  config.hostingPlan === hp.value
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
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

  if (activeTab === 'proposal' || activeTab === 'contract') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {LockedBanner}
        {ProjectInfo}

        {activeTab === 'proposal' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">



            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Timeline Override"
                value={config.proposal.timeline}
                onChange={(v) => updateProposal({ timeline: v })}
                placeholder="e.g. 4–6 weeks (auto-calculated if blank)"
                disabled={isLocked}
              />
              <InputField
                label="Proposal Validity"
                value={config.proposal.validityPeriod}
                onChange={(v) => updateProposal({ validityPeriod: v })}
                placeholder="e.g. 30 Days"
                disabled={isLocked}
              />
            </div>

            <div className="space-y-4">
              <div className="text-[10px] uppercase track-widest font-bold text-nw-graphite font-mono">Proposed Page Architecture</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-nw-bone/30 p-6 border border-nw-graphite/10">
                {Array.from({ length: Math.min(config.pages, 10) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-nw-acid font-bold w-4">{(i + 1).toString().padStart(2, '0')}</span>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-nw-graphite/20 py-1 text-sm focus:border-nw-acid outline-none transition-colors disabled:opacity-50"
                      placeholder={i === 0 ? "Home" : i === 1 ? "About" : i === 2 ? "Services" : i === 3 ? "Contact" : `Page ${i + 1}`}
                      value={config.proposal.pageNames?.[i] || ""}
                      onChange={(e) => {
                        const newNames = [...(config.proposal.pageNames || [])];
                        newNames[i] = e.target.value;
                        updateProposal({ pageNames: newNames });
                      }}
                      disabled={isLocked}
                    />
                  </div>
                ))}
                {config.pages > 10 && (
                  <div className="col-span-full text-[10px] text-nw-graphite italic mt-2">
                    Showing first 10 pages. Total pages: {config.pages}. The rest will be summarized.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-nw-bone border-l-4 border-nw-acid">
              <div className="flex items-start gap-3">
                <Icon icon="solar:magic-stick-linear" className="text-nw-acid mt-0.5 text-lg shrink-0" />
                <div className="text-[11px] text-nw-graphite leading-relaxed">
                  The proposal document is <strong>auto-generated</strong> from your Calculator selections — project type, design level, features, hosting plan, and pricing are all populated automatically.
                </div>
              </div>
            </div>

            {!isLocked && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onPromoteToContract}
                  className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-6 py-3 bg-nw-black text-nw-bone hover:bg-nw-acid hover:text-nw-black transition-all group shadow-lg"
                >
                  Promote to Contract
                  <Icon icon="solar:arrow-right-up-linear" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contract' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InvoiceManager 
              config={config} 
              updateConfig={updateConfig} 
              totalPrice={totalPrice} 
              projectId={projectId}
            />



            <div>
              <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-4">Contract Terms</div>
              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="Presentation Date"
                  value={config.proposal.presentationDate || ""}
                  onChange={(v) => updateProposal({ presentationDate: v })}
                  placeholder="e.g. June 15, 2026"
                  disabled={isLocked}
                />
                <InputField
                  label="Backup Retention"
                  value={config.proposal.backupTerm || ""}
                  onChange={(v) => updateProposal({ backupTerm: v })}
                  placeholder="e.g. 6 months"
                  disabled={isLocked}
                />
                <InputField
                  label="Maintenance SLA (days)"
                  value={config.proposal.maintenanceDays || ""}
                  onChange={(v) => updateProposal({ maintenanceDays: v })}
                  placeholder="e.g. 3"
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="p-4 bg-nw-bone border-l-4 border-nw-acid">
              <div className="flex items-start gap-3">
                <Icon icon="solar:magic-stick-linear" className="text-nw-acid mt-0.5 text-lg shrink-0" />
                <div className="text-[11px] text-nw-graphite leading-relaxed">
                  All legal clauses — Scope, Developer Requirements, Web Hosting, Design, Pricing, Termination, and Conflict Resolution — are <strong>auto-generated</strong> from your Calculator selections. Just fill in the variables above.
                </div>
              </div>
            </div>
          </div>
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
