"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/error-display";

export default function AuthError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Auth section error:", error);
	}, [error]);

	return <ErrorDisplay error={error} reset={reset} />;
}
