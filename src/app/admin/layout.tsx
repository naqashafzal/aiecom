import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <AdminHeader user={session?.user} />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col z-10 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)]">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
