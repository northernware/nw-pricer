"use client";

import { useEffect, useMemo, useState } from "react";
import type { ClientStatus } from "@prisma/client";
import {
  getEmailTemplates,
  getBulkEmailRecipientsAction,
  sendBulkEmailAction,
  sendTestEmailAction,
} from "@/app/actions";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import TemplateCreator, { type EmailTemplateFormData } from "./TemplateCreator";

type EmailTemplate = EmailTemplateFormData & {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type EmailRecipient = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  marketingOptIn: boolean;
};

const RECIPIENT_STATUSES: { id: ClientStatus; label: string }[] = [
  { id: "prospect", label: "Prospects" },
  { id: "active", label: "Active" },
  { id: "retainer", label: "Retainers" },
  { id: "completed", label: "Completed" },
];

export default function EmailMarketing() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ClientStatus[]>(["prospect"]);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedTemplateData = useMemo(
    () => templates.find((template) => template.id === selectedTemplate) ?? null,
    [templates, selectedTemplate]
  );

  const loadTemplates = async () => {
    setLoading(true);
    const data = await getEmailTemplates();
    setTemplates(data as EmailTemplate[]);
    setLoading(false);
  };

  const loadRecipients = async (statuses = selectedStatuses) => {
    setLoadingRecipients(true);
    const res = await getBulkEmailRecipientsAction(statuses);
    if (res.success) {
      setRecipients(res.clients as EmailRecipient[]);
    } else {
      toast.error(res.error || "Unable to load recipients");
      setRecipients([]);
    }
    setLoadingRecipients(false);
  };

  useEffect(() => {
    void Promise.all([getEmailTemplates(), getBulkEmailRecipientsAction(["prospect"])]).then(
      ([templateData, recipientResult]) => {
        setTemplates(templateData as EmailTemplate[]);
        if (recipientResult.success) {
          setRecipients(recipientResult.clients as EmailRecipient[]);
        }
        setLoading(false);
        setLoadingRecipients(false);
      }
    );
  }, []);

  const toggleStatus = (status: ClientStatus) => {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter((item) => item !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(next);
    void loadRecipients(next);
  };

  const startEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowCreator(true);
  };

  const closeCreator = () => {
    setShowCreator(false);
    setEditingTemplate(null);
  };

  const handleLaunchClick = () => {
    if (!campaignName || !selectedTemplate) {
      return toast.error("Campaign name and template are required");
    }
    if (selectedStatuses.length === 0) {
      return toast.error("Select at least one recipient group");
    }
    if (recipients.length === 0) {
      return toast.error("No eligible recipients for this selection");
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
    const result = await sendBulkEmailAction(campaignName, selectedTemplate, selectedStatuses);
    setSending(false);
    setShowConfirm(false);

    if (result.success) {
      const msg =
        result.failed && result.failed > 0
          ? `Sent to ${result.sent} recipients (${result.failed} failed)`
          : `Campaign sent to ${result.sent} recipients`;
      toast.success(msg);
      setCampaignName("");
      setSelectedTemplate("");
      await loadRecipients();
    } else {
      toast.error(result.error || "Bulk distribution failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black">
            Email Sender
          </h2>
          <p className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mt-1">
            Templates, recipient selection, tests, and bulk sends
          </p>
        </div>
        <button
          type="button"
          onClick={() => (showCreator ? closeCreator() : setShowCreator(true))}
          className="bg-nw-black text-nw-bone px-6 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all flex items-center justify-center gap-2 group"
        >
          <Icon icon={showCreator ? "solar:close-circle-linear" : "solar:add-circle-linear"} className="w-4 h-4" />
          {showCreator ? "Close Editor" : "New Template"}
        </button>
      </div>

      {showCreator ? (
        <TemplateCreator
          key={editingTemplate?.id ?? "new-template"}
          initialTemplate={editingTemplate}
          onSaved={loadTemplates}
          onCancel={closeCreator}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-8">
          <div className="bg-nw-white border border-nw-graphite/10 rounded-2xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter">
              <Icon icon="solar:document-text-linear" className="text-nw-acid" />
              Edit Template
            </h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div key={item} className="h-20 bg-nw-bone animate-pulse rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 rounded-xl bg-nw-bone/50 border border-transparent hover:border-nw-graphite/10 transition-all flex justify-between items-center group gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="text-xs font-bold text-nw-black">{template.name}</div>
                      <div className="text-[9px] font-mono text-nw-graphite/40 uppercase tracking-widest mt-1">
                        {template.category} / {template.subject}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditTemplate(template)}
                      className="p-2 rounded-lg hover:bg-nw-white text-nw-graphite/40 hover:text-nw-black transition-all"
                      aria-label={`Edit ${template.name}`}
                    >
                      <Icon icon="solar:pen-linear" />
                    </button>
                  </div>
                ))}
                {templates.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-nw-graphite/10 rounded-xl">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite/40">
                      No templates found
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-nw-black text-nw-bone rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <h3 className="font-display font-bold text-lg mb-6 relative z-10 uppercase tracking-tighter">
                Recipient Selection
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(event) => setCampaignName(event.target.value)}
                    placeholder="e.g. June Prospect Follow-up"
                    className="w-full bg-nw-white/5 border-b border-nw-white/10 focus:border-nw-acid outline-none font-body text-xs py-2 text-nw-bone"
                  />
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">
                    Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(event) => setSelectedTemplate(event.target.value)}
                    className="w-full bg-nw-black border-b border-nw-white/10 focus:border-nw-acid outline-none font-body text-xs py-2 text-nw-bone"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-3 block">
                    Client Groups
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {RECIPIENT_STATUSES.map((status) => (
                      <label key={status.id} className="flex items-center gap-2 rounded-lg border border-nw-white/10 bg-nw-white/5 px-3 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status.id)}
                          onChange={() => toggleStatus(status.id)}
                          className="accent-nw-acid"
                        />
                        <span className="font-mono text-[9px] uppercase tracking-widest">
                          {status.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-nw-white/5 border border-nw-white/10 rounded-xl">
                  <div className="flex items-center justify-between gap-3 text-nw-acid mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest">
                      {loadingRecipients ? "Loading recipients" : `${recipients.length} recipients`}
                    </span>
                    <Icon icon="solar:users-group-rounded-linear" />
                  </div>
                  <p className="text-[10px] text-nw-graphite leading-relaxed">
                    Includes clients with email, marketing opt-in, and selected status groups.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleTestSend}
                    disabled={testing || sending || !selectedTemplate}
                    className="w-full border border-nw-white/20 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-white/10 transition-colors disabled:opacity-30"
                  >
                    {testing ? "Sending test..." : "Send test to me"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchClick}
                    disabled={sending || testing || !selectedTemplate || !campaignName || recipients.length === 0}
                    className="w-full bg-nw-acid text-nw-black py-4 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] font-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                  >
                    Launch Campaign
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-nw-white border border-nw-graphite/10 rounded-2xl p-5 shadow-sm">
              <h4 className="font-display font-bold text-sm uppercase tracking-tighter mb-4">
                Recipient Preview
              </h4>
              <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-3">
                {recipients.map((client) => (
                  <div key={client.id} className="flex items-start justify-between gap-3 rounded-xl bg-nw-bone/60 p-3">
                    <div className="min-w-0">
                      <div className="font-body text-xs font-bold text-nw-black">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite/40 truncate">
                        {client.company || client.email}
                      </div>
                    </div>
                    <span className="shrink-0 rounded bg-nw-white px-2 py-1 font-mono text-[8px] uppercase tracking-widest text-nw-graphite">
                      {client.status}
                    </span>
                  </div>
                ))}
                {!loadingRecipients && recipients.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-nw-graphite/10 rounded-xl">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite/40">
                      No eligible recipients
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nw-black/60 backdrop-blur-sm">
          <div className="bg-nw-white border border-nw-graphite/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="font-display font-bold text-xl uppercase tracking-tighter mb-4">
              Confirm bulk send
            </h3>
            <p className="font-body text-sm text-nw-graphite mb-2">
              Campaign: <strong className="text-nw-black">{campaignName}</strong>
            </p>
            <p className="font-body text-sm text-nw-graphite mb-2">
              Template: <strong className="text-nw-black">{selectedTemplateData?.name}</strong>
            </p>
            <p className="font-body text-sm text-nw-graphite mb-6">
              This will email <strong className="text-nw-black">{recipients.length}</strong> selected client(s).
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
                {sending ? "Sending..." : "Send now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
