"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import type { ClientDetail, ClientProfileLog, ClientProfileProject } from "@/types/crm";
import { getEmailTemplates, sendIndividualEmailAction } from "@/app/actions";
import RichTextEditor from "./RichTextEditor";
import toast from "react-hot-toast";

interface ClientProfileProps {
  client: ClientDetail;
}

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
};

export default function ClientProfile({ client }: ClientProfileProps) {
  const [showEmailSender, setShowEmailSender] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const stats = [
    { label: "Total Projects", value: client.projects?.length || 0, icon: "solar:folder-2-linear" },
    { label: "Client Since", value: format(new Date(client.createdAt), "MMM yyyy"), icon: "solar:calendar-minimalistic-linear" },
    { label: "Current Status", value: client.status, icon: "solar:tag-linear", capitalize: true },
  ];

  const selectedTemplateData = useMemo(
    () => templates.find((template) => template.id === selectedTemplate) ?? null,
    [templates, selectedTemplate]
  );

  useEffect(() => {
    if (!showEmailSender) return;
    void getEmailTemplates().then((data) => {
      setTemplates(data as EmailTemplate[]);
    });
  }, [showEmailSender]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSendEmail = async () => {
    if (!client.email) return toast.error("Client has no email address");
    if (!subject.trim() || !body.trim()) return toast.error("Subject and body are required");

    setSending(true);
    const result = await sendIndividualEmailAction(client.id, subject, body);
    setSending(false);

    if (result.success) {
      toast.success(`Email sent to ${client.email}`);
      setShowEmailSender(false);
      setSelectedTemplate("");
      setSubject("");
      setBody("");
    } else {
      toast.error(result.error || "Failed to send email");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header / Info Card */}
      <div className="bg-nw-white border border-nw-graphite/10 rounded-2xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-nw-acid/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display font-black text-3xl tracking-tighter text-nw-black uppercase">
                {client.firstName} {client.lastName}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest ${
                client.status === 'active' ? 'bg-nw-emerald/10 text-nw-emerald' : 
                client.status === 'prospect' ? 'bg-blue-500/10 text-blue-500' : 'bg-nw-graphite/10 text-nw-graphite'
              }`}>
                {client.status}
              </span>
            </div>
            <p className="font-mono text-xs text-nw-graphite uppercase tracking-widest mb-6">
              {client.company || "No Company"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs text-nw-graphite">
                <Icon icon="solar:letter-linear" className="text-nw-acid" />
                {client.email || "No Email"}
              </div>
              <div className="flex items-center gap-2 text-xs text-nw-graphite">
                <Icon icon="solar:phone-linear" className="text-nw-acid" />
                {client.phone || "No Phone"}
              </div>
              <div className="flex items-center gap-2 text-xs text-nw-graphite">
                <Icon icon="solar:letter-opened-linear" className="text-nw-acid" />
                {client.marketingOptIn ? "Marketing opt-in" : "No marketing opt-in"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {client.email && (
              <a
                href={`mailto:${client.email}`}
                className="border border-nw-graphite/10 px-4 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-bone transition-all flex items-center gap-2"
              >
                <Icon icon="solar:letter-linear" className="w-4 h-4" />
                Mail
              </a>
            )}
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="border border-nw-graphite/10 px-4 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-bone transition-all flex items-center gap-2"
              >
                <Icon icon="solar:phone-linear" className="w-4 h-4" />
                Call
              </a>
            )}
            <button
              type="button"
              onClick={() => setShowEmailSender((value) => !value)}
              className="bg-nw-black text-nw-bone px-6 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all flex items-center gap-2 group disabled:opacity-40"
              disabled={!client.email}
            >
              <Icon icon="solar:letter-send-linear" className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              Send Email
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-nw-graphite/5 relative z-10">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-nw-bone text-nw-black">
                <Icon icon={stat.icon} className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[9px] font-mono text-nw-graphite/40 uppercase tracking-widest">{stat.label}</div>
                <div className={`text-sm font-bold text-nw-black ${stat.capitalize ? 'capitalize' : ''}`}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEmailSender && (
        <div className="bg-nw-white border border-nw-graphite/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-bold text-xl uppercase tracking-tighter flex items-center gap-2">
                <Icon icon="solar:letter-send-linear" className="text-nw-acid" />
                Email Sender
              </h2>
              <p className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite/50 mt-1">
                Sending to {client.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEmailSender(false)}
              className="rounded-lg p-2 text-nw-graphite/40 hover:bg-nw-bone hover:text-nw-black transition-colors"
              aria-label="Close email sender"
            >
              <Icon icon="solar:close-circle-linear" className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
            <div className="space-y-3">
              <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite block">
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(event) => handleTemplateSelect(event.target.value)}
                className="w-full bg-nw-bone border border-nw-graphite/10 rounded-xl px-3 py-3 font-body text-xs outline-none focus:border-nw-acid"
              >
                <option value="">Blank email</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {selectedTemplateData && (
                <div className="rounded-xl bg-nw-bone p-3">
                  <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40 mb-1">
                    Selected
                  </div>
                  <div className="font-body text-xs font-bold text-nw-black">{selectedTemplateData.name}</div>
                  <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40 mt-1">
                    {selectedTemplateData.category}
                  </div>
                </div>
              )}
              <div className="rounded-xl bg-nw-bone p-3 space-y-2">
                <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40">
                  Call Notes
                </div>
                <p className="font-body text-xs text-nw-graphite leading-relaxed">
                  Use the latest activity and project cards below before calling or sending follow-up.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">
                  Message
                </label>
                <RichTextEditor value={body} onChange={setBody} />
              </div>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending || !client.email}
                className="w-full bg-nw-black text-nw-bone py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl uppercase tracking-tighter flex items-center gap-2">
            <Icon icon="solar:user-id-linear" className="text-nw-acid" />
            Client Center
          </h2>
          <div className="bg-nw-white border border-nw-graphite/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40 mb-1">Email</div>
                <div className="font-body text-sm text-nw-black break-all">{client.email || "No email"}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40 mb-1">Phone</div>
                <div className="font-body text-sm text-nw-black">{client.phone || "No phone"}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40 mb-1">Company</div>
                <div className="font-body text-sm text-nw-black">{client.company || "No company"}</div>
              </div>
              <div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40 mb-1">Address / Location</div>
                <div className="font-body text-sm text-nw-black">{client.address || "No address"}</div>
              </div>
            </div>
            <div className="rounded-xl bg-nw-bone p-4">
              <div className="font-mono text-[8px] uppercase tracking-widest text-nw-graphite/40 mb-2">
                Cold calling context
              </div>
              <p className="font-body text-xs text-nw-graphite leading-relaxed">
                Status is <strong className="capitalize text-nw-black">{client.status}</strong>.
                {client.marketingOptIn
                  ? " This client can receive marketing campaigns."
                  : " This client is not opted in for bulk marketing emails."}
              </p>
            </div>
          </div>
        </div>

        {/* Projects History */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl uppercase tracking-tighter flex items-center gap-2">
            <Icon icon="solar:folder-2-bold" className="text-nw-acid" />
            Projects
          </h2>
          <div className="space-y-4">
            {client.projects?.map((project: ClientProfileProject) => (
              <Link 
                key={project.id}
                href={`/admin/calculator?project=${project.id}`}
                className="block bg-nw-white border border-nw-graphite/10 p-5 rounded-2xl hover:border-nw-acid/30 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-nw-black group-hover:text-nw-acid transition-colors">{project.name}</h3>
                  <span className="text-[10px] font-mono text-nw-graphite/40 uppercase">
                    {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-[0.2em] ${
                    project.status === 'signed' ? 'bg-nw-emerald/10 text-nw-emerald' : 'bg-nw-bone text-nw-graphite'
                  }`}>
                    {project.status}
                  </div>
                  <Icon icon="solar:alt-arrow-right-linear" className="text-nw-graphite/20 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
            {(!client.projects || client.projects.length === 0) && (
              <div className="bg-nw-white border border-dashed border-nw-graphite/10 p-12 rounded-2xl text-center">
                <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite/40">No projects yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-xl uppercase tracking-tighter flex items-center gap-2">
              <Icon icon="solar:history-bold" className="text-nw-acid" />
              Activity Log
            </h2>
            <Link
              href={`/admin/activity?clientId=${client.id}`}
              className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite hover:text-nw-acid"
            >
              View all
            </Link>
          </div>
          <div className="relative pl-4 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-nw-graphite/10">
            {client.logs?.map((log: ClientProfileLog) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-nw-acid border-4 border-nw-bone outline outline-1 outline-nw-graphite/10"></div>
                <div className="pl-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-nw-graphite/40">
                      {format(new Date(log.createdAt), "MMM d, h:mm a")}
                    </span>
                    <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      log.type === 'approval' ? 'bg-nw-emerald/10 text-nw-emerald' : 
                      log.type === 'status_change' ? 'bg-blue-500/10 text-blue-500' : 'bg-nw-bone text-nw-graphite'
                    }`}>
                      {log.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-nw-black font-medium leading-relaxed">{log.action}</p>
                  {log.details != null && (
                    <div className="mt-2 p-3 bg-nw-bone rounded-lg font-mono text-[9px] text-nw-graphite overflow-x-auto">
                      <pre>{JSON.stringify(log.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {(!client.logs || client.logs.length === 0) && (
              <div className="pl-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite/40">No activity recorded</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
