export const dynamic = "force-dynamic";

import { Pagination } from "@/components/pagination";
import { TranscriptModal } from "@/components/transcript-modal";
import { PageHeader, SectionTitle } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getCallsData } from "@/lib/data";
import { clockTime, compactDate, integer } from "@/lib/format";
import styles from "./calls.module.css";

type CallsPageProps = {
	searchParams?: Promise<{
		page?: string | string[];
	}>;
};

function badgeClass(value: string) {
	if (["URGENT", "HIGH", "SPAM", "YES"].includes(value)) return "danger";
	if (["MEDIUM", "NOT_SURE"].includes(value)) return "warning";
	return "success";
}

const S = { minWidth: 150 } as const;
const M = { minWidth: 180 } as const;
const L = { minWidth: 220 } as const;
const XL = { minWidth: 300 } as const;

export default async function CallsPage({ searchParams }: CallsPageProps) {
	await requireSession("user");
	const resolvedSearchParams = (await searchParams) ?? {};
	const rawPage = Array.isArray(resolvedSearchParams.page)
		? resolvedSearchParams.page[0]
		: resolvedSearchParams.page;
	const parsedPage = Number.parseInt(rawPage ?? "1", 10);
	const currentPage =
		Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const pageSize = 10;
	const { calls, total, kpis } = await getCallsData(currentPage, pageSize);
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const startIndex = (currentPage - 1) * pageSize;

	return (
		<div className={`screen-grid ${styles.callsPageStatic}`}>
			<PageHeader
				title="Call Classification"
				subtitle="Full classification data for every call — caller details, intent, urgency, spam detection, recommended actions, and transcript."
			/>

			<div className="kpi-grid">
				<div className="card card-pad metric">
					<div className="badge tone-blue">C</div>
					<div>
						<h3>Total calls</h3>
						<strong>{integer(total)}</strong>
						<div className="metric-detail">Queue records in the system</div>
					</div>
				</div>
				<div className="card card-pad metric">
					<div className="badge tone-red">U</div>
					<div>
						<h3>Urgent calls</h3>
						<strong>{integer(kpis.urgentCalls)}</strong>
						<div className="metric-detail">High urgency or emergency</div>
					</div>
				</div>
				<div className="card card-pad metric">
					<div className="badge tone-green">B</div>
					<div>
						<h3>Callback required</h3>
						<strong>{integer(kpis.followup)}</strong>
						<div className="metric-detail">Needs callback action</div>
					</div>
				</div>
				<div className="card card-pad metric">
					<div className="badge tone-yellow">$</div>
					<div>
						<h3>Spam blocked</h3>
						<strong>{integer(kpis.spamBlocked)}</strong>
						<div className="metric-detail">Spam calls closed safely</div>
					</div>
				</div>
			</div>

			<div className="card card-pad">
				<SectionTitle
					title="Call records"
					subtitle="All classification fields per call"
				/>
				<div className={`table-wrap ${styles.wideTableWrap}`}>
					<table>
						<thead>
							<tr>
								<th style={L}>Caller Name</th>
								<th style={M}>Caller Phone</th>
								<th style={S}>Language</th>
								<th style={XL}>Intent</th>
								<th style={M}>Is Spam</th>
								<th style={M}>Urgency</th>
								<th style={M}>Callback</th>
								<th style={XL}>Callback Reason</th>
								<th style={M}>Department</th>
								<th style={M}>Appt Date</th>
								<th style={S}>Appt Time</th>
								<th style={M}>Started</th>
								<th style={M}>Ended</th>
								<th>Call Details</th>
							</tr>
						</thead>
						<tbody>
							{calls.map((call) => {
								const steps = Array.isArray(call.recommendedNextSteps)
									? (call.recommendedNextSteps as string[]).join("; ")
									: "";
								return (
									<tr key={call.id}>
										<td style={L}>
											<div className="patient">
												<div className="avatar-calls" />
												<strong>{call.callerName}</strong>
											</div>
										</td>
										<td style={M}>{call.callerPhone || "-"}</td>
										<td style={S}>{call.callerLanguage}</td>
										<td style={XL}>{call.intent}</td>
										<td style={M}>
											<span
												className={`status ${badgeClass(call.isSpam === "SPAM" ? "SPAM" : call.isSpam === "NOT_SURE" ? "NOT_SURE" : "LOW")}`}
											>
												{call.isSpam}
											</span>
										</td>
										<td style={M}>
											<span
												className={`status ${badgeClass(call.urgency || "LOW")}`}
											>
												{call.urgency}
											</span>
										</td>
										<td style={M}>
											<span
												className={`status ${badgeClass(call.callbackRequired === "YES" ? "YES" : call.callbackRequired === "NOT_SURE" ? "NOT_SURE" : "LOW")}`}
											>
												{call.callbackRequired}
											</span>
										</td>
										<td style={XL}>{call.callbackRequiredReason || "-"}</td>
										<td style={M}>{call.recommendedDepartment || "-"}</td>
										<td style={M}>{call.appointmentDate || "-"}</td>
										<td style={S}>{call.appointmentTime || "-"}</td>
										<td style={M}>
											<div>{clockTime(call.startedAt)}</div>
											<small className="subtle">
												{compactDate(call.startedAt)}
											</small>
										</td>
										<td style={M}>
											{call.endedAt ? (
												<>
													<div>{clockTime(call.endedAt)}</div>
													<small className="subtle">
														{compactDate(call.endedAt)}
													</small>
												</>
											) : (
												"-"
											)}
										</td>
										<td className={styles.transcriptCell} style={M}>
											<TranscriptModal
												transcript={call.transcript}
												callerName={call.callerName}
												nextSteps={steps}
											/>
										</td>
									</tr>
								);
							})}
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
						page <= 1 ? "/user/calls" : `/user/calls?page=${page}`
					}
				/>
			</div>
		</div>
	);
}
