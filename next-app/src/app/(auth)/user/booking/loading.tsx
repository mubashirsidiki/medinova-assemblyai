export default function BookingLoading() {
	return (
		<div className="screen-grid">
			<div style={{ marginBottom: 16 }}>
				<div className="skeleton skeleton-text-lg" />
				<div className="skeleton skeleton-text-sm" style={{ marginTop: 8 }} />
			</div>
			<div className="card card-pad">
				<div className="skeleton skeleton-card" />
			</div>
		</div>
	);
}
