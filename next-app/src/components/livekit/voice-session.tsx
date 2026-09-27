"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./voice-session.css";
import {
	useSession,
	useSessionContext,
	useSessionMessages,
} from "@livekit/components-react";
import { TokenSource } from "livekit-client";
import { AgentSessionProvider } from "./agent-session-provider";
import { PostCallView } from "./post-call-view";
import { SessionView } from "./session-view";
import type { TranscriptMessage } from "./transcription-collector";
import { WelcomeView } from "./welcome-view";

const LOG = "[Medinova Voice]";

type ViewState = "welcome" | "connected" | "post-call";

interface CapturedCallData {
	transcript: TranscriptMessage[];
	callStartTime: number | null;
	roomName: string | null;
}

export function VoiceSession({
	botName,
	defaultCallerPhone = "+1 484 481 2043",
}: {
	botName: string;
	defaultCallerPhone?: string;
}) {
	return (
		<VoiceSessionInner
			botName={botName}
			defaultCallerPhone={defaultCallerPhone}
		/>
	);
}

function VoiceSessionInner({
	botName,
	defaultCallerPhone = "+1 484 481 2043",
}: {
	botName: string;
	defaultCallerPhone?: string;
}) {
	const [callerPhone] = useState(defaultCallerPhone);
	const tokenSource = useMemo(
		() =>
			TokenSource.endpoint(
				`/api/livekit/token?callerPhone=${encodeURIComponent(callerPhone)}`,
			),
		[callerPhone],
	);
	const session = useSession(tokenSource);

	useEffect(() => {
		console.log(LOG, "useSession state:", {
			isConnected: session.isConnected,
			connectionState: session.connectionState,
			room: session.room?.name ?? null,
			callerPhone,
		});
	}, [session.isConnected, session.connectionState, session.room, callerPhone]);

	return (
		<AgentSessionProvider session={session}>
			<ViewController botName={botName} callerPhone={callerPhone} />
		</AgentSessionProvider>
	);
}

function ViewController({
	botName,
	callerPhone,
}: {
	botName: string;
	callerPhone?: string;
}) {
	const session = useSessionContext();
	const { isConnected, start, end, room, connectionState } = session;
	const isConnecting = connectionState === "connecting";
	const { messages } = useSessionMessages(session);

	const [viewState, setViewState] = useState<ViewState>("welcome");
	const [capturedData, setCapturedData] = useState<CapturedCallData>({
		transcript: [],
		callStartTime: null,
		roomName: null,
	});

	const callStartTimeRef = useRef<number | null>(null);
	const transcriptRef = useRef<TranscriptMessage[]>([]);

	const transcript = useMemo<TranscriptMessage[]>(() => {
		return messages.map((msg) => ({
			id: msg.id,
			text: msg.message,
			isUser: !!msg.from?.isLocal,
			timestamp: msg.timestamp,
		}));
	}, [messages]);

	// Keep transcriptRef.current in sync for post-call view capture
	useEffect(() => {
		transcriptRef.current = transcript;
	}, [transcript]);

	// Track when user connects
	useEffect(() => {
		if (isConnected && viewState === "welcome") {
			callStartTimeRef.current = Date.now();
			console.log(LOG, "Connected - room:", room?.name);
			setTimeout(() => {
				setViewState("connected");
			}, 0);
		}
		if (isConnected && room?.name) {
			const roomName = room.name;
			setTimeout(() => {
				setCapturedData((prev) => ({ ...prev, roomName }));
			}, 0);
		}
	}, [isConnected, viewState, room]);

	// Detect unexpected disconnect
	useEffect(() => {
		if (!isConnected && viewState === "connected") {
			console.warn(LOG, "Unexpected disconnect - room:", room?.name);
			const captured = {
				transcript: [...transcriptRef.current],
				callStartTime: callStartTimeRef.current,
				roomName: room?.name ?? null,
			};
			setTimeout(() => {
				setCapturedData(captured);
				setViewState("post-call");
			}, 0);
		}
	}, [isConnected, viewState, room]);

	// Intercept manual disconnect - capture transcript BEFORE ending
	const handleDisconnect = useCallback(() => {
		console.log(LOG, "Manual disconnect - capturing transcript");
		setCapturedData({
			transcript: [...transcriptRef.current],
			callStartTime: callStartTimeRef.current,
			roomName: room?.name ?? null,
		});
		end();
		setViewState("post-call");
	}, [end, room]);

	const handleStartNewCall = useCallback(() => {
		console.log(LOG, "Starting new call");
		transcriptRef.current = [];
		callStartTimeRef.current = null;
		setCapturedData({
			transcript: [],
			callStartTime: null,
			roomName: null,
		});
		setViewState("welcome");
	}, []);

	return (
		<>
			{viewState === "welcome" && (
				<WelcomeView
					botName={botName}
					callerPhone={callerPhone}
					onStartCall={start}
					isConnecting={isConnecting}
				/>
			)}
			{viewState === "connected" && (
				<SessionView transcript={transcript} onDisconnect={handleDisconnect} />
			)}
			{viewState === "post-call" && (
				<PostCallView
					transcript={capturedData.transcript}
					callStartTime={capturedData.callStartTime}
					onStartNewCall={handleStartNewCall}
				/>
			)}
		</>
	);
}
