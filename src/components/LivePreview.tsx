"use client";

import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // The PublicTemplate is designed for max-w-4xl (approx 896px)
        const newScale = containerWidth / 900;
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
          <Icon icon="solar:globus-linear" className="text-nw-acid" />
          Modern Web Preview
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-nw-acid animate-pulse"></div>
          <span className="font-mono text-[8px] uppercase text-nw-acid">Magic Link View</span>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="relative flex-1 overflow-y-auto bg-nw-bone/30 border border-nw-graphite/10 rounded-sm scrollbar-hide"
      >
        <div 
          className="absolute top-0 left-0 transition-transform duration-300 ease-out origin-top-left"
          style={{ 
            width: '900px',
            transform: `scale(${scale})`,
          }}
        >
          <PublicTemplate 
            id={projectId || "PREVIEW"}
            mode={mode}
            input={input}
            result={result}
            createdAt={new Date()}
          />
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-nw-black text-nw-bone font-mono text-[9px] uppercase track-widest flex items-center gap-3">
        <Icon icon="solar:magic-stick-linear" className="text-nw-acid" />
        This matches the experience your client sees online.
      </div>
    </div>
  );
}
