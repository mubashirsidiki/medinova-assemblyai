import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
	defaultLandingRoute,
	normalizeDefaultRouteByRole,
	parseSession,
	type Role,
	type SessionPayload,
} from "./session";

export type { Role, SessionPayload } from "./session";
export {
	defaultLandingRoute,
	normalizeDefaultRouteByRole,
	parseSession,
} from "./session";

export type LoginFormValues = {
	email: string;
	password: string;
	role: Role;
};

export const SESSION_COOKIE = "voicecare_session";

export function normalizeEmail(value: string) {
	return value.trim().toLowerCase();
}

export function hashPassword(
	password: string,
	salt = crypto.randomBytes(16).toString("hex"),
) {
	const derived = crypto
		.pbkdf2Sync(password, salt, 120_000, 64, "sha512")
		.toString("hex");
	return { salt, hash: derived };
}

export function verifyPassword(
	password: string,
	salt: string,
	expectedHash: string,
) {
	const { hash } = hashPassword(password, salt);
	return crypto.timingSafeEqual(
		Buffer.from(hash, "hex"),
		Buffer.from(expectedHash, "hex"),
	);
}

export function serializeSession(payload: SessionPayload) {
	return encodeURIComponent(JSON.stringify(payload));
}

export async function getSessionFromCookies() {
	const cookieStore = await cookies();
	const parsed = parseSession(cookieStore.get(SESSION_COOKIE)?.value);

	if (!parsed) {
		return null;
	}

	const account = await prisma.authUser.findFirst({
		where: {
			id: parsed.userId,
			isActive: true,
		},
		select: {
			id: true,
			email: true,
			displayName: true,
			role: true,
			defaultRoute: true,
		},
	});

	if (!account) {
		return null;
	}

	const normalizedRole = account.role as Role;
	const normalizedPayload: SessionPayload = {
		userId: account.id,
		email: account.email,
		displayName: account.displayName,
		role: normalizedRole,
		defaultRoute: normalizeDefaultRouteByRole(
			normalizedRole,
			account.defaultRoute || defaultLandingRoute[normalizedRole],
		),
	};

	return normalizedPayload;
}

export async function clearSessionCookie() {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE);
}

export async function setSessionCookie(payload: SessionPayload) {
	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE, serializeSession(payload), {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 12,
	});
}

export function loginDefaultsForRole(role: Role) {
	return {
		defaultRoute: defaultLandingRoute[role],
	};
}

export async function requireSession(role?: Role) {
	const session = await getSessionFromCookies();

	if (!session) {
		redirect("/login");
	}

	if (role && session.role !== role) {
		redirect(session.defaultRoute || defaultLandingRoute[session.role]);
	}

	return session;
}
