"use client";

import {
	RoomAudioRenderer,
	SessionProvider,
	type SessionProviderProps,
	type UseSessionReturn,
} from "@livekit/components-react";

export function AgentSessionProvider({
	session,
	children,
}: {
	session: UseSessionReturn;
	children: React.ReactNode;
} & SessionProviderProps) {
	return (
		<SessionProvider session={session}>
			{children}
			<RoomAudioRenderer />
		</SessionProvider>
	);
}
