"use client";

import { Icon } from "@iconify/react";
import type { CalculatorInput, ProjectInvoice } from "@/lib/calculator";
import { generateId } from "@/lib/storage";
import { copyToClipboard } from "@/lib/utils";

interface InvoiceManagerProps {
  config: CalculatorInput;
  updateConfig: (updates: Partial<CalculatorInput>) => void;
  totalPrice: number;
  projectId: string | null;
}

export default function InvoiceManager({ config, updateConfig, totalPrice, projectId }: InvoiceManagerProps) {
  const invoices = config.invoices || [];

  const addInvoice = () => {
    const newInvoices: ProjectInvoice[] = [
      ...invoices,
      {
        id: generateId(),
        label: `Payment ${invoices.length + 1}`,
        percentage: 0,
        status: 'unpaid'
      }
    ];
    updateConfig({ invoices: newInvoices });
  };

  const removeInvoice = (id: string) => {
    updateConfig({ invoices: invoices.filter(inv => inv.id !== id) });
  };

  const updateInvoice = (id: string, updates: Partial<ProjectInvoice>) => {
    updateConfig({
      invoices: invoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv)
    });
  };

  const totalPercentage = invoices.reduce((sum, inv) => sum + (inv.percentage || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-nw-graphite/20 pb-4">
        <div>
          <h3 className="font-display text-xl font-bold">Payment Schedule</h3>
          <p className="text-xs text-nw-graphite mt-1">Define how the total investment is split across multiple payments.</p>
        </div>
        <button
          onClick={addInvoice}
          className="flex items-center gap-2 font-mono text-[10px] uppercase track-widest px-4 py-2 bg-nw-acid text-nw-black hover:bg-nw-black hover:text-nw-acid transition-all"
        >
          <Icon icon="solar:add-circle-linear" />
          Add Payment
        </button>
      </div>

      <div className="space-y-4">
        {invoices.map((inv, index) => (
          <div 
            key={inv.id} 
            className="group relative p-4 border bg-nw-bone/30 border-nw-graphite/10 hover:border-nw-acid/50 transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Label</label>
                <input
                  type="text"
                  value={inv.label}
                  onChange={(e) => updateInvoice(inv.id, { label: e.target.value })}
                  className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-1 transition-colors"
                  placeholder="e.g. Deposit"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Percentage (%)</label>
                <input
                  type="number"
                  value={inv.percentage}
                  onChange={(e) => updateInvoice(inv.id, { percentage: Number(e.target.value) })}
                  className="w-full bg-transparent border-b border-nw-graphite/30 focus:border-nw-acid outline-none font-mono text-sm text-nw-black py-1 transition-colors"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block font-mono text-[10px] uppercase track-widest text-nw-graphite mb-2">Amount (₱)</label>
                <div className="font-mono text-sm text-nw-black py-1 border-b border-transparent">
                  {((totalPrice * (inv.percentage || 0)) / 100).toLocaleString()}
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2 pb-1">
                {projectId && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const url = `${window.location.origin}/p/${projectId}?mode=invoice&invoiceId=${inv.id}`;
                      const success = await copyToClipboard(url);
                      if (success) {
                        alert(`Magic Link for "${inv.label}" copied!`);
                      } else {
                        alert(`Failed to copy. URL: ${url}`);
                      }
                    }}
                    className="p-2 text-nw-graphite hover:text-nw-acid transition-colors"
                    title="Copy Invoice Link"
                  >
                    <Icon icon="solar:link-linear" width="18" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); updateInvoice(inv.id, { status: inv.status === 'paid' ? 'unpaid' : 'paid' }); }}
                  className={`p-2 transition-colors ${inv.status === 'paid' ? "text-nw-emerald" : "text-nw-graphite hover:text-nw-black"}`}
                  title={inv.status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                >
                  <Icon icon={inv.status === 'paid' ? "solar:check-circle-bold" : "solar:check-circle-linear"} width="18" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeInvoice(inv.id); }}
                  className="p-2 text-nw-graphite hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <Icon icon="solar:trash-bin-trash-linear" width="18" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 border flex items-center justify-between font-mono text-xs uppercase track-widest ${totalPercentage === 100 ? 'bg-nw-emerald/10 border-nw-emerald/20 text-nw-emerald' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
        <span>Total Allocation: {totalPercentage}%</span>
        {totalPercentage !== 100 && (
          <span className="flex items-center gap-1">
            <Icon icon="solar:danger-triangle-linear" />
            Must equal 100%
          </span>
        )}
        {totalPercentage === 100 && (
          <span className="flex items-center gap-1">
            <Icon icon="solar:check-circle-linear" />
            Ready to generate
          </span>
        )}
      </div>
    </div>
  );
}
