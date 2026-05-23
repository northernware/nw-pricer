"use client";

import { useState, useTransition } from "react";
import { updateProjectStatusAction, deleteProjectAction } from "@/app/actions";
import { Icon } from "@iconify/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent,
  useDroppable,
  useDraggable,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ProjectStatus } from "@prisma/client";
import type { KanbanStage, StoredProject } from "@/types/crm";

const STAGES: KanbanStage[] = [
  { id: "lead", label: "Lead", dot: "bg-gray-400" },
  { id: "quoted", label: "Quoted", dot: "bg-blue-400" },
  { id: "signed", label: "Signed", dot: "bg-nw-emerald" },
];

interface ProjectCardProps {
  project: StoredProject;
  stageId: string;
  isDragging?: boolean;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  getUrl: (id: string) => string;
  isPending: boolean;
}

function KanbanCard({ project, stageId, isDragging, onDelete, onStatusChange, getUrl, isPending }: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
    data: { project, stageId }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-nw-bone border border-nw-graphite/10 rounded-lg p-5 group hover:border-nw-acid/30 transition-all duration-300 relative flex flex-col shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-3">
        <Link 
          href={getUrl(project.id)} 
          target="_blank" 
          className="hover:text-nw-acid transition-colors flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-display font-bold text-md tracking-tight text-nw-black leading-tight line-clamp-2 pr-4 pointer-events-auto">
            {project.name}
          </h3>
        </Link>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
          className="text-nw-graphite/40 hover:text-red-500 transition-colors pt-1 pointer-events-auto"
        >
          <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mb-6 pointer-events-none">
        <div className="font-mono text-[10px] uppercase tracking-widest text-nw-black leading-tight">
          {project.clientName}
        </div>
        {project.clientCompany && (
          <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-nw-graphite mt-1">
            {project.clientCompany}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-nw-graphite/5 pointer-events-none">
        <div className="text-[8px] font-mono text-nw-graphite/40 uppercase">
          {formatDistanceToNow(project.lastModified, { addSuffix: true })}
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative">
            <select
              value={stageId}
              onChange={(e) => { e.stopPropagation(); onStatusChange(project.id, e.target.value); }}
              disabled={isPending}
              className="appearance-none bg-transparent text-[9px] font-mono uppercase tracking-widest text-nw-graphite hover:text-nw-black cursor-pointer focus:outline-none pr-4 disabled:opacity-50"
            >
              {STAGES.map(s => (
                <option key={s.id} value={s.id} className="bg-nw-bone">{s.label}</option>
              ))}
            </select>
            <Icon icon="solar:alt-arrow-down-linear" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-nw-graphite/40 pointer-events-none" />
          </div>
          
          <div className="w-px h-3 bg-nw-graphite/10"></div>

          <Link 
            href={`/admin/calculator?project=${project.id}`}
            className="text-nw-graphite/60 hover:text-nw-acid transition-colors"
            title="Edit Project"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon icon="solar:pen-new-square-linear" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, children }: { stage: KanbanStage; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-1 min-w-[320px] flex flex-col bg-nw-white rounded-xl border border-nw-graphite/10">
      {/* Column Header */}
      <div className="p-5 flex justify-between items-center border-b border-nw-graphite/10">
        <div className="font-mono text-[10px] text-nw-black uppercase tracking-[0.2em] flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`}></div>
          {stage.label}
        </div>
      </div>

      {/* Cards Container */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
        {children}
      </div>
    </div>
  );
}

export default function KanbanBoard({ initialProjects }: { initialProjects: StoredProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<StoredProject | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, status: newStatus as ProjectStatus } : p)
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveProject(active.data.current?.project);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveProject(null);

    if (over && active.data.current?.stageId !== over.id) {
      const projectId = active.id as string;
      const newStatus = over.id as string;
      handleStatusChange(projectId, newStatus);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 h-full overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageProjects = projects.filter(p => p.status === stage.id || (!p.status && stage.id === 'lead'));
          
          return (
            <KanbanColumn key={stage.id} stage={stage}>
              {stageProjects.map((project) => (
                <KanbanCard 
                  key={project.id}
                  project={project}
                  stageId={stage.id}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  getUrl={getUrl}
                  isPending={isPending}
                />
              ))}
              
              {stageProjects.length === 0 && (
                <div className="h-24 border border-dashed border-nw-graphite/10 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-mono text-nw-graphite/30 uppercase tracking-widest">No projects</span>
                </div>
              )}
            </KanbanColumn>
          );
        })}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.3',
            },
          },
        }),
      }}>
        {activeId && activeProject ? (
          <div className="w-[320px] rotate-2 scale-105 pointer-events-none">
            <KanbanCard 
              project={activeProject}
              stageId={activeProject.status || 'lead'}
              onDelete={() => {}}
              onStatusChange={() => {}}
              getUrl={() => ""}
              isPending={false}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
