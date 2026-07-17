import { db } from "@/lib/prisma";
import { User, Shield, Mail } from "lucide-react";
import UserActions from "./UserActions";

import { Pagination } from "@/components/ui/pagination";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.user.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage administrators and store customers.</p>
        </div>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-primary/10 text-primary'}`}>
                      {user.role === 'ADMIN' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <span className="font-medium">{user.name || 'Anonymous User'}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email || 'No email provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.createdAt))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActions 
                      userId={user.id} 
                      currentRole={user.role} 
                      userName={user.name || user.email || 'User'} 
                    />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t">
          <Pagination totalPages={totalPages} currentPage={page} />
        </div>
      </div>
    </div>
  );
}
