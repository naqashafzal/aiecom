const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'admin', 'online-store', 'LiveThemeEditor.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add import
if (!code.includes('AliExpressEditorClient')) {
  code = code.replace(
    'import { updateThemeSettings, importThemeSettings } from "./actions";',
    'import { updateThemeSettings, importThemeSettings } from "./actions";\nimport { AliExpressEditorClient } from "./AliExpressEditorClient";'
  );
}

// 2. Wrap the left sidebar rendering logic
// The Left Sidebar starts at `<div className="w-[320px] bg-white border-r border-[#c9cccf] flex flex-col shrink-0 overflow-y-auto">`
// Let's find it.

const sidebarStart = '<div className="w-[320px] bg-white border-r border-[#c9cccf] flex flex-col shrink-0 overflow-y-auto">';
const idx = code.indexOf(sidebarStart);

if (idx !== -1) {
  // We want to insert logic right after sidebarStart
  const newLogic = `
          {activeTheme === "aliexpress" && activeTab === "sections" ? (
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
                <AliExpressEditorClient 
                  initialConfigStr={settings["storefront_theme_config_aliexpress"]}
                  onConfigChange={(val) => handleSettingChange("storefront_theme_config_aliexpress", val)}
                  categories={categories}
                />
              </div>
            </div>
          ) : activeSection && activeTheme !== "aliexpress" ? (`;

  let replacedCode = code.replace(
    sidebarStart + '\n          {activeSection ? (',
    sidebarStart + '\n' + newLogic
  );
  
  // Now we need to handle the case where activeSection is true for legacy, but what if !activeSection?
  // Old code had `) : (` which led to the tabs.
  // Wait, if activeTheme === 'aliexpress' and activeTab !== 'sections', it will fall through to `activeSection && ...` which is false, so it falls to `) : (` which is the tabs!
  
  // BUT the old code has activeSection logic:
  // `{activeSection ? (` ... `) : (` ... tabs logic ... `)}`
  
  // So we changed `{activeSection ? (` to `{activeTheme === "aliexpress" && activeTab === "sections" ? ( ... ) : activeSection && activeTheme !== "aliexpress" ? (`
  // This means the rest of the file matches correctly!
  
  // Wait, what about `activeTab === "sections"` inside the old tabs logic? It will still render for `aliexpress`?
  // No! Because `activeTheme === 'aliexpress' && activeTab === 'sections'` is caught by our NEW condition, it never reaches the old tabs logic!
  // BUT if `activeTab === 'theme_settings'`, it will skip our new condition, skip `activeSection`, and fall to the old tabs logic. This is EXACTLY what we want!
  
  // One small issue: the old tabs logic renders the three tab buttons.
  // We duplicated the tab buttons in our new logic. This is fine.
  
  // Another small issue: if the user clicks a legacy section in old themes, `activeSection` is set, and it renders the old form. This is perfect.
  
  // Let's modify the code.
  fs.writeFileSync(filePath, replacedCode, 'utf8');
  console.log("Successfully patched LiveThemeEditor.tsx");
} else {
  console.log("Could not find sidebar start");
}
