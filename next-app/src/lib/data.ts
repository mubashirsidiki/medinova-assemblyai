import type { SessionPayload } from "./auth";
import { currency, integer } from "./format";
import { prisma } from "./prisma";

let cachedOrgId: string | null = null;

async function getOrganization() {
	if (cachedOrgId) {
		return prisma.organization.findUniqueOrThrow({
			where: { id: cachedOrgId },
		});
	}
	const org = await prisma.organization.findFirstOrThrow({
		orderBy: { createdAt: "asc" },
	});
	cachedOrgId = org.id;
	return org;
}

async function getOrganizationId() {
	if (cachedOrgId) return cachedOrgId;
	const org = await getOrganization();
	return org.id;
}

export function deriveDisplayStatus(call: {
	isSpam: string;
	urgency: string;
	callbackRequired: string;
}) {
	if (call.isSpam === "SPAM") return "not entertained";
	if (call.callbackRequired === "YES") return "marked for followup";
	if (call.urgency === "URGENT" || call.urgency === "HIGH")
		return "warm transferred";
	return "completed";
}

function buildTrend(points: Array<{ label: string; value: number }>) {
	const max = Math.max(...points.map((point) => point.value), 1);
	return points.map((point) => ({
		...point,
		height: Math.max(18, Math.round((point.value / max) * 100)),
	}));
}

function getLastNDates(days: number) {
	return Array.from({ length: days }, (_, index) => {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		date.setDate(date.getDate() - (days - 1 - index));
		return date;
	});
}

export async function getDashboardData() {
	const orgId = await getOrganizationId();

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);

	const [
		org,
		calls,
		appointments,
		notifications,
		usageEvents,
		calls30d,
		appointments30d,
		mtdUsage,
		botSetting,
	] = await Promise.all([
		getOrganization(),
		prisma.callRecord.findMany({
			where: { organizationId: orgId },
			include: {
				patient: {
					select: {
						id: true,
						name: true,
						preferredLanguage: true,
						riskLevel: true,
					},
				},
			},
			orderBy: { startedAt: "desc" },
			take: 8,
		}),
		prisma.appointment.findMany({
			where: { organizationId: orgId },
			include: {
				patient: {
					select: {
						id: true,
						name: true,
						preferredLanguage: true,
						riskLevel: true,
					},
				},
				provider: {
					select: {
						id: true,
						name: true,
						role: true,
						shift: true,
						status: true,
						isActive: true,
					},
				},
			},
			orderBy: { scheduledAt: "asc" },
			take: 6,
		}),
		prisma.notification.findMany({
			where: { organizationId: orgId },
			include: {
				patient: {
					select: { id: true, name: true },
				},
				teamMember: {
					select: { id: true, name: true, role: true },
				},
			},
			orderBy: { createdAt: "desc" },
			take: 6,
		}),
		prisma.usageEvent.findMany({
			where: { organizationId: orgId },
			orderBy: { createdAt: "desc" },
		}),
		prisma.callRecord.findMany({
			where: { organizationId: orgId, startedAt: { gte: thirtyDaysAgo } },
			select: {
				startedAt: true,
				isSpam: true,
				urgency: true,
				callbackRequired: true,
				latencyMs: true,
				costUsd: true,
			},
		}),
		prisma.appointment.findMany({
			where: { organizationId: orgId, scheduledAt: { gte: thirtyDaysAgo } },
			select: { scheduledAt: true },
		}),
		prisma.usageEvent.findMany({
			where: { organizationId: orgId, createdAt: { gte: monthStart } },
			select: { costUsd: true, minutes: true, source: true },
		}),
		prisma.botSettings.findFirst({
			where: { organizationId: orgId },
			include: { liveNumbers: true },
		}),
	]);

	const enriched30d = calls30d.map((c) => ({
		...c,
		displayStatus: deriveDisplayStatus(c),
	}));
	const activeQueue = enriched30d.filter(
		(c) =>
			c.displayStatus === "warm transferred" ||
			c.displayStatus === "marked for followup",
	).length;
	const urgentCalls = calls.filter(
		(call) => call.urgency === "URGENT" || call.urgency === "HIGH",
	).length;
	const followupCalls = calls.filter(
		(call) => call.callbackRequired === "YES",
	).length;
	const averageLatency = Math.round(
		calls.reduce((sum, call) => sum + call.latencyMs, 0) /
			Math.max(calls.length, 1),
	);
	const totalCost = usageEvents.reduce((sum, item) => sum + item.costUsd, 0);
	const totalMinutes = usageEvents.reduce((sum, item) => sum + item.minutes, 0);
	const unreadNotifications = notifications.filter(
		(item) => item.status === "unread",
	).length;

	const callsToday = calls30d.filter(
		(c) => new Date(c.startedAt) >= todayStart,
	).length;
	const queueActive = enriched30d.filter(
		(c) =>
			c.displayStatus === "warm transferred" ||
			c.displayStatus === "marked for followup",
	).length;
	const upcomingAppointments = appointments30d.filter(
		(a) => new Date(a.scheduledAt) >= new Date(),
	).length;
	const appointmentsToday = appointments30d.filter((a) => {
		const d = new Date(a.scheduledAt);
		return d >= todayStart && d < new Date(todayStart.getTime() + 86_400_000);
	}).length;
	const mtdCost = mtdUsage.reduce((sum, e) => sum + e.costUsd, 0);
	const avgCostPerCall = calls30d.length ? mtdCost / calls30d.length : 0;

	const completed30d = enriched30d.filter(
		(c) => c.displayStatus === "completed",
	).length;
	const urgent30d = calls30d.filter(
		(c) => c.urgency === "URGENT" || c.urgency === "HIGH",
	).length;
	const warmTransferred30d = enriched30d.filter(
		(c) => c.displayStatus === "warm transferred",
	).length;

	const analyticsAvgLatency = calls30d.length
		? Math.round(
				calls30d.reduce((sum, c) => sum + c.latencyMs, 0) / calls30d.length,
			)
		: 0;

	const costBySource = mtdUsage.reduce<Record<string, number>>((acc, e) => {
		acc[e.source] = (acc[e.source] ?? 0) + e.costUsd;
		return acc;
	}, {});
	const topSourceEntry = Object.entries(costBySource).sort(
		(a, b) => b[1] - a[1],
	)[0];

	const botSummary = botSetting
		? {
				botName: botSetting.botName,
				voiceModel: botSetting.voiceModelName,
				liveNumbersCount: botSetting.liveNumbers.filter(
					(n) => n.status === "active",
				).length,
			}
		: null;

	return {
		org,
		stats: {
			activeQueue,
			urgentCalls,
			followupCalls,
			averageLatency,
			totalCost,
			totalMinutes,
			unreadNotifications,
		},
		recentCalls: calls.slice(0, 5),
		appointments,
		notifications,
		usageEvents,
		heroStats: {
			queueActive,
			callsToday,
			upcomingAppointments,
			appointmentsToday,
			mtdCost,
			avgCostPerCall,
		},
		callSummary: {
			total30d: calls30d.length,
			completed30d,
			urgent30d,
			warmTransferred30d,
		},
		bookingSummary: {
			upcomingCount: upcomingAppointments,
			todayCount: appointmentsToday,
			scheduled30d: appointments30d.length,
		},
		analyticsSummary: {
			totalCalls: calls30d.length,
			urgentRate: calls30d.length
				? Math.round((urgent30d / calls30d.length) * 100)
				: 0,
			warmTransferCalls: warmTransferred30d,
			avgLatency: analyticsAvgLatency,
		},
		costSummary: {
			mtdCost,
			avgCostPerCall,
			totalMinutes,
			topSource: topSourceEntry?.[0] ?? "N/A",
		},
		botSummary,
	};
}
export async function getCallsData(page = 1, pageSize = 10) {
	const orgId = await getOrganizationId();
	const skip = (page - 1) * pageSize;

	const [calls, total, urgentCalls, followup, spamBlocked] = await Promise.all([
		prisma.callRecord.findMany({
			where: { organizationId: orgId },
			orderBy: { startedAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.callRecord.count({ where: { organizationId: orgId } }),
		prisma.callRecord.count({
			where: { organizationId: orgId, urgency: { in: ["URGENT", "HIGH"] } },
		}),
		prisma.callRecord.count({
			where: { organizationId: orgId, callbackRequired: "YES" },
		}),
		prisma.callRecord.count({
			where: { organizationId: orgId, isSpam: "SPAM" },
		}),
	]);

	return {
		calls,
		total,
		kpis: { urgentCalls, followup, spamBlocked },
	};
}
export async function getBookingData() {
	const orgId = await getOrganizationId();
	const [org, [appointments, patients, notifications]] = await Promise.all([
		getOrganization(),
		Promise.all([
			prisma.appointment.findMany({
				where: { organizationId: orgId },
				include: { patient: true, provider: true },
				orderBy: { scheduledAt: "asc" },
			}),
			prisma.patient.findMany({
				where: { organizationId: orgId },
				orderBy: { name: "asc" },
			}),
			prisma.notification.findMany({
				where: {
					organizationId: orgId,
					kind: { in: ["sms_confirmation", "email_confirmation"] },
				},
				orderBy: { createdAt: "desc" },
				take: 4,
			}),
		]),
	]);

	return { org, appointments, patients, notifications };
}
export async function getAnalyticsData() {
	const orgId = await getOrganizationId();

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const [org, [calls, appointments]] = await Promise.all([
		getOrganization(),
		Promise.all([
			prisma.callRecord.findMany({
				where: { organizationId: orgId, startedAt: { gte: sevenDaysAgo } },
				orderBy: { startedAt: "asc" },
			}),
			prisma.appointment.findMany({
				where: { organizationId: orgId },
				select: {
					scheduledAt: true,
					confirmationSent: true,
					calendarSynced: true,
				},
				orderBy: { scheduledAt: "asc" },
			}),
		]),
	]);

	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date();
		date.setDate(date.getDate() - (6 - index));
		const key = date.toDateString();
		const dayCalls = calls.filter(
			(call) => new Date(call.startedAt).toDateString() === key,
		);
		return {
			label: date.toLocaleDateString("en-US", { weekday: "short" }),
			handled: dayCalls.length,
			urgent: dayCalls.filter(
				(call) => call.urgency === "URGENT" || call.urgency === "HIGH",
			).length,
			latency: Math.round(
				dayCalls.reduce((sum, call) => sum + call.latencyMs, 0) /
					Math.max(dayCalls.length, 1) || 0,
			),
		};
	});

	const classifications = calls.reduce<Record<string, number>>((acc, call) => {
		const label = call.intent || "unclassified";
		acc[label] = (acc[label] ?? 0) + 1;
		return acc;
	}, {});

	const totalCalls = calls.length;
	const followupCalls = calls.filter(
		(call) => call.callbackRequired === "YES",
	).length;
	const notEntertainedCalls = calls.filter(
		(call) => call.isSpam === "SPAM",
	).length;
	const urgentCalls = calls.filter(
		(call) => call.urgency === "URGENT" || call.urgency === "HIGH",
	).length;
	const enrichedCalls = calls.map((c) => ({
		...c,
		displayStatus: deriveDisplayStatus(c),
	}));
	const warmTransferCalls = enrichedCalls.filter(
		(c) => c.displayStatus === "warm transferred",
	).length;
	const resolvedCalls = enrichedCalls.filter(
		(c) =>
			c.displayStatus === "completed" ||
			c.displayStatus === "warm transferred" ||
			c.displayStatus === "not entertained",
	);
	const autoHandledCalls = enrichedCalls.filter(
		(c) => c.displayStatus === "completed",
	).length;
	const confirmedAppointments = appointments.filter(
		(appointment) => appointment.confirmationSent,
	).length;
	const syncedAppointments = appointments.filter(
		(appointment) => appointment.calendarSynced,
	).length;

	const conversionMarkers = [
		{
			label: "Follow-up rate",
			detail: "Calls marked for follow-up",
			value: `${((followupCalls / Math.max(totalCalls, 1)) * 100).toFixed(1)}%`,
		},
		{
			label: "Not entertained rate",
			detail: "Calls tagged as spam",
			value: `${((notEntertainedCalls / Math.max(totalCalls, 1)) * 100).toFixed(1)}%`,
		},
		{
			label: "Calendar sync rate",
			detail: "Appointments synced to calendar",
			value: `${((syncedAppointments / Math.max(appointments.length, 1)) * 100).toFixed(1)}%`,
		},
	];

	const serviceLevels = [
		{
			label: "Average first response",
			detail: "Mean call latency across records",
			value: `${Math.round(
				calls.reduce((sum, call) => sum + call.latencyMs, 0) /
					Math.max(totalCalls, 1),
			)} ms`,
		},
		{
			label: "Average handle time",
			detail: "Mean duration for resolved calls",
			value: `${(
				resolvedCalls.reduce((sum, call) => sum + call.durationSeconds, 0) /
					Math.max(resolvedCalls.length, 1) /
					60
			).toFixed(1)} min`,
		},
		{
			label: "Auto-handled rate",
			detail: "Resolved without warm transfer",
			value: `${((autoHandledCalls / Math.max(resolvedCalls.length, 1)) * 100).toFixed(1)}%`,
		},
	];

	const spamCalls = calls.filter((call) => call.isSpam === "SPAM").length;

	const overview = {
		totalCalls,
		urgentCalls,
		warmTransferCalls,
		spamCalls,
		appointmentCount: appointments.length,
		confirmationRate: Math.round(
			(confirmedAppointments / Math.max(appointments.length, 1)) * 100,
		),
		urgentRate: Math.round((urgentCalls / Math.max(totalCalls, 1)) * 100),
		spamRate: Math.round((spamCalls / Math.max(totalCalls, 1)) * 100),
	};

	return {
		org,
		calls,
		appointments,
		days,
		classifications,
		dailyTrend: buildTrend(
			days.map((day) => ({ label: day.label, value: day.handled })),
		),
		conversionMarkers,
		serviceLevels,
		overview,
	};
}

export async function getCostsData(page = 1, pageSize = 10) {
	const orgId = await getOrganizationId();
	const skip = (page - 1) * pageSize;

	const [org, [rawCalls, allCostFields, total]] = await Promise.all([
		getOrganization(),
		Promise.all([
			prisma.callRecord.findMany({
				where: { organizationId: orgId },
				include: { patient: true },
				orderBy: { startedAt: "desc" },
				skip,
				take: pageSize,
			}),
			prisma.callRecord.findMany({
				where: { organizationId: orgId },
				select: { costUsd: true, durationSeconds: true, id: true },
				orderBy: { costUsd: "desc" },
			}),
			prisma.callRecord.count({ where: { organizationId: orgId } }),
		]),
	]);

	const calls = rawCalls.map((call) => {
		const callMinutes = Math.max(call.durationSeconds / 60, 0);
		const costPerMinute = callMinutes > 0 ? call.costUsd / callMinutes : 0;
		return {
			...call,
			callMinutes,
			costPerMinute,
		};
	});

	const totalCallCost = allCostFields.reduce(
		(sum, call) => sum + call.costUsd,
		0,
	);
	const totalCallMinutes = allCostFields.reduce(
		(sum, call) => sum + call.durationSeconds / 60,
		0,
	);
	const averageCostPerMinute =
		totalCallMinutes > 0 ? totalCallCost / totalCallMinutes : 0;
	const highestCostCallCost = allCostFields.length
		? allCostFields[0].costUsd
		: 0;

	return {
		org,
		calls,
		total,
		totalCallCost,
		totalCallMinutes,
		averageCostPerMinute,
		highestCostCallCost,
	};
}

export async function getAdminStaffMonitorData(page = 1, pageSize = 5) {
	const orgId = await getOrganizationId();
	const skip = (page - 1) * pageSize;

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const [org, [teamMembers, total, calls]] = await Promise.all([
		getOrganization(),
		Promise.all([
			prisma.teamMember.findMany({
				where: { organizationId: orgId },
				skip,
				take: pageSize,
			}),
			prisma.teamMember.count({ where: { organizationId: orgId } }),
			prisma.callRecord.findMany({
				where: { organizationId: orgId, startedAt: { gte: thirtyDaysAgo } },
				select: { startedAt: true, callbackRequired: true },
				orderBy: { startedAt: "asc" },
			}),
		]),
	]);

	const dateWindow = getLastNDates(30);
	const dayRows = dateWindow.map((date) => {
		const key = date.toDateString();
		const dayCalls = calls.filter(
			(call) => new Date(call.startedAt).toDateString() === key,
		);
		const unresolved = dayCalls.filter(
			(call) => call.callbackRequired === "YES",
		).length;
		return {
			label: date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
			handled: dayCalls.length,
			unresolved,
		};
	});

	return {
		org,
		teamMembers,
		total,
		dayRows,
		statusMix: {
			online: teamMembers.filter((item) => item.status === "online").length,
			busy: teamMembers.filter((item) => item.status === "busy").length,
			onCall: teamMembers.filter((item) => item.status === "on-call").length,
			other: teamMembers.filter(
				(item) => !["online", "busy", "on-call"].includes(item.status),
			).length,
		},
	};
}
export async function getAdminBotMonitorData(page = 1, pageSize = 5) {
	const orgId = await getOrganizationId();
	const skip = (page - 1) * pageSize;

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const [org, [botProfiles, total, calls, teamMembers]] = await Promise.all([
		getOrganization(),
		Promise.all([
			prisma.botSettings.findMany({
				where: { organizationId: orgId },
				include: { ownerUser: true, liveNumbers: true },
				orderBy: { updatedAt: "desc" },
				skip,
				take: pageSize,
			}),
			prisma.botSettings.count({ where: { organizationId: orgId } }),
			prisma.callRecord.findMany({
				where: { organizationId: orgId, startedAt: { gte: thirtyDaysAgo } },
				select: {
					startedAt: true,
					urgency: true,
					callbackRequired: true,
					channel: true,
				},
				orderBy: { startedAt: "asc" },
			}),
			prisma.teamMember.findMany({
				where: { organizationId: orgId },
				orderBy: { createdAt: "asc" },
			}),
		]),
	]);

	const dateWindow = getLastNDates(30);
	const escalationTrend = dateWindow.map((date) => {
		const key = date.toDateString();
		const dayCalls = calls.filter(
			(call) => new Date(call.startedAt).toDateString() === key,
		);
		return {
			label: date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
			urgent: dayCalls.filter(
				(call) => call.urgency === "URGENT" || call.urgency === "HIGH",
			).length,
			warmTransfer: dayCalls.filter((call) => call.callbackRequired === "YES")
				.length,
		};
	});

	const liveNumbers = botProfiles.flatMap((profile) => profile.liveNumbers);
	const statusMix = {
		active: liveNumbers.filter((item) => item.status === "active").length,
		paused: liveNumbers.filter((item) => item.status === "paused").length,
		disconnected: liveNumbers.filter((item) => item.status === "disconnected")
			.length,
	};

	const channelMix = calls.reduce<Record<string, number>>((acc, call) => {
		acc[call.channel] = (acc[call.channel] ?? 0) + 1;
		return acc;
	}, {});

	const teamByName = new Map(
		teamMembers.map(
			(member) => [member.name.trim().toLowerCase(), member] as const,
		),
	);

	const botProfilesWithStaff = botProfiles.map((profile) => {
		const ownerName = profile.ownerUser.displayName.trim().toLowerCase();
		const staffMatch = teamByName.get(ownerName) ?? null;
		return {
			...profile,
			staffMember: staffMatch,
		};
	});

	return {
		org,
		botProfiles: botProfilesWithStaff,
		total,
		escalationTrend,
		statusMix,
		channelMix: Object.entries(channelMix).sort((a, b) => b[1] - a[1]),
	};
}

export async function getAdminCostMonitorData() {
	const orgId = await getOrganizationId();

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const [usageEvents, calls] = await Promise.all([
		prisma.usageEvent.findMany({
			where: { organizationId: orgId, createdAt: { gte: thirtyDaysAgo } },
			orderBy: { createdAt: "asc" },
		}),
		prisma.callRecord.findMany({
			where: { organizationId: orgId, startedAt: { gte: thirtyDaysAgo } },
			select: { startedAt: true },
			orderBy: { startedAt: "asc" },
		}),
	]);

	const dateWindow = getLastNDates(30);
	const dailySpend = dateWindow.map((date) => {
		const key = date.toDateString();
		const dayEvents = usageEvents.filter(
			(item) => new Date(item.createdAt).toDateString() === key,
		);
		const dayCalls = calls.filter(
			(item) => new Date(item.startedAt).toDateString() === key,
		);
		const spend = dayEvents.reduce((sum, item) => sum + item.costUsd, 0);
		return {
			label: date.toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
			spend,
			costPerCall: dayCalls.length ? spend / dayCalls.length : 0,
		};
	});

	const spendBySource = usageEvents.reduce<Record<string, number>>(
		(acc, item) => {
			acc[item.source] = (acc[item.source] ?? 0) + item.costUsd;
			return acc;
		},
		{},
	);

	const monthStart = new Date();
	monthStart.setDate(1);
	monthStart.setHours(0, 0, 0, 0);
	const mtdEvents = usageEvents.filter(
		(item) => new Date(item.createdAt) >= monthStart,
	);
	const mtdCost = mtdEvents.reduce((sum, item) => sum + item.costUsd, 0);
	const avgCostPerCall = calls.length
		? usageEvents.reduce((sum, item) => sum + item.costUsd, 0) / calls.length
		: 0;
	const highestCostSourceEntry = Object.entries(spendBySource).sort(
		(a, b) => b[1] - a[1],
	)[0];

	return {
		dailySpend,
		spendBySource: Object.entries(spendBySource).sort((a, b) => b[1] - a[1]),
		kpis: {
			mtdCost,
			avgCostPerCall,
			highestCostSource: highestCostSourceEntry?.[0] ?? "N/A",
			highestCostSourceValue: highestCostSourceEntry?.[1] ?? 0,
		},
	};
}

export async function getAdminMonitorOverviewData() {
	const [staff, bots, cost] = await Promise.all([
		getAdminStaffMonitorData(),
		getAdminBotMonitorData(),
		getAdminCostMonitorData(),
	]);

	const staffHandled30d = staff.dayRows.reduce(
		(sum, row) => sum + row.handled,
		0,
	);
	const staffUnresolved30d = staff.dayRows.reduce(
		(sum, row) => sum + row.unresolved,
		0,
	);
	const staffPeak = staff.dayRows.reduce(
		(max, row) => (row.handled > max.handled ? row : max),
		staff.dayRows[0],
	);
	const botUrgent30d = bots.escalationTrend.reduce(
		(sum, row) => sum + row.urgent,
		0,
	);
	const botWarm30d = bots.escalationTrend.reduce(
		(sum, row) => sum + row.warmTransfer,
		0,
	);
	const cost30dTotal = cost.dailySpend.reduce((sum, row) => sum + row.spend, 0);

	return {
		org: staff.org,
		staffSummary: {
			teamCount: staff.teamMembers.length,
			onlineCount: staff.statusMix.online,
			unresolvedLatest:
				staff.dayRows[staff.dayRows.length - 1]?.unresolved ?? 0,
			handled30d: staffHandled30d,
			unresolved30d: staffUnresolved30d,
			peakLabel: staffPeak?.label ?? "N/A",
			peakHandled: staffPeak?.handled ?? 0,
		},
		botSummary: {
			profileCount: bots.botProfiles.length,
			activeNumbers: bots.statusMix.active,
			urgentLatest:
				bots.escalationTrend[bots.escalationTrend.length - 1]?.urgent ?? 0,
			pausedNumbers: bots.statusMix.paused,
			disconnectedNumbers: bots.statusMix.disconnected,
			urgent30d: botUrgent30d,
			warm30d: botWarm30d,
		},
		costSummary: {
			mtdCost: cost.kpis.mtdCost,
			avgCostPerCall: cost.kpis.avgCostPerCall,
			highestCostSource: cost.kpis.highestCostSource,
			highestCostSourceValue: cost.kpis.highestCostSourceValue,
			total30d: cost30dTotal,
		},
	};
}
export async function getBotSettingsData(session: SessionPayload) {
	const account = await prisma.authUser.findUnique({
		where: { id: session.userId },
		select: { id: true, organizationId: true },
	});

	if (!account) {
		throw new Error("Authenticated user was not found.");
	}

	const [org, settings, teamMembers, voiceModels] = await Promise.all([
		prisma.organization.findUniqueOrThrow({
			where: { id: account.organizationId },
		}),
		prisma.botSettings.upsert({
			where: {
				organizationId_ownerUserId: {
					organizationId: account.organizationId,
					ownerUserId: account.id,
				},
			},
			update: {},
			create: {
				organizationId: account.organizationId,
				ownerUserId: account.id,
				botName: "Medinova Assistant",
			},
			include: {
				liveNumbers: {
					orderBy: { createdAt: "asc" },
				},
			},
		}),
		prisma.teamMember.findMany({
			where: { organizationId: account.organizationId, isActive: true },
			orderBy: { name: "asc" },
		}),
		prisma.voiceModel.findMany({
			orderBy: { sortOrder: "asc" },
		}),
	]);

	return { org, settings, teamMembers, voiceModels };
}

export { currency, integer };
