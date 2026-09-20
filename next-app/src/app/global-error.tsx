"use client";

import "@/app/globals.css";
import { ErrorDisplay } from "@/components/error-display";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "var(--bg, #f4f6fb)",
					fontFamily:
						"Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
				}}
			>
				<ErrorDisplay error={error} reset={reset} />
			</body>
		</html>
	);
}
