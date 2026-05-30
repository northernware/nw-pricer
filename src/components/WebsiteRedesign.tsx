"use client";

import { useEffect, useMemo, useState } from "react";
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
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface RedesignProject {
  id: string;
  company: string;
  website: string;
  contactEmail: string;
  contactNo: string;
  devStatus: string;
  emailStatus: string;
  replyStatus: string;
  pitchUrl: string;
  notes: string;
}

interface KanbanStage {
  id: string;
  label: string;
  dot: string;
}

type RedesignFormData = Omit<RedesignProject, "id"> & { id?: string };

const STORAGE_KEY = "nw_redesign_projects";

const STAGES: KanbanStage[] = [
  { id: "prospect", label: "Prospect", dot: "bg-gray-400" },
  { id: "pitch_built", label: "Pitch Built", dot: "bg-blue-400" },
  { id: "in_progress", label: "In Progress", dot: "bg-yellow-400" },
  { id: "completed", label: "Completed", dot: "bg-nw-emerald" },
];

const emptyForm = (): RedesignFormData => ({
  company: "",
  website: "",
  contactEmail: "",
  contactNo: "",
  devStatus: "prospect",
  emailStatus: "Not Sent",
  replyStatus: "No Reply",
  pitchUrl: "",
  notes: "",
});

const INITIAL_PROJECTS: RedesignProject[] = [
  project("oneal-oil-and-gas", "Oneal Oil and Gas Company", "https://www.onealoilandgas.com/", "OwnerRelations@ONealOil.com", "pitch_built", "Sent", "No Reply", "https://onealoilandgascompany.vercel.app/"),
  project("eog-resources", "EOG Resources", "https://www.eogresources.com/"),
  project("merit-energy", "Merit Energy", "https://www.meritenergy.com/"),
  project("carson-team", "Carson Team", "https://carsonteam.com/"),
  project("white-construction", "White Construction", "https://whiteconst.com/"),
  project("roy-briley-general-contracting", "Roy Briley General Contracting", "https://www.roybrileygeneralcontracting.com/copy-of-flooring"),
  project("mckenna-brothers-paving", "McKenna Brothers Paving", "https://mckennabrotherspaving.com/"),
  project("saloka-inc", "Saloka Inc", "https://salokainc.com/"),
  project("saguaro-glass", "Saguaro Glass", "https://www.saguaroglass.com/", "adamw@saguaroglass.com, jen@saguaroglass.com", "pitch_built", "Sent", "No Reply", "https://saguaroglass.vercel.app/"),
  project("usaa-glass", "USAA Glass", "https://www.usaaglass.com/"),
  project("ww-glass-resource", "WW Glass Resource", "https://www.wwglassresource.com/index.php"),
  project("us-glass", "US Glass", "https://www.us-glass.com/"),
  project("atlanta-construction-enterprises", "Atlanta Construction Enterprises, Inc.", "https://www.atlantaconstructionga.com/", "aceincmf@gmail.com, aceincjb@bellsouth.net", "pitch_built", "Sent", "No Reply", "https://atlantaconstructionenterprises.vercel.app/"),
  project("sunday-air-taxi", "Sunday Air Taxi", "https://www.sundayairtaxi.com/", "via website", "pitch_built", "Sent", "No Reply", "https://sundayairtaxi.vercel.app/"),
  project("georgia-air-repair", "Georgia Air Repair", "https://www.georgiaairrepair.com/"),
  project("sweet-ga-heating-and-air", "Sweet GA Heating and Air", "https://www.sweetgaheatingandair.com/"),
  project("maxair-mechanical", "MaxAir Mechanical", "https://maxairmech.com/"),
  project("ga-hvac-experts", "GA HVAC Experts", "http://www.gahvacexperts.com/"),
  project("1st-choice-heating-and-air-ga", "1st Choice Heating and Air GA", "https://1stchoiceheatingandairga.com/"),
  project("stalvey-hvac", "Stalvey HVAC", "https://stalveyhvac.com/"),
  project("bryant-air", "Bryant Air", "https://www.bryant-air.com/"),
  project("ray-and-son", "Ray and Son", "https://rayandson.com/"),
  project("arctic-chill-hvac", "Arctic Chill HVAC", "https://arcticchillhvac.com/"),
  project("conditioned-air-inc", "Conditioned Air Inc.", "https://www.conditionedairinc.com/"),
  project("jd-heating-air", "JD Heating and Air", "https://www.jdheatingair.net/"),
  project("rhodes-mechanical-hvac-r", "Rhodes Mechanical HVAC-R", "https://rhodesmechanicalhvac-r.com/"),
  project("allens-heating-cooling", "Allen's Heating and Cooling", "https://allensheatingcooling.com/"),
  project("just-better-hvac", "Just Better HVAC", "https://justbetterhvac.co/"),
  project("mel-daniel", "Mel Daniel", "https://www.meldaniel.com/"),
  project("edenfield-and-sons", "Edenfield and Sons", "https://edenfieldandsons.com/", "", "prospect", "Not Sent", "No Reply", "", "Priority list"),
  project("hinesville-air", "Hinesville Air", "https://hinesvilleair.com/", "", "prospect", "Not Sent", "No Reply", "", "Priority list"),
  project("ga-cooling-tower", "GA Cooling Tower", "https://www.gacoolingtower.net/", "", "prospect", "Not Sent", "No Reply", "", "Large industrial type"),
  project("jj-air-conditioning", "J&J Air Conditioning", "https://www.jjairconditioning.com/"),
  project("southern-comfort-ga", "Southern Comfort GA", "https://www.southerncomfortga.com/", "", "prospect", "Not Sent", "No Reply", "", "Priority list"),
  project("ac-repair-vidalia-ga", "AC Repair Vidalia GA", "http://www.acrepairvidaliaga.com/", "", "prospect", "Not Sent", "No Reply", "", "Very old website, unresponsive"),
  project("south-georgia-heating-and-cooling", "South Georgia Heating and Cooling", "https://www.southgeorgiaheatingandcooling.com/"),
  project("hills-total-services", "Hills Total Services", "https://hillstotalservices.com/", "", "prospect", "Not Sent", "No Reply", "", "Priority list"),
  project("rivers-ac", "Rivers AC", "https://www.riversac.net/", "", "prospect", "Not Sent", "No Reply", "", "Very old website, unresponsive"),
  project("joiner-heat-and-air", "Joiner Heat and Air", "https://www.joinerheatandair.com/", "", "prospect", "Not Sent", "No Reply", "", "Old website"),
  project("starr-heating", "Starr Heating", "https://starrheating.wixsite.com/website", "", "prospect", "Not Sent", "No Reply", "", "Old website, mid-prio list"),
  project("surrency-ac", "Surrency AC", "https://surrencyac.com/"),
  project("sp-heating-and-air-conditioning", "SP Heating and Air Conditioning", "https://spheatingandairconditioning.com/"),
  project("belks-hvac", "Belk's HVAC", "https://belkshvac.com/", "", "prospect", "Not Sent", "No Reply", "", "Mid-prio list"),
  project("keadle-hvac", "Keadle HVAC", "https://www.keadlehvac.com/"),
  project("pikes-peak-performance", "Pikes Peak Performance", "http://www.pikespeakperformance.net/", "", "prospect", "Not Sent", "No Reply", "", "Outdated, almost no content"),
  project("southern-hvac-mga", "Southern HVAC MGA", "https://southernhvacmga.com/", "", "prospect", "Not Sent", "No Reply", "", "Old website"),
  mapsLead("maps-lf9", "Google Maps Lead - HVAC 1", "https://maps.app.goo.gl/LF9tsWBHXteoUpEU8", "No website yet"),
  mapsLead("maps-lhx", "Google Maps Lead - HVAC 2", "https://maps.app.goo.gl/LhXbL5ojzawtK4NG7", "No website yet"),
  mapsLead("maps-ezw", "Google Maps Lead - HVAC 3", "https://maps.app.goo.gl/EZwhKjAnjh73kwQf9", "No website yet"),
  mapsLead("maps-xuo", "Google Maps Lead - HVAC 4", "https://maps.app.goo.gl/XUooW2MRpeShwFLZ9", "No website yet"),
  mapsLead("maps-y4f", "Google Maps Lead - HVAC 5", "https://maps.app.goo.gl/y4fAroZrDkEo3zUg9"),
  mapsLead("maps-zy8", "Google Maps Lead - HVAC 6", "https://maps.app.goo.gl/zy8pyzC32q9crrpn9", "No website yet"),
  mapsLead("maps-ase", "Google Maps Lead - HVAC 7", "https://maps.app.goo.gl/ASEQtrp5fjD6ePjw5", "No website yet"),
  mapsLead("maps-jov", "Google Maps Lead - HVAC 8", "https://maps.app.goo.gl/jov6C3ve15SWF1cA8", "No website yet"),
  mapsLead("maps-e8z", "Google Maps Lead - HVAC 9", "https://maps.app.goo.gl/e8ZWy4ytK5tCnU9A7", "No website yet"),
  mapsLead("maps-9rm", "Google Maps Lead - HVAC 10", "https://maps.app.goo.gl/9RmqePH3zKAByqba7", "No website yet"),
  mapsLead("maps-spx", "Google Maps Lead - HVAC 11", "https://maps.app.goo.gl/SpxfHZRxMyy452STA", "No website yet"),
  mapsLead("maps-bbh", "Google Maps Lead - HVAC 12", "https://maps.app.goo.gl/BBhJQ47gbkiFbyC17", "No website yet"),
  mapsLead("maps-6gb", "Google Maps Lead - HVAC 13", "https://maps.app.goo.gl/6GBgQ9XssBjxmSsC7", "Website expired"),
  mapsLead("maps-uh1", "Google Maps Lead - HVAC 14", "https://maps.app.goo.gl/uH1vcwodGSuvErW38", "No website yet"),
  mapsLead("maps-qoj", "Google Maps Lead - HVAC 15", "https://maps.app.goo.gl/qojuGNg8USHRbDN89", "Expired website"),
];

function project(
  id: string,
  company: string,
  website: string,
  contactEmail = "",
  devStatus = "prospect",
  emailStatus = "Not Sent",
  replyStatus = "No Reply",
  pitchUrl = "",
  notes = ""
): RedesignProject {
  return {
    id,
    company,
    website,
    contactEmail,
    contactNo: "",
    devStatus,
    emailStatus,
    replyStatus,
    pitchUrl,
    notes,
  };
}

function mapsLead(id: string, company: string, website: string, notes = "") {
  return project(id, company, website, "", "prospect", "Not Sent", "No Reply", "", notes);
}

function getInitialProjects() {
  if (typeof window === "undefined") return INITIAL_PROJECTS;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return INITIAL_PROJECTS;
  try {
    const parsed = JSON.parse(saved) as RedesignProject[];
    const normalized = parsed.map(normalizeProject);
    const savedByWebsite = new Set(normalized.map((item) => item.website).filter(Boolean));
    const newSeedItems = INITIAL_PROJECTS.filter((item) => !savedByWebsite.has(item.website));
    return [...normalized, ...newSeedItems];
  } catch {
    return INITIAL_PROJECTS;
  }
}

function normalizeProject(item: Partial<RedesignProject>): RedesignProject {
  return {
    id: item.id || crypto.randomUUID(),
    company: item.company || "",
    website: item.website || "",
    contactEmail: item.contactEmail || "",
    contactNo: item.contactNo || "",
    devStatus: item.devStatus || "prospect",
    emailStatus: item.emailStatus || "Not Sent",
    replyStatus: item.replyStatus || "No Reply",
    pitchUrl: item.pitchUrl || "",
    notes: item.notes || "",
  };
}

interface ProjectCardProps {
  project: RedesignProject;
  stageId: string;
  isDragging?: boolean;
  onDelete: (id: string) => void;
  onEdit: (project: RedesignProject) => void;
  onStatusChange: (id: string, status: string) => void;
}

function RedesignCard({
  project,
  stageId,
  isDragging,
  onDelete,
  onEdit,
  onStatusChange,
}: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: project.id,
    data: { project, stageId },
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
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-md tracking-tight text-nw-black leading-tight line-clamp-2 pr-4">
            {project.company}
          </h3>
          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-mono text-nw-acid hover:underline mt-1 block break-all"
              onClick={(event) => event.stopPropagation()}
            >
              {project.website}
            </a>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(project);
            }}
            className="text-nw-graphite/40 hover:text-nw-black transition-colors pt-1"
            aria-label="Edit redesign prospect"
          >
            <Icon icon="solar:pen-linear" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(project.id);
            }}
            className="text-nw-graphite/40 hover:text-red-500 transition-colors pt-1"
            aria-label="Delete redesign prospect"
          >
            <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(project.contactEmail || project.contactNo) && (
        <div className="mb-4 space-y-1">
          {project.contactEmail && (
            <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-nw-graphite break-all">
              {project.contactEmail}
            </div>
          )}
          {project.contactNo && (
            <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-nw-graphite">
              {project.contactNo}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 mb-4">
        <StatusRow label="Email" value={project.emailStatus} highlight={project.emailStatus === "Sent"} />
        {project.replyStatus && <StatusRow label="Reply" value={project.replyStatus} />}
        {project.notes && <StatusRow label="Notes" value={project.notes} />}
      </div>

      {project.pitchUrl && (
        <div className="mt-auto pt-3 border-t border-nw-graphite/5">
          <a
            href={project.pitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-mono text-nw-acid hover:underline flex items-center gap-1"
            onClick={(event) => event.stopPropagation()}
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
            onChange={(event) => {
              event.stopPropagation();
              onStatusChange(project.id, event.target.value);
            }}
            className="appearance-none bg-transparent text-[9px] font-mono uppercase tracking-widest text-nw-graphite hover:text-nw-black cursor-pointer focus:outline-none pr-4"
          >
            {STAGES.map((stage) => (
              <option key={stage.id} value={stage.id} className="bg-nw-bone">
                {stage.label}
              </option>
            ))}
          </select>
          <Icon icon="solar:alt-arrow-down-linear" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-nw-graphite/40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[8px] font-mono text-nw-graphite/40 uppercase w-16 shrink-0">{label}:</span>
      <span className={`text-[9px] font-mono uppercase leading-relaxed ${highlight ? "text-nw-emerald" : "text-nw-graphite"}`}>
        {value}
      </span>
    </div>
  );
}

function KanbanColumn({ stage, children, count }: { stage: KanbanStage; children: React.ReactNode; count: number }) {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-1 min-w-[320px] flex flex-col bg-nw-white rounded-xl border border-nw-graphite/10">
      <div className="p-5 flex justify-between items-center border-b border-nw-graphite/10">
        <div className="font-mono text-[10px] text-nw-black uppercase tracking-[0.2em] flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
          {stage.label}
        </div>
        <span className="font-mono text-[9px] text-nw-graphite/40">{count}</span>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
        {children}
      </div>
    </div>
  );
}

function RedesignFormModal({
  formData,
  onChange,
  onClose,
  onSubmit,
}: {
  formData: RedesignFormData;
  onChange: (data: RedesignFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-nw-black/30 backdrop-blur-sm" onClick={onClose} role="presentation" />
      <div className="relative bg-nw-bone border border-nw-black rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black">
            {formData.id ? "Edit Prospect" : "New Prospect"}
          </h3>
          <button type="button" onClick={onClose} className="text-nw-graphite/50 hover:text-nw-black">
            <Icon icon="solar:close-circle-linear" className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Company" value={formData.company} onChange={(company) => onChange({ ...formData, company })} required />
          <TextField label="Website / Map Link" value={formData.website} onChange={(website) => onChange({ ...formData, website })} />
          <TextField label="Contact Email" value={formData.contactEmail} onChange={(contactEmail) => onChange({ ...formData, contactEmail })} />
          <TextField label="Contact No." value={formData.contactNo} onChange={(contactNo) => onChange({ ...formData, contactNo })} />
          <SelectField label="Dev Status" value={formData.devStatus} onChange={(devStatus) => onChange({ ...formData, devStatus })} options={STAGES.map((stage) => ({ value: stage.id, label: stage.label }))} />
          <SelectField label="Email Status" value={formData.emailStatus} onChange={(emailStatus) => onChange({ ...formData, emailStatus })} options={["Not Sent", "Sent", "Drafted"].map((value) => ({ value, label: value }))} />
          <TextField label="Reply Status" value={formData.replyStatus} onChange={(replyStatus) => onChange({ ...formData, replyStatus })} />
          <TextField label="Pitch URL" value={formData.pitchUrl} onChange={(pitchUrl) => onChange({ ...formData, pitchUrl })} />
          <div className="md:col-span-2">
            <TextField label="Notes" value={formData.notes} onChange={(notes) => onChange({ ...formData, notes })} />
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-nw-graphite/20 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-graphite/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 bg-nw-black text-nw-bone py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all"
          >
            Save Prospect
          </button>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">{label}</span>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function WebsiteRedesign() {
  const [projects, setProjects] = useState<RedesignProject[]>(getInitialProjects);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<RedesignProject | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<RedesignFormData>(emptyForm());
  const [query, setQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return projects;
    return projects.filter((item) => {
      return [item.company, item.website, item.contactEmail, item.contactNo, item.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [projects, query]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const handleStatusChange = (projectId: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((projectItem) =>
        projectItem.id === projectId ? { ...projectItem, devStatus: newStatus } : projectItem
      )
    );
  };

  const handleDelete = (projectId: string) => {
    if (!confirm("Are you sure you want to delete this prospect?")) return;
    setProjects((prev) => prev.filter((projectItem) => projectItem.id !== projectId));
  };

  const handleEdit = (projectItem: RedesignProject) => {
    setFormData(projectItem);
    setShowModal(true);
  };

  const handleNew = () => {
    setFormData(emptyForm());
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.company.trim()) return;
    if (formData.id) {
      setProjects((prev) =>
        prev.map((projectItem) =>
          projectItem.id === formData.id ? ({ ...formData, id: formData.id } as RedesignProject) : projectItem
        )
      );
    } else {
      setProjects((prev) => [
        { ...formData, id: crypto.randomUUID() },
        ...prev,
      ]);
    }
    setShowModal(false);
    setFormData(emptyForm());
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
      handleStatusChange(active.id as string, over.id as string);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-nw-black mb-2">Website Redesign Pipeline</h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite">
            Track website redesign opportunities and outreach
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nw-graphite/40" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search redesign leads..."
              className="w-full sm:w-72 rounded-xl border border-nw-graphite/10 bg-nw-white py-3 pl-10 pr-4 font-body text-sm outline-none focus:border-nw-acid"
            />
          </div>
          <button
            type="button"
            onClick={handleNew}
            className="bg-nw-black text-nw-bone px-5 py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all flex items-center justify-center gap-2"
          >
            <Icon icon="solar:add-circle-linear" className="w-4 h-4" />
            New Prospect
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-2 h-full overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageProjects = filteredProjects.filter((projectItem) => projectItem.devStatus === stage.id);

            return (
              <KanbanColumn key={stage.id} stage={stage} count={stageProjects.length}>
                {stageProjects.map((projectItem) => (
                  <RedesignCard
                    key={projectItem.id}
                    project={projectItem}
                    stageId={stage.id}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                  />
                ))}

                {stageProjects.length === 0 && (
                  <div className="h-24 border border-dashed border-nw-graphite/10 rounded-lg flex items-center justify-center px-4 text-center">
                    <span className="text-[10px] font-mono text-nw-graphite/30 uppercase tracking-widest">
                      No projects
                    </span>
                  </div>
                )}
              </KanbanColumn>
            );
          })}
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.3",
                },
              },
            }),
          }}
        >
          {activeId && activeProject ? (
            <div className="w-[320px] rotate-2 scale-105 pointer-events-none">
              <RedesignCard
                project={activeProject}
                stageId={activeProject.devStatus}
                onDelete={() => {}}
                onEdit={() => {}}
                onStatusChange={() => {}}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showModal && (
        <RedesignFormModal
          formData={formData}
          onChange={setFormData}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
