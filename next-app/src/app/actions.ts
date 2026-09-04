"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import {
	clearSessionCookie,
	defaultLandingRoute,
	normalizeDefaultRouteByRole,
	normalizeEmail,
	type Role,
	requireSession,
	setSessionCookie,
	verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
	botBasicSettingsSchema,
	botBehaviorSchema,
	botIntegrationSchema,
	botLiveNumberSchema,
	createAppointmentSchema,
	deleteBotLiveNumberSchema,
	loginSchema,
	toggleNotificationSchema,
	urgentNotificationSchema,
} from "@/lib/validators";

/* ---- helpers ---- */

function toStringValue(value: FormDataEntryValue | null) {
	return typeof value === "string" ? value.trim() : "";
}

function field(name: string, formData: FormData) {
	const v = formData.get(name);
	return typeof v === "string" ? v : undefined;
}

function formatZodError(err: ZodError) {
	return err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
}

async function getOwnedBotSettings(botSettingsId: string, userId: string) {
	const account = await prisma.authUser.findUnique({
		where: { id: userId },
		select: { organizationId: true },
	});

	if (!account) {
		throw new Error("Authenticated user was not found.");
	}

	const settings = await prisma.botSettings.findFirst({
		where: {
			id: botSettingsId,
			organizationId: account.organizationId,
			ownerUserId: userId,
		},
		select: { id: true },
	});

	if (!settings) {
		throw new Error("Bot settings record not found for this user.");
	}

	return settings;
}

async function getOwnedOrganization(userId: string) {
	const account = await prisma.authUser.findUnique({
		where: { id: userId },
		select: { organizationId: true },
	});
	if (!account) throw new Error("Authenticated user was not found.");
	return account.organizationId;
}

/* ---- auth ---- */

export type LoginActionState = {
	error?: string;
};

export async function loginAction(
	_prevState: LoginActionState,
	formData: FormData,
): Promise<LoginActionState | never> {
	const parsed = loginSchema.safeParse({
		email: field("email", formData),
		password: field("password", formData),
	});

	if (!parsed.success) {
		return { error: "Enter your email and password." };
	}

	const { email, password } = parsed.data;
	const normalized = normalizeEmail(email);

	const account = await prisma.authUser.findFirst({
		where: {
			email: normalized,
			isActive: true,
		},
	});

	if (
		!account ||
		!verifyPassword(password, account.passwordSalt, account.passwordHash)
	) {
		return { error: "Those credentials do not match an active account." };
	}

	await setSessionCookie({
		userId: account.id,
		email: account.email,
		displayName: account.displayName,
		role: account.role as Role,
		defaultRoute: normalizeDefaultRouteByRole(
			account.role as Role,
			account.defaultRoute || defaultLandingRoute[account.role as Role],
		),
	});

	redirect(
		normalizeDefaultRouteByRole(
			account.role as Role,
			(account.defaultRoute ||
				defaultLandingRoute[account.role as Role]) as string,
		),
	);
}

export async function logoutAction() {
	await clearSessionCookie();
	redirect("/login");
}

/* ---- appointments ---- */

export async function createAppointmentAction(formData: FormData) {
	const session = await requireSession("user");
	const orgId = await getOwnedOrganization(session.userId);

	const parsed = createAppointmentSchema.safeParse({
		organizationId: field("organizationId", formData),
		patientId: field("patientId", formData),
		patientName: field("patientName", formData),
		reason: field("reason", formData),
		department: field("department", formData),
		scheduledAt: field("scheduledAt", formData),
		channel: field("channel", formData),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;

	/* validate ownership of organizationId */
	if (d.organizationId !== orgId) {
		throw new Error("Organization mismatch.");
	}

	let patientId = d.patientId;
	if (!patientId && d.patientName) {
		const existingPatient = await prisma.patient.findFirst({
			where: { organizationId: orgId, name: d.patientName },
			select: { id: true },
		});

		if (existingPatient) {
			patientId = existingPatient.id;
		} else {
			const createdPatient = await prisma.patient.create({
				data: {
					organizationId: orgId,
					name: d.patientName,
					preferredLanguage: "English",
					riskLevel: "standard",
				},
				select: { id: true },
			});
			patientId = createdPatient.id;
		}
	}

	if (!patientId) {
		throw new Error("Patient is required.");
	}

	const appointment = await prisma.appointment.create({
		data: {
			organizationId: orgId,
			patientId,
			department: d.department,
			scheduledAt: new Date(d.scheduledAt),
			channel: d.channel,
			status: "scheduled",
			durationMinutes: 30,
			confirmationSent: true,
			calendarSynced: true,
		},
	});

	await prisma.notification.create({
		data: {
			organizationId: orgId,
			patientId,
			appointmentId: appointment.id,
			kind: "sms_confirmation",
			channel: "sms",
			title: "Appointment confirmed",
			body: d.reason
				? `Your appointment for ${d.reason.toLowerCase()} has been booked and calendar sync is complete.`
				: "Your appointment has been booked and calendar sync is complete.",
			status: "unread",
			scheduledAt: appointment.scheduledAt,
		},
	});

	revalidatePath("/user/booking");
	revalidatePath("/user/dashboard");
}

/* ---- notifications ---- */

export async function toggleNotificationReadAction(formData: FormData) {
	const session = await requireSession("user");
	const orgId = await getOwnedOrganization(session.userId);

	const parsed = toggleNotificationSchema.safeParse({
		notificationId: field("notificationId", formData),
		status: field("status", formData),
		organizationId: field("organizationId", formData),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;

	if (d.organizationId !== orgId) {
		throw new Error("Organization mismatch.");
	}

	/* ensure notification belongs to the org */
	const notif = await prisma.notification.findFirst({
		where: { id: d.notificationId, organizationId: orgId },
		select: { id: true },
	});

	if (!notif) {
		throw new Error("Notification not found.");
	}

	await prisma.notification.update({
		where: { id: d.notificationId },
		data: {
			status: d.status,
			readAt: d.status === "read" ? new Date() : null,
		},
	});

	revalidatePath("/user/dashboard");
}

/* ---- bot settings ---- */

export async function updateBotBasicSettingsAction(formData: FormData) {
	const session = await requireSession("user");

	const parsed = botBasicSettingsSchema.safeParse({
		botSettingsId: field("botSettingsId", formData),
		botName: field("botName", formData),
		voiceModelName: field("voiceModelName", formData),
		accent: field("accent", formData),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;
	await getOwnedBotSettings(d.botSettingsId, session.userId);

	await prisma.botSettings.update({
		where: { id: d.botSettingsId },
		data: {
			botName: d.botName,
			language: "English",
			accent: d.accent,
			voiceModelName: d.voiceModelName,
		},
	});

	revalidatePath("/user/ai-bot-settings");
}

export async function updateBotBehaviorAction(formData: FormData) {
	const session = await requireSession("user");

	const parsed = botBehaviorSchema.safeParse({
		botSettingsId: field("botSettingsId", formData),
		instructions: field("instructions", formData),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;
	await getOwnedBotSettings(d.botSettingsId, session.userId);

	await prisma.botSettings.update({
		where: { id: d.botSettingsId },
		data: {
			instructions: d.instructions,
		},
	});

	revalidatePath("/user/ai-bot-settings");
}

export async function updateBotIntegrationSettingsAction(formData: FormData) {
	const session = await requireSession("user");

	const parsed = botIntegrationSchema.safeParse({
		botSettingsId: field("botSettingsId", formData),
		crmSyncEnabled: field("crmSyncEnabled", formData),
		calendarSyncEnabled: field("calendarSyncEnabled", formData),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;
	await getOwnedBotSettings(d.botSettingsId, session.userId);

	await prisma.botSettings.update({
		where: { id: d.botSettingsId },
		data: {
			crmSyncEnabled: d.crmSyncEnabled,
			calendarSyncEnabled: d.calendarSyncEnabled,
		},
	});

	revalidatePath("/user/ai-bot-settings");
}

export async function updateUrgentNotificationSettingsAction(
	formData: FormData,
) {
	const session = await requireSession("user");

	const parsed = urgentNotificationSchema.safeParse({
		botSettingsId: field("botSettingsId", formData),
		notifyTargetType: field("notifyTargetType", formData),
		urgentTeamMemberId: field("urgentTeamMemberId", formData),
		contactName: field("contactName", formData),
		contactEmail: field("contactEmail", formData),
		emailTemplate: field("emailTemplate", formData),
		smsTemplate: field("smsTemplate", formData),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;
	await getOwnedBotSettings(d.botSettingsId, session.userId);

	await prisma.botSettings.update({
		where: { id: d.botSettingsId },
		data: {
			notifyTargetType: d.notifyTargetType,
			urgentTeamMemberId: d.urgentTeamMemberId || null,
			contactName: d.contactName || null,
			contactEmail: d.contactEmail || null,
			emailTemplate: d.emailTemplate,
			smsTemplate: d.smsTemplate,
		},
	});

	revalidatePath("/user/ai-bot-settings");
}

export async function createBotLiveNumberAction(formData: FormData) {
	const session = await requireSession("user");

	const parsed = botLiveNumberSchema.safeParse({
		botSettingsId: field("botSettingsId", formData),
		phoneNumber: field("phoneNumber", formData),
		status: field("status", formData),
		assignedWorkflowOrDepartment: field(
			"assignedWorkflowOrDepartment",
			formData,
		),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;
	await getOwnedBotSettings(d.botSettingsId, session.userId);

	await prisma.botLiveNumber.create({
		data: {
			botSettingsId: d.botSettingsId,
			phoneNumber: d.phoneNumber,
			status: d.status,
			assignedWorkflowOrDepartment: d.assignedWorkflowOrDepartment,
		},
	});

	revalidatePath("/user/ai-bot-settings");
}

export async function updateBotLiveNumberAction(formData: FormData) {
	const session = await requireSession("user");

	const parsed = botLiveNumberSchema.safeParse({
		botSettingsId: field("botSettingsId", formData),
		phoneNumber: field("phoneNumber", formData),
		status: field("status", formData),
		assignedWorkflowOrDepartment: field(
			"assignedWorkflowOrDepartment",
			formData,
		),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;
	const liveNumberId = toStringValue(formData.get("liveNumberId"));
	if (!liveNumberId) throw new Error("Missing live number id.");

	await getOwnedBotSettings(d.botSettingsId, session.userId);

	await prisma.botLiveNumber.updateMany({
		where: { id: liveNumberId, botSettingsId: d.botSettingsId },
		data: {
			phoneNumber: d.phoneNumber,
			status: d.status,
			assignedWorkflowOrDepartment: d.assignedWorkflowOrDepartment,
		},
	});

	revalidatePath("/user/ai-bot-settings");
}

export async function deleteBotLiveNumberAction(formData: FormData) {
	const session = await requireSession("user");

	const parsed = deleteBotLiveNumberSchema.safeParse({
		botSettingsId: field("botSettingsId", formData),
		liveNumberId: field("liveNumberId", formData),
	});

	if (!parsed.success) {
		throw new Error(formatZodError(parsed.error));
	}

	const d = parsed.data;
	await getOwnedBotSettings(d.botSettingsId, session.userId);

	await prisma.botLiveNumber.deleteMany({
		where: { id: d.liveNumberId, botSettingsId: d.botSettingsId },
	});

	revalidatePath("/user/ai-bot-settings");
}
