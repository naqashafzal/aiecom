import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Plus, Package, Edit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default async function VendorProductsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { stores: true }
  });

  const store = user?.stores[0];
  if (!store) redirect("/");

  const products = await db.product.findMany({
    where: { storeId: store.id },
    include: {
      images: true,
      categories: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const currencySetting = await db.setting.findUnique({ where: { key: "storeCurrency" } });
  const storeCurrency = currencySetting?.value || "USD";
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store's inventory and listings.</p>
        </div>
        {/* For now, vendors can't create products themselves (they have to be assigned by admin), 
            or we can allow them to use a separate vendor product creation flow later. */}
        <Button className="rounded-full shadow-sm" disabled title="Contact Admin to list new products">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Inventory</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted border shrink-0">
                      {product.images[0]?.url ? (
                        <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                      ) : (
                        <Package className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{product.name}</span>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {product.categories.map(c => c.name).join(", ")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      product.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {product.stock > 0 ? (
                      <span>{product.stock} in stock</span>
                    ) : (
                      <span className="text-red-500 font-medium">Out of stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {product.salePrice ? (
                      <div>
                        <span className="text-red-500">{formatPrice(product.salePrice)}</span>
                        <span className="text-muted-foreground line-through ml-2 text-xs">{formatPrice(product.price)}</span>
                      </div>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild title="View on Storefront">
                        <Link href={`/products/${product.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" disabled title="Contact Admin to edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No products found in your store.</p>
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
