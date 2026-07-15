import { db } from "@/lib/prisma";
import { format } from "date-fns";

export default async function AdminMessagesPage() {
  let messages: any[] = [];
  try {
    messages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Messages</h1>
        <p className="text-muted-foreground text-sm mt-1">Inbox for contact form submissions.</p>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Subject</th>
              <th className="px-6 py-3 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {messages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No messages yet.
                </td>
              </tr>
            )}
            {messages.map((msg) => (
              <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                  {format(new Date(msg.createdAt), "MMM d, yyyy h:mm a")}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{msg.name}</div>
                  <div className="text-gray-500">{msg.email}</div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {msg.subject || "No Subject"}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={msg.message}>
                  {msg.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
