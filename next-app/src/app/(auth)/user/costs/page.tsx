export const revalidate = 60;

import { Pagination } from "@/components/pagination";
import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getCostsData } from "@/lib/data";
import { clockTime, compactDate, currency } from "@/lib/format";

type CostsPageProps = {
	searchParams?: Promise<{
		page?: string | string[];
	}>;
};

export default async function CostsPage({ searchParams }: CostsPageProps) {
	await requireSession("user");
	const resolvedSearchParams = (await searchParams) ?? {};
	const rawPage = Array.isArray(resolvedSearchParams.page)
		? resolvedSearchParams.page[0]
		: resolvedSearchParams.page;
	const parsedPage = Number.parseInt(rawPage ?? "1", 10);
	const currentPage =
		Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const pageSize = 7;
	const {
		org,
		calls,
		total,
		totalCallCost,
		totalCallMinutes,
		averageCostPerMinute,
		highestCostCallCost,
	} = await getCostsData(currentPage, pageSize);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const startIndex = (currentPage - 1) * pageSize;

	return (
		<div className="screen-grid calls-page-static">
			<PageHeader
				title="Cost Tracking"
				subtitle={`${org.name} automatically tracks every call's minutes and billing, so your team can monitor cost per minute in real time.`}
			/>

			<div className="kpi-grid">
				<div className="card card-pad metric">
					<div className="badge tone-yellow">$</div>
					<div>
						<h3>Total call cost</h3>
						<strong>{currency(totalCallCost)}</strong>
						<div className="metric-detail">All calls in this workspace</div>
					</div>
				</div>
				<div className="card card-pad metric">
					<div className="badge tone-green">m</div>
					<div>
						<h3>Total call minutes</h3>
						<strong>{totalCallMinutes.toFixed(1)} min</strong>
						<div className="metric-detail">Sum of call duration</div>
					</div>
				</div>
				<div className="card card-pad metric">
					<div className="badge tone-blue">¢</div>
					<div>
						<h3>Avg cost / minute</h3>
						<strong>{currency(averageCostPerMinute)}</strong>
						<div className="metric-detail">Average billing efficiency</div>
					</div>
				</div>
				<div className="card card-pad metric">
					<div className="badge tone-red">!</div>
					<div>
						<h3>Highest-cost call</h3>
						<strong>{currency(highestCostCallCost)}</strong>
						<div className="metric-detail">Most expensive single call</div>
					</div>
				</div>
			</div>

			<div className="card card-pad">
				<SectionTitle
					title="Call cost records"
					subtitle="Per-call minute and billing breakdown"
				/>
				<div className="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Caller</th>
								<th>Duration</th>
								<th>Call cost</th>
								<th>Cost / minute</th>
								<th>Time</th>
							</tr>
						</thead>
						<tbody>
							{calls.map((call) => (
								<tr key={call.id}>
									<td>
										<div className="patient">
											<div className="avatar-calls" />
											<div className="caller-meta">
												<strong>{call.callerName}</strong>
												<small className="subtle caller-subline">
													{call.callerPhone ?? "No phone on file"}
												</small>
											</div>
										</div>
									</td>
									<td>{call.callMinutes.toFixed(1)} min</td>
									<td>{currency(call.costUsd)}</td>
									<td>
										{call.callMinutes > 0
											? currency(call.costPerMinute)
											: "N/A"}
									</td>
									<td>
										<div className="caller-meta">
											<div>{clockTime(call.startedAt)}</div>
											<small className="subtle caller-subline">
												{compactDate(call.startedAt)}
											</small>
										</div>
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
					endIndex={startIndex + calls.length}
					hrefBuilder={(page) =>
						page <= 1 ? "/user/costs" : `/user/costs?page=${page}`
					}
				/>
			</div>
		</div>
	);
}
