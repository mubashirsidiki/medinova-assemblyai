import { Pagination } from "@/components/pagination";
import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getAdminBotMonitorData } from "@/lib/data";
import { integer } from "@/lib/format";
import styles from "./admin-bots.module.css";

export const revalidate = 30;

type AdminBotsPageProps = {
	searchParams?: Promise<{
		page?: string | string[];
	}>;
};

function formatShortStaffId(id: string) {
	return `STF-${id.slice(-6).toUpperCase()}`;
}

function formatShortBotId(id: string) {
	return `BOT-${id.slice(-6).toUpperCase()}`;
}

export default async function AdminBotMonitorPage({
	searchParams,
}: AdminBotsPageProps) {
	await requireSession("admin");
	const resolvedSearchParams = (await searchParams) ?? {};
	const rawPage = Array.isArray(resolvedSearchParams.page)
		? resolvedSearchParams.page[0]
		: resolvedSearchParams.page;
	const parsedPage = Number.parseInt(rawPage ?? "1", 10);
	const currentPage =
		Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const pageSize = 5;
	const { org, botProfiles, total, escalationTrend, statusMix, channelMix } =
		await getAdminBotMonitorData(currentPage, pageSize);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;

	const maxEscalation = Math.max(
		...escalationTrend.map((row) => Math.max(row.urgent, row.warmTransfer)),
		1,
	);
	const yMax = Math.max(2, Math.ceil(maxEscalation));
	const yTicks = [
		yMax,
		Math.max(0, Math.round(yMax * 0.75)),
		Math.max(0, Math.round(yMax * 0.5)),
		Math.max(0, Math.round(yMax * 0.25)),
		0,
	];
	const chartRows = escalationTrend.filter(
		(_, index) => index % 3 === 0 || index === escalationTrend.length - 1,
	);
	const totalStatus = Math.max(
		statusMix.active + statusMix.paused + statusMix.disconnected,
		1,
	);
	const totalRouted = channelMix.reduce((sum, [, count]) => sum + count, 0);
	const topChannel = channelMix[0] ?? ["none", 0];
	const secondChannel = channelMix[1] ?? ["n/a", 0];

	return (
		<div className={`screen-grid ${styles.botsPage}`}>
			<PageHeader
				title="Bot Monitor"
				subtitle={`${org.name} monitors bot profile coverage, live number health, and urgent escalation activity.`}
			/>

			<div className="grid-2 admin-monitor-top-grid">
				<div className={`card card-pad ${styles.botTrendCard}`}>
					<SectionTitle
						title="Urgent escalation trend"
						subtitle="Last 30 days"
					/>
					<svg
						className={`chart ${styles.botTrendChart}`}
						viewBox="0 0 560 240"
						preserveAspectRatio="xMidYMid meet"
						aria-hidden="true"
					>
						<line
							x1="50"
							y1="30"
							x2="50"
							y2="180"
							stroke="#cfd8e7"
							strokeWidth="1.1"
						/>
						<line
							x1="50"
							y1="180"
							x2="530"
							y2="180"
							stroke="#cfd8e7"
							strokeWidth="1.1"
						/>
						<g stroke="#e1e6ef" strokeDasharray="4 5">
							<line x1="50" y1="30" x2="530" y2="30" />
							<line x1="50" y1="68" x2="530" y2="68" />
							<line x1="50" y1="105" x2="530" y2="105" />
							<line x1="50" y1="143" x2="530" y2="143" />
							<line x1="50" y1="180" x2="530" y2="180" />
						</g>

						{yTicks.map((tick, index) => {
							const y = 30 + index * ((180 - 30) / (yTicks.length - 1));
							return (
								<text
									key={`bot-y-${tick}-${index}`}
									x="44"
									y={y + 3}
									textAnchor="end"
									fontSize="9"
									fill="#8f97a5"
								>
									{tick}
								</text>
							);
						})}

						{escalationTrend.map((row, index) => {
							const x =
								58 + index * (462 / Math.max(escalationTrend.length - 1, 1));
							const urgentY = 180 - Math.round((row.urgent / yMax) * 150);
							const warmY = 180 - Math.round((row.warmTransfer / yMax) * 150);
							return (
								<g key={row.label}>
									<circle cx={x} cy={urgentY} r="3.5" fill="#ff6a61" />
									<circle cx={x} cy={warmY} r="3.5" fill="#3b6cff" />
								</g>
							);
						})}
						<polyline
							fill="none"
							stroke="#ff6a61"
							strokeWidth="2.4"
							points={escalationTrend
								.map((row, index) => {
									const x =
										58 +
										index * (462 / Math.max(escalationTrend.length - 1, 1));
									const y = 180 - Math.round((row.urgent / yMax) * 150);
									return `${x},${y}`;
								})
								.join(" ")}
						/>
						<polyline
							fill="none"
							stroke="#3b6cff"
							strokeWidth="2.4"
							points={escalationTrend
								.map((row, index) => {
									const x =
										58 +
										index * (462 / Math.max(escalationTrend.length - 1, 1));
									const y = 180 - Math.round((row.warmTransfer / yMax) * 150);
									return `${x},${y}`;
								})
								.join(" ")}
						/>
						{chartRows.map((row, index) => {
							const mappedIndex = escalationTrend.indexOf(row);
							const x =
								58 +
								mappedIndex * (462 / Math.max(escalationTrend.length - 1, 1));
							return (
								<text
									key={`bot-label-${row.label}-${index}`}
									x={x}
									y="205"
									textAnchor="middle"
									fontSize="9"
									fill="#8f97a5"
								>
									{row.label}
								</text>
							);
						})}
						<text x="50" y="18" fontSize="10" fill="#8f97a5">
							Calls
						</text>
					</svg>
					<div className="chart-legend">
						<span className="legend-item">
							<span className="legend-swatch red" />
							Urgent calls
						</span>
						<span className="legend-item">
							<span className="legend-swatch blue" />
							Warm transfers
						</span>
					</div>
				</div>

				<div className={`stack ${styles.botMonitorStack}`}>
					<div className="card card-pad">
						<SectionTitle
							title="Live number status"
							subtitle="Current distribution"
						/>
						<div className="status-donut">
							<div className="status-bar">
								<span
									style={{
										width: `${(statusMix.active / totalStatus) * 100}%`,
									}}
									className="segment success"
								/>
								<span
									style={{
										width: `${(statusMix.paused / totalStatus) * 100}%`,
									}}
									className="segment warning"
								/>
								<span
									style={{
										width: `${(statusMix.disconnected / totalStatus) * 100}%`,
									}}
									className="segment neutral"
								/>
							</div>
							<div className="pill-row">
								<span className="pill">Active: {statusMix.active}</span>
								<span className="pill">Paused: {statusMix.paused}</span>
								<span className="pill">
									Disconnected: {statusMix.disconnected}
								</span>
							</div>
						</div>
					</div>
					<div className={`card card-pad ${styles.botChannelCard}`}>
						<SectionTitle title="Channel mix" subtitle="30-day context" />
						<div className="list">
							<div className="list-item">
								<div>
									<strong>Top routed channel</strong>
									<small>{topChannel[0]}</small>
								</div>
								<div className="right">{integer(topChannel[1])} calls</div>
							</div>
							<div className="list-item">
								<div>
									<strong>Total routed interactions</strong>
									<small>Across the current 30-day window</small>
								</div>
								<div className="right">{integer(totalRouted)}</div>
							</div>
							<div className="list-item">
								<div>
									<strong>Secondary channel</strong>
									<small>{secondChannel[0]}</small>
								</div>
								<div className="right">
									{totalRouted > 0
										? `${Math.round((secondChannel[1] / totalRouted) * 100)}%`
										: "0%"}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card card-pad bot-table-card">
				<SectionTitle
					title="Bot inventory"
					subtitle="Read-only profiles and sync posture"
				/>
				<div className="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Staff ID</th>
								<th>Bot ID</th>
								<th>Staff member</th>
								<th>Bot name</th>
								<th>Language</th>
								<th>Voice model</th>
								<th>Live numbers</th>
								<th>CRM sync</th>
								<th>Calendar sync</th>
							</tr>
						</thead>
						<tbody>
							{botProfiles.map((profile) => (
								<tr key={profile.id}>
									<td>
										{profile.staffMember
											? formatShortStaffId(profile.staffMember.id)
											: "Unlinked"}
									</td>
									<td>{formatShortBotId(profile.id)}</td>
									<td>
										{profile.staffMember
											? `${profile.staffMember.name} (${profile.staffMember.role})`
											: "No staff match"}
									</td>
									<td>{profile.botName}</td>
									<td>
										{profile.language} / {profile.accent}
									</td>
									<td>{profile.voiceModelName}</td>
									<td>{profile.liveNumbers.length}</td>
									<td>{profile.crmSyncEnabled ? "Enabled" : "Disabled"}</td>
									<td>
										{profile.calendarSyncEnabled ? "Enabled" : "Disabled"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					recordCount={total}
					startIndex={startIndex}
					endIndex={endIndex}
					hrefBuilder={(page) => `?page=${page}`}
				/>
			</div>
		</div>
	);
}
