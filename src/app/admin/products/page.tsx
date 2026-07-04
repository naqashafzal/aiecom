import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import ProductsTableClient from "./ProductsTableClient";
import { getStoreCurrency } from "@/lib/format";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ page?: string, sort?: string, order?: 'asc' | 'desc' }> }) {
  const storeCurrency = await getStoreCurrency();
  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const pageSize = 10;
  
  const sort = params?.sort || 'createdAt';
  const order = params?.order || 'desc';

  const totalProducts = await db.product.count();
  const totalPages = Math.ceil(totalProducts / pageSize);

  const orderBy: any = {};
  orderBy[sort] = order;

  const products = await db.product.findMany({
    include: {
      categories: true,
      images: true,
    },
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store's inventory and listings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-xl border shadow-sm flex flex-col">
        {/* Table & Toolbar */}
        <ProductsTableClient 
          products={products} 
          currentPage={page}
          totalPages={totalPages}
          totalProducts={totalProducts}
          currentSort={sort}
          currentOrder={order}
          storeCurrency={storeCurrency}
        />
      </div>
    </div>
  );
}
