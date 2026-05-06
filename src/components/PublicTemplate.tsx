"use client";

import { PROJECT_TYPES, FEATURES } from "@/lib/constants";
import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import { Icon } from "@iconify/react";
import SignatureBlock from "./SignatureBlock";
import PaymentBlock from "./PaymentBlock";
import ContractDocument from "./ContractDocument";
import ProposalDocument from "./ProposalDocument";

interface PublicTemplateProps {
  id: string;
  mode: 'quote' | 'proposal' | 'contract' | 'invoice';
  input: CalculatorInput;
  result: CalculatorOutput;
  createdAt: Date;
  isApproved?: boolean;
  signedBy?: string | null;
  approvedAt?: Date | null;
  invoiceId?: string | null;
}

export default function PublicTemplate({ 
  id, 
  mode, 
  input, 
  result, 
  createdAt, 
  isApproved, 
  signedBy, 
  approvedAt,
  invoiceId 
}: PublicTemplateProps) {
  const projectTypeLabel = PROJECT_TYPES.find(p => p.value === input.projectType)?.label || input.projectType;
  const hostingPlan = input.hostingPlan;

  const fmt = (n: number) => "₱" + n.toLocaleString();

  const isProposal = mode === 'proposal' || mode === 'quote';
  const isContract = mode === 'contract';
  const isInvoice = mode === 'invoice';

  // Contract mode: use the fully auto-generated legal document
  if (isContract) {
    return (
      <ContractDocument
        id={id}
        input={input}
        result={result}
        createdAt={createdAt}
        isApproved={isApproved}
        signedBy={signedBy}
        approvedAt={approvedAt}
      />
    );
  }

  // Proposal/quote mode: auto-generated narrative from calculator
  if (isProposal) {
    return (
      <ProposalDocument
        id={id}
        input={input}
        result={result}
        createdAt={createdAt}
      />
    );
  }

  const selectedInvoice = isInvoice && invoiceId && input.invoices
    ? input.invoices.find(inv => inv.id === invoiceId)
    : null;

  const invoiceAmount = selectedInvoice 
    ? (result.roundedPrice * selectedInvoice.percentage) / 100
    : result.roundedPrice;

  const docTitle = isProposal ? "STRATEGIC PROJECT PROPOSAL" :
                   isContract ? "MASTER SERVICES AGREEMENT" :
                   isInvoice ? (selectedInvoice ? `TAX INVOICE: ${selectedInvoice.label}` : "TAX INVOICE") : "PROJECT QUOTATION";
                   
  const docPrefix = isProposal ? "PRP" :
                    isContract ? "CTR" :
                    isInvoice ? "INV" : "QUO";

  return (
    <div className="bg-nw-white p-8 md:p-16 border-t-4 border-nw-acid shadow-xl relative z-10 w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start mb-12 border-b-2 border-nw-black pb-8 gap-6 md:gap-0">
        <div>
          <h1 className="text-4xl font-display font-bold track-tighter m-0">
            northernware<span className="text-nw-acid text-xl align-super ml-1">®</span>
          </h1>
          <p className="mt-2 text-xs uppercase track-widest text-nw-graphite font-bold font-mono">
            {docTitle}
          </p>
        </div>
        <div className="text-right text-xs text-nw-graphite leading-relaxed font-mono">
          <strong>DOCUMENT ID:</strong> {docPrefix}-{id.toUpperCase()}{selectedInvoice ? `-${selectedInvoice.id.split('_')[1]}` : ''}<br />
          <strong>DATE:</strong> {new Date(createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}<br />
          {!isInvoice && (
            <><strong>VALID UNTIL:</strong> {input.proposal.validityPeriod || new Date(new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</>
          )}
          {isInvoice && (
            <><strong>DUE DATE:</strong> Upon Receipt</>
          )}
        </div>
      </header>

      {/* Client Info Section */}
      <section className="flex flex-col md:flex-row justify-between mb-12 bg-nw-bone/50 p-6 md:p-8 border-l-4 border-nw-acid gap-8 md:gap-0 text-left">
        <div className="w-full md:w-1/2 text-left">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">Prepared For</div>
          <div className="text-2xl font-display font-bold mb-1">{input.proposal.clientName || "Valued Client"}</div>
          <div className="text-sm text-nw-graphite">{input.proposal.projectName || "New Digital Project"}</div>
        </div>
        <div className="w-full md:w-2/5 md:text-right">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">Service Provider</div>
          <div className="text-sm font-bold mb-1">Northernware</div>
          <div className="text-xs text-nw-graphite mb-1">Northern Luzon, Philippines</div>
          <div className="text-xs text-nw-graphite">www.northernware.ph</div>
        </div>
      </section>

      {/* Narrative Sections */}
      {(isProposal || isContract) && (
        <div className="mb-12 space-y-8 text-left">
          <Section title="1. Executive Summary" content={input.proposal.projectOverview} />
          {isProposal && <Section title="2. Business Objectives" content={input.proposal.businessGoals} />}
          <Section title={isProposal ? "3. Strategic Scope" : "2. Scope of Work"} content={input.proposal.scopeOfWork} />
          <Section title={isProposal ? "4. Key Deliverables" : "3. Deliverables"} content={input.proposal.deliverables} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 bg-nw-bone/30 p-6 text-left">
            <div>
              <h3 className="text-xs uppercase track-widest text-nw-acid mb-3 border-b border-nw-graphite/20 pb-2 font-mono">Estimated Timeline</h3>
              <p className="text-sm">{input.proposal.timeline}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase track-widest text-nw-acid mb-3 border-b border-nw-graphite/20 pb-2 font-mono">Project Type</h3>
              <p className="text-sm">{projectTypeLabel} ({input.complexity})</p>
            </div>
          </div>

          {isContract && (
            <div className="mt-8 space-y-8 text-left">
              <Section title="4. Exclusions" content={input.proposal.exclusions} />
              <Section title="5. Technical Assumptions" content={input.proposal.assumptions} />
            </div>
          )}
        </div>
      )}

      {/* Investment Breakdown */}
      <div className="mb-16 text-left">
        <h2 className="text-sm uppercase track-widest text-nw-acid mb-6 font-mono font-bold">Financial Investment</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-nw-black">
                <th className="py-3 text-[10px] uppercase track-widest text-nw-graphite font-mono">Description</th>
                <th className="py-3 text-right text-[10px] uppercase track-widest text-nw-graphite font-mono">Amount</th>
              </tr>
            </thead>
            <tbody>
              {!selectedInvoice ? (
                <>
                  <tr className="border-b border-nw-graphite/20">
                    <td className="py-4">
                      <div className="font-bold text-sm mb-1">Core Architecture & Development</div>
                      <div className="text-xs text-nw-graphite">Base setup + {input.pages} pages development + UI/UX design system</div>
                    </td>
                    <td className="py-4 text-right text-sm font-mono font-bold">{fmt(result.baseCost)}</td>
                  </tr>
                  
                  {input.features.length > 0 && (
                    <tr className="border-b border-nw-graphite/20">
                      <td className="py-4">
                        <div className="font-bold text-sm mb-1">Custom Feature Integrations</div>
                        <div className="text-xs text-nw-graphite">{input.features.join(", ")}</div>
                      </td>
                      <td className="py-4 text-right text-sm font-mono font-bold">{fmt(result.featureHours * result.complexityMultiplier * input.hourlyRate)}</td>
                    </tr>
                  )}
                </>
              ) : (
                <tr className="border-b border-nw-graphite/20">
                  <td className="py-4">
                    <div className="font-bold text-sm mb-1">{selectedInvoice.label}</div>
                    <div className="text-xs text-nw-graphite">Payment for {input.proposal.projectName}</div>
                  </td>
                  <td className="py-4 text-right text-sm font-mono font-bold">{fmt(invoiceAmount)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 md:gap-0">
        {isInvoice ? (
          <PaymentBlock 
            projectId={id} 
            amount={invoiceAmount} 
            description={`${selectedInvoice ? selectedInvoice.label : 'Invoice'} for ${input.proposal.projectName} - ${input.proposal.clientName}`} 
          />
        ) : (
          <div className="hidden md:block w-[45%]"></div>
        )}

        <div className="w-full md:w-[400px] text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase track-widest text-nw-graphite font-mono">Subtotal (One-time Dev)</span>
            <span className="text-sm font-mono font-bold">{fmt(result.finalPrice + result.discountAmount)}</span>
          </div>
          {input.discountPercent > 0 && (
            <div className="flex justify-between items-center mb-3 text-nw-acid">
              <span className="text-xs uppercase track-widest font-mono">Strategic Discount ({input.discountPercent}%)</span>
              <span className="text-sm font-mono font-bold">-{fmt(result.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center p-6 bg-nw-black text-nw-bone mt-4">
            <span className="text-sm font-bold uppercase track-widest font-mono">{isInvoice ? 'Amount Due' : 'Total Investment'}</span>
            <span className="text-3xl font-display font-bold text-nw-acid">{fmt(invoiceAmount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Terms Section */}
      <div className="mb-16 p-6 md:p-8 bg-nw-bone/50 border border-nw-graphite/20 text-left">
        <h3 className="text-xs uppercase track-widest text-nw-acid mb-4 font-mono font-bold">Payment Terms & Conditions</h3>
        <div 
          className="prose prose-sm max-w-none text-nw-black prose-p:leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: input.proposal.paymentTerms }} 
        />

        {(isContract || isProposal) && input.invoices && input.invoices.length > 0 && (
          <div className="mt-8 border-t border-nw-graphite/20 pt-6">
            <div className="text-[10px] font-bold uppercase track-widest mb-4 text-nw-graphite font-mono">Payment Schedule</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-nw-graphite/20">
                    <th className="py-2 font-bold text-nw-black uppercase">Milestone</th>
                    <th className="py-2 text-right font-bold text-nw-black uppercase">Percentage</th>
                    <th className="py-2 text-right font-bold text-nw-black uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {input.invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-nw-graphite/10">
                      <td className="py-3 text-nw-graphite">{inv.label}</td>
                      <td className="py-3 text-right text-nw-graphite">{inv.percentage}%</td>
                      <td className="py-3 text-right font-bold text-nw-black">{fmt((result.roundedPrice * inv.percentage) / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Signatures */}
      {!isProposal && !isInvoice && (
        <div className="border-t-2 border-nw-black pt-12 mt-12 text-left">
          <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-0">
            <SignatureBlock 
              projectId={id} 
              isApproved={!!isApproved} 
              signedBy={signedBy} 
              approvedAt={approvedAt} 
            />
            <div className="w-full md:w-[45%] text-left">
              <div className="text-[10px] font-bold uppercase track-widest mb-6 text-nw-graphite font-mono">Authorized Representative</div>
              <div className="border-b border-nw-black mb-2 pb-1 h-[45px] flex items-end">
                 <img src="https://northernware.ph/sig.png" alt="Signature" className="h-[35px] -mb-1" />
              </div>
              <div className="text-xs font-bold">Kenji Von Ashley F. Edillo</div>
              <div className="text-xs text-nw-graphite">CEO, Northernware</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, content }: { title: string, content: string }) {
  if (!content || content === '<p></p>') return null;
  return (
    <div className="mb-8">
      <h3 className="text-xs uppercase track-widest text-nw-acid mb-3 border-b border-nw-graphite/20 pb-2 font-mono font-bold">{title}</h3>
      <div 
        className="prose prose-sm max-w-none text-nw-black prose-p:leading-relaxed prose-headings:font-display prose-a:text-nw-acid hover:prose-a:text-nw-black"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
}
