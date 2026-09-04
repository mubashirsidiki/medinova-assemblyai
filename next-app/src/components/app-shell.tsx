"use client";

import {
	Bot,
	BotMessageSquare,
	CalendarDays,
	ChartColumn,
	Coins,
	LayoutDashboard,
	Loader2,
	LogOut,
	Menu,
	ShieldCheck,
	Users,
	Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useState } from "react";
import { useFormStatus } from "react-dom";
import { logoutAction } from "@/app/actions";
import type { SessionPayload } from "@/lib/auth";

type NavItem = {
	href: string;
	label: string;
	icon: typeof LayoutDashboard;
};

const userNavItems: NavItem[] = [
	{ href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/user/calls", label: "Calls", icon: Workflow },
	{ href: "/user/booking", label: "Booking", icon: CalendarDays },
	{ href: "/user/analytics", label: "Analytics", icon: ChartColumn },
	{ href: "/user/costs", label: "Costs", icon: Coins },
	{ href: "/user/ai-bot-settings", label: "AI Bot Settings", icon: Bot },
];

const adminNavItems: NavItem[] = [
	{ href: "/admin/dashboard", label: "Dashboard", icon: ShieldCheck },
	{ href: "/admin/staff", label: "Staff Monitor", icon: Users },
	{ href: "/admin/bots", label: "Bot Monitor", icon: BotMessageSquare },
	{ href: "/admin/cost", label: "Cost Monitor", icon: Coins },
];

const isNavItemActive = (pathname: string, href: string) => {
	if (href === "/admin/dashboard") {
		return pathname === href || pathname === "/admin";
	}
	return pathname === href || pathname.startsWith(`${href}/`);
};

const SidebarNav = React.memo(function SidebarNav({
	navItems,
	pathname,
	onLinkClick,
	isAdmin,
}: {
	navItems: NavItem[];
	pathname: string;
	onLinkClick: () => void;
	isAdmin: boolean;
}) {
	return (
		<div className="nav-group">
			<div className="nav-label">{isAdmin ? "Admin" : "Operations"}</div>
			{navItems.map((item) => {
				const Icon = item.icon;
				const active = isNavItemActive(pathname, item.href);
				return (
					<Link
						key={item.href}
						href={item.href}
						className={`nav-item ${active ? "active" : ""}`}
						onClick={onLinkClick}
					>
						<Icon size={18} />
						<span>{item.label}</span>
					</Link>
				);
			})}
		</div>
	);
});

function LogoutButton() {
	const { pending } = useFormStatus();
	return (
		<button
			className="action-btn sidebar-logout-btn"
			type="submit"
			aria-label="Sign out"
			disabled={pending}
		>
			{pending ? <Loader2 size={16} className="spin" /> : <LogOut size={16} />}
			{pending ? "Signing out…" : "Logout"}
		</button>
	);
}

export function AppShell({
	children,
	session,
}: {
	children: React.ReactNode;
	session: SessionPayload | null;
}) {
	const pathname = usePathname();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const isAdmin = session?.role === "admin";

	const navItems = isAdmin ? adminNavItems : userNavItems;
	const displayName = isAdmin
		? "Medinova Admin"
		: (session?.displayName ?? "Medinova user");

	const handleLinkClick = useCallback(() => {
		setSidebarOpen(false);
	}, []);

	if (
		pathname === "/login" ||
		pathname === "/" ||
		pathname === "/privacy" ||
		pathname === "/terms" ||
		pathname === "/contact"
	) {
		return <>{children}</>;
	}

	return (
		<div className={`shell ${isAdmin ? "admin-shell" : ""}`}>
			<aside
				className={`sidebar ${isAdmin ? "admin-sidebar" : ""} ${sidebarOpen ? "open" : ""}`}
			>
				<div className="brand">
					<div className="brand-badge">
						<Image
							className="brand-logo"
							src="/medinova.svg"
							alt="Medinova logo"
							width={40}
							height={40}
							priority
						/>
					</div>
					<div>
						<h1>Medinova Health</h1>
						<p>
							{session?.role === "admin"
								? "Admin workspace"
								: "Healthcare operations"}
						</p>
					</div>
				</div>

				<SidebarNav
					navItems={navItems}
					pathname={pathname}
					onLinkClick={handleLinkClick}
					isAdmin={isAdmin}
				/>

				<div className="sidebar-account-card">
					<div className="profile-chip sidebar-profile-chip">
						<div className="avatar" />
						<div>
							<strong>{displayName}</strong>
							<small>{isAdmin ? "Admin access" : "Staff access"}</small>
						</div>
					</div>
					<form action={logoutAction}>
						<LogoutButton />
					</form>
				</div>
			</aside>

			<div className="main">
				<header
					className={`topbar ${isAdmin ? "admin-topbar" : "user-topbar"}`}
				>
					<div className="topbar-left">
						<button
							className="mobile-menu"
							type="button"
							onClick={() => setSidebarOpen((current) => !current)}
						>
							<Menu size={18} />
						</button>
					</div>
				</header>

				<main className="content">{children}</main>
			</div>
		</div>
	);
}
