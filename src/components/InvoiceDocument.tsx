import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import { CURRENCIES } from "@/lib/constants";
import PaymentBlock from "./PaymentBlock";
import ConfigTamperBanner from "./ConfigTamperBanner";
import { SENDER } from "./documents/shared";

interface InvoiceDocumentProps {
  id: string;
  input: CalculatorInput;
  result: CalculatorOutput;
  createdAt: Date;
  invoiceId?: string | null;
  configTampered?: boolean;
}

export default function InvoiceDocument({
  id,
  input,
  result,
  createdAt,
  invoiceId,
  configTampered = false,
}: InvoiceDocumentProps) {
  const p = input.proposal;
  const currency = CURRENCIES.find((c) => c.value === input.currency) || CURRENCIES[0];
  const fmt = (n: number) => currency.symbol + n.toLocaleString(currency.locale);
  const dateStr = new Date(createdAt).toLocaleDateString(currency.locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const selectedInvoice =
    invoiceId && input.invoices
      ? input.invoices.find((inv) => inv.id === invoiceId) ?? null
      : null;

  const invoiceAmount = selectedInvoice
    ? (result.roundedPrice * selectedInvoice.percentage) / 100
    : result.roundedPrice;
  const isSelectedInvoicePaid = selectedInvoice?.status === "paid";

  const clientNameRaw =
    `${p.clientFirstName || ""} ${p.clientLastName || ""}`.trim() || p.clientName || "";
  const clientDisplay = clientNameRaw || p.clientCompany || "Valued Client";
  const docSuffix = selectedInvoice ? `-${selectedInvoice.id.split("_")[1] ?? selectedInvoice.id.slice(-6)}` : "";

  return (
    <div className="bg-nw-white p-8 md:p-16 border-t-4 border-nw-acid shadow-xl relative z-10 w-full font-body text-nw-black">
      {configTampered && <ConfigTamperBanner />}

      <header className="flex flex-col md:flex-row justify-between items-start mb-12 border-b-2 border-nw-black pb-8 gap-6 md:gap-0">
        <div>
          <h1 className="text-4xl font-display font-bold track-tighter m-0">
            northernware<span className="text-nw-acid text-xl align-super ml-1">®</span>
          </h1>
          <p className="mt-2 text-xs uppercase track-widest text-nw-graphite font-bold font-mono">
            {selectedInvoice ? `Invoice — ${selectedInvoice.label}` : "Official Invoice"}
          </p>
        </div>
        <div className="text-right text-xs text-nw-graphite leading-relaxed font-mono">
          <strong>DOCUMENT ID:</strong> INV-{id.toUpperCase()}
          {docSuffix}
          <br />
          <strong>DATE:</strong> {dateStr}
          <br />
          <strong>DUE:</strong> Upon Receipt
          {selectedInvoice && (
            <>
              <br />
              <strong>STATUS:</strong> {isSelectedInvoicePaid ? "PAID" : "UNPAID"}
            </>
          )}
        </div>
      </header>

      <section className="flex flex-col md:flex-row justify-between mb-12 bg-nw-bone/50 p-6 md:p-8 border-l-4 border-nw-acid gap-8 md:gap-0">
        <div className="w-full md:w-1/2">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">Bill To</div>
          <div className="text-2xl font-display font-bold mb-1">{clientDisplay}</div>
          {p.clientCompany && clientNameRaw && (
            <div className="text-sm text-nw-graphite">{p.clientCompany}</div>
          )}
          {p.projectName && (
            <div className="text-xs text-nw-graphite mt-2 font-mono uppercase tracking-widest">
              Re: {p.projectName}
            </div>
          )}
        </div>
        <div className="w-full md:w-2/5 md:text-right">
          <div className="text-[10px] text-nw-graphite uppercase track-widest mb-2 font-mono">From</div>
          <div className="text-sm font-bold mb-1">{SENDER.fullName}</div>
          <div className="text-xs text-nw-graphite mb-1">{SENDER.company}</div>
          <div className="text-xs text-nw-graphite">{SENDER.address}</div>
        </div>
      </section>

      <div className="mb-16 text-left">
        <h2 className="text-sm uppercase track-widest text-nw-acid mb-6 font-mono font-bold">Invoice Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-nw-black">
                <th className="py-3 text-[10px] uppercase track-widest text-nw-graphite font-mono">Description</th>
                {selectedInvoice && (
                  <th className="py-3 text-right text-[10px] uppercase track-widest text-nw-graphite font-mono">
                    Share
                  </th>
                )}
                <th className="py-3 text-right text-[10px] uppercase track-widest text-nw-graphite font-mono">Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice ? (
                <tr className="border-b border-nw-graphite/20">
                  <td className="py-4">
                    <div className="font-bold text-sm mb-1">{selectedInvoice.label}</div>
                    <div className="text-xs text-nw-graphite">
                      Milestone payment — {p.projectName || "Project"}
                    </div>
                    <div className={`text-xs font-mono uppercase mt-1 ${isSelectedInvoicePaid ? "text-nw-emerald" : "text-nw-graphite"}`}>
                      {selectedInvoice.status}
                    </div>
                  </td>
                  <td className="py-4 text-right text-sm font-mono">{selectedInvoice.percentage}%</td>
                  <td className="py-4 text-right text-sm font-mono font-bold">{fmt(invoiceAmount)}</td>
                </tr>
              ) : (
                (input.invoices || []).map((inv) => (
                  <tr key={inv.id} className="border-b border-nw-graphite/20">
                    <td className="py-4">
                      <div className="font-bold text-sm mb-1">{inv.label}</div>
                      <div className="text-xs text-nw-graphite capitalize">{inv.status}</div>
                    </td>
                    <td className="py-4 text-right text-sm font-mono font-bold">
                      {fmt((result.roundedPrice * inv.percentage) / 100)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 md:gap-0">
        {selectedInvoice && !isSelectedInvoicePaid && (
          <PaymentBlock
            projectId={id}
            amount={invoiceAmount}
            description={`${selectedInvoice.label} for ${p.projectName} — ${clientDisplay}`}
          />
        )}
        <div className={`w-full ${selectedInvoice ? "md:w-[400px]" : "md:max-w-md md:ml-auto"}`}>
          <div className="flex justify-between items-center p-6 bg-nw-black text-nw-bone mt-4">
            <span className="text-sm font-bold uppercase track-widest font-mono">
              {isSelectedInvoicePaid ? "Paid" : "Amount Due"}
            </span>
            <span className="text-3xl font-display font-bold text-nw-acid">{fmt(invoiceAmount)}</span>
          </div>
          <p className="text-[10px] text-nw-graphite text-right mt-2 font-mono italic">
            * Prices in {currency.label}
          </p>
        </div>
      </div>

      {input.proposal.paymentTerms && (
        <div className="mb-12 p-6 md:p-8 bg-nw-bone/50 border border-nw-graphite/20 text-left">
          <h3 className="text-xs uppercase track-widest text-nw-acid mb-4 font-mono font-bold">
            Payment Terms
          </h3>
          <div
            className="prose prose-sm max-w-none text-nw-black prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: input.proposal.paymentTerms }}
          />
        </div>
      )}

      <div className="border-t border-nw-graphite/20 pt-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
          {SENDER.company} · {SENDER.address} · INV-{id.toUpperCase()}
          {docSuffix}
        </p>
      </div>
    </div>
  );
}
