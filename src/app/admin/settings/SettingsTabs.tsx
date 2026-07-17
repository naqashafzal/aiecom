"use client";

import { useState } from "react";
import { Store, CreditCard, LayoutTemplate, Bot, CheckCircle2, Megaphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsTabs({ settings, saveAction }: { settings: Record<string, string>, saveAction: any }) {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [menuLinks, setMenuLinks] = useState<Array<{name: string, url: string, highlight?: boolean}>>(() => {
    try {
      return settings.storefront_main_menu ? JSON.parse(settings.storefront_main_menu) : [
        { name: "Bundle deals", url: "/products", highlight: true },
        { name: "Choice", url: "/products" },
        { name: "Automotive", url: "/products" },
        { name: "Appliances", url: "/products" },
      ];
    } catch {
      return [];
    }
  });

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
    { id: "storefront", name: "Product Pages", icon: LayoutTemplate },
    { id: "emails", name: "Emails", icon: Mail },
    { id: "ads", name: "Advertisements", icon: Megaphone },
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
                  <input type="text" name="storeName" defaultValue={settings.storeName || "ZS Decor Premium"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input type="email" name="contactEmail" defaultValue={settings.contactEmail || "support@ZS Decor-ecom.com"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Support Phone</label>
                    <input type="tel" name="supportPhone" defaultValue={settings.supportPhone || "+1 (800) 123-4567"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Favicon URL</label>
                  <input type="text" name="storeFavicon" defaultValue={settings.storeFavicon || "/favicon.ico"} placeholder="e.g. /favicon.ico or https://.../icon.png" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">Provide a URL for the browser tab icon. (Must be .ico or .png format)</p>
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
              <h2 className="text-lg font-bold">Advanced Manual Payments</h2>
              <p className="text-sm text-muted-foreground mb-4">Configure your local payment methods. Customers will see your account details during checkout.</p>
            </div>
            
            <div className="space-y-6">
              {/* Cash on Delivery */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div>
                  <div className="font-semibold">Cash on Delivery (COD)</div>
                  <div className="text-sm text-muted-foreground">Allow customers to pay upon receiving the order.</div>
                </div>
                <select key={settings.payment_cod_enabled} name="payment_cod_enabled" defaultValue={settings.payment_cod_enabled || "true"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              {/* Bank Transfer */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="font-semibold">Bank Transfer</div>
                    <div className="text-sm text-muted-foreground">Customers will transfer directly to your bank account.</div>
                  </div>
                  <select key={settings.payment_bank_enabled} name="payment_bank_enabled" defaultValue={settings.payment_bank_enabled || "false"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Bank Name</label>
                    <input type="text" name="payment_bank_name" defaultValue={settings.payment_bank_name || ""} placeholder="e.g. Meezan Bank" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Account Title</label>
                    <input type="text" name="payment_bank_title" defaultValue={settings.payment_bank_title || ""} placeholder="e.g. ZS Decor Ecom" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1">IBAN / Account Number</label>
                    <input type="text" name="payment_bank_iban" defaultValue={settings.payment_bank_iban || ""} placeholder="e.g. PK00 MEZN 0000 0000 0000" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-mono" />
                  </div>
                </div>
              </div>

              {/* EasyPaisa */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="font-semibold text-green-600">EasyPaisa</div>
                    <div className="text-sm text-muted-foreground">Accept payments via EasyPaisa mobile wallet.</div>
                  </div>
                  <select key={settings.payment_easypaisa_enabled} name="payment_easypaisa_enabled" defaultValue={settings.payment_easypaisa_enabled || "false"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Account Title</label>
                    <input type="text" name="payment_easypaisa_title" defaultValue={settings.payment_easypaisa_title || ""} placeholder="e.g. Muhammad Ali" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Account Number (Phone)</label>
                    <input type="text" name="payment_easypaisa_number" defaultValue={settings.payment_easypaisa_number || ""} placeholder="e.g. 03451234567" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-mono" />
                  </div>
                </div>
              </div>

              {/* JazzCash */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <div className="font-semibold text-red-600">JazzCash</div>
                    <div className="text-sm text-muted-foreground">Accept payments via JazzCash mobile wallet.</div>
                  </div>
                  <select key={settings.payment_jazzcash_enabled} name="payment_jazzcash_enabled" defaultValue={settings.payment_jazzcash_enabled || "false"} className="h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Account Title</label>
                    <input type="text" name="payment_jazzcash_title" defaultValue={settings.payment_jazzcash_title || ""} placeholder="e.g. Muhammad Ali" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Account Number (Phone)</label>
                    <input type="text" name="payment_jazzcash_number" defaultValue={settings.payment_jazzcash_number || ""} placeholder="e.g. 03001234567" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-mono" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === "storefront" && (
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold">Product Page Features</h2>
              <p className="text-sm text-muted-foreground mb-4">Toggle various features on the storefront product pages.</p>
            </div>
            
            <div className="space-y-4">

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

              <div className="border rounded-lg p-4 space-y-4">
                <div className="font-semibold border-b pb-4">Product Page Badges / Policies</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Policy 1 (e.g. Shipping)</label>
                    <input type="text" name="storefront_policy_1_title" defaultValue={settings.storefront_policy_1_title || "Free Worldwide Shipping"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Policy 2 (e.g. Warranty)</label>
                    <input type="text" name="storefront_policy_2_title" defaultValue={settings.storefront_policy_2_title || "2 Year Extended Warranty"} className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  </div>
                </div>
              </div>


            </div>
          </div>
        )}

        {activeTab === "emails" && (
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Email Configuration</h2>
              <p className="text-sm text-muted-foreground mb-4">Configure your Resend API settings to send order confirmations and abandoned cart recovery emails.</p>
            </div>
            
            <div className="space-y-4 border-b pb-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Resend API Key</label>
                <input type="password" name="resend_api_key" defaultValue={settings.resend_api_key || ""} placeholder="re_..." className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-sm" />
                <p className="text-xs text-muted-foreground mt-1.5">If left blank, the system will use the RESEND_API_KEY from your .env file.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sender 'From' Address</label>
                <input type="email" name="email_from_address" id="email_from_address" defaultValue={settings.email_from_address || "onboarding@resend.dev"} placeholder="sales@yourstore.com" className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                <p className="text-xs text-muted-foreground mt-1.5">Must be a verified domain in your Resend dashboard (or onboarding@resend.dev for testing).</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-sm mb-2">Test Resend API</h3>
                <div className="flex gap-2">
                  <input type="email" id="test_email_to" placeholder="Enter your email to test" className="flex-1 h-9 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" />
                  <Button 
                    type="button" 
                    variant="secondary"
                    className="h-9"
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const toEmail = (document.getElementById('test_email_to') as HTMLInputElement).value;
                      const apiKey = (document.querySelector('input[name="resend_api_key"]') as HTMLInputElement).value;
                      const fromAddress = (document.getElementById('email_from_address') as HTMLInputElement).value;
                      
                      if (!toEmail) return alert("Please enter an email to send the test to.");
                      
                      btn.disabled = true;
                      btn.innerText = "Sending...";
                      
                      try {
                        const { testResendApi } = await import('../actions');
                        const res = await testResendApi(apiKey, fromAddress, toEmail);
                        if (res.success) {
                          alert("Test email sent successfully! Please check your inbox.");
                        } else {
                          alert("Error sending test email: " + res.error);
                        }
                      } catch (err: any) {
                        alert("Error: " + err.message);
                      } finally {
                        btn.disabled = false;
                        btn.innerText = "Send Test Email";
                      }
                    }}
                  >
                    Send Test Email
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Abandoned Cart Template</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Available variables: <code className="bg-muted px-1.5 py-0.5 rounded text-primary">{"{{customerName}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-primary">{"{{storeName}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-primary">{"{{checkoutUrl}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-primary">{"{{cartTotal}}"}</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-primary">{"{{itemsList}}"}</code>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Subject</label>
                  <input 
                    type="text" 
                    name="email_abandoned_subject" 
                    defaultValue={settings.email_abandoned_subject || "Did you forget something at {{storeName}}?"} 
                    className="w-full h-10 px-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email Body (HTML or Text)</label>
                  <textarea 
                    name="email_abandoned_body" 
                    defaultValue={settings.email_abandoned_body || `<h1>Did you forget something?</h1>\n<p>Hi {{customerName}},</p>\n<p>We noticed you left some great items in your cart at {{storeName}}. Don't worry, we've saved them for you!</p>\n<hr/>\n<p><strong>Your Items:</strong><br/>{{itemsList}}</p>\n<p><strong>Total:</strong> {{cartTotal}}</p>\n<a href="{{checkoutUrl}}" style="background: black; color: white; padding: 10px 20px; text-decoration: none;">Complete Your Purchase</a>`}
                    className="w-full h-48 p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ads" && (
          <div className="bg-background rounded-xl border shadow-sm p-6 space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Advertisement System</h2>
              <p className="text-sm text-muted-foreground mb-4">Integrate Google AdSense or other custom ad scripts globally across your store.</p>
            </div>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-muted/10 space-y-3">
                <div className="font-semibold">1. Global Head Script (AdSense Verification)</div>
                <p className="text-xs text-muted-foreground">Paste your main `&lt;script async src="..."&gt;&lt;/script&gt;` tag here. This loads on every page.</p>
                <textarea 
                  name="ad_head_script" 
                  defaultValue={settings.ad_head_script || ""} 
                  placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'></script>"
                  className="w-full h-24 px-3 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">2. Header Ad Slot</div>
                  <select key={settings.ad_header_enabled} name="ad_header_enabled" defaultValue={settings.ad_header_enabled || "false"} className="h-8 px-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-xs font-medium">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">Displays directly below the navigation bar.</p>
                <textarea 
                  name="ad_header_script" 
                  defaultValue={settings.ad_header_script || ""} 
                  placeholder="<!-- Header Ad Unit --> <ins class='adsbygoogle' ...></ins>"
                  className="w-full h-24 px-3 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">3. Footer Ad Slot</div>
                  <select key={settings.ad_footer_enabled} name="ad_footer_enabled" defaultValue={settings.ad_footer_enabled || "false"} className="h-8 px-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-xs font-medium">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">Displays directly above the footer.</p>
                <textarea 
                  name="ad_footer_script" 
                  defaultValue={settings.ad_footer_script || ""} 
                  placeholder="<!-- Footer Ad Unit -->"
                  className="w-full h-24 px-3 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">4. Product Page Ad Slot</div>
                  <select key={settings.ad_product_enabled} name="ad_product_enabled" defaultValue={settings.ad_product_enabled || "false"} className="h-8 px-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none text-xs font-medium">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground">Displays on individual product pages, usually below the product description.</p>
                <textarea 
                  name="ad_product_script" 
                  defaultValue={settings.ad_product_script || ""} 
                  placeholder="<!-- Product Page Ad Unit -->"
                  className="w-full h-24 px-3 py-2 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none font-mono text-xs"
                />
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
