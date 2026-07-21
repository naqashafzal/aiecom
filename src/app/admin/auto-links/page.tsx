import { getAutoLinks } from "@/actions/admin/autolinks";
import { AutoLinksClient } from "./auto-links-client";

export const metadata = {
  title: "Auto Internal Links | Admin",
};

export default async function AutoLinksPage() {
  const links = await getAutoLinks();

  return (
    <div className="w-full">
      <AutoLinksClient initialLinks={links} />
    </div>
  );
}
