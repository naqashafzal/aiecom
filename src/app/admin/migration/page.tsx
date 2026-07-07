import { db } from "@/lib/prisma";
import { MigrationClient } from "./MigrationClient";

export default async function MigrationPage() {
  const storeUrl = await db.setting.findUnique({ where: { key: "shopifyStoreUrl" } });
  const accessToken = await db.setting.findUnique({ where: { key: "shopifyAccessToken" } });
  const clientId = await db.setting.findUnique({ where: { key: "shopifyClientId" } });
  const clientSecret = await db.setting.findUnique({ where: { key: "shopifyClientSecret" } });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Migration</h1>
        <p className="text-muted-foreground mt-1">Import your catalog automatically from Shopify or WooCommerce using standard CSV exports.</p>
      </div>
      <MigrationClient 
        savedStoreUrl={storeUrl?.value || ""}
        savedAccessToken={accessToken?.value || ""}
        savedClientId={clientId?.value || ""}
        savedClientSecret={clientSecret?.value || ""}
      />
    </div>
  );
}
