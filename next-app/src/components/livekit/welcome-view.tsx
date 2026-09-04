"use client";

import { Loader2, SendHorizonal } from "lucide-react";

export function WelcomeView({
	botName,
	onStartCall,
	isConnecting = false,
}: {
	botName: string;
	onStartCall: () => void;
	isConnecting?: boolean;
}) {
	return (
		<div className="bot-test-grid">
			{/* Left: orb */}
			<div className="bot-orb-wrap">
				<div className="bot-orb-stage">
					<div className="bot-orb" aria-hidden="true" />
				</div>
				<small className="subtle">Ready to test {botName}</small>
				<div className="control-row">
					<button
						className="action-btn primary voice-start-btn"
						type="button"
						onClick={onStartCall}
						disabled={isConnecting}
						style={{
							display: "inline-flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
						}}
					>
						{isConnecting ? (
							<>
								<Loader2 size={16} className="spin" />
								Connecting...
							</>
						) : (
							"Start bot test"
						)}
					</button>
				</div>
			</div>

			{/* Right: transcript placeholder */}
			<div className="card card-pad transcript-card">
				<strong>Live Transcription Preview</strong>
				<div className="transcript-chat">
					<small className="subtle">
						Start a voice test to see live transcription.
					</small>
				</div>
				<div className="voice-chat-input-row">
					<input
						type="text"
						className="voice-chat-input"
						placeholder="Type a message..."
						disabled
					/>
					<button type="button" className="voice-chat-send" disabled>
						<SendHorizonal size={16} />
					</button>
				</div>
			</div>
		</div>
	);
}
