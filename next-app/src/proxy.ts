import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseSession } from "@/lib/session";

const publicPaths = new Set(["/", "/login", "/privacy", "/terms", "/contact"]);

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (publicPaths.has(pathname)) {
		return NextResponse.next();
	}

	const session = parseSession(request.cookies.get("voicecare_session")?.value);

	if (!session) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("next", pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (pathname.startsWith("/admin") && session.role !== "admin") {
		return NextResponse.redirect(new URL(session.defaultRoute, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon\\.ico|assets|.*\\.svg).*)"],
};
