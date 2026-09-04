import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function PageHeader({
	title,
	subtitle,
	action,
}: {
	title: string;
	subtitle?: string;
	action?: { label: string; href: string };
}) {
	return (
		<div className="route-head">
			<div>
				<h2>{title}</h2>
				{subtitle ? <p>{subtitle}</p> : null}
			</div>
			{action ? (
				<Link href={action.href} className="action-btn primary">
					{action.label}
					<ArrowUpRight size={16} />
				</Link>
			) : null}
		</div>
	);
}

export function StatCard({
	label,
	value,
	detail,
	tone = "blue",
}: {
	label: string;
	value: string;
	detail?: string;
	tone?: "blue" | "green" | "yellow" | "red";
}) {
	return (
		<div className="card card-pad metric">
			<div className={`badge tone-${tone}`}>{label.slice(0, 1)}</div>
			<div>
				<h3>{label}</h3>
				<strong>{value}</strong>
				{detail ? <div className="metric-detail">{detail}</div> : null}
			</div>
		</div>
	);
}

export function SectionTitle({
	title,
	subtitle,
}: {
	title: string;
	subtitle?: string;
}) {
	return (
		<div className="card-head">
			<h3>{title}</h3>
			{subtitle ? <small>{subtitle}</small> : null}
		</div>
	);
}

export function EmptyState({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="card card-pad empty-state">
			<strong>{title}</strong>
			<p>{description}</p>
		</div>
	);
}
