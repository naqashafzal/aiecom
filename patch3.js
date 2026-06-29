const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'online-store', 'LiveThemeEditor.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const importsToAdd = `
import { ThemeBlockEditorClient } from "./ThemeBlockEditorClient";
import { 
  AliExpressThemeSchema, defaultAliExpressConfig,
  ElegantThemeSchema, defaultElegantConfig,
  MarketplaceThemeSchema, defaultMarketplaceConfig
} from "@/lib/themeSchemas";
`;

code = code.replace(
  'import { updateThemeSettings, importThemeSettings } from "./actions";',
  'import { updateThemeSettings, importThemeSettings } from "./actions";' + importsToAdd
);

// We need to add activeTheme definition if it's missing
if (!code.includes('const activeTheme = settings["storefront_active_theme"] || "aliexpress";')) {
  code = code.replace(
    'const [menuOpen, setMenuOpen] = useState(false);',
    'const [menuOpen, setMenuOpen] = useState(false);\n  const activeTheme = settings["storefront_active_theme"] || "aliexpress";'
  );
}

const sidebarStartMarker = '{/* Left Sidebar - Editor */}';
const sidebarEndMarker = '{/* Right Side - Iframe Preview */}';

const startIndex = code.indexOf(sidebarStartMarker);
const endIndex = code.indexOf(sidebarEndMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const beforeSidebar = code.substring(0, startIndex);
  const afterSidebar = code.substring(endIndex);

  const newSidebar = `
        {/* Left Sidebar - Editor */}
        <div className="w-[320px] bg-white border-r border-[#c9cccf] flex flex-col shrink-0 overflow-y-auto">
          {activeTab === "sections" ? (
            <div className="h-full flex flex-col">
              <div className="flex border-b border-[#c9cccf] shrink-0">
                <button 
                  onClick={() => setActiveTab("sections")}
                  className={\`flex-1 py-3 text-sm font-semibold border-b-2 \${activeTab === "sections" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}\`}
                >Sections</button>
                <button 
                  onClick={() => setActiveTab("theme_settings")}
                  className={\`flex-1 py-3 text-sm font-semibold border-b-2 \${activeTab === "theme_settings" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}\`}
                >Theme settings</button>
                <button 
                  onClick={() => setActiveTab("app_embeds")}
                  className={\`flex-1 py-3 text-sm font-semibold border-b-2 \${activeTab === "app_embeds" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}\`}
                >App embeds</button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ThemeBlockEditorClient 
                  key={activeTheme}
                  initialConfigStr={settings[\`storefront_theme_config_\${activeTheme}\`]}
                  onConfigChange={(val) => handleSettingChange(\`storefront_theme_config_\${activeTheme}\`, val)}
                  categories={categories}
                  themeSchema={
                    activeTheme === "elegant" ? ElegantThemeSchema :
                    activeTheme === "marketplace" ? MarketplaceThemeSchema :
                    AliExpressThemeSchema
                  }
                  defaultConfig={
                    activeTheme === "elegant" ? defaultElegantConfig :
                    activeTheme === "marketplace" ? defaultMarketplaceConfig :
                    defaultAliExpressConfig
                  }
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex border-b border-[#c9cccf]">
                <button 
                  onClick={() => setActiveTab("sections")}
                  className={\`flex-1 py-3 text-sm font-semibold border-b-2 \${activeTab === "sections" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}\`}
                >Sections</button>
                <button 
                  onClick={() => setActiveTab("theme_settings")}
                  className={\`flex-1 py-3 text-sm font-semibold border-b-2 \${activeTab === "theme_settings" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}\`}
                >Theme settings</button>
                <button 
                  onClick={() => setActiveTab("app_embeds")}
                  className={\`flex-1 py-3 text-sm font-semibold border-b-2 \${activeTab === "app_embeds" ? "border-black text-black" : "border-transparent text-[#5c5f62] hover:bg-[#f6f6f7]"}\`}
                >App embeds</button>
              </div>
              
              {activeTab === "theme_settings" && (
                <div className="animate-in fade-in duration-200">
                  <div className="p-4 space-y-6">
                    <h2 className="font-semibold text-lg text-black mb-4">Theme Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-800">Logo URL</label>
                        <input 
                          type="url" 
                          value={settings["storefront_logo_url"] || ""}
                          onChange={(e) => handleSettingChange("storefront_logo_url", e.target.value)}
                          className="w-full p-2 border border-[#c9cccf] rounded focus:outline-blue-500 text-sm"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-800">Primary Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={settings["storefront_primary_color"] || "#0071FF"}
                            onChange={(e) => handleSettingChange("storefront_primary_color", e.target.value)}
                            className="h-8 w-8 rounded cursor-pointer border border-[#c9cccf] p-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "app_embeds" && (
                <div className="animate-in fade-in duration-200 p-4">
                  <p className="text-sm text-[#5c5f62]">No app embeds available.</p>
                </div>
              )}
            </div>
          )}
        </div>

`;

  fs.writeFileSync(filePath, beforeSidebar + newSidebar + afterSidebar, 'utf8');
  console.log("Successfully replaced legacy editor with block editor for all themes.");
} else {
  console.log("Could not find markers!");
  console.log("start:", startIndex, "end:", endIndex);
}
