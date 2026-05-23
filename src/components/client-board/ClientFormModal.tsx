"use client";

import type { ClientFormData } from "./constants";

interface ClientFormModalProps {
  formData: ClientFormData;
  isPending: boolean;
  onClose: () => void;
  onChange: (data: ClientFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ClientFormModal({
  formData,
  isPending,
  onClose,
  onChange,
  onSubmit,
}: ClientFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-nw-black/20 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative bg-nw-bone border border-nw-black p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black mb-6">
          {formData.id ? "Edit Client" : "New Client"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => onChange({ ...formData, firstName: e.target.value })}
                className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => onChange({ ...formData, lastName: e.target.value })}
                className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => onChange({ ...formData, company: e.target.value })}
              className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange({ ...formData, email: e.target.value })}
              className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => onChange({ ...formData, phone: e.target.value })}
              className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.marketingOptIn}
              onChange={(e) => onChange({ ...formData, marketingOptIn: e.target.checked })}
              className="mt-0.5 accent-nw-acid"
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite leading-relaxed">
              Opt in to marketing emails (included in bulk campaigns)
            </span>
          </label>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-nw-graphite/20 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-graphite/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-nw-black text-nw-white py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
