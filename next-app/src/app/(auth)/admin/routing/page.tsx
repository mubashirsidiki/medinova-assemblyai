import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export default async function AdminRoutingPage() {
	await requireSession("admin");
	redirect("/admin/bots");
}
