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
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = containerWidth / 900;
        setScale(newScale);
      }
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    // Watch for content height changes (like when switching tabs)
    const observer = new ResizeObserver(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight);
      }
    });
    
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, [mode, input]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef} 
        className="relative flex-1 overflow-y-auto overflow-x-hidden bg-nw-bone/30 border border-nw-graphite/10 rounded-sm scrollbar-hide"
      >
        <div style={{ height: `${contentHeight * scale}px` }}>
          <div 
            ref={contentRef}
            className="absolute top-0 left-0 origin-top-left"
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
      </div>
      
      <div className="mt-4 p-4 bg-nw-black text-nw-bone font-mono text-[9px] uppercase track-widest flex items-center gap-3">
        <Icon icon="solar:magic-stick-linear" className="text-nw-acid" />
        This matches the experience your client sees online.
      </div>
    </div>
  );
}
