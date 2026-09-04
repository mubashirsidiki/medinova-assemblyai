"use client";

import { Check, Copy, FileText, ListChecks, User, X } from "lucide-react";
import { useCallback, useState } from "react";
import styles from "@/app/(auth)/user/calls/calls.module.css";

interface TranscriptModalProps {
	transcript: string | null;
	callerName: string;
	nextSteps?: string | null;
}

export function TranscriptModal({
	transcript,
	callerName,
	nextSteps,
}: TranscriptModalProps) {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		if (!transcript) return;
		navigator.clipboard.writeText(transcript);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [transcript]);

	const stepsArray = nextSteps
		? nextSteps
				.split(";")
				.map((s) => s.trim())
				.filter(Boolean)
		: [];

	if (!transcript && !nextSteps) {
		return <span className="subtle">No details</span>;
	}

	return (
		<>
			<button
				type="button"
				className={styles.transcriptBtn}
				onClick={() => setOpen(true)}
			>
				View
			</button>

			{open ? (
				<div
					className={styles.transcriptModalBackdrop}
					onClick={() => setOpen(false)}
				>
					<div
						className={styles.transcriptModal}
						onClick={(e) => e.stopPropagation()}
					>
						<div
							className={styles.transcriptModalHead}
							style={{
								paddingBottom: "16px",
								borderBottom: "1px solid var(--line-2)",
								marginBottom: "16px",
							}}
						>
							<h4
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									margin: 0,
								}}
							>
								<User size={18} style={{ color: "var(--blue)" }} />
								Call Details: {callerName}
							</h4>
							<div
								style={{ display: "flex", alignItems: "center", gap: "12px" }}
							>
								<button
									type="button"
									className={styles.transcriptModalClose}
									onClick={() => setOpen(false)}
								>
									<X size={20} />
								</button>
							</div>
						</div>
						<div
							className={styles.transcriptModalBody}
							style={{ display: "flex", flexDirection: "column", gap: "24px" }}
						>
							{transcript ? (
								<div>
									<h5
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
											margin: "0 0 12px",
											fontSize: "1rem",
											color: "var(--text)",
										}}
									>
										<FileText size={18} style={{ color: "var(--muted)" }} />
										Transcript
										<button
											type="button"
											onClick={handleCopy}
											title="Copy transcript"
											style={{
												background: "none",
												border: "none",
												cursor: "pointer",
												color: copied
													? "var(--green, #10b981)"
													: "var(--muted)",
												display: "flex",
												alignItems: "center",
												transition: "color 0.2s",
												marginLeft: "auto",
												padding: "4px",
											}}
										>
											{copied ? <Check size={16} /> : <Copy size={16} />}
										</button>
									</h5>
									<div
										style={{
											background: "var(--surface-2, #f8f9fa)",
											border: "1px solid var(--line-2, #eaeaea)",
											borderRadius: "12px",
											padding: "16px",
											maxHeight: "60vh",
											overflowY: "auto",
										}}
									>
										<div
											className={styles.transcriptText}
											style={{
												margin: 0,
												fontSize: "0.9rem",
												lineHeight: "1.6",
												color: "var(--text)",
												whiteSpace: "pre-wrap",
											}}
										>
											{transcript.split("\n").map((line, i) => {
												const match = line.match(/^([^:]+):\s*(.*)$/);
												if (match) {
													const speaker = match[1].toLowerCase();
													const isAssistant =
														speaker.includes("agent") ||
														speaker.includes("assistant") ||
														speaker.includes("voice");
													const isUser =
														speaker.includes("user") ||
														speaker.includes("caller") ||
														speaker.includes("patient");
													const speakerColor = isAssistant
														? "var(--blue)"
														: isUser
															? "#10b981"
															: "var(--text)";
													const displayName = isAssistant
														? "Medinova Voice"
														: isUser
															? "Customer"
															: match[1];

													return (
														<div key={i} style={{ marginBottom: "12px" }}>
															<strong
																style={{
																	fontWeight: "700",
																	color: speakerColor,
																	marginRight: "6px",
																}}
															>
																{displayName}:
															</strong>
															<span>{match[2]}</span>
														</div>
													);
												}
												return (
													<div key={i} style={{ marginBottom: "10px" }}>
														{line}
													</div>
												);
											})}
										</div>
									</div>
								</div>
							) : null}
							{stepsArray.length > 0 ? (
								<div>
									<h5
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
											margin: "0 0 12px",
											fontSize: "1rem",
											color: "var(--text)",
										}}
									>
										<ListChecks size={18} style={{ color: "var(--muted)" }} />
										Next Steps
									</h5>
									<div
										style={{
											background: "var(--surface-2, #f8f9fa)",
											border: "1px solid var(--line-2, #eaeaea)",
											borderRadius: "12px",
											padding: "16px",
										}}
									>
										<ul
											style={{
												margin: 0,
												paddingLeft: "20px",
												color: "var(--text)",
												display: "flex",
												flexDirection: "column",
												gap: "8px",
											}}
										>
											{stepsArray.map((step, idx) => (
												<li
													key={idx}
													style={{ fontSize: "0.95rem", lineHeight: "1.5" }}
												>
													{step}
												</li>
											))}
										</ul>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
