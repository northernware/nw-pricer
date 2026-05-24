"use client";

import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import ContractDocument from "./ContractDocument";
import ProposalDocument from "./ProposalDocument";
import InvoiceDocument from "./InvoiceDocument";
import ConfigTamperBanner from "./ConfigTamperBanner";

interface PublicTemplateProps {
  id: string;
  mode: "quote" | "proposal" | "contract" | "invoice";
  input: CalculatorInput;
  result: CalculatorOutput;
  createdAt: Date;
  isApproved?: boolean;
  signedBy?: string | null;
  approvedAt?: Date | null;
  invoiceId?: string | null;
  ipAddress?: string | null;
  snapshotHash?: string | null;
  configTampered?: boolean;
  canSign?: boolean;
}

export default function PublicTemplate({
  id,
  mode,
  input,
  result,
  createdAt,
  isApproved,
  signedBy,
  approvedAt,
  invoiceId,
  ipAddress,
  snapshotHash,
  configTampered = false,
  canSign = true,
}: PublicTemplateProps) {
  if (mode === "contract") {
    return (
      <>
        {configTampered && <ConfigTamperBanner />}
        <ContractDocument
          id={id}
          input={input}
          result={result}
          createdAt={createdAt}
          isApproved={isApproved}
          signedBy={signedBy}
          approvedAt={approvedAt}
          ipAddress={ipAddress}
          snapshotHash={snapshotHash}
          canSign={canSign}
        />
      </>
    );
  }

  if (mode === "proposal" || mode === "quote") {
    return (
      <>
        {configTampered && <ConfigTamperBanner />}
        <ProposalDocument id={id} input={input} result={result} createdAt={createdAt} />
      </>
    );
  }

  return (
    <InvoiceDocument
      id={id}
      input={input}
      result={result}
      createdAt={createdAt}
      invoiceId={invoiceId}
      configTampered={configTampered}
    />
  );
}
