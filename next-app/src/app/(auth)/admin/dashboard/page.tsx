import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getAdminMonitorOverviewData } from "@/lib/data";
import { currency } from "@/lib/format";

export const revalidate = 30;

export default async function AdminDashboardPage() {
	await requireSession("admin");
	const { org, staffSummary, botSummary, costSummary } =
		await getAdminMonitorOverviewData();

	return (
		<div className="screen-grid">
			<PageHeader
				title="Medinova Admin Overview"
				subtitle={`${org.name} at-a-glance snapshot for staff performance, bot health, and cost control.`}
			/>

			<div className="grid-3 admin-overview-hero">
				<div className="card card-pad admin-soft-stat">
					<small>Staff online now</small>
					<strong>
						{staffSummary.onlineCount}/{staffSummary.teamCount}
					</strong>
					<span>{staffSummary.unresolvedLatest} unresolved today</span>
				</div>
				<div className="card card-pad admin-soft-stat">
					<small>Active bot numbers</small>
					<strong>{botSummary.activeNumbers}</strong>
					<span>{botSummary.urgentLatest} urgent escalations today</span>
				</div>
				<div className="card card-pad admin-soft-stat">
					<small>Month-to-date spend</small>
					<strong>{currency(costSummary.mtdCost)}</strong>
					<span>
						{currency(costSummary.avgCostPerCall)} average cost per call
					</span>
				</div>
			</div>

			<div className="grid-3 admin-overview-clean">
				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle
						title="Staff monitor"
						subtitle="Coverage and queue health"
					/>
					<div className="admin-overview-metrics">
						<div className="admin-overview-metric-row">
							<span>Handled (30d)</span>
							<strong>{staffSummary.handled30d}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Unresolved (30d)</span>
							<strong>{staffSummary.unresolved30d}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Peak day</span>
							<strong>
								{staffSummary.peakLabel} ({staffSummary.peakHandled})
							</strong>
						</div>
					</div>
					<Link href="/admin/staff" className="action-btn admin-overview-btn">
						Open Staff Monitor
					</Link>
				</div>

				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle
						title="Bot monitor"
						subtitle="Live numbers and escalations"
					/>
					<div className="admin-overview-metrics">
						<div className="admin-overview-metric-row">
							<span>Bot profiles</span>
							<strong>{botSummary.profileCount}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Urgent (30d)</span>
							<strong>{botSummary.urgent30d}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Paused / disconnected</span>
							<strong>
								{botSummary.pausedNumbers}/{botSummary.disconnectedNumbers}
							</strong>
						</div>
					</div>
					<Link href="/admin/bots" className="action-btn admin-overview-btn">
						Open Bot Monitor
					</Link>
				</div>

				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle title="Cost monitor" subtitle="Spend and efficiency" />
					<div className="admin-overview-metrics">
						<div className="admin-overview-metric-row">
							<span>Total spend (30d)</span>
							<strong>{currency(costSummary.total30d)}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Top cost source</span>
							<strong>{costSummary.highestCostSource}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Top source value</span>
							<strong>{currency(costSummary.highestCostSourceValue)}</strong>
						</div>
					</div>
					<Link href="/admin/cost" className="action-btn admin-overview-btn">
						Open Cost Monitor
					</Link>
				</div>
			</div>
		</div>
	);
}
