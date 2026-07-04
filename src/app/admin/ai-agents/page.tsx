import { db } from "@/lib/prisma";
import { AgentToggle } from "./AgentToggle";
import { Bot, MessageSquare, Box, PenTool, Truck, BarChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AiAgentsPage() {
  const rawSettings = await db.setting.findMany();
  const settings = rawSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  const agents = [
    {
      id: "aiAgentEnabled", // This maps to the existing setting we added
      name: "The Storefront Concierge",
      role: "Customer Facing",
      description: "Acts as the primary interface for the store. Answers customer questions, provides personalized recommendations, and handles conversational checkout.",
      icon: MessageSquare,
      status: "ACTIVE",
      enabled: settings.aiAgentEnabled !== "false", // Default true
    },
    {
      id: "aiInventoryAgent",
      name: "The AI Inventory Manager",
      role: "Backend Operations",
      description: "Autonomously generates high-converting, SEO-optimized product descriptions directly inside the product editor to save you hours of manual data entry.",
      icon: Box,
      status: "ACTIVE",
      enabled: settings.aiInventoryAgent === "true", // Default false
    },
    {
      id: "aiMarketingAgent",
      name: "The Marketing & Growth Agent",
      role: "Outbound Marketing",
      description: "Instantly researches and writes complete, SEO-optimized blog posts formatted in markdown directly inside the blog post editor.",
      icon: PenTool,
      status: "ACTIVE",
      enabled: settings.aiMarketingAgent === "true",
    },
    {
      id: "aiFulfillmentAgent",
      name: "The Fulfillment & Support Agent",
      role: "Operations & Support",
      description: "Routes orders to fulfillment centers, handles low-level customer complaints automatically, and proactively texts customers for reviews.",
      icon: Truck,
      status: "PLANNED",
      enabled: false,
    },
    {
      id: "aiCeoAgent",
      name: "The 'CEO' Dashboard Agent",
      role: "Executive Oversight",
      description: "Oversees all other agents, manages budgets, and sends you a daily morning briefing via SMS regarding sales metrics and AI actions taken.",
      icon: BarChart,
      status: "PLANNED",
      enabled: false,
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" /> 
            AI Workforce
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your swarm of specialized AI Agents running the store.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/settings">Configure Persona</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const isPlanned = agent.status === "PLANNED";
          
          return (
            <div key={agent.id} className={`bg-background rounded-2xl border shadow-sm overflow-hidden flex flex-col ${isPlanned ? 'opacity-60 grayscale' : ''}`}>
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <agent.icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      agent.status === 'BETA' ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {agent.status}
                    </span>
                    {!isPlanned && (
                      <AgentToggle agentKey={agent.id} initialState={agent.enabled} />
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold">{agent.name}</h3>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mt-1">{agent.role}</p>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>
              </div>
              
              <div className="p-4 border-t bg-muted/20 flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">
                  {isPlanned ? "Coming Soon" : agent.enabled ? "Currently Active" : "Currently Sleeping"}
                </span>
                {!isPlanned && (
                  <Link href="/admin/settings" className="text-primary hover:underline font-semibold text-xs">
                    View Logs
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-primary/5 rounded-2xl border border-primary/20 p-8 text-center mt-8 space-y-4">
        <h3 className="text-2xl font-bold text-primary">Level 5 Autonomy Enabled</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your AI Workforce is currently running {agents.filter(a => a.enabled && a.status !== 'PLANNED').length} active agents. 
          They are autonomously managing operations 24/7.
        </p>
      </div>
      
    </div>
  );
}
