import { useState, useEffect } from "react";
import type { CalculatorOutput, CalculatorInput } from "@/lib/calculator";
import { PROJECT_TYPES, FEATURES, HOSTING_PLANS } from "@/lib/constants";

interface QuoteTemplateProps {
  input: CalculatorInput;
  result: CalculatorOutput;
}

export default function QuoteTemplate({ input, result }: QuoteTemplateProps) {
  const [quoteId, setQuoteId] = useState("");
  const [dates, setDates] = useState({ today: "", validUntil: "" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setQuoteId(`NW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);
    setDates({
      today: new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    });
    setMounted(true);
  }, []);

  const projectTypeLabel = PROJECT_TYPES.find(p => p.value === input.projectType)?.label || input.projectType;
  const hostingPlan = HOSTING_PLANS.find(h => h.value === input.hostingPlan);

  const fmt = (n: number) => "₱" + n.toLocaleString();
  
  // Calculate specific row costs (distributing complexity multiplier)
  const calcRowCost = (hours: number) => {
    const adjusted = hours * result.complexityMultiplier;
    return adjusted * input.hourlyRate;
  };

  if (!mounted) return null;

  return (
    <div 
      id="quote-template" 
      style={{ 
        width: "800px", 
        padding: "60px", 
        backgroundColor: "#F4F4F0", 
        color: "#0A0A0A",
        fontFamily: "sans-serif",
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "60px", borderBottom: "2px solid #0A0A0A", paddingBottom: "30px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.05em" }}>
            NORTHERNWARE<span style={{ color: "#FF3800" }}>®</span>
          </h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#5C5C5C" }}>
            Software Development Services
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: "12px", color: "#5C5C5C", lineHeight: "1.6" }}>
          QUOTATION ID: {quoteId}<br />
          DATE: {dates.today}<br />
          VALID UNTIL: {dates.validUntil}
        </div>
      </div>

      {/* Project Info */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF3800", marginBottom: "15px" }}>Project Overview</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#5C5C5C", textTransform: "uppercase", marginBottom: "4px" }}>Project Type</div>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{projectTypeLabel}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#5C5C5C", textTransform: "uppercase", marginBottom: "4px" }}>Complexity</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", textTransform: "capitalize" }}>{input.complexity} (x{result.complexityMultiplier})</div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF3800", marginBottom: "15px" }}>Itemized Scope</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #B9B9B9" }}>
              <th style={{ textAlign: "left", padding: "12px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C54" }}>Description</th>
              <th style={{ textAlign: "center", padding: "12px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C54" }}>Hours</th>
              <th style={{ textAlign: "right", padding: "12px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C54" }}>Rate</th>
              <th style={{ textAlign: "right", padding: "12px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C54" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
              <td style={{ padding: "12px 0", fontSize: "13px" }}>
                <strong>Project Scaffolding & Core Architecture</strong><br />
                <span style={{ fontSize: "11px", color: "#5C5C5C" }}>Base setup + {input.pages} pages development (10h + {input.pages}×6h)</span>
              </td>
              <td style={{ textAlign: "center", fontSize: "13px" }}>{((10 + input.pages * 6) * result.complexityMultiplier).toFixed(1)}h</td>
              <td style={{ textAlign: "right", fontSize: "13px" }}>{fmt(input.hourlyRate)}</td>
              <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt(calcRowCost(10 + input.pages * 6))}</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
              <td style={{ padding: "12px 0", fontSize: "13px" }}>
                <strong>UI/UX Custom Design</strong><br />
                <span style={{ fontSize: "11px", color: "#5C5C5C" }}>{input.designLevel.replace('_', ' ')} design system</span>
              </td>
              <td style={{ textAlign: "center", fontSize: "13px" }}>{(result.designHours * result.complexityMultiplier).toFixed(1)}h</td>
              <td style={{ textAlign: "right", fontSize: "13px" }}>{fmt(input.hourlyRate)}</td>
              <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt(calcRowCost(result.designHours))}</td>
            </tr>
            
            {input.features.map(fKey => {
              const f = FEATURES.find(x => x.value === fKey);
              if (!f) return null;
              return (
                <tr key={fKey} style={{ borderBottom: "1px solid #EEEEEE" }}>
                  <td style={{ padding: "12px 0", fontSize: "13px" }}>
                    <strong>{f.label}</strong>
                  </td>
                  <td style={{ textAlign: "center", fontSize: "13px" }}>{(f.hours * result.complexityMultiplier).toFixed(1)}h</td>
                  <td style={{ textAlign: "right", fontSize: "13px" }}>{fmt(input.hourlyRate)}</td>
                  <td style={{ textAlign: "right", fontSize: "13px", fontWeight: "bold" }}>{fmt(calcRowCost(f.hours))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Managed Hosting & Maintenance */}
      {hostingPlan && hostingPlan.value !== 'none' && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF3800", marginBottom: "15px" }}>Managed Hosting & Maintenance</h2>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #EEEEEE", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold" }}>{hostingPlan.label}</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#FF3800" }}>{fmt(hostingPlan.price)} / month</div>
            </div>
            <div style={{ fontSize: "12px", color: "#5C5C5C", marginBottom: "15px" }}>Managed Hosting & Maintenance Plan</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {hostingPlan.includes.map((item, idx) => (
                <div key={idx} style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: "#FF3800" }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "60px" }}>
        <div style={{ width: "320px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#5C5C5C" }}>Subtotal (Base Development)</span>
            <span style={{ fontSize: "14px" }}>{fmt(result.baseCost)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#5C5C5C" }}>Project Buffer ({input.bufferPercent}%)</span>
            <span style={{ fontSize: "14px" }}>{fmt(result.finalPrice + result.discountAmount - result.baseCost)}</span>
          </div>
          {input.discountPercent > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#FF3800" }}>
              <span style={{ fontSize: "12px", textTransform: "uppercase" }}>Discount ({input.discountPercent}%)</span>
              <span style={{ fontSize: "14px" }}>-{fmt(result.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderTop: "2px solid #0A0A0A", marginTop: "10px", backgroundColor: "#0A0A0A", color: "#F4F4F0", paddingLeft: "10px", paddingRight: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>One-time Development</span>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#FF3800" }}>{fmt(result.roundedPrice)}</span>
          </div>
          {hostingPlan && hostingPlan.value !== 'none' && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderTop: "1px dashed #0A0A0A", backgroundColor: "#EEEEEE", marginTop: "5px" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>Monthly Managed Hosting</span>
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>{fmt(hostingPlan.price)}/mo</span>
            </div>
          )}
          <p style={{ fontSize: "9px", color: "#5C5C5C", textAlign: "right", marginTop: "8px", fontStyle: "italic" }}>
            * Rounded to {input.roundingMode.replace('_', ' ')}. Estimated range: {fmt(result.priceRange[0])} – {fmt(result.priceRange[1])}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #B9B9B9", paddingTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "10px", color: "#5C5C5C", lineHeight: "1.6" }}>
          This quotation is an estimate based on the current scope. Final pricing is subject to technical deep-dive and finalized functional requirements. 
          Standard payment terms: 50% down payment, 50% upon project completion and deployment.
        </p>
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold" }}>
            ACCEPTED BY:<br /><br />
            ___________________________
          </div>
          <div style={{ fontSize: "10px", fontWeight: "bold", textAlign: "right" }}>
            NORTHERNWARE AUTHORIZED:<br /><br />
            KENJI VAFE / CTO
          </div>
        </div>
      </div>
    </div>
  );
}
