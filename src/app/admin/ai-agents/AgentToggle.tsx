"use client";

import { useState, useTransition } from "react";
import { toggleAiAgent } from "./actions";

interface AgentToggleProps {
  agentKey: string;
  initialState: boolean;
}

export function AgentToggle({ agentKey, initialState }: AgentToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialState);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState); // Optimistic UI update
    
    startTransition(async () => {
      const res = await toggleAiAgent(agentKey, newState);
      if (!res.success) {
        setEnabled(!newState); // Revert on failure
      }
    });
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        enabled ? "bg-primary" : "bg-muted-foreground/30"
      } ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      <span className="sr-only">Toggle {agentKey}</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
