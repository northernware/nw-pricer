import type { CalculatorInput } from "@/lib/calculator";
import type { ProjectStatus } from "@prisma/client";

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
