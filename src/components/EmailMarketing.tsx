"use client";

import { useState, useEffect } from "react";
import {
  getEmailTemplates,
  getBulkEmailRecipientCountAction,
  sendBulkEmailAction,
  sendTestEmailAction,
} from "@/app/actions";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import TemplateCreator from "./TemplateCreator";

export default function EmailMarketing() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await getEmailTemplates();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const loadCount = async () => {
      const res = await getBulkEmailRecipientCountAction();
      if (res.success) setRecipientCount(res.count);
    };
    loadCount();
  }, []);

  const handleLaunchClick = () => {
    if (!campaignName || !selectedTemplate) {
      return toast.error("Campaign name and template are required");
    }
    if (recipientCount === 0) {
      return toast.error("No eligible recipients (email, marketing opt-in, not declined)");
    }
    setShowConfirm(true);
  };

  const handleTestSend = async () => {
    if (!selectedTemplate) return toast.error("Select a template first");
    setTesting(true);
    const result = await sendTestEmailAction(selectedTemplate);
    setTesting(false);
    if (result.success) {
      toast.success(`Test email sent to ${result.to}`);
    } else {
      toast.error(result.error || "Test send failed");
    }
  };

  const handleConfirmSend = async () => {
    setSending(true);
    const result = await sendBulkEmailAction(campaignName, selectedTemplate);
    setSending(false);
    setShowConfirm(false);

    if (result.success) {
      const msg =
        result.failed && result.failed > 0
          ? `Sent to ${result.sent} recipients (${result.failed} failed)`
          : `Campaign sent to ${result.sent} recipients!`;
      toast.success(msg);
      setCampaignName("");
      setSelectedTemplate("");
      const res = await getBulkEmailRecipientCountAction();
      if (res.success) setRecipientCount(res.count);
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
                    <span className="text-[9px] font-mono uppercase tracking-widest">Recipients</span>
                  </div>
                  <p className="text-[10px] text-nw-graphite leading-relaxed">
                    {recipientCount === null
                      ? "Loading eligible recipients…"
                      : `${recipientCount} client(s) with email, marketing opt-in (excludes declined).`}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleTestSend}
                    disabled={testing || sending || !selectedTemplate}
                    className="w-full border border-nw-white/20 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-white/10 transition-colors disabled:opacity-30"
                  >
                    {testing ? "Sending test…" : "Send test to me"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchClick}
                    disabled={sending || testing || !selectedTemplate || !campaignName || recipientCount === 0}
                    className="w-full bg-nw-acid text-nw-black py-4 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] font-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                  >
                    Launch Campaign
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nw-black/60 backdrop-blur-sm">
          <div className="bg-nw-white border border-nw-graphite/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-xl uppercase tracking-tighter mb-4">Confirm bulk send</h3>
            <p className="font-body text-sm text-nw-graphite mb-2">
              Campaign: <strong className="text-nw-black">{campaignName}</strong>
            </p>
            <p className="font-body text-sm text-nw-graphite mb-6">
              This will email <strong className="text-nw-black">{recipientCount}</strong> client(s).
              Only clients with marketing opt-in are included; declined clients are excluded. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={sending}
                className="flex-1 py-3 border border-nw-graphite/20 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-bone transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={sending}
                className="flex-1 py-3 bg-nw-black text-nw-bone rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-colors disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
