import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { addDays, addMinutes, subMinutes } from "date-fns";

const prisma = new PrismaClient();

const orgSeed = {
	name: "Medinova Health Network",
	timezone: "Europe/London",
	industry: "Healthcare",
};

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
	const hash = crypto
		.pbkdf2Sync(password, salt, 120000, 64, "sha512")
		.toString("hex");
	return { salt, hash };
}


const teamSeed = [
	{
		name: "Dr. Eleanor Wright",
		role: "Medical lead",
		shift: "08:00-16:00",
		status: "online",
	},
	{
		name: "Amelia Clarke",
		role: "Care coordinator",
		shift: "09:00-17:00",
		status: "on-call",
	},
	{
		name: "Thomas Reed",
		role: "Support ops",
		shift: "Night shift",
		status: "online",
	},
	{
		name: "Charlotte Bennett",
		role: "Clinic manager",
		shift: "10:00-18:00",
		status: "busy",
	},
	{
		name: "Marc Margulan",
		role: "Operations lead",
		shift: "09:00-17:00",
		status: "online",
	},
];

const patientSeed = [
	{
		name: "Emily Parker",
		preferredLanguage: "English",
		riskLevel: "standard",
	},
	{
		name: "James Walker",
		preferredLanguage: "English",
		riskLevel: "urgent",
	},
	{
		name: "Sophie Turner",
		preferredLanguage: "English",
		riskLevel: "standard",
	},
	{
		name: "Oliver Bennett",
		preferredLanguage: "English",
		riskLevel: "standard",
	},
	{
		name: "Grace Thompson",
		preferredLanguage: "English",
		riskLevel: "high",
	},
];

const DEPARTMENTS = [
	"Cardiology",
	"General Medicine",
	"Endocrinology",
	"Obstetrics",
	"Pediatrics",
];

const LANGUAGES = ["English", "English", "English", "English", "Urdu", "Polish", "Punjabi"];

const CALLER_NAMES = [
	"Emily Parker", "James Walker", "Sophie Turner", "Oliver Bennett", "Grace Thompson",
	"Henry Mitchell", "Chloe Adams", "Daniel Foster", "Lucy Morgan", "William Hughes",
	"Isabella Cooper", "Ethan Richardson", "Mia Clarke", "Alexander Stewart", "Charlotte Morris",
	"Benjamin Hall", "Amelia Young", "Jacob King", "Florence Wright", "Samuel Green",
	"Lily Turner", "Oscar Phillips", "Eva Campbell", "George Parker", "Poppy Wilson",
	"Archie Roberts", "Ivy Walker", "Harry Evans", "Phoebe Thomas", "Charlie Roberts",
	"Ava Davies", "Noah Jackson", "Ruby White", "Jack Thompson", "Ella Wood",
	"Alfie Watson", "Molly Taylor", "Leo Hill", "Jessica Clark", "Finley Harrison",
	"Scarlett Scott", "Arthur Patel", "Chloe Jones", "Freddie Brown", "Maisie Lee",
	"Isaac Martin", "Ellie Anderson", "Oscar Spencer", "Sophia Kelly", "Muhammad Ali",
	"Amna Hussain", "Raj Patel", "Priya Sharma", "Deepak Singh", "Fatima Khan",
];

function leedsPhone() {
	const exchange = `555 ${String(Math.floor(Math.random() * 9000) + 1000)}`;
	return `+44 113 ${exchange}`;
}

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const now = new Date();

function buildCallSeeds() {
	const seeds = [];
	for (let i = 0; i < 100; i++) {
		const isSpam = i < 8 ? "SPAM" : i < 12 ? "NOT_SURE" : "NOT_SPAM";
		const callerName = i < 8 ? "Unknown Caller" : CALLER_NAMES[i % CALLER_NAMES.length];
		const hoursAgo = randomInt(1, 168);
		const durationSeconds = isSpam === "SPAM" ? randomInt(30, 180) : randomInt(120, 900);
		const startedAt = subMinutes(now, hoursAgo * 60 + randomInt(0, 59));
		const endedAt = addMinutes(startedAt, Math.round(durationSeconds / 60));
		const callerPhone = leedsPhone();
		const callerLanguage = pick(LANGUAGES);
		const department = pick(DEPARTMENTS);
		const apptDate = new Date(now.getTime() + randomInt(1, 14) * 86400000).toISOString().split("T")[0];
		const apptTime = `${String(randomInt(9, 16)).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}`;

		let urgency, callbackRequired, intent, callbackReason, nextSteps, transcript;

		if (isSpam === "SPAM") {
			urgency = "LOW";
			callbackRequired = "NO";
			intent = pick([
				"Sales pitch for insurance", "Unsolicited marketing call",
				"PPI claim solicitor", "Survey or prize draw scam",
				"Energy supplier cold call", "Investment opportunity spam",
				"Loan approval telemarketing", "Car warranty sales call",
			]);
			callbackReason = "Spam call — no follow-up required";
			nextSteps = ["Block caller number", "Log as spam in CRM"];
			transcript = `user: Hello?\nassistant: Hello, you've reached Medinova Health Network. How can I help you today?\nuser: I'm calling about a special offer on car insurance...\nassistant: I'm not able to help with that. This is a healthcare line. I'll need to end this call now. Goodbye.`;
		} else if (i >= 12 && i < 18) {
			urgency = "URGENT";
			callbackRequired = "YES";
			intent = pick([
				"Severe chest pain and shortness of breath",
				"Signs of stroke — sudden numbness in face",
				"Heavy bleeding after minor injury",
				"Difficulty breathing with wheezing",
				"Sudden severe headache and confusion",
				"Allergic reaction with swelling",
			]);
			callbackReason = pick([
				"Urgent clinical review required — potential emergency",
				"Doctor callback needed within the hour",
				"Symptoms indicate possible emergency — escalate immediately",
			]);
			nextSteps = pick([
				["Escalate to on-call clinician immediately", "Flag as urgent in patient record", "Send SMS alert to duty doctor"],
				["Transfer to emergency triage nurse", "Log urgency in CRM", "Schedule same-day appointment"],
				["Contact patient within 30 minutes", "Update risk level to urgent", "Notify care coordinator"],
			]);
			transcript = `user: Hello, I need help urgently.\nassistant: I'm here to help. Can you tell me your name please?\nuser: ${callerName}. I'm experiencing ${intent.toLowerCase()}.\nassistant: I'm sorry to hear that. Can you tell me how long you've been experiencing these symptoms?\nuser: It started about an hour ago and it's getting worse.\nassistant: Given what you're describing, I'm flagging this as urgent. I'm going to recommend our ${department} department and ensure a clinician contacts you right away. Please call 999 if symptoms worsen before we call back.\nuser: Thank you, I appreciate it.\nassistant: You're welcome. Take care and don't hesitate to call back.`;
		} else if (i >= 18 && i < 35) {
			urgency = "HIGH";
			callbackRequired = pick(["YES", "YES", "NOT_SURE"]);
			intent = pick([
				"Persistent headache for three days", "Fever that won't go down",
				"Severe lower back pain", "Skin rash spreading quickly",
				"Recurring dizzy spells", "Thyroid medication side effects",
				"High blood sugar readings", "Post-surgery wound redness",
				"Vomiting for over 24 hours", "Ear infection with hearing loss",
				"Anxiety and heart palpitations", "Swollen ankle after fall",
			]);
			callbackReason = callbackRequired === "YES"
				? pick(["Doctor review needed before prescribing", "Lab results require discussion", "Patient requested nurse callback", "Symptoms need clinical assessment"])
				: callbackRequired === "NOT_SURE"
					? "Needs further assessment to determine if follow-up is required"
					: "Symptoms appear manageable — self-care advice given";
			nextSteps = pick([
				["Schedule follow-up appointment", "Send confirmation SMS"],
				["Route to appropriate department", "Log call details in CRM"],
				["Callback from nurse within 2 hours", "Update patient record"],
				["Refer to specialist", "Send referral letter by email"],
				["Book lab tests", "Notify care coordinator"],
			]);
			transcript = `user: Hi, I'm calling about a health concern.\nassistant: Of course. Can I start with your name please?\nuser: ${callerName}.\nassistant: Thank you ${callerName}. What symptoms or health concern are you experiencing?\nuser: ${intent.toLowerCase()}.\nassistant: I'm sorry to hear that. How long have you been experiencing this?\nuser: A few days now, and it's not getting any better.\nassistant: I understand. Based on what you've described, I'd recommend our ${department} department. I can see their next availability. Would you like me to book an appointment?\nuser: Yes please.\nassistant: I've got an appointment on ${apptDate} at ${apptTime}. Does that work for you?\nuser: That's perfect, thank you.\nassistant: You're welcome. We'll send you a confirmation SMS. Is there anything else I can help with?\nuser: No, that's all. Thanks.\nassistant: Take care, ${callerName}. Goodbye.`;
		} else if (i >= 35 && i < 65) {
			urgency = "MEDIUM";
			callbackRequired = pick(["YES", "NO", "NOT_SURE"]);
			intent = pick([
				"Routine check-up appointment request", "Prescription refill needed",
				"Blood test results inquiry", "Follow-up on previous consultation",
				"Vaccination schedule for child", "Prenatal appointment booking",
				"Diabetes management review", "Physiotherapy referral inquiry",
				"Change of address and GP details", "Referral letter status check",
				"MRI scan scheduling", "Diet and nutrition consultation",
				"Repeat prescription authorization", "Travel vaccination advice",
			]);
			callbackReason = callbackRequired === "YES"
				? pick(["Doctor review needed before prescribing", "Patient requested callback for test results", "Follow-up appointment needs scheduling"])
				: callbackRequired === "NOT_SURE"
					? "Needs further assessment to determine follow-up"
					: "Query resolved during call — no follow-up needed";
			nextSteps = pick([
				["Schedule follow-up appointment", "Send confirmation SMS"],
				["Route to appropriate department", "Log call details"],
				["Callback from nurse within 2 hours", "Update patient record"],
				["Book lab tests", "Notify care coordinator"],
			]);
			transcript = `user: Hello, I'd like some help please.\nassistant: Good morning, you've reached Medinova Health. How can I assist you today?\nuser: I'm calling about ${intent.toLowerCase()}.\nassistant: Certainly. Let me take some details. Can I confirm your name?\nuser: ${callerName}.\nassistant: Thank you ${callerName}. And your date of birth?\nuser: ${pick(["12 March 1985", "5 July 1990", "18 November 1978", "23 January 1995", "7 September 1982"])}.\nassistant: Perfect. Let me look into that for you. Our ${department} department handles ${intent.toLowerCase()}. I can book you in on ${apptDate} at ${apptTime}.\nuser: That works for me.\nassistant: Great, you're all booked in. We'll send a confirmation to your phone. Anything else?\nuser: No that's everything, thanks.\nassistant: Thank you for calling Medinova Health. Goodbye!`;
		} else {
			urgency = "LOW";
			callbackRequired = pick(["NO", "NO", "NOT_SURE"]);
			intent = pick([
				"General health inquiry", "Clinic opening hours",
				"Parking and directions to Leeds site", "Test result wait time query",
				"Appointment cancellation", "Insurance coverage question",
				"Feedback about previous visit", "New patient registration inquiry",
				"Ask about telehealth availability", "Query about referral process",
			]);
			callbackReason = callbackRequired === "YES"
				? "Minor follow-up may be needed"
				: callbackRequired === "NOT_SURE"
					? "May need follow-up depending on next steps"
					: "Information provided — no follow-up required";
			nextSteps = pick([
				["Log call details in CRM", "Send info pack to patient"],
				["Update patient record", "No further action required"],
			]);
			transcript = `user: Hi there.\nassistant: Hello, welcome to Medinova Health Network. How can I help you today?\nuser: I just had a quick question about ${intent.toLowerCase()}.\nassistant: Of course, happy to help. Let me look that up for you.\nuser: Thanks.\nassistant: Our ${department} team can assist with that. I've noted your query and you should receive a response shortly. Is there anything else?\nuser: No, that's great. Cheers.\nassistant: Thank you for calling. Have a lovely day!`;
		}

		seeds.push({
			callerName,
			callerPhone,
			callerLanguage,
			intent,
			isSpam,
			urgency,
			callbackRequired,
			callbackRequiredReason: callbackReason,
			recommendedDepartment: department,
			appointmentDate: apptDate,
			appointmentTime: apptTime,
			recommendedNextSteps: nextSteps,
			transcript,
			startedAt,
			endedAt,
			durationSeconds,
			latencyMs: randomInt(200, 450),
			costUsd: Math.round((durationSeconds / 60) * 0.025 * 100) / 100,
		});
	}
	return seeds;
}

async function main() {
	await prisma.notification.deleteMany();
	await prisma.appointment.deleteMany();
	await prisma.callRecord.deleteMany();
	await prisma.usageEvent.deleteMany();
	await prisma.botLiveNumber.deleteMany();
	await prisma.botSettings.deleteMany();
	await prisma.authUser.deleteMany();
	await prisma.teamMember.deleteMany();
	await prisma.patient.deleteMany();
	await prisma.organization.deleteMany();

	const org = await prisma.organization.create({ data: orgSeed });

	const teamMembers = [];
	for (const member of teamSeed) {
		teamMembers.push(
			await prisma.teamMember.create({
				data: { ...member, organizationId: org.id },
			}),
		);
	}

	const patients = [];
	for (const patient of patientSeed) {
		patients.push(
			await prisma.patient.create({
				data: {
					...patient,
					organizationId: org.id,
				},
			}),
		);
	}

	const adminPassword = hashPassword("MediNova#2026Admin");
	const userPassword = hashPassword("MediNova#2026User");

	await prisma.authUser.createMany({
		data: [
			{
				organizationId: org.id,
				email: "marc_margulan@admin.medinova.de",
				displayName: "Medinova Admin",
				role: "admin",
				passwordHash: adminPassword.hash,
				passwordSalt: adminPassword.salt,
				defaultRoute: "/admin",
				isActive: true,
			},
			{
				organizationId: org.id,
				email: "marc_margulan@user.medinova.de",
				displayName: "Marc Margulan",
				role: "user",
				passwordHash: userPassword.hash,
				passwordSalt: userPassword.salt,
				defaultRoute: "/user/dashboard",
				isActive: true,
			},
		],
	});

	const callSeeds = buildCallSeeds();
	const calls = [];
	for (const seed of callSeeds) {
		calls.push(
			await prisma.callRecord.create({
				data: {
					organizationId: org.id,
					patientId: Math.random() > 0.7 ? pick(patients).id : null,
					callerName: seed.callerName,
					callerPhone: seed.callerPhone,
					callerLanguage: seed.callerLanguage,
					intent: seed.intent,
					isSpam: seed.isSpam,
					urgency: seed.urgency,
					callbackRequired: seed.callbackRequired,
					callbackRequiredReason: seed.callbackRequiredReason,
					recommendedDepartment: seed.recommendedDepartment,
					appointmentDate: seed.appointmentDate,
					appointmentTime: seed.appointmentTime,
					recommendedNextSteps: seed.recommendedNextSteps,
					transcript: seed.transcript,
					channel: "voice",
					startedAt: seed.startedAt,
					endedAt: seed.endedAt,
					durationSeconds: seed.durationSeconds,
					latencyMs: seed.latencyMs,
					costUsd: seed.costUsd,
				},
			}),
		);
	}

	const appointment1 = await prisma.appointment.create({
		data: {
			organizationId: org.id,
			patientId: patients[2].id,
			providerId: teamMembers[0].id,
			department: "Cardiology",
			status: "confirmed",
			channel: "voice",
			scheduledAt: addDays(now, 1),
			durationMinutes: 30,
			confirmationSent: true,
			calendarSynced: true,
		},
	});

	const appointment2 = await prisma.appointment.create({
		data: {
			organizationId: org.id,
			patientId: patients[4].id,
			providerId: teamMembers[1].id,
			department: "Endocrinology",
			status: "scheduled",
			channel: "sms",
			scheduledAt: addDays(now, 2),
			durationMinutes: 20,
			confirmationSent: true,
			calendarSynced: true,
		},
	});

	await prisma.notification.createMany({
		data: [
			{
				organizationId: org.id,
				patientId: patients[2].id,
				appointmentId: appointment1.id,
				kind: "sms_confirmation",
				channel: "sms",
				title: "Appointment booked",
				body: "Your cardiology visit is confirmed for tomorrow at 10:30 AM.",
				status: "read",
				scheduledAt: addDays(now, 1),
				readAt: subMinutes(now, 12),
			},
			{
				organizationId: org.id,
				patientId: patients[4].id,
				appointmentId: appointment2.id,
				kind: "email_confirmation",
				channel: "email",
				title: "Follow-up visit scheduled",
				body: "Your endocrinology follow-up is ready and calendar sync completed.",
				status: "unread",
				scheduledAt: addDays(now, 2),
			},
			{
				organizationId: org.id,
				teamMemberId: teamMembers[0].id,
				kind: "urgent_flag",
				channel: "inbox",
				title: "Urgent call flagged",
				body: "James Walker reported chest discomfort and was flagged for callback.",
				status: "unread",
			},
			{
				organizationId: org.id,
				teamMemberId: teamMembers[1].id,
				kind: "daily_summary",
				channel: "email",
				title: "Daily call digest",
				body: "100 calls resolved, 6 urgent, 8 spam blocked.",
				status: "read",
				readAt: subMinutes(now, 48),
			},
			{
				organizationId: org.id,
				patientId: patients[0].id,
				kind: "sms_confirmation",
				channel: "sms",
				title: "Medication refill processed",
				body: "Your refill request has been handled and a callback is queued.",
				status: "read",
				readAt: subMinutes(now, 20),
			},
		],
	});



	await prisma.usageEvent.createMany({
		data: [
			{
				organizationId: org.id,
				source: "twilio",
				minutes: 1240,
				costUsd: 221.4,
			},
			{
				organizationId: org.id,
				source: "twilio",
				minutes: 0,
				costUsd: 18.9,
			},
			{
				organizationId: org.id,
				source: "call-routing",
				minutes: 180,
				costUsd: 42.1,
			},
			{
				organizationId: org.id,
				source: "platform",
				minutes: 0,
				costUsd: 31.0,
			},
			{
				organizationId: org.id,
				source: "integration",
				minutes: 0,
				costUsd: 6.8,
			},
		],
	});


	console.log(
		`Seeded ${org.name} with ${teamMembers.length} team members, ${patients.length} patients, and ${calls.length} calls.`,
	);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
