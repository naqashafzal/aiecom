export interface PluginConfig {
  identifier: string;
  name: string;
  description: string;
  version: string;
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  hooks?: Partial<PluginHooks>;
  components?: Record<string, React.FC<any>>;
}

export interface PluginHooks {
  onOrderCreated: (orderId: string) => Promise<void>;
  onUserRegistered: (userId: string) => Promise<void>;
}

export type PluginRegistry = Record<string, PluginConfig>;
