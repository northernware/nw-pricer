"use client";

import { useState, useTransition } from "react";
import { updateProjectStatusAction, deleteProjectAction } from "@/app/actions";
import { Icon } from "@iconify/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const STAGES = [
  { id: "lead", label: "Lead", dot: "bg-gray-400" },
  { id: "quoted", label: "Quoted", dot: "bg-blue-400" },
  { id: "signed", label: "Signed", dot: "bg-nw-emerald" },
];

export default function KanbanBoard({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p)
    );
    startTransition(async () => {
      const result = await updateProjectStatusAction(projectId, newStatus);
      if (!result.success) {
        toast.error("Failed to move project");
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
          <div key={stage.id} className="flex-1 min-w-[300px] flex flex-col">
            {/* Column Header */}
            <div className="flex justify-between items-center border-b border-nw-graphite/20 pb-4 mb-4">
              <div className="font-mono text-xs text-nw-black uppercase tracking-widest flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.dot}`}></div>
                {stage.label}
              </div>
              <span className="text-[10px] font-mono text-nw-graphite">
                {stageProjects.length} {stageProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {stageProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-transparent border border-nw-graphite/20 p-5 group hover:border-nw-graphite/50 transition-colors relative flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link href={getUrl(project.id)} target="_blank" className="hover:text-nw-acid transition-colors">
                      <h3 className="font-display font-bold text-xl tracking-tighter text-nw-black line-clamp-2 pr-6">
                        {project.name}
                      </h3>
                    </Link>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="absolute top-5 right-5 text-nw-graphite hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" />
                    </button>
                  </div>
                  
                  <div className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-6">
                    {project.client}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-nw-graphite/10">
                    <div className="text-[9px] font-mono text-nw-graphite/60 uppercase">
                      {formatDistanceToNow(project.lastModified, { addSuffix: true })}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <select
                          value={stage.id}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          disabled={isPending}
                          className="appearance-none bg-transparent text-[9px] font-mono uppercase tracking-wider text-nw-graphite cursor-pointer focus:outline-none hover:text-nw-black transition-colors pr-4 disabled:opacity-50"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                        <Icon icon="solar:alt-arrow-down-linear" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-nw-graphite pointer-events-none" />
                      </div>
                      
                      <div className="w-px h-3 bg-nw-graphite/20"></div>

                      <Link 
                        href={`/admin/calculator?project=${project.id}`}
                        className="text-[9px] font-mono uppercase tracking-widest text-nw-graphite hover:text-nw-acid transition-colors flex items-center gap-1"
                      >
                        Edit
                        <Icon icon="solar:pen-new-square-linear" />
                      </Link>
                    </div>
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
