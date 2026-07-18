"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, CheckSquare, Square, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkUpdateOrderStatus, bulkUpdatePaymentStatus } from "./actions";

export function OrderTableClient({ orders }: { orders: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    setIsUpdating(true);
    await bulkUpdateOrderStatus(selectedIds, status as any);
    setSelectedIds([]);
    setIsUpdating(false);
  };

  const handleUpdatePayment = async (status: string) => {
    if (selectedIds.length === 0) return;
    setIsUpdating(true);
    await bulkUpdatePaymentStatus(selectedIds, status);
    setSelectedIds([]);
    setIsUpdating(false);
  };

  return (
    <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
      
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/5 p-3 flex items-center justify-between border-b animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
              {selectedIds.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Button variant="outline" size="sm" className="h-8 gap-1" disabled={isUpdating}>
                Update Status <ChevronDown className="h-3 w-3" />
              </Button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-popover border shadow-md rounded-md overflow-hidden hidden group-hover:block z-10">
                <button onClick={() => handleUpdateStatus('PROCESSING')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted">Processing</button>
                <button onClick={() => handleUpdateStatus('SHIPPED')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted">Shipped</button>
                <button onClick={() => handleUpdateStatus('DELIVERED')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted">Delivered</button>
                <button onClick={() => handleUpdateStatus('CANCELLED')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-destructive">Cancelled</button>
              </div>
            </div>

            <div className="relative group">
              <Button variant="outline" size="sm" className="h-8 gap-1" disabled={isUpdating}>
                Update Payment <ChevronDown className="h-3 w-3" />
              </Button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-popover border shadow-md rounded-md overflow-hidden hidden group-hover:block z-10">
                <button onClick={() => handleUpdatePayment('PAID')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted">Paid</button>
                <button onClick={() => handleUpdatePayment('PENDING')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted">Pending</button>
                <button onClick={() => handleUpdatePayment('FAILED')} className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-destructive">Failed</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 w-10 text-center">
                <button onClick={handleSelectAll} className="text-muted-foreground hover:text-primary">
                  {selectedIds.length === orders.length && orders.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
              <th className="px-6 py-4 font-medium text-center">Payment</th>
              <th className="px-6 py-4 font-medium text-center">Fulfillment</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className={`transition-colors ${selectedIds.includes(order.id) ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
              >
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleSelect(order.id)} className="text-muted-foreground hover:text-primary">
                    {selectedIds.includes(order.id) ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                  #{order.orderNumber ? order.orderNumber : order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(order.createdAt))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">{order.customerLocation}</div>
                </td>
                <td className="px-6 py-4 font-medium text-right whitespace-nowrap">
                  {order.totalFormatted}
                  <div className="text-xs text-muted-foreground font-normal">{order.itemCount} items</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                  No orders have been placed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
