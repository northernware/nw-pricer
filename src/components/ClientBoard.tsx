"use client";

import { useState, useTransition } from "react";
import {
  updateClientStatusAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
} from "@/app/actions";
import toast from "react-hot-toast";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import type { ClientStatus } from "@prisma/client";
import type { ClientListItem } from "@/types/crm";
import ClientCard from "@/components/client-board/ClientCard";
import ClientColumn from "@/components/client-board/ClientColumn";
import ClientFormModal from "@/components/client-board/ClientFormModal";
import ClientDeleteModal from "@/components/client-board/ClientDeleteModal";
import { CLIENT_STAGES, emptyClientForm, type ClientFormData } from "@/components/client-board/constants";

export default function ClientBoard({ initialClients }: { initialClients: ClientListItem[] }) {
  const [clients, setClients] = useState(initialClients);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeClient, setActiveClient] = useState<ClientListItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientListItem | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [formData, setFormData] = useState<ClientFormData>(emptyClientForm());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleStatusChange = (clientId: string, newStatus: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status: newStatus as ClientStatus } : c))
    );
    startTransition(async () => {
      const result = await updateClientStatusAction(clientId, newStatus);
      if (!result.success) {
        toast.error("Failed to move client");
        setClients(initialClients);
      }
    });
  };

  const handleEdit = (client: ClientListItem) => {
    setFormData({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
      marketingOptIn: client.marketingOptIn,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (client: ClientListItem) => {
    setClientToDelete(client);
    setConfirmName("");
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    const fullName = `${clientToDelete.firstName} ${clientToDelete.lastName}`;
    if (confirmName.trim().toLowerCase() !== fullName.toLowerCase()) {
      toast.error("Name does not match");
      return;
    }

    startTransition(async () => {
      const result = await deleteClientAction(clientToDelete.id);
      if (result.success) {
        toast.success("Client deleted");
        setShowDeleteModal(false);
        setClientToDelete(null);
        setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      } else {
        toast.error(result.error || "Failed to delete client");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = formData.id
        ? await updateClientAction(formData.id, formData)
        : await createClientAction(formData);

      if (result.success) {
        toast.success(formData.id ? "Client updated" : "Client created");
        setShowModal(false);
        setFormData(emptyClientForm());
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to save client");
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveClient(event.active.data.current?.client);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveClient(null);

    if (over && active.data.current?.stageId !== over.id) {
      handleStatusChange(active.id as string, over.id as string);
    }
  };

  const openNewClientModal = () => {
    setFormData(emptyClientForm());
    setShowModal(true);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-2 h-full overflow-x-auto pb-4">
        {CLIENT_STAGES.map((stage) => {
          const stageClients = clients.filter(
            (c) => c.status === stage.id || (!c.status && stage.id === "prospect")
          );

          return (
            <ClientColumn key={stage.id} stage={stage} onAdd={openNewClientModal}>
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
                  <span className="text-[10px] font-mono text-nw-graphite/30 uppercase tracking-widest">
                    No clients
                  </span>
                </div>
              )}
            </ClientColumn>
          );
        })}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.3" } },
          }),
        }}
      >
        {activeId && activeClient ? (
          <div className="w-[320px] rotate-2 scale-105 pointer-events-none">
            <ClientCard
              client={activeClient}
              stageId={activeClient.status || "prospect"}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
              isPending={false}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>

      {showModal && (
        <ClientFormModal
          formData={formData}
          isPending={isPending}
          onClose={() => setShowModal(false)}
          onChange={setFormData}
          onSubmit={handleSubmit}
        />
      )}

      {showDeleteModal && clientToDelete && (
        <ClientDeleteModal
          client={clientToDelete}
          confirmName={confirmName}
          isPending={isPending}
          onConfirmNameChange={setConfirmName}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </DndContext>
  );
}
