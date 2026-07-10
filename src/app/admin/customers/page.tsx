import { db } from "@/lib/prisma";

import { User, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: 'USER' },
    include: {
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Prevent server crash on large amount of users
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your store's registered users.</p>
        </div>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Registered</th>
                <th className="px-6 py-4 font-medium text-center">Orders</th>
                <th className="px-6 py-4 font-medium text-center">Points</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{customer.name || 'Anonymous User'}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {customer.email || 'No email provided'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(customer.createdAt))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {customer._count.orders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {customer.points}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs text-muted-foreground">-</span>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
