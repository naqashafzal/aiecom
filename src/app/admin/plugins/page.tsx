import { db } from "@/lib/prisma";
import { registry } from "@/lib/plugins/registry";
import { togglePluginStatus } from "./actions";
import { Button } from "@/components/ui/button";

export default async function AdminPluginsPage() {
  const dbPlugins = await db.plugin.findMany();
  
  // Create a map for quick lookup
  const dbPluginMap = new Map(dbPlugins.map(p => [p.identifier, p]));

  // Combine local registry with DB state
  const pluginsList = Object.values(registry).map(plugin => {
    const dbRecord = dbPluginMap.get(plugin.identifier);
    return {
      ...plugin,
      isActive: dbRecord?.isActive || false,
    };
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plugins</h1>
        <p className="text-muted-foreground mt-1">Manage modular extensions and integrations for your store.</p>
      </div>

      <div className="grid gap-4">
        {pluginsList.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-background shadow-sm text-muted-foreground">
            No plugins installed.
          </div>
        ) : (
          pluginsList.map(plugin => (
            <div key={plugin.identifier} className="bg-background rounded-xl border shadow-sm p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{plugin.name}</h3>
                <p className="text-sm text-muted-foreground">{plugin.description}</p>
                <div className="mt-2 text-xs font-mono text-muted-foreground">v{plugin.version} • {plugin.identifier}</div>
              </div>
              <div>
                <form action={async () => {
                  "use server";
                  await togglePluginStatus(plugin.identifier, plugin.name, plugin.description, plugin.version, !plugin.isActive);
                }}>
                  <Button 
                    type="submit" 
                    variant={plugin.isActive ? "destructive" : "default"}
                  >
                    {plugin.isActive ? "Disable" : "Enable"}
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
