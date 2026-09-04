import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getAdminCostMonitorData } from "@/lib/data";
import { currency } from "@/lib/format";
import styles from "./admin-cost.module.css";

export const revalidate = 60;

function axisUsd(value: number) {
	if (value >= 1000) {
		return `$${(value / 1000).toFixed(1)}k`;
	}
	return `$${Math.round(value)}`;
}

export default async function AdminCostMonitorPage() {
	await requireSession("admin");
	const { dailySpend, spendBySource, kpis } = await getAdminCostMonitorData();

	const maxSpend = Math.max(...dailySpend.map((row) => row.spend), 1);
	const yMax = Math.ceil(maxSpend / 10) * 10;
	const yTicks = [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0];

	const spendWithAverage = dailySpend.map((row, index) => {
		const start = Math.max(0, index - 6);
		const window = dailySpend.slice(start, index + 1);
		const avg =
			window.reduce((sum, item) => sum + item.spend, 0) /
			Math.max(window.length, 1);
		return { ...row, movingAverage: avg };
	});

	const chartRows = dailySpend.filter(
		(_, index) => index % 3 === 0 || index === dailySpend.length - 1,
	);
	const topSource = spendBySource[0];
	const totalSourceSpend = Math.max(
		spendBySource.reduce((sum, [, spend]) => sum + spend, 0),
		1,
	);
	const sourceA = spendBySource[0];
	const sourceB = spendBySource[1];
	const sourceC = spendBySource[2];
	const sourceD = spendBySource[3];
	const maxCostPerCall = Math.max(
		...dailySpend.map((row) => row.costPerCall),
		0.01,
	);
	const costPerCallMax = Math.max(0.5, Math.ceil(maxCostPerCall * 10) / 10);
	const costPerCallTicks = [
		costPerCallMax,
		costPerCallMax * 0.75,
		costPerCallMax * 0.5,
		costPerCallMax * 0.25,
		0,
	];
	const costPerCallWithAverage = dailySpend.map((row, index) => {
		const start = Math.max(0, index - 6);
		const window = dailySpend.slice(start, index + 1);
		const avg =
			window.reduce((sum, item) => sum + item.costPerCall, 0) /
			Math.max(window.length, 1);
		return { ...row, movingAverage: avg };
	});

	return (
		<div className={`screen-grid ${styles.costPage}`}>
			<PageHeader
				title="Cost Monitor"
				subtitle="30-day spend monitoring with source-level breakdown and cost-per-call efficiency."
			/>

			<div className="grid-2 admin-monitor-top-grid">
				<div className={`card card-pad ${styles.costTrendCard}`}>
					<SectionTitle
						title="Daily spend trend"
						subtitle="Last 30 days (USD)"
					/>
					<svg
						className={`chart ${styles.costTrendChart}`}
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

						{yTicks.map((value, index) => {
							const y = 30 + index * ((180 - 30) / (yTicks.length - 1));
							return (
								<text
									key={`y-${value}-${index}`}
									x="44"
									y={y + 3}
									textAnchor="end"
									fontSize="9"
									fill="#8f97a5"
								>
									{axisUsd(value)}
								</text>
							);
						})}

						{spendWithAverage.map((row, index) => {
							const x =
								58 + index * (462 / Math.max(spendWithAverage.length - 1, 1));
							const y = 180 - Math.round((row.spend / yMax) * 150);
							return (
								<circle
									key={`point-${row.label}-${index}`}
									cx={x}
									cy={y}
									r="2.8"
									fill="#3b6cff"
								/>
							);
						})}

						<polyline
							fill="none"
							stroke="#3b6cff"
							strokeWidth="2.5"
							points={spendWithAverage
								.map((row, index) => {
									const x =
										58 +
										index * (462 / Math.max(spendWithAverage.length - 1, 1));
									const y = 180 - Math.round((row.spend / yMax) * 150);
									return `${x},${y}`;
								})
								.join(" ")}
						/>

						<polyline
							fill="none"
							stroke="#22c98a"
							strokeWidth="2.1"
							strokeDasharray="5 4"
							points={spendWithAverage
								.map((row, index) => {
									const x =
										58 +
										index * (462 / Math.max(spendWithAverage.length - 1, 1));
									const y = 180 - Math.round((row.movingAverage / yMax) * 150);
									return `${x},${y}`;
								})
								.join(" ")}
						/>

						{chartRows.map((row, index) => {
							const mappedIndex = dailySpend.findIndex(
								(item) => item.label === row.label && item.spend === row.spend,
							);
							const x =
								58 + mappedIndex * (462 / Math.max(dailySpend.length - 1, 1));
							return (
								<text
									key={`label-${row.label}-${index}`}
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
							USD
						</text>
						<text
							x="290"
							y="224"
							textAnchor="middle"
							fontSize="9"
							fill="#8f97a5"
						>
							Date
						</text>
					</svg>
					<div className="chart-legend">
						<span className="legend-item">
							<span className="legend-swatch blue" />
							Daily spend
						</span>
						<span className="legend-item">
							<span className="legend-swatch green" />
							7-day average
						</span>
					</div>

					<div className={styles.costTrendSecondary}>
						<small className="subtle">Cost per call trend (USD)</small>
						<svg
							className={`chart ${styles.costEfficiencyChart}`}
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

							{costPerCallTicks.map((value, index) => {
								const y =
									30 + index * ((180 - 30) / (costPerCallTicks.length - 1));
								return (
									<text
										key={`cpc-tick-${value}-${index}`}
										x="44"
										y={y + 3}
										textAnchor="end"
										fontSize="9"
										fill="#8f97a5"
									>
										{`$${value.toFixed(2)}`}
									</text>
								);
							})}

							{costPerCallWithAverage.map((row, index) => {
								const x =
									58 +
									index *
										(462 / Math.max(costPerCallWithAverage.length - 1, 1));
								const y =
									180 - Math.round((row.costPerCall / costPerCallMax) * 150);
								return (
									<circle
										key={`cpc-${row.label}-${index}`}
										cx={x}
										cy={y}
										r="2.6"
										fill="#6f8fff"
									/>
								);
							})}

							<polyline
								fill="none"
								stroke="#6f8fff"
								strokeWidth="2.2"
								points={costPerCallWithAverage
									.map((row, index) => {
										const x =
											58 +
											index *
												(462 / Math.max(costPerCallWithAverage.length - 1, 1));
										const y =
											180 -
											Math.round((row.costPerCall / costPerCallMax) * 150);
										return `${x},${y}`;
									})
									.join(" ")}
							/>

							<polyline
								fill="none"
								stroke="#22c98a"
								strokeWidth="2.1"
								strokeDasharray="5 4"
								points={costPerCallWithAverage
									.map((row, index) => {
										const x =
											58 +
											index *
												(462 / Math.max(costPerCallWithAverage.length - 1, 1));
										const y =
											180 -
											Math.round((row.movingAverage / costPerCallMax) * 150);
										return `${x},${y}`;
									})
									.join(" ")}
							/>

							{chartRows.map((row, index) => {
								const mappedIndex = dailySpend.findIndex(
									(item) =>
										item.label === row.label && item.spend === row.spend,
								);
								const x =
									58 + mappedIndex * (462 / Math.max(dailySpend.length - 1, 1));
								return (
									<text
										key={`cpc-label-${row.label}-${index}`}
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
								USD / call
							</text>
							<text
								x="290"
								y="224"
								textAnchor="middle"
								fontSize="9"
								fill="#8f97a5"
							>
								Date
							</text>
						</svg>
						<div className="chart-legend">
							<span className="legend-item">
								<span className="legend-swatch purple" />
								Cost per call
							</span>
							<span className="legend-item">
								<span className="legend-swatch green" />
								7-day average
							</span>
						</div>
					</div>
				</div>

				<div className={`stack ${styles.costMonitorStack}`}>
					<div className="card card-pad">
						<SectionTitle
							title="Cost KPIs"
							subtitle="Current monitoring baseline"
						/>
						<div className="status-donut">
							<div className="status-bar">
								<span
									style={{
										width: `${sourceA ? (sourceA[1] / totalSourceSpend) * 100 : 0}%`,
									}}
									className="segment success"
								/>
								<span
									style={{
										width: `${sourceB ? (sourceB[1] / totalSourceSpend) * 100 : 0}%`,
									}}
									className="segment info"
								/>
								<span
									style={{
										width: `${sourceC ? (sourceC[1] / totalSourceSpend) * 100 : 0}%`,
									}}
									className="segment warning"
								/>
								<span
									style={{
										width: `${sourceD ? (sourceD[1] / totalSourceSpend) * 100 : 0}%`,
									}}
									className="segment neutral"
								/>
							</div>
							<div className="pill-row">
								<span className="pill">MTD: {currency(kpis.mtdCost)}</span>
								<span className="pill">
									Avg/call: {currency(kpis.avgCostPerCall)}
								</span>
								<span className="pill">
									Top source: {kpis.highestCostSource}
								</span>
								<span className="pill">
									Source spend: {currency(kpis.highestCostSourceValue)}
								</span>
							</div>
						</div>
					</div>

					<div className={`card card-pad ${styles.spendSourceCard}`}>
						<SectionTitle
							title="Spend by source"
							subtitle="Top cost contributors"
						/>
						<div className="list">
							{spendBySource.map(([source, spend]) => {
								const pct = topSource
									? Math.round((spend / topSource[1]) * 100)
									: 0;
								return (
									<div className="list-item" key={source}>
										<div style={{ width: "100%" }}>
											<strong>{source}</strong>
											<small>{currency(spend)}</small>
											<div className="meter" style={{ marginTop: 8 }}>
												<span style={{ width: `${pct}%` }} />
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
