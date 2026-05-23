"use client";

import type { InputPanelProps } from "@/components/input-panel/types";
import CalculatorTab from "@/components/input-panel/CalculatorTab";
import ProposalContractTab from "@/components/input-panel/ProposalContractTab";

export type { InputPanelProps } from "@/components/input-panel/types";

export default function InputPanel(props: InputPanelProps) {
  const { activeTab } = props;

  if (activeTab === "calculator") {
    return <CalculatorTab {...props} />;
  }

  if (activeTab === "proposal" || activeTab === "contract") {
    return <ProposalContractTab {...props} activeTab={activeTab} />;
  }

  return null;
}
