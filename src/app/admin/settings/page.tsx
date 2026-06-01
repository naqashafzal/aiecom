import { Button } from "@/components/ui/button";
import { Store, Globe, CreditCard, Bell, Shield, Mail } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-muted text-foreground">
            <Store className="h-4 w-4" /> General
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <CreditCard className="h-4 w-4" /> Payments
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Globe className="h-4 w-4" /> Shipping
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Shield className="h-4 w-4" /> Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold">Store Details</h2>
              <p className="text-sm text-muted-foreground mb-4">Your store name and contact email appear on receipts and the storefront.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <input type="text" defaultValue="Aura Premium" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input type="email" defaultValue="support@aura-ecom.com" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Support Phone</label>
                  <input type="tel" defaultValue="+1 (800) 123-4567" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold">Currency & Formatting</h2>
              <p className="text-sm text-muted-foreground mb-4">Choose how prices are displayed across your store.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Currency</label>
                <select className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none">
                  <option value="USD">United States Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none">
                  <option value="EST">Eastern Time (US & Canada)</option>
                  <option value="PST">Pacific Time (US & Canada)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button>Save Settings</Button>
          </div>

        </div>
      </div>
    </div>
  );
}
