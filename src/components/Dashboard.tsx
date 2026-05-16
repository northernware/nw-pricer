"use client";

import { useEffect, useState } from "react";
import { getStats } from "@/app/actions";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) return <div className="p-8 animate-pulse font-mono text-xs uppercase tracking-widest text-nw-graphite">Loading Analytics...</div>;
  if (!stats) return <div className="p-8 font-mono text-xs uppercase tracking-widest text-red-500">Failed to load statistics.</div>;

  const cards = [
    { label: "Active Clients", value: stats.activeClients, icon: "solar:users-group-rounded-bold-duotone", color: "text-blue-500" },
    { label: "Prospects", value: stats.prospects, icon: "solar:user-plus-bold-duotone", color: "text-nw-graphite" },
    { label: "Signed Projects", value: stats.signedProjects, icon: "solar:document-add-bold-duotone", color: "text-nw-emerald" },
    { label: "Cancelled", value: stats.cancelled, icon: "solar:user-block-bold-duotone", color: "text-red-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-nw-white border border-nw-graphite/10 p-6 rounded-2xl shadow-sm hover:border-nw-acid/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <Icon icon={card.icon} className={`w-8 h-8 ${card.color} group-hover:scale-110 transition-transform`} />
              <div className="text-[10px] font-mono text-nw-graphite/40 uppercase tracking-widest">Growth +{(Math.random() * 5).toFixed(1)}%</div>
            </div>
            <div className="text-3xl font-display font-black text-nw-black mb-1">{card.value}</div>
            <div className="text-[10px] font-mono text-nw-graphite uppercase tracking-[0.2em]">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-nw-white border border-nw-graphite/10 rounded-2xl p-6 shadow-sm">
          <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter">
            <Icon icon="solar:history-linear" className="text-nw-acid" />
            Activity Log
          </h3>
          <div className="space-y-4">
            {stats.recentActivity.map((log: any) => (
              <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-nw-bone/50 transition-colors border border-transparent hover:border-nw-graphite/5">
                <div className={`mt-1 p-2 rounded-lg bg-nw-bone`}>
                  <Icon icon={
                    log.type === 'approval' ? "solar:check-circle-bold" :
                    log.type === 'status_change' ? "solar:refresh-circle-bold" :
                    log.type === 'creation' ? "solar:add-circle-bold" : "solar:letter-bold"
                  } className="w-4 h-4 text-nw-black" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-nw-black">{log.clientName}</span>
                    <span className="text-[10px] font-mono text-nw-graphite/40">{formatDistanceToNow(log.createdAt, { addSuffix: true })}</span>
                  </div>
                  <p className="text-[11px] text-nw-graphite leading-relaxed">{log.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links / Future Reference */}
        <div className="bg-nw-black text-nw-bone rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nw-acid/10 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          <h3 className="font-display font-bold text-lg mb-6 relative z-10 uppercase tracking-tighter">CRM Quick Actions</h3>
          <div className="space-y-3 relative z-10">
            <button className="w-full text-left p-4 rounded-xl bg-nw-white/5 border border-nw-white/10 hover:bg-nw-acid hover:text-nw-black transition-all flex items-center justify-between group">
              <span className="text-xs font-mono uppercase tracking-widest">Marketing Campaign</span>
              <Icon icon="solar:alt-arrow-right-linear" className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full text-left p-4 rounded-xl bg-nw-white/5 border border-nw-white/10 hover:bg-nw-acid hover:text-nw-black transition-all flex items-center justify-between group">
              <span className="text-xs font-mono uppercase tracking-widest">Email Templates</span>
              <Icon icon="solar:alt-arrow-right-linear" className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full text-left p-4 rounded-xl bg-nw-white/5 border border-nw-white/10 hover:bg-nw-acid hover:text-nw-black transition-all flex items-center justify-between group">
              <span className="text-xs font-mono uppercase tracking-widest">Export CRM Data</span>
              <Icon icon="solar:download-minimalistic-linear" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
