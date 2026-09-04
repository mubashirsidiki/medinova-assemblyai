export type Role = "admin" | "user";

export type SessionPayload = {
	userId: string;
	email: string;
	displayName: string;
	role: Role;
	defaultRoute: string;
};

export const defaultLandingRoute: Record<Role, string> = {
	admin: "/admin/dashboard",
	user: "/user/dashboard",
};

export function parseSession(raw?: string | null): SessionPayload | null {
	if (!raw) {
		return null;
	}

	try {
		const payload = JSON.parse(decodeURIComponent(raw)) as SessionPayload;
		if (
			typeof payload.userId === "string" &&
			typeof payload.email === "string" &&
			typeof payload.displayName === "string" &&
			(payload.role === "admin" || payload.role === "user") &&
			typeof payload.defaultRoute === "string"
		) {
			const normalizedRole = payload.role as Role;
			const normalizedRoute = normalizeDefaultRouteByRole(
				normalizedRole,
				payload.defaultRoute,
			);
			return {
				...payload,
				role: normalizedRole,
				defaultRoute: normalizedRoute,
			};
		}
	} catch {
		return null;
	}

	return null;
}

const legacyUserRouteMap: Record<string, string> = {
	"/dashboard": "/user/dashboard",
	"/calls": "/user/calls",
	"/booking": "/user/booking",
	"/analytics": "/user/analytics",
	"/costs": "/user/costs",
	"/ai-bot-settings": "/user/ai-bot-settings",
};

export function normalizeDefaultRouteByRole(role: Role, route?: string | null) {
	if (!route) {
		return defaultLandingRoute[role];
	}

	if (role === "user") {
		if (route === "/user") {
			return defaultLandingRoute.user;
		}
		if (route.startsWith("/user/")) {
			return route;
		}
		return legacyUserRouteMap[route] ?? defaultLandingRoute.user;
	}

	return route;
}
