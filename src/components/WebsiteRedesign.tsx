"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
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

interface RedesignProject {
  id: string;
  company: string;
  website: string;
  contactEmail: string;
  devStatus: string;
  emailStatus: string;
  replyStatus: string;
  pitchUrl: string;
}

interface KanbanStage {
  id: string;
  label: string;
  dot: string;
}

const STAGES: KanbanStage[] = [
  { id: "prospect", label: "Prospect", dot: "bg-gray-400" },
  { id: "pitch_built", label: "Pitch Built", dot: "bg-blue-400" },
  { id: "in_progress", label: "In Progress", dot: "bg-yellow-400" },
  { id: "completed", label: "Completed", dot: "bg-nw-emerald" },
];

const INITIAL_PROJECTS: RedesignProject[] = [
  {
    id: "1",
    company: "Oneal Oil and Gas Company",
    website: "https://www.onealoilandgas.com/",
    contactEmail: "OwnerRelations@ONealOil.com",
    devStatus: "pitch_built",
    emailStatus: "Sent",
    replyStatus: "No Reply",
    pitchUrl: "https://onealoilandgascompany.vercel.app/",
  },
  {
    id: "2",
    company: "EOG Resources",
    website: "https://www.eogresources.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "3",
    company: "Merit Energy",
    website: "https://www.meritenergy.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "4",
    company: "Carson Team",
    website: "https://carsonteam.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "5",
    company: "White Construction",
    website: "https://whiteconst.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "6",
    company: "Roy B Riley General Contracting",
    website: "https://www.roybrileygeneralcontracting.com/copy-of-flooring",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "7",
    company: "McKenna Brothers Paving",
    website: "https://mckennabrotherspaving.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "8",
    company: "Saloka Inc",
    website: "https://salokainc.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "9",
    company: "Saguaro Glass",
    website: "https://www.saguaroglass.com/",
    contactEmail: "adamw@saguaroglass.com, jen@saguaroglass.com",
    devStatus: "pitch_built",
    emailStatus: "Sent",
    replyStatus: "No Reply",
    pitchUrl: "https://saguaroglass.vercel.app/",
  },
  {
    id: "10",
    company: "USA Glass",
    website: "https://www.usaaglass.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "11",
    company: "WW Glass Resource",
    website: "https://www.wwglassresource.com/index.php",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "12",
    company: "US Glass",
    website: "https://www.us-glass.com/",
    contactEmail: "",
    devStatus: "prospect",
    emailStatus: "Not Sent",
    replyStatus: "No Reply",
    pitchUrl: "",
  },
  {
    id: "13",
    company: "Atlanta Construction Enterprises, Inc.",
    website: "https://www.atlantaconstructionga.com/",
    contactEmail: "aceincmf@gmail.com, aceincjb@bellsouth.net",
    devStatus: "pitch_built",
    emailStatus: "Sent",
    replyStatus: "No Reply",
    pitchUrl: "https://atlantaconstructionenterprises.vercel.app/",
  },
  {
    id: "14",
    company: "Sunday Air Taxi",
    website: "https://www.sundayairtaxi.com/",
    contactEmail: "via website",
    devStatus: "pitch_built",
    emailStatus: "Sent",
    replyStatus: "No Reply",
    pitchUrl: "https://sundayairtaxi.vercel.app/",
  },
];

interface ProjectCardProps {
  project: RedesignProject;
  stageId: string;
  isDragging?: boolean;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

function RedesignCard({ project, stageId, isDragging, onDelete, onStatusChange }: ProjectCardProps) {
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
        <div className="flex-1">
          <h3 className="font-display font-bold text-md tracking-tight text-nw-black leading-tight line-clamp-2 pr-4">
            {project.company}
          </h3>
          {project.website && (
            <a 
              href={project.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] font-mono text-nw-acid hover:underline mt-1 block"
              onClick={(e) => e.stopPropagation()}
            >
              {project.website}
            </a>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
          className="text-nw-graphite/40 hover:text-red-500 transition-colors pt-1"
        >
          <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
        </button>
      </div>
      
      {project.contactEmail && (
        <div className="mb-4">
          <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-nw-graphite">
            {project.contactEmail}
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-nw-graphite/40 uppercase w-16">Email:</span>
          <span className={`text-[9px] font-mono uppercase ${
            project.emailStatus === 'Sent' ? 'text-nw-emerald' : 
            project.emailStatus === 'Not Sent' ? 'text-nw-graphite' : 'text-nw-black'
          }`}>
            {project.emailStatus}
          </span>
        </div>
        {project.replyStatus && (
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-nw-graphite/40 uppercase w-16">Reply:</span>
            <span className="text-[9px] font-mono uppercase text-nw-graphite">
              {project.replyStatus}
            </span>
          </div>
        )}
      </div>

      {project.pitchUrl && (
        <div className="mt-auto pt-3 border-t border-nw-graphite/5">
          <a 
            href={project.pitchUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-nw-acid hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Icon icon="solar:link-linear" className="w-3 h-3" />
            View Pitch
          </a>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-nw-graphite/5">
        <div className="relative">
          <select
            value={stageId}
            onChange={(e) => { e.stopPropagation(); onStatusChange(project.id, e.target.value); }}
            className="appearance-none bg-transparent text-[9px] font-mono uppercase tracking-widest text-nw-graphite hover:text-nw-black cursor-pointer focus:outline-none pr-4"
          >
            {STAGES.map(s => (
              <option key={s.id} value={s.id} className="bg-nw-bone">{s.label}</option>
            ))}
          </select>
          <Icon icon="solar:alt-arrow-down-linear" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-nw-graphite/40 pointer-events-none" />
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
      <div className="p-5 flex justify-between items-center border-b border-nw-graphite/10">
        <div className="font-mono text-[10px] text-nw-black uppercase tracking-[0.2em] flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`}></div>
          {stage.label}
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
        {children}
      </div>
    </div>
  );
}

export default function WebsiteRedesign() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<RedesignProject | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, devStatus: newStatus } : p)
    );
  };

  const handleDelete = (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
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
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-nw-black mb-2">Website Redesign Pipeline</h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
          Track website redesign opportunities and outreach
        </p>
      </div>

      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-2 h-full overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageProjects = projects.filter(p => p.devStatus === stage.id);
            
            return (
              <KanbanColumn key={stage.id} stage={stage}>
                {stageProjects.map((project) => (
                  <RedesignCard 
                    key={project.id}
                    project={project}
                    stageId={stage.id}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
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
              <RedesignCard 
                project={activeProject}
                stageId={activeProject.devStatus}
                onDelete={() => {}}
                onStatusChange={() => {}}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
