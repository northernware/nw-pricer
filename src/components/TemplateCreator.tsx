"use client";

import { useState } from "react";
import { saveEmailTemplate } from "@/app/actions";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import RichTextEditor from "./RichTextEditor";

export default function TemplateCreator({ onSaved }: { onSaved: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    } else {
      toast.error(result.error || "Failed to save template");
    }
  };

  return (
    <div className="bg-nw-bone/50 border border-nw-graphite/10 p-6 rounded-2xl">
      <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter">
        <Icon icon="solar:pen-new-square-linear" className="text-nw-acid" />
        Create Template
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-nw-black text-nw-bone py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Template"}
        </button>
      </form>
    </div>
  );
}
