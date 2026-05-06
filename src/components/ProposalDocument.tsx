import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import { FEATURES, HOSTING_PLANS, PROJECT_TYPES, DESIGN_LEVELS } from "@/lib/constants";

// ─── Northernware Sender Info ───
const SENDER = {
  company: "Northernware Software Development Services",
  fullName: "Kenji Von Ashley F. Edillo",
  address: "Tabuk City, Kalinga, Philippines",
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
    "requires a professional digital presence to support your growth strategy. This website will allow you to expose your brand to organic audiences via search engines, leverage digital advertising to boost lead generation, and deploy content marketing to build brand awareness and authority.",
  ecommerce:
    "requires a full-featured e-commerce platform to drive online revenue. This solution will enable seamless product discovery, secure checkout, and efficient order management, allowing you to scale your retail operations globally.",
  redesign:
    "requires a strategic website overhaul to modernize your digital brand. We will audit your current site, restructure the user journey, and implement a fresh design system that aligns with your current business trajectory and conversion goals.",
  custom_system:
    "requires a purpose-built web application to automate and streamline core business workflows. This system will provide a secure, scalable, and user-centric platform tailored specifically to your team's operational requirements.",
};

const SOLUTION_DETAILS: Record<string, { tech: string; benefits: string[] }> = {
  business_website: {
    tech: "modern Content Management System (CMS)",
    benefits: ["Easily update page content and images", "Integrate with analytics to track performance", "Post new content to your company blog"],
  },
  ecommerce: {
    tech: "robust E-commerce Engine",
    benefits: ["Manage products, inventory, and categories", "Process secure payments via multiple gateways", "Track orders and customer data in real-time"],
  },
  redesign: {
    tech: "high-performance modern framework",
    benefits: ["Significantly faster page load times", "Enhanced mobile responsiveness", "Improved SEO and conversion architecture"],
  },
  custom_system: {
    tech: "bespoke full-stack architecture",
    benefits: ["Automated internal workflows", "Role-based access and data security", "Scalable infrastructure for future growth"],
  },
};

function SectionTitle({ num, title }: { num: number; title: string }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-nw-acid mb-2">
        Section {num.toString().padStart(2, "0")}
      </div>
      <h2 className="text-xl font-display font-bold tracking-tight text-nw-black border-b border-nw-graphite/10 pb-4">
        {title}
      </h2>
    </div>
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
  const clientCompany = p.clientCompany || clientName;

  const projectTypeLabel = PROJECT_TYPES.find(pt => pt.value === input.projectType)?.label || input.projectType;
  const designLevel = DESIGN_LEVELS.find(dl => dl.value === input.designLevel);
  const hostingPlan = HOSTING_PLANS.find(h => h.value === input.hostingPlan);
  const hasHosting = input.hostingPlan !== "none" && !!hostingPlan;
  const selectedFeatures = FEATURES.filter(f => input.features.includes(f.value));

  const overview = PROJECT_OVERVIEWS[input.projectType] || PROJECT_OVERVIEWS.business_website;
  const solution = SOLUTION_DETAILS[input.projectType] || SOLUTION_DETAILS.business_website;

  const validUntil = p.validityPeriod
    ? `${p.validityPeriod} from date of issue`
    : new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
      });

  // Calculate timeline estimates (simplified)
  const totalWeeks = Math.ceil(result.adjustedHours / 30);
  const stages = [
    { name: "Project Kickoff & Strategy", week: "Week 01" },
    { name: "UI/UX Design & Mockups", week: `Week ${Math.ceil(totalWeeks * 0.3).toString().padStart(2, "0")}` },
    { name: "Development & Functional Prototype", week: `Week ${Math.ceil(totalWeeks * 0.6).toString().padStart(2, "0")}` },
    { name: "QA, Testing & Optimization", week: `Week ${Math.ceil(totalWeeks * 0.9).toString().padStart(2, "0")}` },
    { name: "Final Deployment & Handover", week: `Week ${totalWeeks.toString().padStart(2, "0")}` },
  ];

  return (
    <div className="bg-nw-white p-8 md:p-16 border-t-4 border-nw-acid shadow-xl relative z-10 w-full font-body text-nw-black">

      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row justify-between items-start mb-16 border-b-2 border-nw-black pb-8 gap-6 md:gap-0">
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
      <section className="flex flex-col md:flex-row justify-between mb-20 bg-nw-bone/50 p-6 md:p-10 border-l-4 border-nw-acid gap-8 md:gap-0">
        <div className="w-full md:w-1/2">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-3 font-mono font-bold">Prepared For</div>
          {clientNameRaw ? (
            <>
              <div className="text-3xl font-display font-bold mb-1">{clientNameRaw}</div>
              {p.clientCompany && (
                <div className="text-sm text-nw-graphite font-medium">{p.clientCompany}</div>
              )}
            </>
          ) : (
            <div className="text-3xl font-display font-bold mb-1">{p.clientCompany || "Valued Client"}</div>
          )}
        </div>
        <div className="w-full md:w-2/5 md:text-right">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-3 font-mono font-bold">Project Lead</div>
          <div className="text-xl font-display font-bold mb-1">{SENDER.fullName}</div>
          <div className="text-xs text-nw-graphite mb-1">{SENDER.company}</div>
          <div className="text-xs text-nw-graphite">{SENDER.address}</div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="space-y-20">

        {/* 1. Introduction */}
        <div>
          <SectionTitle num={1} title="Introduction" />
          <div className="space-y-4 text-sm leading-relaxed max-w-3xl">
            <p>
              Thank you for your interest in partnering with <strong>{SENDER.company}</strong> for your website development project. With well over 100,000 firms offering website development services, we know how challenging it can be to find the right agency for your web development needs.
            </p>
            <p>
              At <strong>{SENDER.company}</strong>, we hold one goal above all others: 100% client satisfaction. Our in-house team of web designers and developers uphold the highest standards for project planning and execution, and we're dedicated to building the perfect website for your company on-time and on-budget.
            </p>
            <p>
              We've built websites for several brands with great success, and are quite excited to get to work on yours. In this proposal, you'll find what we feel is the optimal solution for your website development needs, along with the associated delivery timeline, costs, and project terms.
            </p>
            <div className="pt-4">
              <p className="font-bold">{SENDER.fullName}</p>
              <p className="text-xs text-nw-graphite font-mono uppercase tracking-widest">{SENDER.company}</p>
            </div>
          </div>
        </div>

        {/* 2. Executive Summary */}
        <div>
          <SectionTitle num={2} title="Executive Summary" />
          <div className="space-y-4 text-sm leading-relaxed max-w-3xl">
            <p>
              <strong>{clientCompany}</strong> {overview}
            </p>
            <p>
              <strong>{SENDER.company}</strong> is uniquely qualified to build the website that you desire, due to our focus on high-performance architecture, our in-house team of experts, and our commitment to strategic design that actually converts visitors into customers.
            </p>
          </div>
        </div>

        {/* 3. Solution Outline */}
        <div>
          <SectionTitle num={3} title="Solution Outline" />
          <div className="space-y-6 text-sm leading-relaxed max-w-3xl">
            <p>
              <strong>{SENDER.company}</strong> will build your website using a <strong>{solution.tech}</strong>. This technology is known for its speed, security, and scalability—ensuring your digital presence can grow as your business does.
            </p>
            <p>This solution will allow you to do the following once your website is launched:</p>
            <ul className="space-y-3 pl-2">
              {solution.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-nw-acid rounded-full shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {hasHosting && (
              <div className="mt-8 p-6 bg-nw-bone/30 border border-nw-graphite/10">
                <p>
                  We propose that your site be hosted using modern, high-performance infrastructure. This will ensure that your website is capable of supporting a high volume of traffic while remaining protected and optimized for search engines.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Site Structure & Features */}
        <div>
          <SectionTitle num={4} title="Site Structure & Integrations" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-nw-graphite mb-4">Proposed Page Architecture</div>
              <ul className="space-y-2 border-l border-nw-graphite/20 pl-4">
                <li className="text-sm font-bold text-nw-black">Home</li>
                <li className="text-sm text-nw-graphite">About</li>
                <li className="text-sm text-nw-graphite">Services / Products</li>
                <li className="text-sm text-nw-graphite">Blog / Insights</li>
                <li className="text-sm text-nw-graphite">Contact</li>
                {input.pages > 5 && (
                  <li className="text-sm text-nw-acid italic">+ {input.pages - 5} Additional Strategic Pages</li>
                )}
              </ul>
            </div>
            {selectedFeatures.length > 0 && (
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-nw-graphite mb-4">Core Integrations & Features</div>
                <div className="grid grid-cols-1 gap-2">
                  {selectedFeatures.map(f => (
                    <div key={f.value} className="flex items-center gap-2 p-3 bg-nw-bone/20 border border-nw-graphite/10 text-xs">
                      <span className="text-nw-acid font-bold">✓</span>
                      <span>{f.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 p-3 bg-nw-bone/20 border border-nw-graphite/10 text-xs">
                    <span className="text-nw-acid font-bold">✓</span>
                    <span>Search Engine Optimization (SEO) Base</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Execution Timeline */}
        <div>
          <SectionTitle num={5} title="Execution Timeline" />
          <p className="text-sm text-nw-graphite mb-6 leading-relaxed max-w-2xl">
            The following table details our projected execution timeline for your website development project.
          </p>
          <div className="overflow-hidden border border-nw-black">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-nw-black text-nw-bone font-mono text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="p-4 border-r border-nw-bone/20">Stage</th>
                  <th className="p-4 text-right">Target Milestone</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s, i) => (
                  <tr key={i} className="border-b border-nw-graphite/20 last:border-0 hover:bg-nw-bone/30 transition-colors">
                    <td className="p-4 font-medium border-r border-nw-graphite/20">{s.name}</td>
                    <td className="p-4 text-right font-mono text-nw-graphite">{s.week}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-nw-graphite mt-4 italic max-w-2xl">
            Disclaimer: The milestones above are estimates based on our experience with similar projects. We strive for accuracy but timelines may adjust in response to unforeseen delays or scope changes.
          </p>
        </div>

        {/* 6. Financial Investment */}
        <div>
          <SectionTitle num={6} title="Project Investment" />
          <div className="overflow-hidden border border-nw-graphite/20 mb-8">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-nw-bone/50 font-mono text-[10px] uppercase tracking-widest text-nw-graphite border-b border-nw-graphite/20">
                <tr>
                  <th className="p-4 text-left font-bold">Description</th>
                  <th className="p-4 text-right font-bold">Investment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nw-graphite/10">
                <tr>
                  <td className="p-4">
                    <div className="font-bold">Core Development & Design</div>
                    <div className="text-[10px] text-nw-graphite">{input.pages} pages · {designLevel?.label} design</div>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-nw-black">{fmt(result.baseCost - (result.featureHours * result.complexityMultiplier * input.hourlyRate))}</td>
                </tr>
                {selectedFeatures.length > 0 && (
                  <tr>
                    <td className="p-4">
                      <div className="font-bold">Strategic Feature Integrations</div>
                      <div className="text-[10px] text-nw-graphite">{selectedFeatures.map(f => f.label).join(", ")}</div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-nw-black">{fmt(result.featureHours * result.complexityMultiplier * input.hourlyRate)}</td>
                  </tr>
                )}
                {result.discountAmount > 0 && (
                  <tr className="bg-nw-acid/5 text-nw-acid">
                    <td className="p-4 font-bold">Strategic Partnership Discount ({input.discountPercent}%)</td>
                    <td className="p-4 text-right font-mono font-bold">-{fmt(result.discountAmount)}</td>
                  </tr>
                )}
                <tr className="bg-nw-black text-nw-bone">
                  <td className="p-4 font-display font-bold text-lg uppercase tracking-tight">Total Project Investment</td>
                  <td className="p-4 text-right font-display font-bold text-2xl text-nw-acid">{fmt(result.roundedPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {input.invoices && input.invoices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="p-6 bg-nw-bone/30 border border-nw-graphite/10">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-nw-graphite mb-4">Payment Schedule</div>
                <div className="space-y-4">
                  {input.invoices.map(inv => (
                    <div key={inv.id} className="flex justify-between items-end border-b border-nw-graphite/10 pb-2">
                      <div>
                        <div className="text-xs font-bold">{inv.label}</div>
                        <div className="text-[10px] text-nw-graphite font-mono">{inv.percentage}% of total</div>
                      </div>
                      <div className="font-mono text-sm font-bold">{fmt((result.roundedPrice * inv.percentage) / 100)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-nw-graphite leading-relaxed">
                <p className="mb-2"><strong>Payment Terms:</strong> Invoices are payable via bank transfer or G-Cash. Each milestone payment is required before proceeding to the next project phase.</p>
                <p>* All prices are in Philippine Pesos (PHP). Non-VAT.</p>
              </div>
            </div>
          )}
        </div>

        {/* 7. Acceptance */}
        <div>
          <SectionTitle num={7} title="Acceptance" />
          <div className="space-y-6 text-sm leading-relaxed max-w-3xl mb-12">
            <p>
              Once you've reviewed this proposal thoroughly, simply electronically sign below to indicate your approval and initiate the project. We're excited to build something exceptional with you.
            </p>
          </div>
          
          <div className="mt-10 pt-10 border-t-2 border-nw-black">
             <div className="text-[10px] font-bold uppercase track-widest mb-6 text-nw-graphite font-mono">
                Authorized Approval — {clientCompany}
              </div>
              <div className="h-32 border-b-2 border-nw-graphite/20 mb-4"></div>
              <div className="flex justify-between font-mono text-[10px] uppercase text-nw-graphite">
                <span>Signature</span>
                <span>Date</span>
              </div>
          </div>
        </div>

        {/* Footer bar */}
        <footer className="border-t border-nw-graphite/20 pt-8 flex justify-between items-center text-nw-graphite">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em]">
            {SENDER.company} · {SENDER.address}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em]">
            PRP-{id.toUpperCase()}
          </div>
        </footer>

      </div>
    </div>
  );
}
