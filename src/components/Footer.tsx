export default function Footer() {
  return (
    <footer className="border-t border-nw-graphite/20 bg-nw-black relative overflow-hidden">
      <div className="max-w-[clamp(70rem,95vw,100rem)] mx-auto px-[clamp(1.5rem,5vw,4rem)] py-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="font-mono text-[10px] uppercase track-widest text-nw-bone/60">
          © 2026 Northernware Software Development Services
        </div>
        <div className="font-mono text-[10px] uppercase track-widest text-nw-bone/40">
          Internal Pricing Tool — Not for distribution
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[45%] w-full text-center overflow-hidden pointer-events-none z-0 opacity-[0.03]">
        <h1 className="font-display font-bold text-[clamp(6rem,10vw,14rem)] leading-none track-tightest text-nw-bone select-none m-0 p-0">
          NW PRICER
        </h1>
      </div>
    </footer>
  );
}
