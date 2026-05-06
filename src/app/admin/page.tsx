import CRMView from "@/components/CRMView";
import { getSavedProjects, getClients } from "@/app/actions";

export default async function AdminDashboard() {
  const [projects, clients] = await Promise.all([
    getSavedProjects(),
    getClients()
  ]);

  return (
    <div className="w-full h-full p-8">
      <CRMView projects={projects} clients={clients} />
    </div>
  );
}
