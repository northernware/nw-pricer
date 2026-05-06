"use client";

import { useState } from "react";
import KanbanBoard from "./KanbanBoard";
import ClientBoard from "./ClientBoard";
import { Icon } from "@iconify/react";

interface CRMViewProps {
  projects: any[];
  clients: any[];
}

export default function CRMView({ projects, clients }: CRMViewProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'clients'>('projects');

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6">
      {/* Sidebar Tabs */}
      <div className="w-48 flex flex-col gap-2 pt-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
            activeTab === 'projects'
              ? 'bg-nw-black text-nw-white shadow-md'
              : 'text-nw-graphite hover:bg-nw-bone'
          }`}
        >
          <Icon icon="solar: folder-2-linear" className="w-4 h-4" />
          Projects
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
            activeTab === 'clients'
              ? 'bg-nw-black text-nw-white shadow-md'
              : 'text-nw-graphite hover:bg-nw-bone'
          }`}
        >
          <Icon icon="solar:users-group-rounded-linear" className="w-4 h-4" />
          Clients
        </button>
      </div>

      {/* Pipeline View */}
      <div className="flex-1 min-w-0">
        {activeTab === 'projects' ? (
          <KanbanBoard initialProjects={projects} />
        ) : (
          <ClientBoard initialClients={clients} />
        )}
      </div>
    </div>
  );
}
