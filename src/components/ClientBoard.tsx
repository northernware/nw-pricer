"use client";

import { useState, useTransition } from "react";
import { updateClientStatusAction } from "@/app/actions";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const CLIENT_STAGES = [
  { id: "prospect", label: "Prospect", dot: "bg-gray-400" },
  { id: "active", label: "Active", dot: "bg-blue-400" },
  { id: "retainer", label: "Retainer", dot: "bg-nw-emerald" },
];

export default function ClientBoard({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (clientId: string, newStatus: string) => {
    setClients(prev => 
      prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c)
    );
    startTransition(async () => {
      const result = await updateClientStatusAction(clientId, newStatus);
      if (!result.success) {
        toast.error("Failed to move client");
        setClients(initialClients);
      }
    });
  };

  return (
    <div className="flex gap-2 h-full overflow-x-auto pb-4">
      {CLIENT_STAGES.map((stage) => {
        const stageClients = clients.filter(c => c.status === stage.id || (!c.status && stage.id === 'prospect'));
        
        return (
          <div key={stage.id} className="flex-1 min-w-[320px] flex flex-col bg-nw-white rounded-xl border border-nw-graphite/10">
            {/* Column Header */}
            <div className="p-5 flex justify-between items-center border-b border-nw-graphite/10">
              <div className="font-mono text-[10px] text-nw-black uppercase tracking-[0.2em] flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`}></div>
                {stage.label}
              </div>
              <span className="text-[10px] font-mono text-nw-graphite/60">
                {stageClients.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {stageClients.map((client) => (
                <div 
                  key={client.id} 
                  className="bg-nw-bone border border-nw-graphite/10 rounded-lg p-5 group hover:border-nw-acid/30 transition-all duration-300 relative flex flex-col shadow-sm"
                >
                  <div className="mb-3">
                    <h3 className="font-display font-bold text-lg tracking-tight text-nw-black leading-tight">
                      {client.firstName} {client.lastName}
                    </h3>
                    {client.company && (
                      <div className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mt-1">
                        {client.company}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-6">
                    {client.email && (
                      <div className="text-[10px] font-mono text-nw-graphite flex items-center gap-2">
                        <Icon icon="solar:letter-linear" className="w-3 h-3" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="text-[10px] font-mono text-nw-graphite flex items-center gap-2">
                        <Icon icon="solar:phone-linear" className="w-3 h-3" />
                        {client.phone}
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-nw-graphite flex items-center gap-2">
                      <Icon icon="solar:folder-linear" className="w-3 h-3" />
                      {client.projectCount} {client.projectCount === 1 ? 'project' : 'projects'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-nw-graphite/5">
                    <div className="text-[8px] font-mono text-nw-graphite/40 uppercase">
                      Updated {formatDistanceToNow(client.lastModified, { addSuffix: true })}
                    </div>

                    <div className="relative">
                      <select
                        value={stage.id}
                        onChange={(e) => handleStatusChange(client.id, e.target.value)}
                        disabled={isPending}
                        className="appearance-none bg-transparent text-[9px] font-mono uppercase tracking-widest text-nw-graphite hover:text-nw-black cursor-pointer focus:outline-none pr-4 disabled:opacity-50"
                      >
                        {CLIENT_STAGES.map(s => (
                          <option key={s.id} value={s.id} className="bg-nw-bone">{s.label}</option>
                        ))}
                      </select>
                      <Icon icon="solar:alt-arrow-down-linear" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-nw-graphite/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
              
              {stageClients.length === 0 && (
                <div className="h-24 border border-dashed border-nw-graphite/10 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-mono text-nw-graphite/30 uppercase tracking-widest">No clients</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
