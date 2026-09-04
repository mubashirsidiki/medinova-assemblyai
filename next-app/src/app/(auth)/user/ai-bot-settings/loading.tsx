export default function BotSettingsLoading() {
	return (
		<div className="screen-grid">
			<div style={{ marginBottom: 16 }}>
				<div className="skeleton skeleton-text-lg" />
				<div className="skeleton skeleton-text-sm" style={{ marginTop: 8 }} />
			</div>
			<div className="grid-2">
				<div className="card card-pad">
					<div className="skeleton skeleton-text-md" />
					<div className="skeleton skeleton-card" style={{ marginTop: 12 }} />
				</div>
				<div className="card card-pad">
					<div className="skeleton skeleton-text-md" />
					<div className="skeleton skeleton-card" style={{ marginTop: 12 }} />
				</div>
			</div>
		</div>
	);
}
