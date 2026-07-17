import { PluginConfig, PluginRegistry } from './types';
import { db } from '@/lib/prisma';

import helloWorldPlugin from '@/plugins/hello-world';
import nullpkDownloadPlugin from '@/plugins/nullpk-download';

const localPlugins: PluginConfig[] = [
  helloWorldPlugin,
  nullpkDownloadPlugin
];

export const registry: PluginRegistry = localPlugins.reduce((acc, plugin) => {
  acc[plugin.identifier] = plugin;
  return acc;
}, {} as PluginRegistry);

export async function getActivePlugins() {
  try {
    const activeDbPlugins = await db.plugin.findMany({
      where: { isActive: true }
    });

    return activeDbPlugins.map(dbPlugin => registry[dbPlugin.identifier]).filter(Boolean);
  } catch (error) {
    console.error("Failed to load active plugins from DB", error);
    return [];
  }
}
