import { z } from "zod";

/* ===================================================================
   Sanitization helpers
   =================================================================== */

function trim(s: unknown) {
	return typeof s === "string" ? s.trim() : "";
}

function normalizeEmail(s: unknown) {
	const t = trim(s).toLowerCase();
	if (!t || t.length > 254) return null;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : null;
}

/* ===================================================================
   Enum / status constants
   =================================================================== */

export const NOTIFICATION_STATUS = ["unread", "read"] as const;

export const BOT_LIVE_NUMBER_STATUS = [
	"active",
	"paused",
	"disconnected",
] as const;

export const NOTIFY_TARGET_TYPES = ["team_member", "custom_contact"] as const;

/* ===================================================================
   Input validators — server actions
   =================================================================== */

/* login */
export const loginSchema = z.object({
	email: z
		.string()
		.transform(trim)
		.pipe(z.string().min(1, "Email is required")),
	password: z.string().min(1, "Password is required"),
});

/* create appointment */
export const createAppointmentSchema = z
	.object({
		organizationId: z.string().min(1),
		patientId: z.string().optional(),
		patientName: z.string().transform(trim).optional(),
		reason: z.string().transform(trim).pipe(z.string().max(500)).optional(),
		department: z
			.string()
			.transform(trim)
			.pipe(z.string().min(1, "Department is required")),
		scheduledAt: z.string().min(1, "Scheduled date is required"),
		channel: z.enum(["voice", "sms", "web"]).default("voice"),
	})
	.refine((d) => d.patientId || (d.patientName && d.patientName.length > 0), {
		message: "patientId or patientName is required",
		path: ["patientName"],
	});

/* toggle notification read */
export const toggleNotificationSchema = z.object({
	notificationId: z.string().min(1),
	status: z.enum(NOTIFICATION_STATUS),
	organizationId: z.string().min(1),
});

/* bot basic settings */
export const botBasicSettingsSchema = z.object({
	botSettingsId: z.string().min(1),
	botName: z.string().transform(trim).pipe(z.string().min(1).max(80)),
	voiceModelName: z.string().transform(trim).pipe(z.string().min(1).max(80)),
	accent: z
		.string()
		.transform(trim)
		.pipe(z.string().max(40))
		.default("British"),
});

/* bot behavior */
export const botBehaviorSchema = z.object({
	botSettingsId: z.string().min(1),
	instructions: z.string().transform(trim).pipe(z.string().min(1).max(5000)),
});

/* bot integrations */
export const botIntegrationSchema = z.object({
	botSettingsId: z.string().min(1),
	crmSyncEnabled: z.string().transform((v) => v === "true"),
	calendarSyncEnabled: z.string().transform((v) => v === "true"),
});

/* urgent notifications */
export const urgentNotificationSchema = z.object({
	botSettingsId: z.string().min(1),
	notifyTargetType: z.enum(NOTIFY_TARGET_TYPES).default("team_member"),
	urgentTeamMemberId: z.string().transform(trim).optional(),
	contactName: z.string().transform(trim).pipe(z.string().max(80)).optional(),
	contactEmail: z.string().transform(normalizeEmail).optional(),
	emailTemplate: z.string().transform(trim).pipe(z.string().min(1).max(4000)),
	smsTemplate: z.string().transform(trim).pipe(z.string().min(1).max(1000)),
});

/* bot live number */
export const botLiveNumberSchema = z.object({
	botSettingsId: z.string().min(1),
	phoneNumber: z.string().transform(trim).pipe(z.string().min(1).max(20)),
	status: z.enum(BOT_LIVE_NUMBER_STATUS).default("active"),
	assignedWorkflowOrDepartment: z
		.string()
		.transform(trim)
		.pipe(z.string().min(1).max(80)),
});

export const deleteBotLiveNumberSchema = z.object({
	botSettingsId: z.string().min(1),
	liveNumberId: z.string().min(1),
});
