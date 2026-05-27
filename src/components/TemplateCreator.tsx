"use client";

import { useState } from "react";
import { saveEmailTemplate } from "@/app/actions";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import RichTextEditor from "./RichTextEditor";

export interface EmailTemplateFormData {
  id?: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

export default function TemplateCreator({
  onSaved,
  initialTemplate,
  onCancel,
}: {
  onSaved: () => void;
  initialTemplate?: EmailTemplateFormData | null;
  onCancel?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EmailTemplateFormData>(initialTemplate ?? {
    name: "",
    subject: "",
    body: "",
    category: "marketing"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.body) return toast.error("Template body is required");
    
    setLoading(true);
    const result = await saveEmailTemplate(formData);
    setLoading(false);

    if (result.success) {
      toast.success("Template saved successfully");
      setFormData({ name: "", subject: "", body: "", category: "marketing" });
      onSaved();
      onCancel?.();
    } else {
      toast.error(result.error || "Failed to save template");
    }
  };

  return (
    <div className="bg-nw-bone/50 border border-nw-graphite/10 p-6 rounded-2xl">
      <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter">
        <Icon icon="solar:pen-new-square-linear" className="text-nw-acid" />
        {formData.id ? "Edit Template" : "Create Template"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">Template Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Monthly Newsletter"
              className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-xs py-2"
            />
          </div>
          <div>
            <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-xs py-2"
            >
              <option value="marketing">Marketing</option>
              <option value="proposal">Proposal Follow-up</option>
              <option value="contract">Contract/Legal</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        <div>
          <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">Default Subject</label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={e => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Email subject line"
            className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-xs py-2"
          />
        </div>

        <div>
          <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">Template Content</label>
          <RichTextEditor 
            value={formData.body} 
            onChange={(val) => setFormData({ ...formData, body: val })}
          />
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 border border-nw-graphite/20 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-graphite/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-nw-black text-nw-bone py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : formData.id ? "Update Template" : "Save Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
