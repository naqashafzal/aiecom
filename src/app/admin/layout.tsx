import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f3f3f3]">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-64 shrink-0 bg-[#ebebeb] border-r border-gray-200 overflow-y-auto">
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
