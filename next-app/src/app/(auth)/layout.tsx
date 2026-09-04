import "@/styles/dashboard.css";
import { AppShell } from "@/components/app-shell";
import { getSessionFromCookies } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSessionFromCookies();

	return <AppShell session={session}>{children}</AppShell>;
}
