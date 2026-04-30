"use client";

import type { ProjectType, DesignLevel, Complexity, Feature, RoundingMode } from "@/lib/calculator";
import { PROJECT_TYPES, DESIGN_LEVELS, COMPLEXITIES, FEATURES, ROUNDING_MODES } from "@/lib/constants";

interface InputPanelProps {
  projectType: ProjectType;
  setProjectType: (v: ProjectType) => void;
  pages: number;
  setPages: (v: number) => void;
  designLevel: DesignLevel;
  setDesignLevel: (v: DesignLevel) => void;
  complexity: Complexity;
  setComplexity: (v: Complexity) => void;
  features: Feature[];
  toggleFeature: (f: Feature) => void;
  hourlyRate: number;
  setHourlyRate: (v: number) => void;
  bufferPercent: number;
  setBufferPercent: (v: number) => void;
  roundingMode: RoundingMode;
  setRoundingMode: (v: RoundingMode) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-3">
      {children}
    </div>
  );
}

export default function InputPanel(props: InputPanelProps) {
  return (
    <div className="space-y-8">
      {/* Project Type */}
      <div>
        <Label>Project Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {PROJECT_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => props.setProjectType(pt.value)}
              className={`group relative font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 text-left ${
                props.projectType === pt.value
                  ? "bg-nw-black text-nw-bone border-nw-black"
                  : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
              }`}
            >
              <span className="text-nw-acid text-[10px] mr-1.5">[{pt.code}]</span>
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pages */}
      <div>
        <Label>
          Number of Pages
          <span className="text-nw-acid ml-2 font-bold">{props.pages}</span>
        </Label>
        <input
          type="range"
          min={1}
          max={30}
          value={props.pages}
          onChange={(e) => props.setPages(Number(e.target.value))}
          className="w-full accent-nw-acid h-1 bg-nw-graphite/20 rounded-none appearance-none cursor-pointer"
        />
        <div className="flex justify-between font-mono text-[10px] text-nw-graphite mt-1">
          <span>1</span>
          <span className="text-nw-acid">
            {props.pages <= 5 ? "10 hrs" : props.pages <= 10 ? "20 hrs" : "30 hrs"}
          </span>
          <span>30</span>
        </div>
      </div>

      {/* Design Level */}
      <div>
        <Label>Design Level</Label>
        <div className="grid grid-cols-3 gap-2">
          {DESIGN_LEVELS.map((dl) => (
            <button
              key={dl.value}
              type="button"
              onClick={() => props.setDesignLevel(dl.value)}
              className={`font-mono text-xs uppercase track-widest px-3 py-3 border transition-all duration-200 ${
                props.designLevel === dl.value
                  ? "bg-nw-black text-nw-bone border-nw-black"
                  : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
              }`}
            >
              <div>{dl.label}</div>
              <div className="text-[10px] mt-1 opacity-60">+{dl.hours}h</div>
            </button>
          ))}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <Label>Complexity</Label>
        <div className="grid grid-cols-3 gap-2">
          {COMPLEXITIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => props.setComplexity(c.value)}
              className={`font-mono text-xs uppercase track-widest px-3 py-3 border transition-all duration-200 ${
                props.complexity === c.value
                  ? "bg-nw-black text-nw-bone border-nw-black"
                  : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
              }`}
            >
              <div>{c.label}</div>
              <div className="text-[10px] mt-1 opacity-60">{c.multiplier}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <Label>Features</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEATURES.map((f) => {
            const active = props.features.includes(f.value);
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => props.toggleFeature(f.value)}
                className={`flex items-center justify-between font-mono text-xs uppercase track-widest px-4 py-3 border transition-all duration-200 ${
                  active
                    ? "bg-nw-black text-nw-bone border-nw-black"
                    : "bg-transparent text-nw-graphite border-nw-graphite/20 hover:border-nw-acid hover:text-nw-black"
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] ${active ? "text-nw-acid" : "opacity-50"}`}>
                  +{f.hours}h
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced: Rate, Buffer, Rounding */}
      <div className="border-t border-nw-graphite/20 pt-6">
        <Label>
          <span className="flex items-center gap-2">
            Advanced Settings
          </span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
              Hourly Rate (₱)
            </div>
            <input
              type="number"
              value={props.hourlyRate}
              onChange={(e) => props.setHourlyRate(Number(e.target.value))}
              className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors"
            />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
              Project Buffer (%)
            </div>
            <input
              type="number"
              value={props.bufferPercent}
              onChange={(e) => props.setBufferPercent(Number(e.target.value))}
              className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors"
            />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">
              Rounding
            </div>
            <select
              value={props.roundingMode}
              onChange={(e) => props.setRoundingMode(e.target.value as RoundingMode)}
              className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-2 transition-colors cursor-pointer"
            >
              {ROUNDING_MODES.map((rm) => (
                <option key={rm.value} value={rm.value} className="bg-nw-bone">
                  {rm.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
