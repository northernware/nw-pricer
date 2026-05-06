import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { calculate, type CalculatorInput } from "@/lib/calculator";
import { PROJECT_TYPES, FEATURES, HOSTING_PLANS } from "@/lib/constants";
import { Metadata } from "next";
import SignatureBlock from "@/components/SignatureBlock";
import PaymentBlock from "@/components/PaymentBlock";
import PublicTemplate from "@/components/PublicTemplate";

export async function generateMetadata(
  { params, searchParams }: { params: { id: string }, searchParams: { mode?: string, invoiceId?: string } }
): Promise<Metadata> {
  const { id } = await params;
  const { mode } = await searchParams;
  const project = await prisma.project.findUnique({ where: { id } });
  
  if (!project) return { title: "Document Not Found" };
  
  const modeStr = mode === 'contract' ? 'Contract' : 
                  mode === 'invoice' ? 'Invoice' : 
                  mode === 'quote' ? 'Quotation' : 'Proposal';
                  
  return { title: `${modeStr} | ${project.client} | Northernware` };
}

export default async function MagicLinkPage({ params, searchParams }: { params: { id: string }, searchParams: { mode?: string, invoiceId?: string } }) {
  const { id } = await params;
  const { mode, invoiceId } = await searchParams;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    notFound();
  }

  const input = project.config as unknown as CalculatorInput;
  const result = calculate(input);

  const projectTypeLabel = PROJECT_TYPES.find(p => p.value === input.projectType)?.label || input.projectType;
  const hostingPlan = HOSTING_PLANS.find(h => h.value === input.hostingPlan);

  const fmt = (n: number) => "₱" + n.toLocaleString();

  const isProposal = mode === 'proposal' || !mode;
  const isContract = mode === 'contract';
  const isInvoice = mode === 'invoice';
  const isQuote = mode === 'quote';

  const selectedInvoice = isInvoice && invoiceId && input.invoices
    ? input.invoices.find(inv => inv.id === invoiceId)
    : null;

  const invoiceAmount = selectedInvoice 
    ? (result.roundedPrice * selectedInvoice.percentage) / 100
    : result.roundedPrice;

  const docTitle = isProposal ? "STRATEGIC PROJECT PROPOSAL" :
                   isContract ? "MASTER SERVICES AGREEMENT" :
                   isInvoice ? (selectedInvoice ? `TAX INVOICE: ${selectedInvoice.label}` : "TAX INVOICE") : "PROJECT QUOTATION";
                   
  const docPrefix = isProposal ? "PRP" :
                    isContract ? "CTR" :
                    isInvoice ? "INV" : "QUO";

  return (
    <div className="min-h-screen bg-nw-bone text-nw-black font-body selection-acid relative py-12 md:py-24 px-4 md:px-0 overflow-x-hidden">
      <div className="bg-noise"></div>
      
      <main className="max-w-4xl mx-auto relative z-10">
        <PublicTemplate 
          id={id}
          mode={(mode as any) || 'proposal'}
          invoiceId={invoiceId}
          input={input}
          result={result}
          createdAt={project.createdAt}
          isApproved={!!project.approvedAt}
          signedBy={project.signedBy}
          approvedAt={project.approvedAt}
          ipAddress={project.ipAddress}
          snapshotHash={project.snapshotHash}
        />
      </main>
      
      <footer className="text-center py-8 text-nw-graphite text-[10px] font-mono track-widest uppercase relative z-10">
        CONFIDENTIAL DOCUMENT • NORTHERNWARE DIGITAL AGENCY
      </footer>
    </div>
  );
}
