"use client";

import { Icon } from "@iconify/react";
import type { StoredProject } from "@/types/crm";

interface ProjectLibraryModalProps {
  projects: StoredProject[];
  onClose: () => void;
  onLoad: (project: StoredProject) => void;
  onDelete: (e: React.MouseEvent, id: string, name: string) => void;
}

export default function ProjectLibraryModal({
  projects,
  onClose,
  onLoad,
  onDelete,
}: ProjectLibraryModalProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 no-print">
      <div
        className="absolute inset-0 bg-nw-bone/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-nw-bone text-nw-black border border-nw-graphite/20 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8 border-b border-nw-graphite/10 flex justify-between items-center">
          <div>
            <div className="font-mono text-xs uppercase track-widest text-nw-acid mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-nw-acid rounded-full animate-pulse" />
              Project Management
            </div>
            <h2 className="font-display font-bold text-3xl uppercase tracking-tighter">
              Saved Projects Library
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 text-nw-graphite/50 hover:text-nw-acid hover:rotate-90 transition-all duration-300"
          >
            <Icon icon="solar:close-circle-linear" className="text-3xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <div className="col-span-full py-20 text-center font-mono text-xs text-nw-graphite uppercase track-widest">
                <Icon icon="solar:folder-open-linear" className="text-4xl mx-auto mb-4 opacity-20" />
                No saved projects found.
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  className="border border-nw-graphite/10 p-6 hover:border-nw-acid hover:bg-nw-acid/5 transition-all cursor-pointer group flex flex-col justify-between"
                  onClick={() => onLoad(p)}
                  onKeyDown={(e) => e.key === "Enter" && onLoad(p)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="font-bold text-xl truncate tracking-tight text-nw-black group-hover:text-nw-acid transition-colors">
                        {p.name}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => onDelete(e, p.id, p.name)}
                        className="opacity-0 group-hover:opacity-100 text-nw-graphite hover:text-red-500 transition-all p-1"
                        title="Delete Project"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" width="18" />
                      </button>
                    </div>
                    <div className="text-xs text-nw-graphite mb-8 line-clamp-1 font-mono uppercase tracking-wider">
                      {p.clientName || "Unknown Client"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-nw-graphite uppercase font-mono track-widest border-t border-nw-graphite/5 pt-5">
                    <span>{new Date(p.lastModified).toLocaleDateString()}</span>
                    <span className="text-nw-acid flex items-center gap-2 font-bold opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                      LOAD <Icon icon="solar:arrow-right-linear" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-8 py-4 bg-nw-graphite/5 border-t border-nw-graphite/10 flex justify-between items-center font-mono text-[10px] uppercase track-widest text-nw-graphite">
          <span>Northernware Pricing Engine v1.0</span>
          <span>Total Projects: {projects.length}</span>
        </div>
      </div>
    </div>
  );
}
