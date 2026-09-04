import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
	const secret = process.env.JWT_SECRET || "";

	if (!token || token !== secret) {
		console.warn("[LiveKit Notify] Unauthorized attempt — token mismatch");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const {
		callerName,
		callerPhone,
		reason,
		urgency,
		callerLanguage,
		appointmentDate,
		appointmentTime,
		recommendedDepartment,
		callbackRequired,
		callbackRequiredReason,
		isSpam,
	} = body;

	if (!reason) {
		console.warn("[LiveKit Notify] Missing required field: reason");
		return NextResponse.json(
			{ error: "Missing required fields" },
			{ status: 400 },
		);
	}

	console.log("[LiveKit Notify] Call record received:", {
		callerName: callerName || "Unknown",
		callerPhone: callerPhone || "N/A",
		reason: reason.slice(0, 100),
		urgency: urgency || null,
		callerLanguage: callerLanguage || null,
		appointmentDate: appointmentDate || null,
		appointmentTime: appointmentTime || null,
		recommendedDepartment: recommendedDepartment || null,
		callbackRequired: callbackRequired || null,
		callbackRequiredReason: callbackRequiredReason || null,
		isSpam: isSpam || null,
	});

	return NextResponse.json({ received: true });
}
