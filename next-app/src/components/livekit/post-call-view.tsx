"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import type { TranscriptMessage } from "./transcription-collector";

function formatDuration(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes === 0) return `${remainingSeconds}s`;
	return `${minutes}m ${remainingSeconds}s`;
}

export function PostCallView({
	transcript,
	callStartTime,
	onStartNewCall,
}: {
	transcript: TranscriptMessage[];
	callStartTime: number | null;
	onStartNewCall: () => void;
}) {
	const userMessages = transcript.filter((m) => m.isUser);
	const agentMessages = transcript.filter((m) => !m.isUser);
	const [callDuration] = useState(() =>
		callStartTime != null ? Date.now() - callStartTime : 0,
	);

	return (
		<div className="voice-post-call">
			<div className="voice-post-call-header">
				<h3>Call Summary</h3>
				<p>Medinova Health AI Voice Test</p>
			</div>

			<div className="voice-post-call-stats">
				<div className="voice-stat">
					<strong>
						{callStartTime != null ? formatDuration(callDuration) : "—"}
					</strong>
					<small>Duration</small>
				</div>
				<div className="voice-stat">
					<strong>{userMessages.length}</strong>
					<small>Your Messages</small>
				</div>
				<div className="voice-stat">
					<strong>{agentMessages.length}</strong>
					<small>Agent Messages</small>
				</div>
			</div>

			<div className="voice-post-call-transcript">
				<strong>Transcript</strong>
				{transcript.length === 0 ? (
					<small className="subtle">No conversation recorded.</small>
				) : (
					<div className="voice-transcript">
						{transcript.map((msg) => {
							const time = new Date(msg.timestamp);
							const timeStr = time.toLocaleTimeString(undefined, {
								hour: "2-digit",
								minute: "2-digit",
							});
							return (
								<div
									key={msg.id}
									className={`transcript-line ${msg.isUser ? "user" : "agent"}`}
								>
									<span className="transcript-label">
										{msg.isUser ? "You" : "Agent"}
									</span>
									<span className="transcript-time">{timeStr}</span>
									<p>{msg.text}</p>
								</div>
							);
						})}
					</div>
				)}
			</div>

			<div className="control-row voice-controls">
				<button
					className="action-btn primary"
					type="button"
					onClick={onStartNewCall}
					style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
				>
					<RotateCcw size={16} />
					Back to test lobby
				</button>
			</div>
		</div>
	);
}
