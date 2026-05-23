"use client";

import { useDroppable } from "@dnd-kit/core";
import type { KanbanStage } from "@/types/crm";

interface ClientColumnProps {
  stage: KanbanStage;
  onAdd?: () => void;
  children: React.ReactNode;
}

export default function ClientColumn({ stage, onAdd, children }: ClientColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <div className="flex-1 min-w-[320px] flex flex-col bg-nw-white rounded-xl border border-nw-graphite/10">
      <div className="p-5 flex justify-between items-center border-b border-nw-graphite/10">
        <div className="font-mono text-[10px] text-nw-black uppercase tracking-[0.2em] flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
          {stage.label}
          {stage.id === "prospect" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.();
              }}
              className="ml-2 inline-flex items-center justify-center text-nw-black hover:text-nw-acid transition-colors"
              title="Add Prospect"
            >
              <span className="text-lg leading-none font-bold">+</span>
            </button>
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
        {children}
      </div>
    </div>
  );
}
