"use client";

import type { ProposalContractTabProps } from "./types";
import { Icon } from "@iconify/react";
import InvoiceManager from "@/components/InvoiceManager";
import { InputField, LockedBanner, ProjectInfoFields } from "./shared";

export default function ProposalContractTab({
  activeTab,
  config,
  updateConfig,
  updateProposal,
  totalPrice,
  projectId,
  onPromoteToContract,
  isLocked,
  onUnlock,
}: ProposalContractTabProps) {
  return (
  
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLocked && onUnlock && <LockedBanner onUnlock={onUnlock} />}
        <ProjectInfoFields config={config} updateProposal={updateProposal} isLocked={isLocked} />

        {activeTab === 'proposal' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">



            <div className="space-y-4">
              <div className="text-[10px] uppercase track-widest font-bold text-nw-graphite font-mono">Proposed Page Architecture</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-nw-bone/30 p-6 border border-nw-graphite/10">
                {Array.from({ length: Math.min(config.pages, 10) }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-nw-acid font-bold w-4">{(i + 1).toString().padStart(2, '0')}</span>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-nw-graphite/20 py-1 text-sm focus:border-nw-acid outline-none transition-colors disabled:opacity-50"
                      placeholder={i === 0 ? "Home" : i === 1 ? "About" : i === 2 ? "Services / Products" : i === 3 ? "Contact" : `Page ${i + 1}`}
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
                  The proposal document is <strong>auto-generated</strong> from your Calculator selections G�� project type, design level, features, hosting plan, and pricing are all populated automatically.
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
                  All legal clauses G�� Scope, Developer Requirements, Web Hosting, Design, Pricing, Termination, and Conflict Resolution G�� are <strong>auto-generated</strong> from your Calculator selections. Just fill in the variables above.
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
