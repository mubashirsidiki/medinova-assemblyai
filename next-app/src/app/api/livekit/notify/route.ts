import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

	let appointmentId: string | null = null;

	if (appointmentDate) {
		try {
			const org = await prisma.organization.findFirst({
				orderBy: { createdAt: "asc" },
				select: { id: true },
			});

			if (org) {
				const name =
					callerName && callerName !== "Unknown"
						? callerName
						: "Unknown Caller";

				let patient = await prisma.patient.findFirst({
					where: {
						organizationId: org.id,
						name: { equals: name, mode: "insensitive" },
					},
				});

				if (!patient && name !== "Unknown Caller") {
					const riskLevel =
						urgency === "URGENT"
							? "urgent"
							: urgency === "HIGH"
								? "high"
								: "standard";

					patient = await prisma.patient.create({
						data: {
							organizationId: org.id,
							name,
							preferredLanguage: callerLanguage || "English",
							riskLevel,
						},
					});
				}

				const timePart = appointmentTime || "09:00";
				const scheduledAt = new Date(
					`${appointmentDate}T${timePart.length === 5 ? `${timePart}:00` : timePart}Z`,
				);

				if (patient && !Number.isNaN(scheduledAt.getTime())) {
					let appointment = await prisma.appointment.findFirst({
						where: {
							organizationId: org.id,
							patientId: patient.id,
							scheduledAt,
						},
					});

					if (!appointment) {
						const dept = recommendedDepartment || "General Medicine";
						appointment = await prisma.appointment.create({
							data: {
								organizationId: org.id,
								patientId: patient.id,
								department: dept,
								scheduledAt,
								channel: "voice",
								status: "scheduled",
								durationMinutes: 30,
								confirmationSent: true,
								calendarSynced: true,
							},
						});

						await prisma.notification.create({
							data: {
								organizationId: org.id,
								patientId: patient.id,
								appointmentId: appointment.id,
								kind: "sms_confirmation",
								channel: "sms",
								title: "Appointment confirmed",
								body: `Your visit with ${dept} is scheduled for ${appointmentDate} at ${timePart}.`,
								status: "unread",
								scheduledAt,
							},
						});

						revalidatePath("/user/booking");
						revalidatePath("/user/dashboard");
					}

					appointmentId = appointment.id;
				}
			}
		} catch (error) {
			console.error("[LiveKit Notify] Failed to create appointment:", error);
		}
	}

	return NextResponse.json({ received: true, appointmentId });
}
