import { getClientById } from "@/app/actions";
import ClientProfile from "@/components/ClientProfile";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ClientPage({ params }: { params: { id: string } }) {
  const client = await getClientById(params.id);

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-nw-graphite hover:text-nw-acid transition-colors group"
        >
          ← Back to Pipeline
        </Link>
      </div>

      <ClientProfile client={JSON.parse(JSON.stringify(client))} />
    </div>
  );
}
