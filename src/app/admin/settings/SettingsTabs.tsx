"use client";

import { useState } from "react";
import { Store, CreditCard, LayoutTemplate, Bot, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsTabs({ settings, saveAction }: { settings: Record<string, string>, saveAction: any }) {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    await saveAction(formData);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: "general", name: "General", icon: Store },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "storefront", name: "Storefront", icon: LayoutTemplate },
    { id: "ai", name: "AI Models", icon: Bot },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Settings Navigation */}
      <div className="space-y-1">
        {tabs.map(tab => (
          <button 
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.name}
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <form action={handleSubmit} className="md:col-span-3 space-y-6">
        
        {activeTab === "general" && (
          <>
            <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold">Store Details</h2>
                <p className="text-sm text-muted-foreground mb-4">Your store name and contact email appear on receipts and the storefront.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Name</label>
                  <input type="text" name="storeName" defaultValue={settings.storeName || "Aura Premium"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input type="email" name="contactEmail" defaultValue={settings.contactEmail || "support@aura-ecom.com"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Support Phone</label>
                    <input type="tel" name="supportPhone" defaultValue={settings.supportPhone || "+1 (800) 123-4567"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold">Currency & Formatting</h2>
                <p className="text-sm text-muted-foreground mb-4">Choose how prices are displayed across your store.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Store Currency</label>
                  <select key={settings.storeCurrency} name="storeCurrency" defaultValue={settings.storeCurrency || "USD"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none">
                    <option value="USD">United States Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="PKR">Pakistani Rupee (PKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select key={settings.timezone} name="timezone" defaultValue={settings.timezone || "EST"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none">
                    <option value="EST">Eastern Time (US & Canada)</option>
                    <option value="PST">Pacific Time (US & Canada)</option>
                    <option value="UTC">UTC</option>
                    <option value="PKT">Pakistan Standard Time (PKT)</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "payments" && (
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold">Payments</h2>
              <p className="text-sm text-muted-foreground mb-4">Configure accepted payment methods for checkout.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold flex items-center gap-2">Stripe <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase font-bold">Active</span></div>
                  <div className="text-sm text-muted-foreground">Accept credit cards securely.</div>
                </div>
                <input type="hidden" name="stripeEnabled" value="true" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Manual Payments</div>
                  <div className="text-sm text-muted-foreground">Cash on Delivery or Bank Transfer.</div>
                </div>
                <select key={settings.manualPaymentEnabled} name="manualPaymentEnabled" defaultValue={settings.manualPaymentEnabled || "true"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "storefront" && (
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold">Storefront Features</h2>
              <p className="text-sm text-muted-foreground mb-4">Toggle various features on the storefront product pages.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Top Announcement Bar</div>
                  <div className="text-sm text-muted-foreground">Show the promotional banner at the very top.</div>
                </div>
                <select key={settings.storefront_show_announcement} name="storefront_show_announcement" defaultValue={settings.storefront_show_announcement || "true"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Hero Banner Section</div>
                  <div className="text-sm text-muted-foreground">Show the main large image banner and welcome panel.</div>
                </div>
                <select key={settings.storefront_show_hero} name="storefront_show_hero" defaultValue={settings.storefront_show_hero || "true"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Value Props Features</div>
                  <div className="text-sm text-muted-foreground">Show the 4 boxes below hero (Fast Delivery, Buyer Protection, etc).</div>
                </div>
                <select key={settings.storefront_show_features} name="storefront_show_features" defaultValue={settings.storefront_show_features || "true"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Latest Products</div>
                  <div className="text-sm text-muted-foreground">Show the grid of the newest products.</div>
                </div>
                <select key={settings.storefront_show_products} name="storefront_show_products" defaultValue={settings.storefront_show_products || "true"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Premium Stores</div>
                  <div className="text-sm text-muted-foreground">Show the list of top-rated stores.</div>
                </div>
                <select key={settings.storefront_show_stores} name="storefront_show_stores" defaultValue={settings.storefront_show_stores || "true"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold text-red-500">Fake Sales Activity (Social Proof)</div>
                  <div className="text-sm text-muted-foreground">Show randomized "X sold in last Y hours" tags on product pages to increase urgency.</div>
                </div>
                <select key={settings.storefront_fake_sales_enabled} name="storefront_fake_sales_enabled" defaultValue={settings.storefront_fake_sales_enabled || "false"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50/50 border-indigo-100">
                <div>
                  <div className="font-semibold text-indigo-700 flex items-center gap-1.5"><Bot className="h-4 w-4" /> Personalization Engine</div>
                  <div className="text-sm text-indigo-600/80">Rotate homepage products dynamically based on the user's browsing cookies and search history.</div>
                </div>
                <select key={settings.storefront_personalization_enabled} name="storefront_personalization_enabled" defaultValue={settings.storefront_personalization_enabled || "false"} className="h-10 px-3 rounded-md border bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><Bot className="h-5 w-5 text-primary" /> AI Model Configuration</h2>
              <p className="text-sm text-muted-foreground mb-4">Configure the LLM provider and API keys used by your AI Workforce.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Default AI Provider</label>
                <select key={settings.ai_provider} name="ai_provider" defaultValue={settings.ai_provider || "google"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none">
                  <option value="google">Google Gemini (Default)</option>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="claude">Anthropic (Claude)</option>
                  <option value="wavespeed">Wavespeed</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1.5">Note: Switching models requires valid API keys below.</p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-sm">Provider API Keys</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
                  <input type="password" name="ai_openai_key" defaultValue={settings.ai_openai_key || ""} placeholder="sk-proj-..." className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Anthropic (Claude) API Key</label>
                  <input type="password" name="ai_claude_key" defaultValue={settings.ai_claude_key || ""} placeholder="sk-ant-..." className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Wavespeed API Key</label>
                  <input type="password" name="ai_wavespeed_key" defaultValue={settings.ai_wavespeed_key || ""} placeholder="ws-..." className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Google Gemini API Key (Fallback)</label>
                  <input type="password" name="ai_google_key" defaultValue={settings.ai_google_key || ""} placeholder="AIzaSy..." className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">If empty, the system will use the GOOGLE_GENERATIVE_AI_API_KEY from your .env file.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4 sticky bottom-6 z-10 bg-white/80 backdrop-blur-md p-4 border rounded-2xl shadow-2xl transition-all">
          {showSuccess && (
            <div className="flex items-center text-green-600 text-sm font-medium animate-in fade-in slide-in-from-right-4 mr-2">
              <CheckCircle2 className="mr-1 h-4 w-4" /> Settings saved successfully!
            </div>
          )}
          <Button type="submit" disabled={isSaving} className="shadow-lg shadow-primary/25 min-w-[140px]">
            {isSaving ? "Saving..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> Save Settings</>}
          </Button>
        </div>

      </form>
    </div>
  );
}
