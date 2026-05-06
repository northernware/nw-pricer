import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import { FEATURES, HOSTING_PLANS, PROJECT_TYPES } from "@/lib/constants";
import SignatureBlock from "./SignatureBlock";

// ─── Northernware Sender Info ───
const SENDER = {
  company: "Northernware Software Development Services",
  fullName: "Kenji Von Ashley F. Edillo",
  address: "Tabuk City, Kalinga, Philippines",
  state: "Kalinga",
  country: "Philippines",
};

interface ContractDocumentProps {
  id: string;
  input: CalculatorInput;
  result: CalculatorOutput;
  createdAt: Date;
  isApproved?: boolean;
  signedBy?: string | null;
  approvedAt?: Date | null;
  ipAddress?: string | null;
  snapshotHash?: string | null;
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-nw-black border-b-2 border-nw-black pb-2 mb-4">
        {num}. {title}
      </h2>
      <div className="space-y-3 text-sm text-nw-black leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Clause({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed">{children}</p>;
}

export default function ContractDocument({
  id,
  input,
  result,
  createdAt,
  isApproved,
  signedBy,
  approvedAt,
  ipAddress,
  snapshotHash,
}: ContractDocumentProps) {
  const p = input.proposal;
  const fmt = (n: number) => "₱" + n.toLocaleString();
  const dateStr = new Date(createdAt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clientFirst = p.clientFirstName || p.clientName.split(" ")[0] || "Client";
  const clientLast = p.clientLastName || p.clientName.split(" ").slice(1).join(" ") || "";
  const clientFull = `${clientFirst} ${clientLast}`.trim();
  const clientCompany = p.clientCompany || clientFull;
  const senderFull = SENDER.fullName;

  const projectTypeLabel = PROJECT_TYPES.find(pt => pt.value === input.projectType)?.label || input.projectType;
  const hostingPlan = HOSTING_PLANS.find(h => h.value === input.hostingPlan);
  const hasHosting = input.hostingPlan !== "none" && !!hostingPlan;
  const selectedFeatures = FEATURES.filter(f => input.features.includes(f.value));

  const deliverablesList = [
    `${input.pages}-page ${projectTypeLabel}`,
    input.designLevel === "high_end" ? "High-end custom UI/UX design system" :
    input.designLevel === "custom" ? "Custom UI/UX design" : "Basic design",
    ...selectedFeatures.map(f => f.label),
    hasHosting ? `${hostingPlan!.label} (managed hosting & maintenance)` : null,
    "Technical documentation",
    "30-day post-launch support",
  ].filter(Boolean);

  const sectionCount = {
    devReq: 2,
    hosting: hasHosting ? 3 : null,
    design: hasHosting ? 4 : 3,
    ip: hasHosting ? 5 : 4,
    pricing: hasHosting ? 6 : 5,
    termination: hasHosting ? 7 : 6,
    conflict: hasHosting ? 8 : 7,
    acceptance: hasHosting ? 9 : 8,
  };

  return (
    <div className="bg-nw-white p-8 md:p-16 border-t-4 border-nw-acid shadow-xl relative z-10 w-full font-body text-nw-black">

      {/* ── Header (matches proposal) ── */}
      <header className="flex flex-col md:flex-row justify-between items-start mb-12 border-b-2 border-nw-black pb-8 gap-6 md:gap-0">
        <div>
          <h1 className="text-4xl font-display font-bold track-tighter m-0">
            northernware<span className="text-nw-acid text-xl align-super ml-1">®</span>
          </h1>
          <p className="mt-2 text-xs uppercase track-widest text-nw-graphite font-bold font-mono">
            Master Services Agreement
          </p>
        </div>
        <div className="text-right text-xs text-nw-graphite leading-relaxed font-mono">
          <strong>DOCUMENT ID:</strong> CTR-{id.toUpperCase()}<br />
          <strong>DATE:</strong> {dateStr}<br />
          <strong>PROJECT:</strong> {p.projectName || "Website Development Project"}
        </div>
      </header>

      {/* ── Client Info (matches proposal) ── */}
      <section className="flex flex-col md:flex-row justify-between mb-12 bg-nw-bone/50 p-6 md:p-8 border-l-4 border-nw-acid gap-8 md:gap-0">
        <div className="w-full md:w-1/2">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">Prepared For</div>
          {clientFull ? (
            <>
              <div className="text-2xl font-display font-bold mb-1 text-nw-black">{clientFull}</div>
              {p.clientCompany && (
                <div className="text-sm text-nw-graphite mb-1">{p.clientCompany}</div>
              )}
            </>
          ) : (
            <div className="text-2xl font-display font-bold mb-1 text-nw-black">{p.clientCompany || "Valued Client"}</div>
          )}
        </div>
        <div className="w-full md:w-2/5 md:text-right">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">Prepared By</div>
          <div className="text-sm font-bold mb-1">{SENDER.fullName}</div>
          <div className="text-xs text-nw-graphite mb-1">{SENDER.company}</div>
          <div className="text-xs text-nw-graphite">{SENDER.address}</div>
        </div>
      </section>

      {/* ── Document Body ── */}
      <div>

        {/* Preamble */}
        <div className="mb-10 p-6 bg-nw-bone/50 border-l-4 border-nw-acid text-sm leading-relaxed space-y-3">
          <p>
            This Website Development Services Agreement (<strong>"Agreement"</strong>) is a legally binding agreement between{" "}
            <strong>{senderFull}</strong> (<strong>"Developer"</strong>) operating as {SENDER.company}, and{" "}
            <strong>{clientFull}</strong> (<strong>"Client"</strong>)
            {p.clientCompany ? <> of <strong>{p.clientCompany}</strong></> : ""}, collectively referred to as the <strong>"Parties"</strong>.
          </p>
          <p>
            The Client has agreed to retain the Developer to create, develop, test, and deploy a website in accordance with the scope of work described in this Agreement. The Developer is willing to undertake such work, and both Parties mutually agree to the terms and conditions set forth herein.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
            Agreement Date: {dateStr}
          </p>
        </div>

        {/* Section 1 — Scope of Work */}
        <Section num="1" title="Scope of Work">
          <Clause>
            The Developer agrees to design, develop, test, and deploy a <strong>{projectTypeLabel}</strong> consisting of{" "}
            <strong>{input.pages} pages</strong> with a <strong>{input.designLevel.replace("_", "-")} design level</strong>{" "}
            for the Client's project: <strong>"{p.projectName || "Website Development Project"}"</strong>.
          </Clause>

          <div className="mt-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2">Deliverables</div>
            <ul className="space-y-1">
              {deliverablesList.map((d, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-nw-acid font-bold mt-0.5">—</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 p-4 bg-nw-bone/30 border border-nw-graphite/20">
            <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">Estimated Timeline: </span>
            <span className="text-sm">Approximately {Math.ceil(result.adjustedHours / 40)} weeks from project kickoff</span>
          </div>

          <Clause>
            Any changes to the scope of work must be submitted in writing and approved by both Parties prior to implementation. Scope changes may result in revised timelines and pricing.
          </Clause>
        </Section>

        {/* Section 2 — Developer Requirements */}
        <Section num={`${sectionCount.devReq}`} title="Developer Requirements">
          <Clause>
            {clientFull} hereby retains the services of {senderFull} to design, develop, and deploy a website in accordance with the proposal submitted and agreed upon on {dateStr}.
          </Clause>
          <Clause>
            {senderFull} agrees to notify the Client immediately of any risks, delays, or circumstances that may affect the agreed delivery timeline.
          </Clause>
          <Clause>
            {senderFull} agrees to personally present the completed website{p.presentationDate ? ` on ${p.presentationDate}` : " at a mutually agreed date"} for final approval and acceptance by {clientFull}.
          </Clause>
          <Clause>
            {senderFull} shall provide all necessary equipment, software, and personnel to conduct the final presentation. The Client shall provide suitable space and resources for such a presentation.
          </Clause>
          <Clause>
            Upon completion and approval, or upon termination of this Agreement (whichever occurs first), the Developer shall deliver all materials, source files, and assets developed under this Agreement to the Client in compatible digital formats.
          </Clause>
        </Section>

        {/* Section 3 — Web Hosting (conditional) */}
        {hasHosting && (
          <Section num="3" title="Web Hosting & Maintenance">
            <Clause>
              {senderFull} shall provide managed website hosting services under the <strong>{hostingPlan!.label}</strong> (₱{hostingPlan!.price.toLocaleString()}/month) once development is complete. The hosting environment shall maintain a minimum of <strong>99.9% server uptime</strong>.
            </Clause>
            <Clause>
              The Developer shall maintain an offline backup copy of the Client's website as a contingency against data loss or server failure.
            </Clause>
            <Clause>
              Maintenance requests and content modifications are expected to be completed within <strong>{p.maintenanceDays || "3"} business days</strong> of acknowledgment, subject to the complexity of the request.
            </Clause>
            <Clause>
              The Developer agrees to provide reasonable access to any parties authorized by the Client for the purposes of website audits, updates, or modifications.
            </Clause>
            <div className="mt-4 p-4 bg-nw-bone/30 border border-nw-graphite/20">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2">Plan Includes</div>
              <ul className="space-y-1">
                {hostingPlan!.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-nw-acid">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        )}

        {/* Design Section */}
        <Section num={`${sectionCount.design}`} title="Design">
          <Clause>
            {senderFull} agrees to obtain design approval from {clientFull} prior to commencing development by submitting detailed design mockups for review.
          </Clause>
          <Clause>
            The Client's website will not include any destructive, crude, harassing, violent, sexual, or otherwise inappropriate content, unless previously agreed upon in writing by both Parties.
          </Clause>
          <Clause>
            All materials, content, and assets to be supplied by the Client must be provided in compatible file formats and within agreed timelines to avoid project delays.
          </Clause>
          <Clause>
            Until the final website receives formal approval from the Client, no portion of the site shall be made publicly accessible without proper access controls in place.
          </Clause>
          <Clause>
            {senderFull} agrees to maintain website backups and retain a copy of all final materials for a period of <strong>{p.backupTerm || "6 months"}</strong> from the project completion date.
          </Clause>
          <Clause>
            Upon termination of this Agreement or expiry of the agreed backup term, {senderFull} will securely destroy all copies, files, and documents related to this project, unless otherwise instructed in writing by the Client.
          </Clause>
        </Section>
  
        {/* Intellectual Property Section */}
        <Section num={`${sectionCount.ip}`} title="Intellectual Property">
          <Clause>
            Upon receipt of final payment, {senderFull} hereby assigns and transfers all rights, title, and interest in and to the final deliverables and source code created under this Agreement to {clientFull}.
          </Clause>
          <Clause>
            {senderFull} shall retain ownership of any pre-existing code, libraries, frameworks, or generic tools used in the development of the website ("Developer Tools"). {clientFull} is granted a non-exclusive, perpetual, royalty-free license to use such Developer Tools as part of the website.
          </Clause>
          <Clause>
            {senderFull} reserves the right to showcase the completed website and its components in their professional portfolio, website, or marketing materials as a demonstration of their work, unless otherwise restricted by a non-disclosure agreement.
          </Clause>
        </Section>

        {/* Pricing Section */}
        <Section num={`${sectionCount.pricing}`} title="Pricing & Payment">
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-nw-black">
                  <th className="text-left py-2 font-mono text-[10px] uppercase tracking-widest text-nw-graphite">Item</th>
                  <th className="text-right py-2 font-mono text-[10px] uppercase tracking-widest text-nw-graphite">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-nw-graphite/20">
                  <td className="py-3">
                    <div className="font-bold">Core Development & Design</div>
                    <div className="text-xs text-nw-graphite">{input.pages} pages · {input.designLevel.replace("_", " ")} design</div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold">{fmt((result.pagesHours + result.designHours) * input.hourlyRate)}</td>
                </tr>
                {selectedFeatures.length > 0 && (
                  <tr className="border-b border-nw-graphite/20">
                    <td className="py-3">
                      <div className="font-bold">Custom Feature Integrations</div>
                      <div className="text-xs text-nw-graphite">{selectedFeatures.map(f => f.label).join(" · ")}</div>
                    </td>
                    <td className="py-3 text-right font-mono font-bold">{fmt(result.featureHours * input.hourlyRate)}</td>
                  </tr>
                )}
                <tr className="border-b border-nw-graphite/20">
                  <td className="py-3">
                    <div className="font-bold">Technical Management & QA</div>
                    <div className="text-xs text-nw-graphite">Complexity adjustment, project buffer, and quality assurance</div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold">
                    {fmt(result.roundedPrice + result.discountAmount - (result.baseHours * input.hourlyRate))}
                  </td>
                </tr>
                {result.discountAmount > 0 && (
                  <>
                    <tr className="border-b border-nw-graphite/20 bg-nw-bone/30">
                      <td className="py-3 font-bold uppercase tracking-widest text-[10px]">Gross Investment (Pre-Discount)</td>
                      <td className="py-3 text-right font-mono font-bold">{fmt(result.roundedPrice + result.discountAmount)}</td>
                    </tr>
                    <tr className="border-b border-nw-graphite/20 text-nw-acid">
                      <td className="py-3 font-bold uppercase tracking-widest text-[10px]">Strategic Discount ({input.discountPercent}%)</td>
                      <td className="py-3 text-right font-mono font-bold">-{fmt(result.discountAmount)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-64">
              <div className="flex justify-between items-center p-5 bg-nw-black text-nw-bone">
                <span className="font-mono text-xs uppercase tracking-widest font-bold">Total Investment</span>
                <span className="text-2xl font-display font-bold text-nw-acid">{fmt(result.roundedPrice)}</span>
              </div>
              <p className="text-[10px] text-nw-graphite text-right mt-2 italic">* All prices are in Philippine Pesos (PHP). Non-VAT.</p>
            </div>
          </div>

          {input.invoices && input.invoices.length > 0 && (
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-3">Payment Schedule</div>
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
        </Section>

        {/* Termination */}
        <Section num={`${sectionCount.termination}`} title="Termination">
          <Clause>
            {clientFull} may terminate this Agreement at any time by providing written notice via email or certified mail to {senderFull}.
          </Clause>
          <Clause>
            {senderFull} may cancel this Agreement in the same manner if circumstances require it.
          </Clause>
          <Clause>
            In the event of termination by either Party, {senderFull} shall issue a final invoice for any unbilled work or materials completed up to the date of termination. {clientFull} agrees to pay the final invoice in accordance with the payment terms of this Agreement.
          </Clause>
        </Section>

        {/* Conflict Resolution */}
        <Section num={`${sectionCount.conflict}`} title="Conflict Resolution">
          <Clause>
            This Agreement shall be governed by the prevailing laws of {SENDER.state}, {SENDER.country}. Should any conflicts arise in relation to this Agreement, the Parties agree to seek resolution through a mutually agreed neutral arbitrator. The arbitrator's ruling shall be considered final and binding on both Parties.
          </Clause>
        </Section>

        {/* Acceptance */}
        <Section num={`${sectionCount.acceptance}`} title="Acceptance">
          <Clause>
            By signing below, both Parties acknowledge that they have read, understood, and agreed to all terms and conditions outlined in this Website Development Services Agreement.
          </Clause>

          <div className="mt-10 flex flex-col md:flex-row justify-between gap-12">
            {/* Client signature */}
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase track-widest mb-6 text-nw-graphite font-mono">
                Authorized Representative — {p.clientCompany || clientFull}
              </div>
              <SignatureBlock
                projectId={id}
                isApproved={!!isApproved}
                signedBy={signedBy}
                approvedAt={approvedAt}
                title={p.clientSignerTitle}
                ipAddress={ipAddress}
                snapshotHash={snapshotHash}
              />
            </div>

            {/* Sender signature */}
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-6 text-nw-graphite font-mono">
                Authorized Representative — {SENDER.company}
              </div>
              <div className="border-b border-nw-black mb-2 pb-1 h-[45px] flex items-end">
                <img src="https://northernware.ph/sig.png" alt="Signature" className="h-[35px] -mb-1" />
              </div>
              <div className="text-xs font-bold">{senderFull}</div>
              <div className="text-xs text-nw-graphite">CEO, {SENDER.company}</div>
              <div className="text-[10px] text-nw-graphite font-mono mt-1">{dateStr}</div>
            </div>
          </div>
        </Section>

        <div className="border-t border-nw-graphite/20 pt-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
            {SENDER.company} · {SENDER.address} · CTR-{id.toUpperCase()} · {dateStr}
          </p>
        </div>
      </div>
    </div>
  );
}
