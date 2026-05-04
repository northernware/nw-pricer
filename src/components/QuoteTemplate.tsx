"use client";

import { useState, useEffect } from "react";
import type { CalculatorOutput, CalculatorInput, ProjectInvoice } from "@/lib/calculator";
import { PROJECT_TYPES, FEATURES, HOSTING_PLANS } from "@/lib/constants";

interface QuoteTemplateProps {
  mode: 'quote' | 'proposal' | 'contract' | 'invoice';
  input: CalculatorInput;
  result: CalculatorOutput;
  projectId?: string | null;
  invoiceId?: string | null;
  isInline?: boolean;
}

export default function QuoteTemplate({ mode, input, result, projectId, invoiceId, isInline }: QuoteTemplateProps) {
  const [docId, setDocId] = useState("");
  const [dates, setDates] = useState({ today: "", validUntil: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const prefix = mode === 'invoice' ? 'INV' : mode === 'contract' ? 'CTR' : 'PRP';
    const baseId = projectId || Math.random().toString(36).substring(2, 9).toUpperCase();
    setDocId(`${prefix}-${baseId}`);
    setDates({
      today: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    });
    setMounted(true);
  }, [mode, projectId]);

  const projectTypeLabel = PROJECT_TYPES.find(p => p.value === input.projectType)?.label || input.projectType;
  const hostingPlan = HOSTING_PLANS.find(h => h.value === input.hostingPlan);

  const fmt = (n: number) => "₱" + n.toLocaleString();
  
  const calcRowCost = (hours: number) => {
    const adjusted = hours * result.complexityMultiplier;
    return adjusted * input.hourlyRate;
  };

  if (!mounted) return null;

  const isProposal = mode === 'proposal';
  const isContract = mode === 'contract';
  const isInvoice = mode === 'invoice';

  const selectedInvoice = isInvoice && input.invoices
    ? input.invoices.find(inv => inv.id === invoiceId) || null
    : null;
    
  const invoiceAmount = selectedInvoice 
    ? (result.roundedPrice * (selectedInvoice.percentage || 0)) / 100 
    : result.roundedPrice;

  return (
    <div 
      id={isInline ? "quote-preview" : "quote-template"} 
      style={{ 
        width: "800px", 
        padding: "0 60px 40px 60px", 
        backgroundColor: "#FFFFFF", 
        color: "#0A0A0A",
        fontFamily: "sans-serif",
        position: isInline ? "relative" : "fixed",
        top: isInline ? "0" : "-9999px",
        left: isInline ? "0" : "-9999px",
        transform: isInline ? "scale(var(--preview-scale, 1))" : "none",
        transformOrigin: "top left",
        boxShadow: isInline ? "0 20px 50px rgba(0,0,0,0.1)" : "none",
        zIndex: isInline ? 1 : -1,
        lineHeight: "1.5",
        background: "#FFFFFF"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px", borderBottom: "3px solid #0A0A0A", paddingBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "bold", letterSpacing: "-0.05em" }}>
            northernware<span style={{ color: "#FF3800", fontSize: "16px", verticalAlign: "super", marginLeft: "2px" }}>®</span>
          </h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#5C5C5C", fontWeight: "bold" }}>
            {isProposal ? "STRATEGIC PROJECT PROPOSAL" : isContract ? "SERVICE AGREEMENT & CONTRACT" : isInvoice ? (selectedInvoice ? `INVOICE: ${selectedInvoice.label}` : "OFFICIAL INVOICE") : "PROJECT QUOTATION"}
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: "11px", color: "#5C5C5C", lineHeight: "1.8" }}>
          <strong>{isInvoice ? "INVOICE" : isContract ? "CONTRACT" : "DOCUMENT"} ID:</strong> {docId}{selectedInvoice ? `-${selectedInvoice.id.split('_')[1]}` : ''}<br />
          <strong>DATE:</strong> {dates.today}<br />
          {!isInvoice && <><strong>VALID UNTIL:</strong> {input.proposal.validityPeriod || dates.validUntil}</>}
          {isContract && <><br /><strong>STATUS:</strong> LEGALLY BINDING</>}
        </div>
      </div>

      {/* Client Info Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", backgroundColor: "#F9F9F9", padding: "20px", borderLeft: "4px solid #FF3800" }}>
        <div style={{ width: "50%" }}>
          <div style={{ fontSize: "10px", color: "#5C5C5C", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Prepared For</div>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>{input.proposal.clientName || "Valued Client"}</div>
          <div style={{ fontSize: "14px", color: "#5C5C5C" }}>{input.proposal.projectName || "New Digital Project"}</div>
        </div>
        <div style={{ width: "40%", textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: "#5C5C5C", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Service Provider</div>
          <div style={{ fontSize: "14px", fontWeight: "bold" }}>Northernware</div>
          <div style={{ fontSize: "12px", color: "#5C5C5C" }}>Northern Luzon, Philippines</div>
          <div style={{ fontSize: "12px", color: "#5C5C5C" }}>www.northernware.ph</div>
        </div>
      </div>

      {/* Content for Proposal / Contract */}
      {(isProposal || isContract) && (
        <div style={{ marginBottom: "40px" }}>
          <Section title="1. Executive Summary" content={input.proposal.projectOverview} />
          {isProposal && <Section title="2. Business Objectives" content={input.proposal.businessGoals} />}
          <Section title={isProposal ? "3. Strategic Scope" : "2. Scope of Work"} content={input.proposal.scopeOfWork} />
          <Section title={isProposal ? "4. Key Deliverables" : "3. Deliverables"} content={input.proposal.deliverables} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "20px" }}>
            <div>
              <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#FF3800", marginBottom: "10px", borderBottom: "1px solid #EEEEEE", paddingBottom: "5px" }}>Estimated Timeline</h3>
              <p style={{ fontSize: "13px", margin: 0 }}>{input.proposal.timeline}</p>
            </div>
            <div>
              <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#FF3800", marginBottom: "10px", borderBottom: "1px solid #EEEEEE", paddingBottom: "5px" }}>Project Type</h3>
              <p style={{ fontSize: "13px", margin: 0 }}>{projectTypeLabel} ({input.complexity})</p>
            </div>
          </div>

          {isContract && (
            <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #EEEEEE", backgroundColor: "#FFFFFF" }}>
              <Section title="4. Exclusions" content={input.proposal.exclusions} />
              <Section title="5. Technical Assumptions" content={input.proposal.assumptions} />
              <Section title="6. Payment Terms" content={input.proposal.paymentTerms} />
            </div>
          )}
        </div>
      )}

      {/* Itemized Table — Always show for Quote/Invoice, show simplified for others */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF3800", marginBottom: "15px" }}>{isInvoice ? "Invoice Details" : "Financial Investment"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #0A0A0A" }}>
              <th style={{ textAlign: "left", padding: "10px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C5C" }}>Description</th>
              <th style={{ textAlign: "right", padding: "10px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C5C" }}>{isInvoice ? "Percentage" : "Amount"}</th>
              {isInvoice && <th style={{ textAlign: "right", padding: "10px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C5C" }}>Amount</th>}
            </tr>
          </thead>
          <tbody>
            {!isInvoice ? (
              <>
                <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                  <td style={{ padding: "12px 0", fontSize: "13px" }}>
                    <div style={{ fontWeight: "bold" }}>Core Architecture & Development</div>
                    <div style={{ fontSize: "11px", color: "#5C5C5C" }}>Base setup + {input.pages} pages development + UI/UX design system</div>
                  </td>
                  <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt(result.baseCost)}</td>
                </tr>
                
                {input.features.length > 0 && (
                  <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                    <td style={{ padding: "12px 0", fontSize: "13px" }}>
                      <div style={{ fontWeight: "bold" }}>Custom Feature Integrations</div>
                      <div style={{ fontSize: "11px", color: "#5C5C5C" }}>{input.features.map(f => FEATURES.find(x => x.value === f)?.label).join(", ")}</div>
                    </td>
                    <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt(result.featureHours * result.complexityMultiplier * input.hourlyRate)}</td>
                  </tr>
                )}
              </>
            ) : (
              selectedInvoice ? (
                <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                  <td style={{ padding: "12px 0", fontSize: "13px" }}>
                    <div style={{ fontWeight: "bold" }}>{selectedInvoice.label}</div>
                    <div style={{ fontSize: "11px", color: "#5C5C5C" }}>Payment for {input.proposal.projectName}</div>
                  </td>
                  <td style={{ textAlign: "right", fontSize: "13px" }}>{selectedInvoice.percentage}%</td>
                  <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt(invoiceAmount)}</td>
                </tr>
              ) : (
                (input.invoices || []).map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #EEEEEE" }}>
                    <td style={{ padding: "12px 0", fontSize: "13px" }}>
                      <div style={{ fontWeight: "bold" }}>{inv.label}</div>
                      <div style={{ fontSize: "11px", color: "#5C5C5C" }}>{inv.status === 'paid' ? 'Paid' : 'Unpaid'}</div>
                    </td>
                    <td style={{ textAlign: "right", fontSize: "13px" }}>{inv.percentage}%</td>
                    <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt((result.roundedPrice * inv.percentage) / 100)}</td>
                  </tr>
                ))
              )
            )}

            {hostingPlan && hostingPlan.value !== 'none' && !isInvoice && (
              <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                <td style={{ padding: "12px 0", fontSize: "13px" }}>
                  <div style={{ fontWeight: "bold" }}>{hostingPlan.label} (Monthly Recurring)</div>
                  <div style={{ fontSize: "11px", color: "#5C5C5C" }}>{hostingPlan.description}</div>
                </td>
                <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt(hostingPlan.price)} /mo</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "50px" }}>
        <div style={{ width: "350px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#5C5C5C" }}>Subtotal (One-time Dev)</span>
            <span style={{ fontSize: "14px" }}>{fmt(result.finalPrice + result.discountAmount)}</span>
          </div>
          {input.discountPercent > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#FF3800" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase" }}>Strategic Discount ({input.discountPercent}%)</span>
              <span style={{ fontSize: "14px" }}>-{fmt(result.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "20px 15px", backgroundColor: "#0A0A0A", color: "#FFFFFF", marginTop: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>{isInvoice ? "Amount Due" : "Total Investment"}</span>
            <span style={{ fontSize: "24px", fontWeight: "bold", color: "#FF3800" }}>{fmt(invoiceAmount)}</span>
          </div>
          <p style={{ fontSize: "10px", color: "#5C5C5C", textAlign: "right", marginTop: "10px", fontStyle: "italic" }}>
            * All prices are in Philippine Pesos (PHP).
          </p>
        </div>
      </div>

      {/* Payment Terms Section */}
      {(isContract || isInvoice) && (
        <div style={{ marginBottom: "40px", padding: "20px", backgroundColor: "#F9F9F9", border: "1px solid #EEEEEE" }}>
          <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#FF3800", marginBottom: "10px" }}>Payment Terms & Conditions</h3>
          <div style={{ fontSize: "12px", margin: "0 0 20px 0", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: input.proposal.paymentTerms }} />
          
          {(isContract || isProposal) && input.invoices && input.invoices.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", color: "#5C5C5C", marginBottom: "10px" }}>Payment Schedule</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                    <th style={{ textAlign: "left", padding: "5px 0" }}>Milestone</th>
                    <th style={{ textAlign: "right", padding: "5px 0" }}>Percentage</th>
                    <th style={{ textAlign: "right", padding: "5px 0" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {input.invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <td style={{ padding: "8px 0" }}>{inv.label}</td>
                      <td style={{ textAlign: "right", padding: "8px 0" }}>{inv.percentage}%</td>
                      <td style={{ textAlign: "right", padding: "8px 0", fontWeight: "bold" }}>{fmt((result.roundedPrice * inv.percentage) / 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Acceptance Section */}
      {isContract && (
        <div style={{ borderTop: "2px solid #0A0A0A", paddingTop: "30px", marginTop: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "45%" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "40px", color: "#5C5C5C" }}>Accepted By (Client)</div>
            <div style={{ borderBottom: "1px solid #0A0A0A", marginBottom: "5px" }}></div>
            <div style={{ fontSize: "11px" }}>Signature / Full Name</div>
            <div style={{ fontSize: "11px", color: "#5C5C5C", marginTop: "5px" }}>Date: ____________________</div>
          </div>
          <div style={{ width: "45%" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "40px", color: "#5C5C5C" }}>Authorized Representative</div>
            <div style={{ borderBottom: "1px solid #0A0A0A", marginBottom: "5px" }}>
               <img src="https://northernware.ph/sig.png" alt="" style={{ height: "35px", marginBottom: "-10px" }} />
            </div>
            <div style={{ fontSize: "11px", fontWeight: "bold" }}>Kenji Von Ashley F. Edillo</div>
            <div style={{ fontSize: "11px", color: "#5C5C5C" }}>CEO, Northernware</div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

function Section({ title, content }: { title: string, content: string }) {
  if (!content) return null;
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#FF3800", marginBottom: "8px", borderBottom: "1px solid #EEEEEE", paddingBottom: "5px" }}>{title}</h3>
      <div 
        style={{ fontSize: "13px", color: "#333333", whiteSpace: "normal", lineHeight: "1.6" }} 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
}
