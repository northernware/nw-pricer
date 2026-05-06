import CRMView from "@/components/CRMView";
import { getSavedProjects, getClients } from "@/app/actions";

export default async function AdminDashboard() {
  const [projects, clients] = await Promise.all([
    getSavedProjects(),
    getClients()
  ]);

  return (
    <div className="w-full h-full p-8">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl uppercase tracking-tighter text-nw-black">
          CRM Dashboard
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite mt-2">
          Manage your clients and project pipelines
        </p>
      </div>

      <CRMView projects={projects} clients={clients} />
    </div>
  );
}
