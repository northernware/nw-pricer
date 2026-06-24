import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { calculate } from "@/lib/calculator";
import { parseProjectConfig } from "@/lib/project-config-schema";
import { Metadata } from "next";
import PublicTemplate from "@/components/PublicTemplate";
import { isConfigTampered } from "@/lib/project-integrity";
import { resolvePublicLinkAccess } from "@/lib/public-link";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; invoiceId?: string; print?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { mode } = await searchParams;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!project) return { title: "Document Not Found" };

  const modeStr =
    mode === "contract"
      ? "Contract"
      : mode === "invoice"
        ? "Invoice"
        : mode === "quote"
          ? "Quotation"
          : "Proposal";

  const clientName =
    project.client.company || `${project.client.firstName} ${project.client.lastName}`;

  return { title: `${modeStr} | ${clientName} | Northernware` };
}

export default async function MagicLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    mode?: string;
    invoiceId?: string;
    token?: string;
    sign?: string;
    print?: string;
  }>;
}) {
  const { id } = await params;
  const { mode, invoiceId, token, sign, print } = await searchParams;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!project) {
    notFound();
  }

  const docMode = (mode as "proposal" | "contract" | "invoice" | "quote") || "proposal";
  const access = await resolvePublicLinkAccess(id, docMode, { token, sign });

  if (!access.canView) {
    notFound();
  }

  const input = parseProjectConfig(project.config);
  const result = calculate(input);
  const isPrintMode = print === "1";

  const configTampered = isConfigTampered(
    project.config,
    project.snapshotHash,
    !!project.approvedAt
  );

  return (
    <div
      className={`min-h-screen text-nw-black font-body selection-acid relative overflow-x-hidden ${
        isPrintMode ? "bg-white py-0 px-0" : "bg-nw-bone py-12 md:py-24 px-4 md:px-0"
      }`}
    >
      {!isPrintMode && <div className="bg-noise"></div>}

      <main className={isPrintMode ? "max-w-4xl mx-auto" : "max-w-4xl mx-auto relative z-10"}>
        <PublicTemplate
          id={id}
          mode={docMode}
          invoiceId={invoiceId}
          input={input}
          result={result}
          createdAt={project.createdAt}
          isApproved={!!project.approvedAt}
          signedBy={project.signedBy}
          approvedAt={project.approvedAt}
          ipAddress={project.ipAddress}
          snapshotHash={project.snapshotHash}
          configTampered={configTampered}
          canSign={access.canSign}
        />
      </main>

      {!isPrintMode && (
        <footer className="text-center py-8 text-nw-graphite text-[10px] font-mono track-widest uppercase relative z-10">
          CONFIDENTIAL DOCUMENT - NORTHERNWARE DIGITAL AGENCY
        </footer>
      )}

      {isPrintMode && (
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.addEventListener('load',function(){setTimeout(function(){window.print();},300);});",
          }}
        />
      )}
    </div>
  );
}
