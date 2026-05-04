"use client";

import PublicTemplate from "./PublicTemplate";
import type { CalculatorOutput, CalculatorInput } from "@/lib/calculator";
import { Icon } from "@iconify/react";

interface LivePreviewProps {
  mode: 'quote' | 'proposal' | 'contract' | 'invoice';
  input: CalculatorInput;
  result: CalculatorOutput;
  projectId?: string | null;
}

export default function LivePreview({ mode, input, result, projectId }: LivePreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 overflow-y-auto bg-nw-bone/30 border border-nw-graphite/10 rounded-sm scrollbar-hide">
        <PublicTemplate 
          id={projectId || "PREVIEW"}
          mode={mode}
          input={input}
          result={result}
          createdAt={new Date()}
        />
      </div>
      
      <div className="mt-4 p-4 bg-nw-black text-nw-bone font-mono text-[9px] uppercase track-widest flex items-center gap-3">
        <Icon icon="solar:magic-stick-linear" className="text-nw-acid" />
        This matches the experience your client sees online.
      </div>
    </div>
  );
}
