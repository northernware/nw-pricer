import type { Feature, CalculatorInput, ProposalContent } from "@/lib/calculator";

export interface InputPanelProps {
  activeTab: "calculator" | "proposal" | "contract" | "invoice";
  config: CalculatorInput;
  updateConfig: (updates: Partial<CalculatorInput>) => void;
  updateProposal: (updates: Partial<ProposalContent>) => void;
  toggleFeature: (f: Feature) => void;
  totalPrice: number;
  projectId: string | null;
  onPromoteToContract?: () => void;
  isLocked?: boolean;
  onUnlock?: () => void;
}

export type ProposalContractTabProps = InputPanelProps & {
  activeTab: "proposal" | "contract";
};
