import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";

export default async function AdminTeamPage() {
	await requireSession("admin");
	redirect("/admin/staff");
}
