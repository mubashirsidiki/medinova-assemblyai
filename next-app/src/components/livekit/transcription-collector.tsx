"use client";

import { useTranscriptions } from "@livekit/components-react";
import type { Room } from "livekit-client";
import { useCallback, useEffect } from "react";

export interface TranscriptMessage {
	id: string;
	text: string;
	isUser: boolean;
	timestamp: number;
}

export function TranscriptionCollector({
	room,
	onTranscriptsUpdate,
}: {
	room: Room;
	onTranscriptsUpdate: (transcripts: TranscriptMessage[]) => void;
}) {
	const transcriptions = useTranscriptions({ room });

	const update = useCallback(
		(transcripts: TranscriptMessage[]) => {
			onTranscriptsUpdate(transcripts);
		},
		[onTranscriptsUpdate],
	);

	useEffect(() => {
		if (transcriptions.length > 0) {
			console.log(
				"[Medinova Voice] TranscriptionCollector:",
				transcriptions.length,
				"items, latest:",
				transcriptions[transcriptions.length - 1].text?.slice(0, 60),
			);
			update(
				transcriptions.map((t) => ({
					id: t.streamInfo.id,
					text: t.text,
					isUser: t.participantInfo.identity === room.localParticipant.identity,
					timestamp: t.streamInfo.timestamp,
				})),
			);
		}
	}, [transcriptions, room, update]);

	return null;
}
