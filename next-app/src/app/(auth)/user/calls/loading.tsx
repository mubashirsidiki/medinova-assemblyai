export default function CallsLoading() {
	return (
		<div className="screen-grid">
			<div style={{ marginBottom: 16 }}>
				<div className="skeleton skeleton-text-lg" />
				<div className="skeleton skeleton-text-sm" style={{ marginTop: 8 }} />
			</div>
			<div className="kpi-grid">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="card card-pad metric">
						<div className="skeleton skeleton-text-xs" />
						<div
							className="skeleton skeleton-text-lg"
							style={{ marginTop: 8 }}
						/>
					</div>
				))}
			</div>
			<div className="card card-pad" style={{ marginTop: 16 }}>
				<div className="skeleton skeleton-text-md" />
				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} style={{ display: "flex", gap: 16, marginTop: 12 }}>
						<div className="skeleton skeleton-text-sm" />
						<div className="skeleton skeleton-text-sm" />
						<div className="skeleton skeleton-text-sm" />
						<div className="skeleton skeleton-text-xs" />
					</div>
				))}
			</div>
		</div>
	);
}
