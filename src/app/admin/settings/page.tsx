import { db } from "@/lib/prisma";
import { saveSettings } from "../actions";
import SettingsTabs from "./SettingsTabs";

export default async function AdminSettingsPage() {
  const rawSettings = await db.setting.findMany();
  const settings = rawSettings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store preferences and configurations.</p>
      </div>

      <SettingsTabs settings={settings} saveAction={saveSettings} />
    </div>
  );
}
