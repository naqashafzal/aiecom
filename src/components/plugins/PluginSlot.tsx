"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import helloWorldPlugin from "@/plugins/hello-world";

// Static mapping for client-side components
const clientRegistry: Record<string, any> = {
  "hello-world": helloWorldPlugin
};

export function PluginSlot({ name }: { name: string }) {
  const [injectedComponents, setInjectedComponents] = useState<React.ReactNode[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        const res = await fetch(`/api/plugins/active`);
        if (res.ok) {
          const { activeIdentifiers } = await res.json();
          
          const components: React.ReactNode[] = [];
          for (const id of activeIdentifiers) {
            const plugin = clientRegistry[id];
            if (plugin && plugin.components && plugin.components[name]) {
              const Component = plugin.components[name];
              components.push(<Component key={id} />);
            }
          }
          setInjectedComponents(components);
        }
      } catch (err) {
        console.error("Failed to load plugin slot", name);
      }
    };
    
    loadPlugins();
  }, [name, pathname]);

  if (injectedComponents.length === 0) return null;

  return (
    <div className={`plugin-slot plugin-slot-${name}`}>
      {injectedComponents.map((Component, idx) => (
        <div key={idx}>{Component}</div>
      ))}
    </div>
  );
}
