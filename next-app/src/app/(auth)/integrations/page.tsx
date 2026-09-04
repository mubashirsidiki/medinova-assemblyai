import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export default async function IntegrationsPage() {
	await requireSession("admin");
	redirect("/admin/bots");
}
