"use client";

import type { ClientListItem } from "@/types/crm";

interface ClientDeleteModalProps {
  client: ClientListItem;
  confirmName: string;
  isPending: boolean;
  onConfirmNameChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClientDeleteModal({
  client,
  confirmName,
  isPending,
  onConfirmNameChange,
  onClose,
  onConfirm,
}: ClientDeleteModalProps) {
  const fullName = `${client.firstName} ${client.lastName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-nw-black/20 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div className="relative bg-nw-bone border border-red-500 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-red-500 mb-2">
          Danger Zone
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-6">
          This action cannot be undone. All projects and data associated with this client will be
          affected.
        </p>

        <div className="space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">
              Type <span className="text-nw-black font-bold">&quot;{fullName}&quot;</span> to confirm
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => onConfirmNameChange(e.target.value)}
              placeholder="Type full name here"
              className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-red-500 outline-none font-body text-sm py-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-nw-graphite/20 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-graphite/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending || confirmName !== fullName}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isPending ? "Deleting..." : "Delete Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
