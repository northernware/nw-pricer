import KanbanBoard from "@/components/KanbanBoard";
import { getSavedProjects } from "@/app/actions";

export default async function AdminDashboard() {
  const projects = await getSavedProjects();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl uppercase tracking-tighter text-nw-black dark:text-nw-bone">
          Pipeline Overview
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite dark:text-nw-graphite/80 mt-2">
          Manage your active projects and quotes
        </p>
      </div>

      <KanbanBoard initialProjects={projects} />
    </div>
  );
}
