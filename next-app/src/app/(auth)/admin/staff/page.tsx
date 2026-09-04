import { Pagination } from "@/components/pagination";
import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getAdminStaffMonitorData } from "@/lib/data";
import styles from "./admin-staff.module.css";

export const revalidate = 60;

function formatShift24Hour(shift: string) {
	const value = shift.trim();

	if (value.toLowerCase() === "night shift") {
		return "22:00-06:00";
	}

	if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(value)) {
		return value;
	}

	const parts = value.split(/\s*(?:-|–|to)\s*/i);
	if (parts.length !== 2) {
		return value;
	}

	const to24 = (token: string) => {
		const match = token.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
		if (!match) {
			return null;
		}
		let hour = Number.parseInt(match[1], 10);
		const minute = match[2] ?? "00";
		const meridiem = match[3].toLowerCase();
		if (meridiem === "pm" && hour < 12) {
			hour += 12;
		}
		if (meridiem === "am" && hour === 12) {
			hour = 0;
		}
		return `${hour.toString().padStart(2, "0")}:${minute}`;
	};

	const start = to24(parts[0]);
	const end = to24(parts[1]);
	if (!start || !end) {
		return value;
	}

	return `${start}-${end}`;
}

function formatShortMemberId(id: string) {
	return `TM-${id.slice(-6).toUpperCase()}`;
}

type AdminStaffMonitorPageProps = {
	searchParams?: Promise<{
		page?: string | string[];
	}>;
};

export default async function AdminStaffMonitorPage({
	searchParams,
}: AdminStaffMonitorPageProps) {
	await requireSession("admin");
	const resolvedSearchParams = (await searchParams) ?? {};
	const rawPage = Array.isArray(resolvedSearchParams.page)
		? resolvedSearchParams.page[0]
		: resolvedSearchParams.page;
	const parsedPage = Number.parseInt(rawPage ?? "1", 10);
	const currentPage =
		Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const pageSize = 5;
	const { org, teamMembers, total, dayRows, statusMix } =
		await getAdminStaffMonitorData(currentPage, pageSize);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;

	const maxSeriesValue = Math.max(
		...dayRows.map((row) => Math.max(row.handled, row.unresolved)),
		1,
	);
	const yMax = Math.max(4, Math.ceil(maxSeriesValue / 2) * 2);
	const yTicks = [
		yMax,
		Math.round(yMax * 0.75),
		Math.round(yMax * 0.5),
		Math.round(yMax * 0.25),
		0,
	];
	const chartRows = dayRows.filter(
		(_, index) => index % 3 === 0 || index === dayRows.length - 1,
	);
	const totalStatus = Math.max(
		statusMix.online + statusMix.busy + statusMix.onCall + statusMix.other,
		1,
	);
	const handled30d = dayRows.reduce((sum, row) => sum + row.handled, 0);
	const unresolved30d = dayRows.reduce((sum, row) => sum + row.unresolved, 0);
	const peakDay = dayRows.reduce(
		(max, row) => (row.handled > max.handled ? row : max),
		dayRows[0],
	);

	return (
		<div className={`screen-grid ${styles.staffPage}`}>
			<PageHeader
				title="Staff Monitor"
				subtitle={`${org.name} 30-day view of staffing coverage, handled calls, and unresolved queue pressure.`}
			/>

			<div className="grid-2 admin-monitor-top-grid">
				<div className={`card card-pad ${styles.staffTrendCard}`}>
					<SectionTitle
						title="Handled vs unresolved calls"
						subtitle="Last 30 days"
					/>
					<svg
						className={`chart ${styles.staffTrendChart}`}
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
									key={`staff-y-${tick}-${index}`}
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

						{dayRows.map((row, index) => {
							const x = 58 + index * (462 / Math.max(dayRows.length - 1, 1));
							const handledY = 180 - Math.round((row.handled / yMax) * 150);
							const unresolvedY =
								180 - Math.round((row.unresolved / yMax) * 150);
							return (
								<g key={row.label}>
									<circle cx={x} cy={handledY} r="3.5" fill="#3b6cff" />
									<circle cx={x} cy={unresolvedY} r="3" fill="#ff6a61" />
								</g>
							);
						})}
						<polyline
							fill="none"
							stroke="#3b6cff"
							strokeWidth="2.5"
							points={dayRows
								.map((row, index) => {
									const x =
										58 + index * (462 / Math.max(dayRows.length - 1, 1));
									const y = 180 - Math.round((row.handled / yMax) * 150);
									return `${x},${y}`;
								})
								.join(" ")}
						/>
						<polyline
							fill="none"
							stroke="#ff6a61"
							strokeWidth="2.2"
							points={dayRows
								.map((row, index) => {
									const x =
										58 + index * (462 / Math.max(dayRows.length - 1, 1));
									const y = 180 - Math.round((row.unresolved / yMax) * 150);
									return `${x},${y}`;
								})
								.join(" ")}
						/>
						{chartRows.map((row, index) => {
							const mappedIndex = dayRows.indexOf(row);
							const x =
								58 + mappedIndex * (462 / Math.max(dayRows.length - 1, 1));
							return (
								<text
									key={`staff-label-${row.label}-${index}`}
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
							<span className="legend-swatch blue" />
							Handled calls
						</span>
						<span className="legend-item">
							<span className="legend-swatch red" />
							Unresolved calls
						</span>
					</div>
				</div>

				<div className="stack">
					<div className="card card-pad">
						<SectionTitle
							title="Staff status mix"
							subtitle="Current distribution"
						/>
						<div className="status-donut">
							<div className="status-bar">
								<span
									style={{
										width: `${(statusMix.online / totalStatus) * 100}%`,
									}}
									className="segment success"
								/>
								<span
									style={{ width: `${(statusMix.busy / totalStatus) * 100}%` }}
									className="segment warning"
								/>
								<span
									style={{
										width: `${(statusMix.onCall / totalStatus) * 100}%`,
									}}
									className="segment info"
								/>
								<span
									style={{ width: `${(statusMix.other / totalStatus) * 100}%` }}
									className="segment neutral"
								/>
							</div>
							<div className="pill-row">
								<span className="pill">Online: {statusMix.online}</span>
								<span className="pill">Busy: {statusMix.busy}</span>
								<span className="pill">On-call: {statusMix.onCall}</span>
								<span className="pill">Other: {statusMix.other}</span>
							</div>
						</div>
					</div>

					<div className="card card-pad">
						<SectionTitle title="Coverage snapshot" subtitle="30-day context" />
						<div className="list">
							<div className="list-item">
								<div>
									<strong>Total handled calls</strong>
									<small>Across the current 30-day window</small>
								</div>
								<div className="right">{handled30d}</div>
							</div>
							<div className="list-item">
								<div>
									<strong>Total unresolved calls</strong>
									<small>Pending intervention or transfer</small>
								</div>
								<div className="right">{unresolved30d}</div>
							</div>
							<div className="list-item">
								<div>
									<strong>Peak daily load</strong>
									<small>{peakDay.label}</small>
								</div>
								<div className="right">{peakDay.handled} calls</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="card card-pad team-table-card">
				<SectionTitle
					title="Team coverage table"
					subtitle="Read-only staff monitoring"
				/>
				<div className="table-wrap">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Name</th>
								<th>Role</th>
								<th>Shift</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{teamMembers.map((member) => (
								<tr key={member.id}>
									<td>{formatShortMemberId(member.id)}</td>
									<td>
										<div className="patient">
											<div className="avatar-sm" />
											<strong>{member.name}</strong>
										</div>
									</td>
									<td>{member.role}</td>
									<td>{formatShift24Hour(member.shift)}</td>
									<td>
										<span
											className={`status ${member.status === "online" ? "success" : member.status === "busy" ? "warning" : "info"}`}
										>
											{member.status}
										</span>
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
