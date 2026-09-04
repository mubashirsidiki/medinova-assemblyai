"use client";

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
					fontFamily: "system-ui, sans-serif",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					background: "#f5f6fa",
				}}
			>
				<div style={{ textAlign: "center", padding: 32 }}>
					<h2 style={{ fontSize: 20, marginBottom: 8 }}>
						Something went wrong
					</h2>
					<p style={{ color: "#666", marginBottom: 24 }}>
						{error.message || "An unexpected error occurred."}
					</p>
					<button
						type="button"
						onClick={reset}
						style={{
							padding: "8px 20px",
							borderRadius: 6,
							border: "none",
							background: "#3b6cff",
							color: "#fff",
							cursor: "pointer",
							fontSize: 14,
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
