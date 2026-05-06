import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-nw-bone dark:bg-[#0a0a0a] text-nw-black dark:text-nw-bone font-body selection-acid flex flex-col transition-colors duration-300">
      <AdminHeader />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
