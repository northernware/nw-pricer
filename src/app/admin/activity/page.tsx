import ActivityFeed from "@/components/ActivityFeed";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; projectId?: string }>;
}) {
  const { clientId, projectId } = await searchParams;

  return (
    <div className="w-full h-full p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite hover:text-nw-black mb-2 inline-flex items-center gap-1"
          >
            <Icon icon="solar:alt-arrow-left-linear" />
            Back to CRM
          </Link>
          <h1 className="font-display font-black text-2xl uppercase tracking-tighter text-nw-black">
            Activity Log
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-nw-graphite mt-1">
            {clientId ? "Filtered by client" : "All recent events"}
          </p>
        </div>
      </div>
      <ActivityFeed initialClientId={clientId} initialProjectId={projectId} />
    </div>
  );
}
