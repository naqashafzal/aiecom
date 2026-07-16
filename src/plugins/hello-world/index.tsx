import { PluginConfig } from "@/lib/plugins/types";

export const HelloWorldBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-md my-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="font-bold text-lg">👋 Hello from the Plugin System!</h3>
      <p className="text-sm opacity-90">This is injected via the PluginSlot component.</p>
    </div>
  );
};

const helloWorldPlugin: PluginConfig & { components: Record<string, React.FC> } = {
  identifier: "hello-world",
  name: "Hello World Example",
  description: "A demonstration plugin that adds a banner to the product page and hooks into the order system.",
  version: "1.0.0",
  hooks: {
    onOrderCreated: async (orderId) => {
      console.log(`[Plugin: Hello World] Order ${orderId} was just created!`);
    }
  },
  components: {
    product_sidebar: HelloWorldBanner
  }
};

export default helloWorldPlugin;
