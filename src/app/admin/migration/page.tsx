import { MigrationClient } from "./MigrationClient";

export default function MigrationPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Migration</h1>
        <p className="text-muted-foreground mt-1">Import your catalog automatically from Shopify or WooCommerce using standard CSV exports.</p>
      </div>
      <MigrationClient />
    </div>
  );
}
