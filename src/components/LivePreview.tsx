"use client";

import { useEffect, useRef, useState } from "react";
import QuoteTemplate from "./QuoteTemplate";
import type { CalculatorOutput, CalculatorInput } from "@/lib/calculator";
import { Icon } from "@iconify/react";

interface LivePreviewProps {
  mode: 'quote' | 'proposal' | 'contract' | 'invoice';
  input: CalculatorInput;
  result: CalculatorOutput;
  projectId?: string | null;
}

export default function LivePreview({ mode, input, result, projectId }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // The template is fixed at 800px width
        const newScale = containerWidth / 800;
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite flex items-center gap-2">
          <Icon icon="solar:document-text-linear" className="text-nw-acid" />
          Live Document Preview
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-nw-acid animate-pulse"></div>
          <span className="font-mono text-[8px] uppercase text-nw-acid">Real-time</span>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="relative flex-1 overflow-hidden bg-nw-bone/50 border border-nw-graphite/10 rounded-sm"
        style={{ '--preview-scale': scale } as React.CSSProperties}
      >
        <div 
          className="absolute top-0 left-0 transition-transform duration-300 ease-out"
          style={{ height: `${1200 * scale}px` }} // Approximate height to ensure scrollability if needed
        >
          <QuoteTemplate 
            mode={mode}
            input={input}
            result={result}
            projectId={projectId}
            isInline={true}
          />
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-nw-black text-nw-bone font-mono text-[9px] uppercase track-widest flex items-center gap-3">
        <Icon icon="solar:info-circle-linear" className="text-nw-acid" />
        This is a live representation of the final document.
      </div>
    </div>
  );
}
