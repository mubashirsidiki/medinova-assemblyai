"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TestState = "idle" | "running" | "paused" | "ended";

interface Message {
	role: "agent" | "user";
	text: string;
}

const script: Message[] = [
	{
		role: "agent",
		text: "Hello, thank you for calling Medinova. How can I assist you today?",
	},
	{ role: "user", text: "Hi, I'd like to book an appointment." },
	{
		role: "agent",
		text: "Sure, I can help with that. May I have your full name and date of birth?",
	},
	{ role: "user", text: "Oliver Bennett, 12 March 1990." },
	{
		role: "agent",
		text: "Thank you, Oliver. What type of appointment would you like to schedule?",
	},
	{ role: "user", text: "A general consultation." },
	{
		role: "agent",
		text: "Do you have a preferred doctor, or should I book the next available slot?",
	},
	{ role: "user", text: "Next available is fine." },
	{
		role: "agent",
		text: "Let me check… The next available appointment is tomorrow at 11:00 AM.",
	},
	{
		role: "agent",
		text: "Your appointment has been successfully booked for tomorrow at 11:00 AM.",
	},
	{
		role: "agent",
		text: "You will receive a confirmation and reminder via SMS shortly.",
	},
	{
		role: "agent",
		text: "Is there anything else I can assist you with today?",
	},
	{ role: "user", text: "No, that's all." },
	{ role: "agent", text: "Thank you for choosing Medinova. Have a great day!" },
];

const TYPE_SPEED_MS = 32;
const MESSAGE_PAUSE_MS = 600;

export function BotTestLab() {
	const [state, setState] = useState<TestState>("idle");
	const [tick, setTick] = useState(0);
	const [msgIdx, setMsgIdx] = useState(0);
	const [charIdx, setCharIdx] = useState(0);
	const [betweenMessages, setBetweenMessages] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const done = msgIdx >= script.length;

	/* ---- typewriter engine ---- */
	useEffect(() => {
		if (state !== "running" || done) {
			if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
			if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
			return;
		}

		if (betweenMessages) {
			pauseTimerRef.current = setTimeout(() => {
				setBetweenMessages(false);
				setMsgIdx((i) => i + 1);
				setCharIdx(0);
			}, MESSAGE_PAUSE_MS);
			return;
		}

		const currentMsg = script[msgIdx];
		if (!currentMsg) return;

		if (charIdx < currentMsg.text.length) {
			typeTimerRef.current = setTimeout(() => {
				setCharIdx((c) => c + 1);
			}, TYPE_SPEED_MS);
		} else {
			pauseTimerRef.current = setTimeout(() => {
				setBetweenMessages(true);
			}, 0);
		}

		return () => {
			if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
			if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
		};
	}, [state, msgIdx, charIdx, betweenMessages, done]);

	/* ---- orb animation ---- */
	const amplitude = useMemo(() => {
		if (state !== "running") return 1;
		return 1 + ((tick % 4) + 1) / 25;
	}, [state, tick]);

	/* ---- orb pulse tick ---- */
	useEffect(() => {
		if (state !== "running") return;
		const interval = setInterval(() => setTick((c) => c + 1), 1300);
		return () => clearInterval(interval);
	}, [state]);

	/* ---- auto-scroll ---- */
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, []);

	/* ---- helpers to render transcript lines ---- */
	const typedSoFar =
		msgIdx < script.length ? script[msgIdx].text.slice(0, charIdx) : "";

	const visibleMessages: Message[] = [];
	for (let i = 0; i < msgIdx; i++) {
		visibleMessages.push(script[i]);
	}

	const handleEnd = () => {
		setState("ended");
		setMsgIdx(0);
		setCharIdx(0);
		setBetweenMessages(false);
		setTick(0);
	};

	return (
		<div className="bot-test-grid">
			{/* ---- left: orb ---- */}
			<div className="bot-orb-wrap">
				<div className="bot-orb-stage">
					<div
						className={`bot-orb ${state}`}
						style={{ transform: `scale(${amplitude})` }}
						aria-hidden="true"
					/>
				</div>
				<small className="subtle">
					{state === "idle" && "Ready to run a voice interaction"}
					{state === "running" && "Listening and processing"}
					{state === "paused" && "Interaction paused"}
					{state === "ended" && "Interaction ended"}
				</small>
				<div className="control-row">
					<button
						className="action-btn primary"
						type="button"
						onClick={() => setState("running")}
					>
						Start
					</button>
					<button
						className="action-btn"
						type="button"
						onClick={() => setState("paused")}
					>
						Pause
					</button>
					<button className="action-btn" type="button" onClick={handleEnd}>
						End
					</button>
				</div>
			</div>

			{/* ---- right: single transcript card ---- */}
			<div className="card card-pad transcript-card">
				<strong>Live Transcription Preview</strong>
				<div className="transcript-chat" ref={scrollRef}>
					{state === "idle" ? (
						<small className="subtle">
							Start simulation to see live transcription.
						</small>
					) : (
						<>
							{visibleMessages.map((m, i) => (
								<div className={`transcript-line ${m.role}`} key={i}>
									<span className="transcript-label">
										{m.role === "agent" ? "Medinova Voice" : "Your Response"}:
									</span>{" "}
									{m.text}
								</div>
							))}
							{!done && typedSoFar.length > 0 && (
								<div className={`transcript-line ${script[msgIdx].role}`}>
									<span className="transcript-label">
										{script[msgIdx].role === "agent"
											? "Medinova Voice"
											: "Your Response"}
										:
									</span>{" "}
									{typedSoFar}
									<span className="transcript-cursor" />
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
