import { NextResponse } from "next/server";
import { getActivePlugins } from "@/lib/plugins/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activePlugins = await getActivePlugins();
    return NextResponse.json({
      activeIdentifiers: activePlugins.map(p => p.identifier)
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch plugins" }, { status: 500 });
  }
}
