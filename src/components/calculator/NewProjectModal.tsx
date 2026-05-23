"use client";

import { Icon } from "@iconify/react";
import type { NewProjectInfo } from "@/hooks/useCalculatorProject";

interface NewProjectModalProps {
  newProjectInfo: NewProjectInfo;
  onChange: (info: NewProjectInfo) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function NewProjectModal({
  newProjectInfo,
  onChange,
  onClose,
  onConfirm,
}: NewProjectModalProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 no-print">
      <div
        className="absolute inset-0 bg-nw-bone/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative w-full max-w-xl bg-nw-bone text-nw-black border border-nw-graphite/20 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 border-b border-nw-graphite/10 flex justify-between items-center">
          <div>
            <div className="font-mono text-xs uppercase track-widest text-nw-acid mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-nw-acid rounded-full" />
              Initialize
            </div>
            <h2 className="font-display font-bold text-3xl uppercase tracking-tighter">New Project</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 text-nw-graphite/50 hover:text-nw-acid hover:rotate-90 transition-all duration-300"
          >
            <Icon icon="solar:close-circle-linear" className="text-3xl" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <p className="font-body text-sm text-nw-graphite">
            Starting a new project will clear your current workspace. Unsaved changes will be lost.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectInfo.name}
                onChange={(e) => onChange({ ...newProjectInfo, name: e.target.value })}
                placeholder="e.g. Acme Corp Website Redesign"
                className="w-full bg-nw-white border border-nw-graphite/20 p-3 font-mono text-xs outline-none focus:border-nw-acid transition-colors"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
                  Client First Name
                </label>
                <input
                  type="text"
                  value={newProjectInfo.firstName}
                  onChange={(e) => onChange({ ...newProjectInfo, firstName: e.target.value })}
                  placeholder="e.g. John"
                  className="w-full bg-nw-white border border-nw-graphite/20 p-3 font-mono text-xs outline-none focus:border-nw-acid transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
                  Client Last Name
                </label>
                <input
                  type="text"
                  value={newProjectInfo.lastName}
                  onChange={(e) => onChange({ ...newProjectInfo, lastName: e.target.value })}
                  placeholder="e.g. Doe"
                  className="w-full bg-nw-white border border-nw-graphite/20 p-3 font-mono text-xs outline-none focus:border-nw-acid transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
                Company / Organization{" "}
                <span className="text-nw-graphite/40 normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={newProjectInfo.company}
                onChange={(e) => onChange({ ...newProjectInfo, company: e.target.value })}
                placeholder="e.g. Acme Corp Ltd."
                className="w-full bg-nw-white border border-nw-graphite/20 p-3 font-mono text-xs outline-none focus:border-nw-acid transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="p-8 pt-0 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-nw-black text-nw-bone font-mono text-[10px] uppercase track-widest py-4 hover:bg-nw-acid transition-all shadow-lg hover:shadow-nw-acid/20"
          >
            Create Project
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 border border-nw-graphite/20 font-mono text-[10px] uppercase track-widest hover:border-nw-black transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
