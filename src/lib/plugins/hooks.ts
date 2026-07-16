import { PluginHooks } from './types';
import { getActivePlugins } from './registry';

export async function executeHook<K extends keyof PluginHooks>(
  hookName: K,
  ...args: Parameters<PluginHooks[K]>
) {
  const activePlugins = await getActivePlugins();

  for (const plugin of activePlugins) {
    const hookFunc = plugin.hooks?.[hookName];
    if (typeof hookFunc === 'function') {
      try {
        // @ts-ignore - Dynamic execution
        await hookFunc(...args);
      } catch (error) {
        console.error(`Plugin ${plugin.identifier} failed executing hook ${hookName}:`, error);
      }
    }
  }
}
