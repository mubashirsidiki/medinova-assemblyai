"use client";

import { useCallback, useState } from "react";
import styles from "@/app/(auth)/user/ai-bot-settings/ai-bot-settings.module.css";

interface VoiceModelData {
	id: string;
	name: string;
	tone: string;
	accent: string;
	language: string;
	gender: string;
	sampleAudio: string;
}

export function VoiceModelSelector({
	voiceModels,
	defaultVoiceModelName,
}: {
	voiceModels: VoiceModelData[];
	defaultVoiceModelName: string;
}) {
	const fallback = voiceModels[0] ?? {
		id: "",
		name: defaultVoiceModelName,
		tone: "",
		accent: "",
		language: "",
		gender: "",
		sampleAudio: "",
	};
	const defaultModel =
		voiceModels.find((m) => m.name === defaultVoiceModelName) ?? fallback;

	const [selected, setSelected] = useState<VoiceModelData>(defaultModel);
	const [open, setOpen] = useState(false);

	const pick = useCallback((vm: VoiceModelData) => {
		setSelected(vm);
		setOpen(false);
	}, []);

	return (
		<div className="field">
			<label>Voice model name</label>
			<input type="hidden" name="voiceModelName" value={selected.name} />
			<input type="hidden" name="accent" value={selected.accent} />

			<button
				type="button"
				className={styles.voiceModelTrigger}
				onClick={() => setOpen(true)}
			>
				<span className={styles.voiceModelTriggerName}>{selected.name}</span>
				<span className={styles.voiceModelTriggerAccent}>
					{selected.gender} &middot; {selected.language}
				</span>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path
						d="M6 4L10 8L6 12"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			<div className={styles.voiceModelDetails}>
				<div className={styles.voiceModelAudioRow}>
					<span className={styles.voiceModelLabel}>Sample</span>
					<audio controls preload="none" style={{ width: "100%", height: 32 }}>
						{selected.sampleAudio ? (
							<source src={selected.sampleAudio} type="audio/mpeg" />
						) : null}
					</audio>
				</div>
			</div>

			{open ? (
				<div
					className={styles.voiceModalBackdrop}
					onClick={() => setOpen(false)}
				>
					<div
						className={styles.voiceModal}
						onClick={(e) => e.stopPropagation()}
					>
						<div className={styles.voiceModalHead}>
							<h4>Choose voice model</h4>
							<button
								type="button"
								className={styles.voiceModalClose}
								onClick={() => setOpen(false)}
							>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
									<path
										d="M5 5L15 15M15 5L5 15"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
									/>
								</svg>
							</button>
						</div>
						<div className={styles.voiceModalList}>
							{voiceModels.map((vm) => (
								<button
									key={vm.id}
									type="button"
									className={`${styles.voiceModelCard} ${vm.id === selected.id ? styles.active : ""}`}
									onClick={() => pick(vm)}
								>
									<div className={styles.voiceModelCardTop}>
										<strong>{vm.name}</strong>
										{vm.id === selected.id ? (
											<span className={styles.voiceModelCheck}>Selected</span>
										) : null}
									</div>
									<div className={styles.voiceModelCardTraits}>
										<span>
											<mark>Gender</mark> {vm.gender}
										</span>
										<span>
											<mark>Language</mark> {vm.language}
										</span>
										<span>
											<mark>Accent</mark> {vm.accent}
										</span>
										<span>
											<mark>Tone</mark> {vm.tone}
										</span>
									</div>
									<audio
										controls
										preload="none"
										style={{ width: "100%", height: 30 }}
										onClick={(e) => e.stopPropagation()}
									>
										{vm.sampleAudio ? (
											<source src={vm.sampleAudio} type="audio/mpeg" />
										) : null}
									</audio>
								</button>
							))}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
