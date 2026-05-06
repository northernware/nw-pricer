import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import { FEATURES, HOSTING_PLANS, PROJECT_TYPES, DESIGN_LEVELS } from "@/lib/constants";

// ─── Northernware Sender Info ───
const SENDER = {
  company: "Northernware",
  state: "Northern Luzon",
  country: "Philippines",
  website: "www.northernware.ph",
};

interface ProposalDocumentProps {
  id: string;
  input: CalculatorInput;
  result: CalculatorOutput;
  createdAt: Date;
}

// ─── Content generators keyed by project type ───
const PROJECT_OVERVIEWS: Record<string, string> = {
  business_website:
    "This proposal outlines the design and development of a professional business website to establish a strong digital presence, communicate your brand story, and drive customer engagement. The site will be built with performance, accessibility, and conversion in mind.",
  ecommerce:
    "This proposal covers the end-to-end development of a full-featured e-commerce platform — from product catalog and cart to checkout and order management. The goal is to build a scalable, secure, and seamless online store that converts visitors into loyal customers.",
  redesign:
    "This proposal outlines a complete website redesign initiative aimed at modernizing your digital presence, improving usability, and aligning your online brand with your current business direction. The existing site will be audited, restructured, and rebuilt with a fresh design system.",
  custom_system:
    "This proposal covers the development of a custom web-based system tailored to your unique operational requirements. The platform will be architected for scalability, security, and long-term maintainability — purpose-built for your team's workflows.",
};

const BUSINESS_GOALS: Record<string, string[]> = {
  business_website: [
    "Establish a credible and professional digital presence",
    "Communicate brand value clearly to target audiences",
    "Drive inbound leads and customer inquiries",
    "Improve search engine discoverability",
  ],
  ecommerce: [
    "Launch a fully functional online store with seamless checkout",
    "Increase average order value through smart product presentation",
    "Reduce cart abandonment with optimized UX flows",
    "Enable scalable inventory and order management",
  ],
  redesign: [
    "Modernize the visual identity and user experience",
    "Improve site performance and mobile responsiveness",
    "Align the digital brand with current business positioning",
    "Increase conversion rates through improved UX architecture",
  ],
  custom_system: [
    "Digitize and automate core business workflows",
    "Provide a scalable and maintainable internal platform",
    "Reduce manual operational overhead",
    "Deliver a secure, role-based access system",
  ],
};

const DESIGN_DESCRIPTIONS: Record<string, string> = {
  basic: "A clean, functional design using a proven layout system. Focused on clarity and performance without heavy customization.",
  custom: "A tailored design system crafted to reflect your brand identity. Includes custom layouts, typography, and component design.",
  high_end: "A premium, high-fidelity design experience with advanced animations, bespoke UI components, and a fully custom visual language.",
};

const COMPLEXITY_NOTES: Record<string, string> = {
  simple: "The project architecture follows straightforward patterns with standard integrations and a clean separation of concerns.",
  complex: "The project involves advanced architectural decisions, intricate data flows, and complex integrations requiring careful engineering.",
};

function SectionTitle({ num, title }: { num: number; title: string }) {
  return (
    <h2 className="text-xs uppercase tracking-widest text-nw-acid mb-3 font-mono font-bold border-b border-nw-graphite/20 pb-2">
      {num}. {title}
    </h2>
  );
}

export default function ProposalDocument({
  id,
  input,
  result,
  createdAt,
}: ProposalDocumentProps) {
  const p = input.proposal;
  const fmt = (n: number) => "₱" + n.toLocaleString();
  const dateStr = new Date(createdAt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientNameRaw = `${p.clientFirstName || ""} ${p.clientLastName || ""}`.trim() || p.clientName || "";
  const clientName = clientNameRaw || "Valued Client";

  const projectTypeLabel = PROJECT_TYPES.find(pt => pt.value === input.projectType)?.label || input.projectType;
  const designLevel = DESIGN_LEVELS.find(dl => dl.value === input.designLevel);
  const hostingPlan = HOSTING_PLANS.find(h => h.value === input.hostingPlan);
  const hasHosting = input.hostingPlan !== "none" && !!hostingPlan;
  const selectedFeatures = FEATURES.filter(f => input.features.includes(f.value));

  const overview = PROJECT_OVERVIEWS[input.projectType] || PROJECT_OVERVIEWS.business_website;
  const goals = BUSINESS_GOALS[input.projectType] || BUSINESS_GOALS.business_website;
  const designDesc = DESIGN_DESCRIPTIONS[input.designLevel] || DESIGN_DESCRIPTIONS.custom;
  const complexityNote = COMPLEXITY_NOTES[input.complexity] || COMPLEXITY_NOTES.simple;

  const deliverables = [
    `${input.pages}-page ${projectTypeLabel} (fully responsive, mobile-first)`,
    `${input.designLevel === "high_end" ? "High-end bespoke" : input.designLevel === "custom" ? "Custom" : "Clean functional"} UI/UX design (${designLevel?.hours}h design phase)`,
    ...selectedFeatures.map(f => `${f.label} (+${f.hours}h)`),
    hasHosting ? `${hostingPlan!.label} — Managed Hosting & Maintenance (₱${hostingPlan!.price.toLocaleString()}/mo)` : null,
    "Cross-browser & device quality assurance",
    "Technical documentation & handover",
    "30-day post-launch support",
  ].filter(Boolean) as string[];

  const exclusions: Record<string, string[]> = {
    business_website: [
      "Content writing and copywriting",
      "Professional photography or videography",
      "Premium stock asset licensing",
      "Domain registration and hosting fees (if not on hosting plan)",
    ],
    ecommerce: [
      "Product photography and editing",
      "Payment gateway transaction fees",
      "Shipping and logistics configuration beyond API scope",
      "Bulk product data entry",
    ],
    redesign: [
      "Content migration for broken or legacy links",
      "Server-side repair of old architecture",
      "SEO ranking guarantees",
    ],
    custom_system: [
      "Third-party API subscription or usage fees",
      "Hardware procurement and setup",
      "User training beyond documented scope",
      "Ongoing data entry and system population",
    ],
  };

  const projectExclusions = exclusions[input.projectType] || exclusions.business_website;

  const validUntil = p.validityPeriod
    ? `${p.validityPeriod} from date of issue`
    : new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
      });

  return (
    <div className="bg-nw-white p-8 md:p-16 border-t-4 border-nw-acid shadow-xl relative z-10 w-full font-body text-nw-black">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row justify-between items-start mb-12 border-b-2 border-nw-black pb-8 gap-6 md:gap-0">
        <div>
          <h1 className="text-4xl font-display font-bold track-tighter m-0">
            northernware<span className="text-nw-acid text-xl align-super ml-1">®</span>
          </h1>
          <p className="mt-2 text-xs uppercase track-widest text-nw-graphite font-bold font-mono">
            Strategic Project Proposal
          </p>
        </div>
        <div className="text-right text-xs text-nw-graphite leading-relaxed font-mono">
          <strong>DOCUMENT ID:</strong> PRP-{id.toUpperCase()}<br />
          <strong>DATE:</strong> {dateStr}<br />
          <strong>VALID UNTIL:</strong> {validUntil}
        </div>
      </header>

      {/* ── Client / Provider Info ── */}
      <section className="flex flex-col md:flex-row justify-between mb-12 bg-nw-bone/50 p-6 md:p-8 border-l-4 border-nw-acid gap-8 md:gap-0">
        <div className="w-full md:w-1/2">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">Prepared For</div>
          {p.clientCompany ? (
            <>
              <div className="text-2xl font-display font-bold mb-1">{p.clientCompany}</div>
              {clientNameRaw && (
                <div className="text-sm text-nw-graphite">Attn: {clientNameRaw}</div>
              )}
            </>
          ) : (
            <div className="text-2xl font-display font-bold mb-1">{clientName}</div>
          )}
          <div className="text-sm text-nw-graphite mt-1">{p.projectName || "Website Development Project"}</div>
        </div>
        <div className="w-full md:w-2/5 md:text-right">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">Service Provider</div>
          <div className="text-sm font-bold mb-1">{SENDER.company}</div>
          <div className="text-xs text-nw-graphite mb-1">{SENDER.state}, {SENDER.country}</div>
          <div className="text-xs text-nw-graphite">{SENDER.website}</div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="space-y-10">

        {/* 1. Executive Summary */}
        <div>
          <SectionTitle num={1} title="Executive Summary" />
          <p className="text-sm leading-relaxed">{overview}</p>
          {p.projectOverview && p.projectOverview !== overview && (
            <p className="text-sm leading-relaxed mt-3 italic text-nw-graphite">{p.projectOverview}</p>
          )}
        </div>

        {/* 2. Business Objectives */}
        <div>
          <SectionTitle num={2} title="Business Objectives" />
          <ul className="space-y-2">
            {goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-nw-acid font-bold shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}.</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Project Scope */}
        <div>
          <SectionTitle num={3} title="Project Scope & Technical Approach" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="p-4 bg-nw-bone/30 border border-nw-graphite/20">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2">Project Type</div>
              <div className="font-bold text-sm">{projectTypeLabel}</div>
            </div>
            <div className="p-4 bg-nw-bone/30 border border-nw-graphite/20">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2">Scale</div>
              <div className="font-bold text-sm">{input.pages} Pages · {result.adjustedHours}h Total</div>
            </div>
            <div className="p-4 bg-nw-bone/30 border border-nw-graphite/20">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2">Design Level</div>
              <div className="font-bold text-sm capitalize">{input.designLevel.replace("_", " ")}</div>
              <div className="text-xs text-nw-graphite mt-1">{designDesc}</div>
            </div>
            <div className="p-4 bg-nw-bone/30 border border-nw-graphite/20">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2">Complexity</div>
              <div className="font-bold text-sm capitalize">{input.complexity}</div>
              <div className="text-xs text-nw-graphite mt-1">{complexityNote}</div>
            </div>
          </div>
          {selectedFeatures.length > 0 && (
            <div className="mt-2">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-3">Custom Feature Integrations</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {selectedFeatures.map(f => (
                  <div key={f.value} className="flex items-center gap-2 p-3 border border-nw-graphite/20 text-xs">
                    <span className="text-nw-acid font-bold">+</span>
                    <span>{f.label}</span>
                    <span className="ml-auto text-nw-graphite font-mono">{f.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Deliverables */}
        <div>
          <SectionTitle num={4} title="Key Deliverables" />
          <ul className="space-y-2">
            {deliverables.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-nw-acid font-bold shrink-0 mt-0.5">—</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Hosting (conditional) */}
        {hasHosting && (
          <div>
            <SectionTitle num={5} title="Managed Hosting & Maintenance" />
            <div className="p-6 border border-nw-graphite/20 bg-nw-bone/20">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-sm">{hostingPlan!.label}</div>
                <div className="font-mono text-sm font-bold text-nw-acid">₱{hostingPlan!.price.toLocaleString()}/mo</div>
              </div>
              <p className="text-xs text-nw-graphite mb-4">{hostingPlan!.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {hostingPlan!.includes.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-nw-acid">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. Exclusions */}
        <div>
          <SectionTitle num={hasHosting ? 6 : 5} title="Exclusions & Out-of-Scope" />
          <p className="text-sm text-nw-graphite mb-3 leading-relaxed">
            The following items are not included in this proposal and will require a separate agreement if needed:
          </p>
          <ul className="space-y-2">
            {projectExclusions.map((ex, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-nw-graphite">
                <span className="font-bold shrink-0 mt-0.5">×</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 7. Investment */}
        <div>
          <SectionTitle num={hasHosting ? 7 : 6} title="Financial Investment" />
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-nw-black">
                <th className="text-left py-3 font-mono text-[10px] uppercase tracking-widest text-nw-graphite">Description</th>
                <th className="text-right py-3 font-mono text-[10px] uppercase tracking-widest text-nw-graphite">Hours</th>
                <th className="text-right py-3 font-mono text-[10px] uppercase tracking-widest text-nw-graphite">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-nw-graphite/20">
                <td className="py-3">
                  <div className="font-bold">Core Development & Design</div>
                  <div className="text-xs text-nw-graphite">{input.pages} pages · {input.designLevel} design · {input.complexity} complexity</div>
                </td>
                <td className="py-3 text-right font-mono text-nw-graphite">{result.pagesHours + result.designHours}h</td>
                <td className="py-3 text-right font-mono font-bold">{fmt(result.baseCost - (result.featureHours * result.complexityMultiplier * input.hourlyRate))}</td>
              </tr>
              {selectedFeatures.length > 0 && (
                <tr className="border-b border-nw-graphite/20">
                  <td className="py-3">
                    <div className="font-bold">Feature Integrations</div>
                    <div className="text-xs text-nw-graphite">{selectedFeatures.map(f => f.label).join(" · ")}</div>
                  </td>
                  <td className="py-3 text-right font-mono text-nw-graphite">{result.featureHours}h</td>
                  <td className="py-3 text-right font-mono font-bold">{fmt(result.featureHours * result.complexityMultiplier * input.hourlyRate)}</td>
                </tr>
              )}
              {result.discountAmount > 0 && (
                <tr className="border-b border-nw-graphite/20 text-nw-acid">
                  <td className="py-3">Strategic Discount ({input.discountPercent}%)</td>
                  <td className="py-3 text-right font-mono">—</td>
                  <td className="py-3 text-right font-mono font-bold">-{fmt(result.discountAmount)}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full md:w-72">
              <div className="flex justify-between items-center p-6 bg-nw-black text-nw-bone">
                <span className="font-mono text-xs uppercase tracking-widest font-bold">Total Investment</span>
                <span className="text-3xl font-display font-bold text-nw-acid">{fmt(result.roundedPrice)}</span>
              </div>
              <p className="text-[10px] text-nw-graphite text-right mt-2 italic">
                * All prices in Philippine Pesos (PHP). Non-VAT.
              </p>
            </div>
          </div>

          {input.invoices && input.invoices.length > 0 && (
            <div className="mt-8 p-6 bg-nw-bone/50 border border-nw-graphite/20">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-4">Payment Schedule</div>
              <table className="w-full border-collapse text-sm font-mono">
                <thead>
                  <tr className="border-b border-nw-graphite/20">
                    <th className="text-left py-2 text-[10px] uppercase tracking-widest text-nw-graphite">Milestone</th>
                    <th className="text-right py-2 text-[10px] uppercase tracking-widest text-nw-graphite">%</th>
                    <th className="text-right py-2 text-[10px] uppercase tracking-widest text-nw-graphite">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {input.invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-nw-graphite/10">
                      <td className="py-2 text-nw-graphite">{inv.label}</td>
                      <td className="py-2 text-right text-nw-graphite">{inv.percentage}%</td>
                      <td className="py-2 text-right font-bold">{fmt((result.roundedPrice * inv.percentage) / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 8. Timeline */}
        <div>
          <SectionTitle num={hasHosting ? 8 : 7} title="Estimated Timeline" />
          <div className="p-6 bg-nw-bone/30 border-l-4 border-nw-acid">
            <div className="text-sm font-bold mb-1">{p.timeline || `${Math.ceil(result.adjustedHours / 40)}–${Math.ceil(result.adjustedHours / 30)} weeks from kickoff`}</div>
            <div className="text-xs text-nw-graphite">Based on {result.adjustedHours} total estimated hours at ₱{input.hourlyRate.toLocaleString()}/hr</div>
          </div>
          <p className="text-xs text-nw-graphite mt-3 leading-relaxed">
            Timeline assumes timely delivery of all required assets, content, and feedback from the client within 48 hours of each review cycle. Delays in client-side deliverables may affect the overall project timeline.
          </p>
        </div>

        {/* Footer bar */}
        <div className="border-t border-nw-graphite/20 pt-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
            Confidential · {SENDER.company} · PRP-{id.toUpperCase()} · Valid {validUntil}
          </p>
        </div>

      </div>
    </div>
  );
}
