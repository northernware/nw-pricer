"use client";

import { useState, useTransition } from "react";
import { updateProjectStatusAction, deleteProjectAction } from "@/app/actions";
import { Icon } from "@iconify/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const STAGES = [
  { id: "lead", label: "Lead", color: "border-gray-500", bg: "bg-gray-500/10" },
  { id: "quoted", label: "Quoted", color: "border-blue-500", bg: "bg-blue-500/10" },
  { id: "signed", label: "Signed", color: "border-nw-acid", bg: "bg-nw-acid/10" },
];

export default function KanbanBoard({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (projectId: string, newStatus: string) => {
    // Optimistic update
    setProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
    );

    startTransition(async () => {
      const result = await updateProjectStatusAction(projectId, newStatus);
      if (!result.success) {
        toast.error("Failed to move project");
        // Revert on error
        setProjects(initialProjects);
      }
    });
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    setProjects(prev => prev.filter(p => p.id !== projectId));
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (result.success) {
        toast.success("Project deleted");
      } else {
        toast.error("Failed to delete project");
        setProjects(initialProjects);
      }
    });
  };

  const getUrl = (projectId: string) => {
    // Determine default mode based on status
    const p = projects.find(p => p.id === projectId);
    if (!p) return `/p/${projectId}`;
    if (p.status === 'signed') return `/p/${projectId}?mode=contract`;
    return `/p/${projectId}`;
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)] overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageProjects = projects.filter(p => p.status === stage.id || (!p.status && stage.id === 'lead'));
        
        return (
          <div key={stage.id} className="flex-1 min-w-[300px] flex flex-col bg-white border border-nw-black">
            {/* Column Header */}
            <div className={`p-4 border-b border-nw-black flex items-center justify-between ${stage.bg}`}>
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold">
                {stage.label}
              </h2>
              <span className="text-[10px] font-mono bg-nw-black text-nw-bone px-2 py-0.5">
                {stageProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-nw-bone/50">
              {stageProjects.map((project) => (
                <div 
                  key={project.id} 
                  className={`bg-white border ${stage.color} p-4 shadow-[4px_4px_0_0_#0a0a0a] group hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#0a0a0a] transition-all relative`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link href={getUrl(project.id)} target="_blank" className="hover:underline">
                      <h3 className="font-display font-bold text-lg leading-tight line-clamp-2 pr-6">
                        {project.name}
                      </h3>
                    </Link>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="absolute top-4 right-4 text-nw-graphite hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" />
                    </button>
                  </div>
                  
                  <div className="text-xs font-mono text-nw-graphite mb-4">
                    {project.client}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="text-[9px] font-mono text-nw-graphite uppercase">
                      {formatDistanceToNow(project.lastModified, { addSuffix: true })}
                    </div>

                    {/* Status Selector */}
                    <div className="relative">
                      <select
                        value={stage.id}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                        disabled={isPending}
                        className="appearance-none bg-transparent border border-nw-black text-[9px] font-mono uppercase tracking-wider px-2 py-1 pr-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-nw-acid disabled:opacity-50"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      <Icon icon="solar:alt-arrow-down-linear" className="absolute right-1 top-1.5 text-[10px] pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Actions overlay */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Link 
                      href={`/admin/calculator?load=${project.id}`}
                      className="bg-nw-black text-nw-bone text-[9px] font-mono px-3 py-1 uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black border border-transparent hover:border-nw-black transition-colors shadow-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
