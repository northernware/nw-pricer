"use client";

import type { CalculatorOutput, CalculatorInput } from "@/lib/calculator";
import { PROJECT_TYPES } from "@/lib/constants";

interface QuoteTemplateProps {
  input: CalculatorInput;
  result: CalculatorOutput;
}

export default function QuoteTemplate({ input, result }: QuoteTemplateProps) {
  const projectTypeLabel = PROJECT_TYPES.find(p => p.value === input.projectType)?.label || input.projectType;

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
          QUOTATION ID: NW-{Math.random().toString(36).substring(2, 9).toUpperCase()}<br />
          DATE: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}<br />
          VALID UNTIL: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            <div style={{ fontSize: "10px", color: "#5C5C5C", textTransform: "uppercase", marginBottom: "4px" }}>Design Level</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", textTransform: "capitalize" }}>{input.designLevel.replace('_', ' ')}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#5C5C5C", textTransform: "uppercase", marginBottom: "4px" }}>Complexity</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", textTransform: "capitalize" }}>{input.complexity}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#5C5C5C", textTransform: "uppercase", marginBottom: "4px" }}>Estimated Scope</div>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{input.pages} Pages</div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#FF3800", marginBottom: "15px" }}>Scope Breakdown</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #B9B9B9" }}>
              <th style={{ textAlign: "left", padding: "12px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C5C" }}>Item</th>
              <th style={{ textAlign: "right", padding: "12px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C5C" }}>Details</th>
              <th style={{ textAlign: "right", padding: "12px 0", fontSize: "10px", textTransform: "uppercase", color: "#5C5C5C" }}>Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
              <td style={{ padding: "12px 0", fontSize: "14px" }}>Base Architecture & Pages</td>
              <td style={{ textAlign: "right", fontSize: "14px", color: "#5C5C5C" }}>{input.pages} Pages</td>
              <td style={{ textAlign: "right", fontSize: "14px" }}>{result.pagesHours}h</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
              <td style={{ padding: "12px 0", fontSize: "14px" }}>UI/UX Design Phase</td>
              <td style={{ textAlign: "right", fontSize: "14px", color: "#5C5C5C" }}>{input.designLevel}</td>
              <td style={{ textAlign: "right", fontSize: "14px" }}>{result.designHours}h</td>
            </tr>
            {input.features.length > 0 && (
              <tr style={{ borderBottom: "1px solid #EEEEEE" }}>
                <td style={{ padding: "12px 0", fontSize: "14px" }}>Selected Functional Features</td>
                <td style={{ textAlign: "right", fontSize: "14px", color: "#5C5C5C" }}>{input.features.length} Items</td>
                <td style={{ textAlign: "right", fontSize: "14px" }}>{result.featureHours}h</td>
              </tr>
            )}
            <tr style={{ backgroundColor: "#0A0A0A", color: "#F4F4F0" }}>
              <td colSpan={2} style={{ padding: "15px", fontSize: "14px", fontWeight: "bold" }}>Adjusted Total (Complexity: {result.complexityMultiplier}x)</td>
              <td style={{ textAlign: "right", padding: "15px", fontSize: "16px", fontWeight: "bold" }}>{result.adjustedHours}h</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pricing */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "60px" }}>
        <div style={{ width: "300px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#5C5C5C" }}>Base Development Cost</span>
            <span style={{ fontSize: "14px" }}>₱{result.baseCost.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#5C5C5C" }}>Project Buffer ({input.bufferPercent}%)</span>
            <span style={{ fontSize: "14px" }}>₱{(result.finalPrice - result.baseCost).toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderTop: "2px solid #0A0A0A", marginTop: "10px" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase" }}>Total Quotation</span>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#FF3800" }}>₱{result.roundedPrice.toLocaleString()}</span>
          </div>
          <p style={{ fontSize: "10px", color: "#5C5C5C", textAlign: "right", marginTop: "5px" }}>
            Suggested Range: ₱{result.priceRange[0].toLocaleString()} – ₱{result.priceRange[1].toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #B9B9B9", paddingTop: "20px" }}>
        <p style={{ margin: 0, fontSize: "10px", color: "#5C5C5C", lineHeight: "1.6" }}>
          This quotation is an estimate based on the scope provided. Final pricing may vary upon technical deep-dive. 
          Standard payment terms: 50% upfront, 50% upon deployment. All rates in PHP.
        </p>
        <p style={{ margin: "20px 0 0 0", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", textAlign: "center", color: "#0A0A0A" }}>
          Northernware Software Development Services &middot; Engineering Reality
        </p>
      </div>
    </div>
  );
}
