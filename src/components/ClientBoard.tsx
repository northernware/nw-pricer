"use client";

import { useState, useTransition } from "react";
import { updateClientStatusAction, createClientAction, updateClientAction, deleteClientAction } from "@/app/actions";
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

const CLIENT_STAGES = [
  { id: "prospect", label: "Prospect", dot: "bg-gray-400" },
  { id: "active", label: "Active", dot: "bg-blue-400" },
  { id: "retainer", label: "Retainer", dot: "bg-nw-emerald" },
  { id: "completed", label: "Completed", dot: "bg-purple-400" },
  { id: "declined", label: "Declined", dot: "bg-red-400" },
];

interface ClientFormData {
  id?: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
}

interface ClientCardProps {
  client: any;
  stageId: string;
  isDragging?: boolean;
  onEdit: (client: any) => void;
  onDelete: (client: any) => void;
  onStatusChange: (id: string, status: string) => void;
  isPending: boolean;
}

function ClientCard({ client, stageId, isDragging, onEdit, onDelete, onStatusChange, isPending }: ClientCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: client.id,
    data: { client, stageId }
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
        <div>
          <Link href={`/admin/client/${client.id}`} className="hover:text-nw-acid transition-colors">
            <h3 className="font-display font-bold text-md tracking-tight text-nw-black leading-tight">
              {client.firstName} {client.lastName}
            </h3>
          </Link>
          {client.company && (
            <div className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mt-1">
              {client.company}
            </div>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(client); }}
            className="text-nw-graphite/40 hover:text-nw-black transition-colors"
            title="Edit"
          >
            <Icon icon="solar:pen-linear" className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(client); }}
            className="text-nw-graphite/40 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 mb-6 pointer-events-none">
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
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-nw-graphite/5 pointer-events-none">
        <div className="text-[8px] font-mono text-nw-graphite/40 uppercase">
          Updated {formatDistanceToNow(client.lastModified, { addSuffix: true })}
        </div>

        <div className="relative pointer-events-auto">
          <select
            value={stageId}
            onChange={(e) => { e.stopPropagation(); onStatusChange(client.id, e.target.value); }}
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
  );
}

function ClientColumn({ stage, onAdd, children }: { stage: any, onAdd?: () => void, children: React.ReactNode }) {
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
          {stage.id === 'prospect' && (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
              className="ml-2 inline-flex items-center justify-center text-nw-black hover:text-nw-acid transition-colors"
              title="Add Prospect"
            >
              <span className="text-lg leading-none font-bold">+</span>
            </button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
        {children}
      </div>
    </div>
  );
}

export default function ClientBoard({ initialClients }: { initialClients: any[] }) {
  const [clients, setClients] = useState(initialClients);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeClient, setActiveClient] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [confirmName, setConfirmName] = useState("");
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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

  const handleEdit = (client: any) => {
    setFormData({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
    });
    setShowModal(true);
  };

  const handleDeleteClick = (client: any) => {
    setClientToDelete(client);
    setConfirmName("");
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    const fullName = `${clientToDelete.firstName} ${clientToDelete.lastName}`;
    if (confirmName !== fullName) {
      toast.error("Name does not match");
      return;
    }

    startTransition(async () => {
      const result = await deleteClientAction(clientToDelete.id);
      if (result.success) {
        toast.success("Client deleted");
        setShowDeleteModal(false);
        setClientToDelete(null);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete client");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      let result;
      if (formData.id) {
        result = await updateClientAction(formData.id, formData);
      } else {
        result = await createClientAction(formData);
      }

      if (result.success) {
        toast.success(formData.id ? "Client updated" : "Client created");
        setShowModal(false);
        setFormData({ firstName: "", lastName: "", company: "", email: "", phone: "" });
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to save client");
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveClient(active.data.current?.client);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveClient(null);

    if (over && active.data.current?.stageId !== over.id) {
      const clientId = active.id as string;
      const newStatus = over.id as string;
      handleStatusChange(clientId, newStatus);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-2 h-full overflow-x-auto pb-4">
        {CLIENT_STAGES.map((stage) => {
          const stageClients = clients.filter(c => c.status === stage.id || (!c.status && stage.id === 'prospect'));
          
          return (
            <ClientColumn 
              key={stage.id} 
              stage={stage}
              onAdd={() => {
                setFormData({ firstName: "", lastName: "", company: "", email: "", phone: "" });
                setShowModal(true);
              }}
            >
              {stageClients.map((client) => (
                <ClientCard 
                  key={client.id}
                  client={client}
                  stageId={stage.id}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onStatusChange={handleStatusChange}
                  isPending={isPending}
                />
              ))}
              
              {stageClients.length === 0 && (
                <div className="h-24 border border-dashed border-nw-graphite/10 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-mono text-nw-graphite/30 uppercase tracking-widest">No clients</span>
                </div>
              )}
            </ClientColumn>
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
        {activeId ? (
          <div className="w-[320px] rotate-2 scale-105 pointer-events-none">
            <ClientCard 
              client={activeClient}
              stageId={activeClient?.status || 'prospect'}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
              isPending={false}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-nw-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-nw-bone border border-nw-black p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black mb-6">
              {formData.id ? "Edit Client" : "New Client"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-nw-acid outline-none font-body text-sm py-2"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-nw-graphite/20 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-graphite/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-nw-black text-nw-white py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-acid hover:text-nw-black transition-all disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-nw-black/20 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}></div>
          <div className="relative bg-nw-bone border border-red-500 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="font-display font-black text-2xl uppercase tracking-tighter text-red-500 mb-2">
              Danger Zone
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-6">
              This action cannot be undone. All projects and data associated with this client will be affected.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mb-2 block">
                  Type <span className="text-nw-black font-bold">"{clientToDelete.firstName} {clientToDelete.lastName}"</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={e => setConfirmName(e.target.value)}
                  placeholder="Type full name here"
                  className="w-full bg-transparent border-b border-nw-graphite/20 focus:border-red-500 outline-none font-body text-sm py-2"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 border border-nw-graphite/20 py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-nw-graphite/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isPending || confirmName !== `${clientToDelete.firstName} ${clientToDelete.lastName}`}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-mono text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {isPending ? "Deleting..." : "Delete Client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
