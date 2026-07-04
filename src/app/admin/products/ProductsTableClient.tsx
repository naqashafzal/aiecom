"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Tag, Percent, ArrowUpCircle, PackageSearch, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductsTableProps {
  products: any[];
  currentPage?: number;
  totalPages?: number;
  totalProducts?: number;
  currentSort?: string;
  currentOrder?: string;
  storeCurrency?: string;
}

export default function ProductsTableClient({ 
  products, 
  currentPage = 1, 
  totalPages = 1, 
  totalProducts = 0, 
  currentSort = 'createdAt', 
  currentOrder = 'desc',
  storeCurrency = "USD"
}: ProductsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort, order] = e.target.value.split('-');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    params.set('order', order);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const isAllPageSelected = products.length > 0 && products.every(p => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (isAllPageSelected) {
      // deselect page
      const newSet = new Set(selectedIds);
      products.forEach(p => newSet.delete(p.id));
      setSelectedIds(newSet);
    } else {
      // select page
      const newSet = new Set(selectedIds);
      products.forEach(p => newSet.add(p.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [priceField, setPriceField] = useState<'price' | 'salePrice'>('price');
  const [priceOp, setPriceOp] = useState<'set' | 'increase_pct' | 'decrease_pct'>('set');
  const [priceValue, setPriceValue] = useState<string>('');

  const [stockOp, setStockOp] = useState<'set' | 'add' | 'subtract'>('set');
  const [stockValue, setStockValue] = useState<string>('');

  const openStatusModal = () => setShowStatusModal(true);
  const openPriceModal = () => setShowPriceModal(true);
  const openStockModal = () => setShowStockModal(true);
  const openDeleteModal = () => setShowDeleteModal(true);

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20 rounded-t-xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto items-center">
          <select 
            value={`${currentSort}-${currentOrder}`} 
            onChange={handleSortSelect}
            className="h-9 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="createdAt-desc">Newest Added</option>
            <option value="createdAt-asc">Oldest Added</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                  checked={isAllPageSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Inventory</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No products found. Start by adding a new product.
                </td>
              </tr>
            ) : products.map((product) => {
              const isSelected = selectedIds.has(product.id);
              
              return (
              <tr key={product.id} className={`border-b last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/20'}`}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-input h-4 w-4 text-primary focus:ring-primary"
                    checked={isSelected}
                    onChange={() => toggleSelect(product.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 border overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {product.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {product.categories && product.categories.length > 0 ? product.categories.map((c: any) => c.name).join(', ') : '-'}
                </td>
                <td className="px-6 py-4 font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: storeCurrency }).format(product.price)}
                </td>
                <td className="px-6 py-4">
                  <span className={`${product.stock === 0 ? 'text-destructive font-bold' : product.stock < 20 ? 'text-orange-500 font-bold' : 'text-muted-foreground'}`}>
                    {product.stock} in stock
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    product.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Link href={`/admin/products/${product.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={async () => {
                      const { deleteProduct } = await import('@/app/admin/actions');
                      await deleteProduct(product.id);
                    }}>
                      <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
        <div>Showing {totalProducts === 0 ? 0 : (currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalProducts)} of {totalProducts} products</div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} asChild={currentPage > 1}>
            {currentPage <= 1 ? <span>Previous</span> : <Link href={`/admin/products?page=${currentPage - 1}`}>Previous</Link>}
          </Button>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} asChild={currentPage < totalPages}>
            {currentPage >= totalPages ? <span>Next</span> : <Link href={`/admin/products?page=${currentPage + 1}`}>Next</Link>}
          </Button>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col items-center gap-2">
          
          {/* Select All Store Banner */}
          {isAllPageSelected && selectedIds.size < totalProducts && totalProducts > products.length && (
            <div className="bg-primary text-primary-foreground text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
              All {products.length} products on this page are selected. 
              <button 
                className="font-bold underline hover:opacity-80 ml-1"
                onClick={async () => {
                  const { getAllProductIds } = await import('@/app/admin/actions');
                  const allIds = await getAllProductIds();
                  setSelectedIds(new Set(allIds));
                }}
              >
                Select all {totalProducts} products in your store
              </button>
            </div>
          )}

          <div className="bg-foreground text-background shadow-2xl rounded-full px-6 py-3 flex items-center gap-4">
            <span className="font-medium bg-background/20 px-2.5 py-0.5 rounded-full text-sm">
              {selectedIds.size} selected
            </span>
            <div className="h-6 w-px bg-background/20"></div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="hover:bg-background/20 hover:text-background rounded-full" onClick={openStatusModal}>
                <ArrowUpCircle className="h-4 w-4 mr-2" /> Status
              </Button>
              <Button size="sm" variant="ghost" className="hover:bg-background/20 hover:text-background rounded-full" onClick={openPriceModal}>
                <Percent className="h-4 w-4 mr-2" /> Price
              </Button>
              <Button size="sm" variant="ghost" className="hover:bg-background/20 hover:text-background rounded-full" onClick={openStockModal}>
                <PackageSearch className="h-4 w-4 mr-2" /> Stock
              </Button>
              <Button size="sm" variant="ghost" className="hover:bg-background/20 text-red-400 hover:text-red-300 rounded-full" onClick={openDeleteModal}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
            <div className="h-6 w-px bg-background/20 ml-2"></div>
            <Button size="icon" variant="ghost" className="h-8 w-8 ml-2 hover:bg-background/20 hover:text-background rounded-full" onClick={() => setSelectedIds(new Set())}>
              &times;
            </Button>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background rounded-xl shadow-lg border w-full max-w-sm p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">Update Status</h3>
            <p className="text-sm text-muted-foreground mb-6">Change the status of {selectedIds.size} selected products.</p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={async () => {
                  const { bulkUpdateProductStatus } = await import('@/app/admin/actions');
                  await bulkUpdateProductStatus(Array.from(selectedIds), 'DRAFT');
                  setShowStatusModal(false);
                  setSelectedIds(new Set());
                }}
              >
                Set as Draft
              </Button>
              <Button 
                className="flex-1" 
                onClick={async () => {
                  const { bulkUpdateProductStatus } = await import('@/app/admin/actions');
                  await bulkUpdateProductStatus(Array.from(selectedIds), 'ACTIVE');
                  setShowStatusModal(false);
                  setSelectedIds(new Set());
                }}
              >
                Set as Active
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background rounded-xl shadow-lg border w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">Update Prices</h3>
            <p className="text-sm text-muted-foreground mb-6">Adjust prices for {selectedIds.size} selected products.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Field</label>
                  <select 
                    value={priceField} 
                    onChange={(e) => setPriceField(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border text-sm bg-background"
                  >
                    <option value="price">Base Price</option>
                    <option value="salePrice">Sale Price</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Operation</label>
                  <select 
                    value={priceOp} 
                    onChange={(e) => setPriceOp(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border text-sm bg-background"
                  >
                    <option value="set">Set to fixed value</option>
                    <option value="increase_pct">Increase by %</option>
                    <option value="decrease_pct">Decrease by %</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Value</label>
                <div className="relative">
                  {priceOp === 'set' && <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>}
                  <input 
                    type="number" 
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    className={`w-full h-10 px-3 rounded-md border text-sm bg-background ${priceOp === 'set' ? 'pl-7' : ''}`}
                    placeholder="e.g. 15.99"
                  />
                  {priceOp !== 'set' && <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="ghost" onClick={() => setShowPriceModal(false)}>Cancel</Button>
              <Button 
                onClick={async () => {
                  if (!priceValue) return;
                  const { bulkUpdateProductPrices } = await import('@/app/admin/actions');
                  await bulkUpdateProductPrices(Array.from(selectedIds), priceField, priceOp, parseFloat(priceValue));
                  setShowPriceModal(false);
                  setSelectedIds(new Set());
                }}
              >
                Apply Prices
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background rounded-xl shadow-lg border w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">Update Stock</h3>
            <p className="text-sm text-muted-foreground mb-6">Adjust inventory levels for {selectedIds.size} selected products.</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Operation</label>
                  <select 
                    value={stockOp} 
                    onChange={(e) => setStockOp(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border text-sm bg-background"
                  >
                    <option value="set">Set exactly to</option>
                    <option value="add">Add to stock</option>
                    <option value="subtract">Subtract from stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input 
                    type="number" 
                    value={stockValue}
                    onChange={(e) => setStockValue(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border text-sm bg-background"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button variant="ghost" onClick={() => setShowStockModal(false)}>Cancel</Button>
              <Button 
                onClick={async () => {
                  if (!stockValue) return;
                  const { bulkUpdateProductStock } = await import('@/app/admin/actions');
                  await bulkUpdateProductStock(Array.from(selectedIds), stockOp, parseInt(stockValue, 10));
                  setShowStockModal(false);
                  setSelectedIds(new Set());
                }}
              >
                Apply Inventory
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background rounded-xl shadow-lg border w-full max-w-sm p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">Delete Products?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete {selectedIds.size} products? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                className="flex-1" 
                onClick={async () => {
                  const { bulkDeleteProducts } = await import('@/app/admin/actions');
                  await bulkDeleteProducts(Array.from(selectedIds));
                  setShowDeleteModal(false);
                  setSelectedIds(new Set());
                }}
              >
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
