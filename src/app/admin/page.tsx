import CRMView from "@/components/CRMView";
import { getSavedProjects, getClients, getStats } from "@/app/actions";

export default async function AdminDashboard() {
  const [projects, clients, statsResult] = await Promise.all([
    getSavedProjects(),
    getClients(),
    getStats(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const statsError = statsResult.success ? undefined : statsResult.error;

  return (
    <div className="w-full h-full p-8">
      <CRMView
        projects={projects}
        clients={clients}
        stats={stats}
        statsError={statsError}
      />
    </div>
  );
}
