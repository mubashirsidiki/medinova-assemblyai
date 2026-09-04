import styles from "./user-dashboard.module.css";
export default function DashboardLoading() {
	return (
		<div className={`screen-grid ${styles.dashboardPage}`}>
			<div style={{ marginBottom: 16 }}>
				<div className="skeleton skeleton-text-lg" />
				<div className="skeleton skeleton-text-sm" style={{ marginTop: 8 }} />
			</div>
			<div className="grid-3 admin-overview-hero">
				{[1, 2, 3].map((i) => (
					<div key={i} className="card card-pad admin-soft-stat">
						<div className="skeleton skeleton-text-xs" />
						<div
							className="skeleton skeleton-text-lg"
							style={{ marginTop: 8 }}
						/>
						<div
							className="skeleton skeleton-text-sm"
							style={{ marginTop: 6 }}
						/>
					</div>
				))}
			</div>
			<div className="grid-3 admin-overview-clean" style={{ marginTop: 16 }}>
				{[1, 2, 3].map((i) => (
					<div key={i} className="card card-pad admin-overview-clean-card">
						<div className="skeleton skeleton-text-xs" />
						<div
							className="skeleton skeleton-text-md"
							style={{ marginTop: 8 }}
						/>
						<div className="skeleton skeleton-card" style={{ marginTop: 12 }} />
					</div>
				))}
			</div>
		</div>
	);
}
