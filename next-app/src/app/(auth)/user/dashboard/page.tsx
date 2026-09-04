import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { currency, integer } from "@/lib/format";
import styles from "./user-dashboard.module.css";

export const revalidate = 30;

export default async function DashboardPage() {
	await requireSession("user");
	const {
		org,
		heroStats,
		callSummary,
		bookingSummary,
		analyticsSummary,
		costSummary,
		botSummary,
	} = await getDashboardData();

	return (
		<div className={`screen-grid ${styles.dashboardPage}`}>
			<PageHeader
				title="Medinova Voice Platform"
				subtitle={`${org.name} at-a-glance snapshot for calls, bookings, analytics, costs, and AI bot settings.`}
			/>

			{/* ---- hero stat cards ---- */}
			<div className="grid-3 admin-overview-hero">
				<div className="card card-pad admin-soft-stat">
					<small>Active calls / records</small>
					<strong>{integer(heroStats.queueActive)} in queue</strong>
					<span>{integer(heroStats.callsToday)} calls today</span>
				</div>
				<div className="card card-pad admin-soft-stat">
					<small>Upcoming bookings</small>
					<strong>{integer(heroStats.upcomingAppointments)} scheduled</strong>
					<span>{integer(heroStats.appointmentsToday)} today</span>
				</div>
				<div className="card card-pad admin-soft-stat">
					<small>Month-to-date cost</small>
					<strong>{currency(heroStats.mtdCost)}</strong>
					<span>{currency(heroStats.avgCostPerCall)} avg cost per call</span>
				</div>
			</div>

			{/* ---- clean overview row 1: Calls, Bookings, Analytics ---- */}
			<div className="grid-3 admin-overview-clean">
				{/* Calls */}
				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle title="Calls" subtitle="30-day voice activity" />
					<div className="admin-overview-metrics">
						<div className="admin-overview-metric-row">
							<span>Total calls (30d)</span>
							<strong>{integer(callSummary.total30d)}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Urgent calls</span>
							<strong>{integer(callSummary.urgent30d)}</strong>
						</div>
					</div>
					<Link href="/user/calls" className="action-btn admin-overview-btn">
						Open Calls
					</Link>
				</div>

				{/* Bookings */}
				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle title="Bookings" subtitle="Upcoming and scheduled" />
					<div className="admin-overview-metrics">
						<div className="admin-overview-metric-row">
							<span>Upcoming</span>
							<strong>{integer(bookingSummary.upcomingCount)}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Today</span>
							<strong>{integer(bookingSummary.todayCount)}</strong>
						</div>
					</div>
					<Link href="/user/booking" className="action-btn admin-overview-btn">
						Open Bookings
					</Link>
				</div>

				{/* Analytics */}
				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle title="Analytics" subtitle="Call handling and trends" />
					<div className="admin-overview-metrics">
						<div className="admin-overview-metric-row">
							<span>Total calls (30d)</span>
							<strong>{integer(analyticsSummary.totalCalls)}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Urgent rate</span>
							<strong>{analyticsSummary.urgentRate}%</strong>
						</div>
					</div>
					<Link
						href="/user/analytics"
						className="action-btn admin-overview-btn"
					>
						Open Analytics
					</Link>
				</div>
			</div>

			{/* ---- clean overview row 2: Costs, AI Bot Settings ---- */}
			<div className="grid-2-equal admin-overview-clean">
				{/* Costs */}
				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle title="Costs" subtitle="Spend and efficiency" />
					<div className="admin-overview-metrics">
						<div className="admin-overview-metric-row">
							<span>MTD spend</span>
							<strong>{currency(costSummary.mtdCost)}</strong>
						</div>
						<div className="admin-overview-metric-row">
							<span>Avg cost / call</span>
							<strong>{currency(costSummary.avgCostPerCall)}</strong>
						</div>
					</div>
					<Link href="/user/costs" className="action-btn admin-overview-btn">
						Open Costs
					</Link>
				</div>

				{/* AI Bot Settings */}
				<div className="card card-pad admin-overview-clean-card">
					<SectionTitle title="AI Bot Settings" subtitle="Your bot profile" />
					{botSummary ? (
						<>
							<div className="admin-overview-metrics">
								<div className="admin-overview-metric-row">
									<span>Bot name</span>
									<strong>{botSummary.botName}</strong>
								</div>
								<div className="admin-overview-metric-row">
									<span>Voice model</span>
									<strong>{botSummary.voiceModel}</strong>
								</div>
							</div>
							<Link
								href="/user/ai-bot-settings"
								className="action-btn admin-overview-btn"
							>
								Open AI Bot Settings
							</Link>
						</>
					) : (
						<>
							<p className="subtle" style={{ padding: "4px 0" }}>
								No bot profile configured yet.
							</p>
							<Link
								href="/user/ai-bot-settings"
								className="action-btn admin-overview-btn"
							>
								Set Up Bot
							</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
