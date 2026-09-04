import Link from "next/link";

export default function NotFound() {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				fontFamily: "system-ui, sans-serif",
				background: "#f5f6fa",
			}}
		>
			<div style={{ textAlign: "center", padding: 32 }}>
				<h1
					style={{ fontSize: 72, fontWeight: 700, color: "#3b6cff", margin: 0 }}
				>
					404
				</h1>
				<h2 style={{ fontSize: 20, margin: "8px 0 4px" }}>Page not found</h2>
				<p style={{ color: "#666", marginBottom: 24 }}>
					The page you are looking for does not exist.
				</p>
				<Link
					href="/"
					style={{
						padding: "8px 20px",
						borderRadius: 6,
						border: "none",
						background: "#3b6cff",
						color: "#fff",
						textDecoration: "none",
						fontSize: 14,
					}}
				>
					Back to home
				</Link>
			</div>
		</div>
	);
}
