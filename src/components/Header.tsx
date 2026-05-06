"use client";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-nw-graphite/20 bg-nw-bone/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-nw-acid animate-pulse"></div>
          <span className="font-display font-bold text-[clamp(1.1rem,2vw,1.4rem)] track-tighter text-nw-black">
            northernware<span className="text-nw-acid">®</span>
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase track-widest text-nw-graphite border-l border-nw-graphite/30 pl-3 ml-1">
            pricer v1.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase track-widest text-nw-graphite">
            <span className="w-1.5 h-1.5 rounded-full bg-nw-emerald"></span>
            Internal Tool
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="font-mono text-[10px] uppercase track-widest text-nw-graphite hover:text-nw-acid transition-colors flex items-center gap-2"
          >
            Logout
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
