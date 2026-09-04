"use client";

import {
	useSessionContext,
	useSessionMessages,
	useVoiceAssistant,
} from "@livekit/components-react";
import { PhoneOff, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TranscriptMessage } from "./transcription-collector";

export function SessionView({
	transcript,
	onDisconnect,
}: {
	transcript: TranscriptMessage[];
	onDisconnect: () => void;
}) {
	const { state } = useVoiceAssistant();
	const session = useSessionContext();
	const { send, isSending } = useSessionMessages(session);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [chatInput, setChatInput] = useState("");

	useEffect(() => {
		const el = scrollRef.current;
		if (el) el.scrollTop = el.scrollHeight;
	}, [transcript]);

	const handleSend = () => {
		const text = chatInput.trim();
		if (!text || isSending) return;
		send(text);
		setChatInput("");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="bot-test-grid">
			{/* Left: orb */}
			<div className="bot-orb-wrap">
				<div className="bot-orb-stage">
					<div className="bot-orb running" aria-hidden="true" />
				</div>
				<small className="subtle">
					{state === "speaking"
						? "Speaking..."
						: state === "listening"
							? "Listening..."
							: "Processing..."}
				</small>
				<div className="control-row">
					<button
						className="action-btn danger"
						type="button"
						onClick={onDisconnect}
					>
						<PhoneOff size={16} />
						End Call
					</button>
				</div>
			</div>

			{/* Right: transcript + chat input */}
			<div className="card card-pad transcript-card">
				<strong>Live Transcription</strong>
				<div className="transcript-chat" ref={scrollRef}>
					{transcript.length === 0 ? (
						<small className="subtle">
							Speak or type to start the conversation.
						</small>
					) : (
						transcript.map((msg) => (
							<div
								key={msg.id}
								className={`transcript-line ${msg.isUser ? "user" : "agent"}`}
							>
								<span className="transcript-label">
									{msg.isUser ? "You" : "Medinova Voice"}:
								</span>{" "}
								{msg.text}
							</div>
						))
					)}
				</div>
				<div className="voice-chat-input-row">
					<input
						type="text"
						className="voice-chat-input"
						placeholder="Type a message..."
						value={chatInput}
						onChange={(e) => setChatInput(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={isSending}
					/>
					<button
						type="button"
						className="voice-chat-send"
						onClick={handleSend}
						disabled={isSending || !chatInput.trim()}
					>
						<SendHorizonal size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}
