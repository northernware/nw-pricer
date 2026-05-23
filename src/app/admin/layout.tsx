import AdminHeader from "@/components/AdminHeader";

/** Admin pages use session cookies and Prisma — never statically prerender. */
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-nw-bone text-nw-black font-body selection-acid flex flex-col">
      <AdminHeader />
      <main className="grow">
        {children}
      </main>
    </div>
  );
}
