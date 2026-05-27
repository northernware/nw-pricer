import type { KanbanStage } from "@/types/crm";

export const CLIENT_STAGES: KanbanStage[] = [
  { id: "prospect", label: "Prospect", dot: "bg-gray-400" },
  { id: "active", label: "Active", dot: "bg-blue-400" },
  { id: "retainer", label: "Retainer", dot: "bg-nw-emerald" },
  { id: "completed", label: "Completed", dot: "bg-purple-400" },
  { id: "declined", label: "Declined", dot: "bg-red-400" },
];

export interface ClientFormData {
  id?: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  marketingOptIn: boolean;
}

export const emptyClientForm = (): ClientFormData => ({
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  marketingOptIn: false,
});
