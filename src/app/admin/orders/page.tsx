import { db } from "@/lib/prisma";
import Link from "next/link";
import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormatPrice } from "@/lib/format";

import { Pagination } from "@/components/ui/pagination";
import { OrderTableClient } from "./OrderTableClient";

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) || 1 : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const formatPrice = await getFormatPrice();
  
  const [orders, total] = await Promise.all([
    db.order.findMany({
      include: {
        shippingAddress: true,
        items: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    db.order.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track your store's recent orders.</p>
        </div>
      </div>

      {/* Client Table with Bulk Actions */}
      <OrderTableClient orders={orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        customerName: `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Unknown',
        customerLocation: `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''}`.trim() || 'Unknown',
        totalFormatted: formatPrice(order.grandTotal),
        itemCount: order.items.length,
        paymentStatus: order.paymentStatus,
        status: order.status
      }))} />
      
      <div className="p-4 border border-t-0 rounded-b-xl bg-background shadow-sm">
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </div>
  );
}
