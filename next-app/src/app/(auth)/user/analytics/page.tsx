import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/data";
import styles from "./analytics.module.css";

export const revalidate = 60;

export default async function AnalyticsPage() {
	await requireSession("user");
	const {
		org,
		days,
		classifications,
		conversionMarkers,
		serviceLevels,
		overview,
	} = await getAnalyticsData();
	const sortedClassifications = Object.entries(classifications).sort(
		(a, b) => b[1] - a[1],
	);
	const topClassifications = sortedClassifications;
	const hiddenKpis = new Set([
		"Data window",
		"Average first response",
		"Calendar sync rate",
		"Follow-up rate",
		"Auto-handled rate",
		"Resolved without warm transfer",
	]);
	const operationalKpis = [
		...conversionMarkers,
		...serviceLevels,
		{
			label: "Appointment confirmations",
			detail: "Confirmed notifications across appointments",
			value: `${overview.confirmationRate}%`,
		},
	].filter((item) => !hiddenKpis.has(item.label));
	const maxSeriesValue = Math.max(
		...days.map((day) => Math.max(day.handled, day.urgent)),
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
	const chartRows = days;
	const pieRadius = 78;
	const pieCircumference = 2 * Math.PI * pieRadius;
	const spamRatio =
		overview.totalCalls > 0 ? overview.spamCalls / overview.totalCalls : 0;
	const nonSpamRatio = 1 - spamRatio;
	const spamArc = spamRatio * pieCircumference;
	const nonSpamArc = pieCircumference - spamArc;

	return (
		<div className={`screen-grid ${styles.analyticsPage}`}>
			<PageHeader
				title="Operations Analytics"
				subtitle={`${org.name} live metrics for call handling, urgency, booking outcomes, and appointment confirmation.`}
			/>

			<div className="grid-2">
				<div className={`card card-pad ${styles.analyticsTrendCard}`}>
					<SectionTitle title="Weekly call trends" subtitle="Last 7 days" />
					{overview.totalCalls === 0 ? (
						<div className="empty-state">
							<strong>No call activity in the last 7 days</strong>
							<p>
								When calls are received, this section will show volume and
								urgent-call distribution.
							</p>
						</div>
					) : (
						<svg
							className={`chart ${styles.analyticsTrendChart}`}
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
							<g stroke="#e1e6ef" strokeDasharray="5 5">
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
										key={`analytics-y-${tick}-${index}`}
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

							{days.map((day, index) => {
								const x = 58 + index * (462 / Math.max(days.length - 1, 1));
								const handledY = 180 - Math.round((day.handled / yMax) * 150);
								const urgentY = 180 - Math.round((day.urgent / yMax) * 150);
								return (
									<g key={day.label}>
										<circle cx={x} cy={handledY} r="3.5" fill="#3b6cff" />
										<circle cx={x} cy={urgentY} r="3" fill="#ff6a61" />
									</g>
								);
							})}

							<polyline
								fill="none"
								stroke="#3b6cff"
								strokeWidth="2.5"
								points={days
									.map((day, index) => {
										const x = 58 + index * (462 / Math.max(days.length - 1, 1));
										const y = 180 - Math.round((day.handled / yMax) * 150);
										return `${x},${y}`;
									})
									.join(" ")}
							/>
							<polyline
								fill="none"
								stroke="#ff6a61"
								strokeWidth="2.2"
								points={days
									.map((day, index) => {
										const x = 58 + index * (462 / Math.max(days.length - 1, 1));
										const y = 180 - Math.round((day.urgent / yMax) * 150);
										return `${x},${y}`;
									})
									.join(" ")}
							/>

							{chartRows.map((day, index) => {
								const mappedIndex = days.indexOf(day);
								const x =
									58 + mappedIndex * (462 / Math.max(days.length - 1, 1));
								return (
									<text
										key={`analytics-label-${day.label}-${index}`}
										x={x}
										y="205"
										textAnchor="middle"
										fontSize="9"
										fill="#8f97a5"
									>
										{day.label}
									</text>
								);
							})}
							<text x="50" y="18" fontSize="10" fill="#8f97a5">
								Calls
							</text>
						</svg>
					)}
					<div className="chart-legend">
						<span className="legend-item">
							<span className="legend-swatch blue" />
							Handled calls
						</span>
						<span className="legend-item">
							<span className="legend-swatch red" />
							Urgent calls
						</span>
					</div>
				</div>

				<div className={`card card-pad ${styles.analyticsPieCard}`}>
					<div className={`card-head ${styles.analyticsPieHead}`}>
						<h3>Spam vs. Not Spam</h3>
						<small>Spam detection breakdown</small>
					</div>
					{overview.totalCalls === 0 ? (
						<div className="empty-state">
							<strong>No call activity in the last 7 days</strong>
							<p>
								Spam detection breakdown will appear after calls are logged.
							</p>
						</div>
					) : (
						<div className={styles.analyticsPieOnly}>
							<svg
								className={styles.analyticsPieChart}
								viewBox="0 0 280 280"
								aria-hidden="true"
							>
								<g transform="translate(140 140) rotate(-90)">
									<circle
										cx="0"
										cy="0"
										r={pieRadius}
										fill="none"
										stroke="#edf1f6"
										strokeWidth="18"
									/>
									<circle
										cx="0"
										cy="0"
										r={pieRadius}
										fill="none"
										stroke="#ff6a61"
										strokeWidth="18"
										strokeDasharray={`${spamArc} ${Math.max(pieCircumference - spamArc, 0.001)}`}
										strokeLinecap={spamArc > 0 ? "round" : "butt"}
									/>
									<circle
										cx="0"
										cy="0"
										r={pieRadius}
										fill="none"
										stroke="#3b6cff"
										strokeWidth="18"
										strokeDasharray={`${nonSpamArc} ${Math.max(pieCircumference - nonSpamArc, 0.001)}`}
										strokeDashoffset={-spamArc}
										strokeLinecap={nonSpamArc > 0 ? "round" : "butt"}
									/>
								</g>
								<text
									x="140"
									y="130"
									textAnchor="middle"
									className={styles.analyticsPieCenterLabel}
								>
									Spam calls
								</text>
								<text
									x="140"
									y="158"
									textAnchor="middle"
									className={styles.analyticsPieCenterValue}
								>
									{overview.spamCalls}
								</text>
							</svg>
						</div>
					)}
					<div className={`chart-legend ${styles.analyticsPieLegend}`}>
						<span className="legend-item">
							<span className="legend-swatch red" />
							Spam {Math.round(spamRatio * 100)}%
						</span>
						<span className="legend-item">
							<span className="legend-swatch blue" />
							Not Spam {Math.round(nonSpamRatio * 100)}%
						</span>
					</div>
				</div>
			</div>

			<div className={`grid-2 ${styles.classificationsKpiRow}`}>
				<div className={`card card-pad ${styles.classificationsCard}`}>
					<SectionTitle
						title="Top call classifications"
						subtitle="Most frequent labels in this period"
					/>
					<div className={`list ${styles.classificationsList}`}>
						{topClassifications.map(([label, count]) => (
							<div className="list-item" key={label}>
								<div>
									<strong>{label.replaceAll("_", " ")}</strong>
									<small>Classified calls</small>
								</div>
								<div className="right">{count}</div>
							</div>
						))}
					</div>
				</div>

				<div className="card card-pad">
					<SectionTitle
						title="Operational KPIs"
						subtitle="Conversion and service-level snapshot"
					/>
					<div className={`list ${styles.operationalKpisList}`}>
						{operationalKpis.map((item) => (
							<div className="list-item" key={item.label}>
								<div>
									<strong>{item.label}</strong>
									<small>{item.detail}</small>
								</div>
								<div className="right">{item.value}</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
