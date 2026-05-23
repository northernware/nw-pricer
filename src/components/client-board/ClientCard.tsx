"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ClientListItem } from "@/types/crm";
import { CLIENT_STAGES } from "./constants";

export interface ClientCardProps {
  client: ClientListItem;
  stageId: string;
  isDragging?: boolean;
  onEdit: (client: ClientListItem) => void;
  onDelete: (client: ClientListItem) => void;
  onStatusChange: (id: string, status: string) => void;
  isPending: boolean;
}

export default function ClientCard({
  client,
  stageId,
  isDragging,
  onEdit,
  onDelete,
  onStatusChange,
  isPending,
}: ClientCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: client.id,
    data: { client, stageId },
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(client);
            }}
            className="text-nw-graphite/40 hover:text-nw-black transition-colors"
            title="Edit"
          >
            <Icon icon="solar:pen-linear" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(client);
            }}
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
        <div className="text-[8px] font-mono text-nw-graphite/40 uppercase" suppressHydrationWarning>
          Updated {formatDistanceToNow(client.lastModified, { addSuffix: true })}
        </div>

        <div className="relative pointer-events-auto">
          <select
            value={stageId}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(client.id, e.target.value);
            }}
            disabled={isPending}
            className="appearance-none bg-transparent text-[9px] font-mono uppercase tracking-widest text-nw-graphite hover:text-nw-black cursor-pointer focus:outline-none pr-4 disabled:opacity-50"
          >
            {CLIENT_STAGES.map((s) => (
              <option key={s.id} value={s.id} className="bg-nw-bone">
                {s.label}
              </option>
            ))}
          </select>
          <Icon
            icon="solar:alt-arrow-down-linear"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-nw-graphite/40 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
