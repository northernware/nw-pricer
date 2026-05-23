"use client";

import { useEffect, useState } from "react";
import { getActivityLogsAction } from "@/app/actions";
import type { ActivityLogItem } from "@/types/crm";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const ACTIVITY_TYPES = [
  { id: "", label: "All types" },
  { id: "approval", label: "Approval" },
  { id: "status_change", label: "Status change" },
  { id: "creation", label: "Creation" },
  { id: "email_sent", label: "Email sent" },
];

function activityIcon(type: string) {
  switch (type) {
    case "approval":
      return "solar:check-circle-bold";
    case "status_change":
      return "solar:refresh-circle-bold";
    case "creation":
      return "solar:add-circle-bold";
    case "email_sent":
      return "solar:letter-bold";
    default:
      return "solar:history-linear";
  }
}

interface ActivityFeedProps {
  initialClientId?: string;
  initialProjectId?: string;
  showFilters?: boolean;
}

export default function ActivityFeed({
  initialClientId,
  initialProjectId,
  showFilters = true,
}: ActivityFeedProps) {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getActivityLogsAction({
        clientId: initialClientId,
        projectId: initialProjectId,
        type: typeFilter || undefined,
        limit: 200,
      });
      setLogs(data);
      setLoading(false);
    }
    load();
  }, [initialClientId, initialProjectId, typeFilter]);

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mb-2 block">
              Filter by type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-nw-white border border-nw-graphite/20 rounded-lg px-3 py-2 font-mono text-xs"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.id || "all"} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {(initialClientId || typeFilter) && (
            <Link
              href="/admin/activity"
              className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite hover:text-nw-black"
            >
              Clear filters
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <p className="font-mono text-xs uppercase tracking-widest text-nw-graphite animate-pulse">
          Loading activity…
        </p>
      ) : logs.length === 0 ? (
        <p className="font-mono text-xs uppercase tracking-widest text-nw-graphite/60">
          No activity found
        </p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 rounded-xl bg-nw-white border border-nw-graphite/10 hover:border-nw-acid/20 transition-colors"
            >
              <div className="mt-1 p-2 rounded-lg bg-nw-bone">
                <Icon icon={activityIcon(log.type)} className="w-4 h-4 text-nw-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
                  {log.clientId ? (
                    <Link
                      href={`/admin/client/${log.clientId}`}
                      className="text-xs font-bold text-nw-black hover:text-nw-acid"
                    >
                      {log.clientName}
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-nw-black">{log.clientName}</span>
                  )}
                  <span className="text-[10px] font-mono text-nw-graphite/40">
                    {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-[11px] text-nw-graphite leading-relaxed">{log.action}</p>
                <span className="inline-block mt-2 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-nw-bone text-nw-graphite">
                  {log.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
