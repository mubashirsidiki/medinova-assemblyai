import { RoomConfiguration } from "@livekit/protocol";
import {
	AccessToken,
	type AccessTokenOptions,
	type VideoGrant,
} from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

type ConnectionDetails = {
	serverUrl: string;
	roomName: string;
	participantName: string;
	participantToken: string;
};

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
	try {
		await requireSession("user");

		if (!LIVEKIT_URL) throw new Error("LIVEKIT_URL is not defined");
		if (!API_KEY) throw new Error("LIVEKIT_API_KEY is not defined");
		if (!API_SECRET) throw new Error("LIVEKIT_API_SECRET is not defined");

		const url = new URL(req.url);
		const queryPhone = url.searchParams.get("callerPhone");
		const queryName = url.searchParams.get("callerName");

		const body = await req.json().catch(() => ({}));
		const roomConfig = body?.room_config
			? RoomConfiguration.fromJson(body.room_config, {
					ignoreUnknownFields: true,
				})
			: undefined;

		const callerPhone =
			typeof body?.callerPhone === "string"
				? body.callerPhone.trim()
				: (queryPhone?.trim() ?? undefined);
		const callerName =
			typeof body?.callerName === "string"
				? body.callerName.trim()
				: (queryName?.trim() ?? undefined);

		const participantName = callerName || "user";
		const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
		const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

		console.log("[LiveKit Token] Generating token:", {
			roomName,
			participantIdentity,
			callerPhone: callerPhone ?? "None",
			callerName: callerName ?? "None",
			hasRoomConfig: !!roomConfig,
		});

		const participantToken = await createParticipantToken(
			{ identity: participantIdentity, name: participantName },
			roomName,
			roomConfig,
			callerPhone,
			callerName,
		);

		const data: ConnectionDetails = {
			serverUrl: LIVEKIT_URL,
			roomName,
			participantName,
			participantToken,
		};

		console.log(
			"[LiveKit Token] Token generated successfully for room:",
			roomName,
		);

		return new NextResponse(JSON.stringify(data), {
			headers: {
				"Cache-Control": "no-store",
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error("[LiveKit Token] Error:", error.message);
			return new NextResponse(error.message, { status: 500 });
		}
		console.error("[LiveKit Token] Unknown error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

function createParticipantToken(
	userInfo: AccessTokenOptions,
	roomName: string,
	roomConfig: RoomConfiguration | undefined,
	callerPhone?: string,
	callerName?: string,
): Promise<string> {
	const at = new AccessToken(API_KEY ?? "", API_SECRET ?? "", {
		...userInfo,
		ttl: "15m",
	});
	const grant: VideoGrant = {
		room: roomName,
		roomJoin: true,
		canPublish: true,
		canPublishData: true,
		canSubscribe: true,
	};
	at.addGrant(grant);
	if (roomConfig) at.roomConfig = roomConfig as unknown as typeof at.roomConfig;

	if (callerPhone || callerName) {
		at.attributes = {
			...(callerPhone ? { "sip.phoneNumber": callerPhone, callerPhone } : {}),
			...(callerName ? { callerName } : {}),
		};
		at.metadata = JSON.stringify({
			callerPhone,
			callerName,
		});
	}

	return at.toJwt();
}
