import type { CalculatorInput } from "@/lib/calculator";
import type { ClientStatus, ProjectStatus } from "@prisma/client";

export interface StoredProject {
  id: string;
  name: string;
  clientName: string;
  clientCompany: string | null;
  status: ProjectStatus | string;
  lastModified: number;
  config: CalculatorInput;
  isApproved?: boolean;
  signedBy?: string | null;
  approvedAt?: Date | null;
}

export interface ClientListItem {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  projectCount: number;
  lastModified: number;
}

export interface ActivityLogItem {
  id: string;
  type: string;
  action: string;
  clientName: string;
  clientId?: string;
  projectId?: string | null;
  createdAt: number;
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  prospects: number;
  cancelled: number;
  totalProjects: number;
  signedProjects: number;
  recentActivity: ActivityLogItem[];
}

export interface KanbanStage {
  id: string;
  label: string;
  dot: string;
}

export interface ClientProfileProject {
  id: string;
  name: string;
  status: ProjectStatus;
  updatedAt: Date;
  approvedAt: Date | null;
}

export interface ClientProfileLog {
  id: string;
  type: string;
  action: string;
  createdAt: Date;
  projectId: string | null;
  details?: unknown;
}

export interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
  projects?: ClientProfileProject[];
  logs?: ClientProfileLog[];
}
