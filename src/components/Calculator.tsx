"use client";

import { useState, useMemo } from "react";
import { calculate } from "@/lib/calculator";
import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode } from "@/lib/calculator";
import { DEFAULTS } from "@/lib/constants";
import InputPanel from "./InputPanel";
import OutputPanel from "./OutputPanel";

export default function Calculator() {
  const [projectType, setProjectType] = useState<ProjectType>(DEFAULTS.projectType);
  const [pages, setPages] = useState(DEFAULTS.pages);
  const [designLevel, setDesignLevel] = useState<DesignLevel>(DEFAULTS.designLevel);
  const [complexity, setComplexity] = useState<Complexity>(DEFAULTS.complexity);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [hourlyRate, setHourlyRate] = useState(DEFAULTS.hourlyRate);
  const [bufferPercent, setBufferPercent] = useState(DEFAULTS.bufferPercent);
  const [roundingMode, setRoundingMode] = useState<RoundingMode>(DEFAULTS.roundingMode);

  const toggleFeature = (f: Feature) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const result = useMemo(
    () =>
      calculate({
        projectType,
        pages,
        designLevel,
        complexity,
        features,
        hourlyRate,
        bufferPercent,
        roundingMode,
      }),
    [projectType, pages, designLevel, complexity, features, hourlyRate, bufferPercent, roundingMode]
  );

  return (
    <section className="py-[clamp(3rem,6vw,6rem)] relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-40 pointer-events-none"></div>

      <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <div className="font-mono text-[10px] md:text-xs uppercase track-widest text-nw-graphite mb-4 flex items-center gap-4 before:content-[''] before:w-8 before:h-px before:bg-nw-acid">
            [PRICING ENGINE]
          </div>
          <h1 className="font-display font-bold text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] track-tightest text-nw-black mb-4">
            Calculate project scope.
          </h1>
          <p className="font-body text-[clamp(0.95rem,1.2vw,1.125rem)] text-nw-graphite max-w-[55ch]">
            Configure inputs below. The output updates in real-time — no guesswork, no ambiguity.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-12 gap-[clamp(1.5rem,3vw,2.5rem)]">
          {/* Input Column */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-nw-white border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-nw-graphite/20 pb-4">
                <div className="font-mono text-xs text-nw-black uppercase track-widest flex items-center gap-2">
                  <span className="iconify" data-icon="solar:settings-linear" suppressHydrationWarning></span>
                  scope.config
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-nw-graphite/30 rounded-full"></div>
                  <div className="w-3 h-3 bg-nw-emerald rounded-full animate-pulse"></div>
                </div>
              </div>

              <InputPanel
                projectType={projectType}
                setProjectType={setProjectType}
                pages={pages}
                setPages={setPages}
                designLevel={designLevel}
                setDesignLevel={setDesignLevel}
                complexity={complexity}
                setComplexity={setComplexity}
                features={features}
                toggleFeature={toggleFeature}
                hourlyRate={hourlyRate}
                setHourlyRate={setHourlyRate}
                bufferPercent={bufferPercent}
                setBufferPercent={setBufferPercent}
                roundingMode={roundingMode}
                setRoundingMode={setRoundingMode}
              />
            </div>
          </div>

          {/* Output Column */}
          <div className="col-span-12 lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="bg-nw-bone border-t border-l border-nw-graphite/20 p-[clamp(1.5rem,3vw,2.5rem)] shadow-2xl">
                <OutputPanel result={result} />
              </div>

              {/* Quick summary bar */}
              <div className="mt-4 bg-nw-black text-nw-bone p-4 font-mono text-[10px] uppercase track-widest flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-nw-acid animate-pulse"></span>
                  Live calculation
                </span>
                <span className="text-nw-acid">
                  {result.adjustedHours}h · {features.length} features
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
