import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-nw-bone text-nw-black font-body selection-acid flex flex-col">
      <AdminHeader />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
