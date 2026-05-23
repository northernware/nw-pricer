"use client";

import RichTextEditor from "@/components/RichTextEditor";
import { Icon } from "@iconify/react";
import type { CalculatorInput, ProposalContent } from "@/lib/calculator";

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-3">
      {children}
    </div>
  );
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">{label}</div>
      {textarea ? (
        <div className={disabled ? "pointer-events-none opacity-60" : ""}>
          <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} />
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

export function LockedBanner({ onUnlock }: { onUnlock?: () => void }) {
  return (
    <div className="mb-8 p-4 bg-nw-black text-nw-bone border-l-4 border-nw-acid flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <Icon icon="solar:lock-bold" className="text-nw-acid" />
        <div className="font-mono text-[10px] uppercase track-widest">
          This project is officially signed and locked.
        </div>
      </div>
      <button
        type="button"
        onClick={onUnlock}
        className="font-mono text-[10px] uppercase track-widest px-3 py-1.5 border border-nw-bone/20 hover:bg-nw-acid hover:text-nw-black hover:border-nw-acid transition-all"
      >
        Unlock for Revision
      </button>
    </div>
  );
}

export function ProjectInfoFields({
  config,
  updateProposal,
  isLocked,
}: {
  config: CalculatorInput;
  updateProposal: (updates: Partial<ProposalContent>) => void;
  isLocked?: boolean;
}) {
  return (
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
          onChange={(v) =>
            updateProposal({
              clientFirstName: v,
              clientName: `${v} ${config.proposal.clientLastName || ""}`.trim(),
            })
          }
          placeholder="e.g. Juan"
          disabled={isLocked}
        />
        <InputField
          label="Client Last Name"
          value={config.proposal.clientLastName || ""}
          onChange={(v) =>
            updateProposal({
              clientLastName: v,
              clientName: `${config.proposal.clientFirstName || ""} ${v}`.trim(),
            })
          }
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
}
