import { pdf } from "@react-pdf/renderer";
import type { CalculatorInput, CalculatorOutput } from "@/lib/calculator";
import { QuotePdfDocument, type PdfDocKind } from "./QuotePdfDocument";

export async function downloadVectorQuotePdf(
  kind: PdfDocKind,
  input: CalculatorInput,
  result: CalculatorOutput,
  projectId?: string | null
): Promise<void> {
  const blob = await pdf(
    QuotePdfDocument({ kind, input, result, projectId })
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `NW-${kind}-${new Date().toISOString().split("T")[0]}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
