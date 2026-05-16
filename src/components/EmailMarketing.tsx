"use client";

import { useState, useEffect } from "react";
import { getEmailTemplates, sendBulkEmailAction } from "@/app/actions";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import TemplateCreator from "./TemplateCreator";

export default function EmailMarketing() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const loadTemplates = async () => {
    setLoading(true);
    const data = await getEmailTemplates();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSendBulk = async () => {
    if (!campaignName || !selectedTemplate) return toast.error("Campaign name and template are required");
    
    setSending(true);
    const result = await sendBulkEmailAction(campaignName, selectedTemplate);
    setSending(false);

    if (result.success) {
      toast.success(`Campaign sent to ${result.count} recipients!`);
      setCampaignName("");
      setSelectedTemplate("");
    } else {
      toast.error(result.error || "Bulk distribution failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black">Marketing Suite</h2>
          <p className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mt-1">Branded Email Distribution & Templates</p>
        </div>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="bg-nw-black text-nw-bone px-6 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all flex items-center gap-2 group"
        >
          <Icon icon={showCreator ? "solar:close-circle-linear" : "solar:add-circle-linear"} className="w-4 h-4" />
          {showCreator ? "Close Creator" : "New Template"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {showCreator ? (
          <div className="lg:col-span-2">
            <TemplateCreator onSaved={loadTemplates} />
          </div>
        ) : (
          <>
            {/* Templates List */}
            <div className="bg-nw-white border border-nw-graphite/10 rounded-2xl p-6 shadow-sm">
              <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <Icon icon="solar:document-text-linear" className="text-nw-acid" />
                Templates
              </h3>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-20 bg-nw-bone animate-pulse rounded-xl"></div>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-nw-bone/50 border border-transparent hover:border-nw-graphite/10 transition-all flex justify-between items-center group">
                      <div>
                        <div className="text-xs font-bold text-nw-black">{t.name}</div>
                        <div className="text-[9px] font-mono text-nw-graphite/40 uppercase tracking-widest mt-1">{t.category} — {t.subject}</div>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-nw-white text-nw-graphite/40 hover:text-nw-black transition-all">
                        <Icon icon="solar:pen-linear" />
                      </button>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-nw-graphite/10 rounded-xl">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite/40">No templates found</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Distribution Panel */}
            <div className="bg-nw-black text-nw-bone rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-nw-acid/5 blur-3xl -ml-32 -mb-32 rounded-full"></div>
              <h3 className="font-display font-bold text-lg mb-6 relative z-10 uppercase tracking-tighter">Bulk Distribution</h3>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                    placeholder="e.g. May 2026 Promo"
                    className="w-full bg-nw-white/5 border-b border-nw-white/10 focus:border-nw-acid outline-none font-body text-xs py-2 text-nw-bone"
                  />
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">Select Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={e => setSelectedTemplate(e.target.value)}
                    className="w-full bg-nw-black border-b border-nw-white/10 focus:border-nw-acid outline-none font-body text-xs py-2 text-nw-bone"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-nw-white/5 border border-nw-white/10 rounded-xl">
                  <div className="flex items-center gap-3 text-nw-acid mb-2">
                    <Icon icon="solar:info-circle-linear" />
                    <span className="text-[9px] font-mono uppercase tracking-widest">Notice</span>
                  </div>
                  <p className="text-[10px] text-nw-graphite leading-relaxed">
                    This will send the selected template to all clients with an email address. This action cannot be undone.
                  </p>
                </div>

                <button
                  onClick={handleSendBulk}
                  disabled={sending || !selectedTemplate || !campaignName}
                  className="w-full bg-nw-acid text-nw-black py-4 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] font-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                >
                  {sending ? "Distributing..." : "Launch Campaign"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
