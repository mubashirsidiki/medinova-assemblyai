"use client";

import { useEffect } from "react";

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

	return (
		<div
			className="screen-grid"
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "60vh",
			}}
		>
			<div
				className="card card-pad"
				style={{ textAlign: "center", maxWidth: 400 }}
			>
				<h2>Something went wrong</h2>
				<p style={{ color: "var(--muted)", margin: "8px 0 20px" }}>
					{error.message || "An unexpected error occurred."}
				</p>
				<button type="button" className="action-btn" onClick={reset}>
					Try again
				</button>
			</div>
		</div>
	);
}
