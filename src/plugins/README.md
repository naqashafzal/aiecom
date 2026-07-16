# Aura Plugin Development Guide

Welcome to the Plugin System for Aura (aiecom)! This guide explains exactly how to develop new plugins from scratch for this modular monolith.

Because the system is a compiled Next.js application, plugins must be added directly into the codebase. However, they are dynamically controlled via the database—meaning you can toggle them on/off instantly without deploying code.

---

## 1. Create Your Plugin Folder & File

To create a new plugin, add a new folder inside `src/plugins/`. Let's create an "SEO Optimizer" plugin.

**Path:** `src/plugins/seo-optimizer/index.tsx`

Inside this file, you need to import the `PluginConfig` type and export an object that describes your plugin.

```tsx
import { PluginConfig } from "@/lib/plugins/types";

// (Optional) Define a UI component your plugin wants to inject
const SeoDashboardWidget = () => {
  return (
    <div className="bg-blue-500 text-white p-4 rounded shadow">
      <h3>SEO Optimizer is running!</h3>
      <p>All your pages are being automatically optimized.</p>
    </div>
  );
};

// Define the Plugin Configuration
const seoOptimizerPlugin: PluginConfig & { components: Record<string, React.FC> } = {
  identifier: "seo-optimizer", // MUST be unique
  name: "SEO Optimizer Pro",
  description: "Automatically generates meta tags and schema markup.",
  version: "1.0.0",
  
  // (Optional) Backend Hooks: Trigger actions on backend events
  hooks: {
    onOrderCreated: async (orderId) => {
      console.log(`[SEO Plugin] Order ${orderId} was just created! Ping search engines.`);
    },
    onUserRegistered: async (userId) => {
      console.log(`[SEO Plugin] Welcome new user ${userId}!`);
    }
  },
  
  // (Optional) UI Components: Inject UI into specific slots
  components: {
    // This injects `SeoDashboardWidget` into any `<PluginSlot name="product_sidebar" />`
    product_sidebar: SeoDashboardWidget 
  }
};

export default seoOptimizerPlugin;
```

---

## 2. Register the Plugin in the Backend (Server)

Next.js needs to know your plugin exists at build-time. You must register it in the master registry.

**File:** `src/lib/plugins/registry.ts`

```typescript
import { PluginConfig, PluginRegistry } from './types';
import { db } from '@/lib/prisma';

// 1. Import your new plugin
import helloWorldPlugin from '@/plugins/hello-world';
import seoOptimizerPlugin from '@/plugins/seo-optimizer';

// 2. Add it to the localPlugins array
const localPlugins: PluginConfig[] = [
  helloWorldPlugin,
  seoOptimizerPlugin
];

// ... rest of the file
```

---

## 3. Register the Plugin UI in the Frontend (Client)

Because UI injection happens on the client-side browser, we need a client-safe mapping for the React components.

**File:** `src/components/plugins/PluginSlot.tsx`

```tsx
import helloWorldPlugin from "@/plugins/hello-world";
import seoOptimizerPlugin from "@/plugins/seo-optimizer"; // 1. Import it

// 2. Add it to the static mapping using its unique identifier
const clientRegistry: Record<string, any> = {
  "hello-world": helloWorldPlugin,
  "seo-optimizer": seoOptimizerPlugin
};

// ... rest of the file
```

---

## 4. How UI Slots Work

In the Aura frontend, you will see components like this:
```tsx
<PluginSlot name="product_sidebar" />
```

Any plugin that defines `product_sidebar` in its `components` object will have its React component rendered exactly where that `<PluginSlot />` is placed.

To create a new slot somewhere else in the app (e.g., the shopping cart), simply add `<PluginSlot name="cart_bottom" />` to the cart component, and plugins can start targeting it!

---

## 5. Enable Your Plugin

1. Go to your store's **Admin Panel** (`/admin`).
2. Click on the **Plugins** tab in the sidebar.
3. You will see your new plugin automatically listed.
4. Click **Enable**.

Your backend hooks will start firing, and your UI components will immediately appear in their respective slots!
