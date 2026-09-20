"use client";

import { AlertCircle, Home, RotateCw, WifiOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./error-display.module.css";

type ErrorDisplayProps = {
	error: Error & { digest?: string };
	reset: () => void;
	sectionTitle?: string;
};

function isDatabaseOrNetworkError(err: Error): boolean {
	const msg = (err?.message || "").toLowerCase();
	const name = (err?.name || "").toLowerCase();
	return (
		msg.includes("server selection timeout") ||
		msg.includes("replicasetnoprimary") ||
		msg.includes("timed out") ||
		msg.includes("timeout") ||
		msg.includes("i/o error") ||
		msg.includes("connection was forcibly closed") ||
		msg.includes("econnrefused") ||
		msg.includes("etimedout") ||
		msg.includes("no available servers") ||
		msg.includes("mongodb") ||
		msg.includes("prismaclientinitializationerror") ||
		msg.includes("prismaclientknownrequesterror") ||
		name.includes("prismaclient")
	);
}

export function ErrorDisplay({ error, reset }: ErrorDisplayProps) {
	const [isRetrying, setIsRetrying] = useState(false);
	const isDbIssue = isDatabaseOrNetworkError(error);

	function handleReconnect() {
		setIsRetrying(true);
		try {
			reset();
		} catch {
			// ignore
		}
		window.location.reload();
	}

	return (
		<main className={styles.errorWrapper}>
			<div className={styles.errorCard}>
				{/* Brand Bar */}
				<div className={styles.brandBar}>
					<Image
						src="/medinova.svg"
						alt="Medinova logo"
						width={22}
						height={22}
						priority
					/>
					<span className={styles.brandName}>Medinova Health</span>
				</div>

				{/* Icon Indicator */}
				<div
					className={`${styles.iconCircle} ${isDbIssue ? styles.warning : styles.danger}`}
				>
					{isDbIssue ? <WifiOff size={24} /> : <AlertCircle size={24} />}
				</div>

				{/* Title & Message */}
				<h1 className={styles.title}>
					{isDbIssue ? "Connection Unavailable" : "Something Went Wrong"}
				</h1>
				<p className={styles.message}>
					{isDbIssue
						? "Unable to reach the database. If you are using a VPN (such as ProtonVPN), please disconnect or authorize your IP to continue."
						: "An unexpected error occurred. Please try reconnecting or return to the dashboard."}
				</p>

				{/* Actions */}
				<div className={styles.actionsRow}>
					<button
						type="button"
						className={styles.primaryBtn}
						onClick={handleReconnect}
						disabled={isRetrying}
					>
						<RotateCw size={14} className={isRetrying ? styles.spin : ""} />
						{isRetrying
							? "Reconnecting..."
							: isDbIssue
								? "Reconnect"
								: "Try Again"}
					</button>

					<Link href="/" className={styles.secondaryBtn}>
						<Home size={14} />
						Reception
					</Link>
				</div>
			</div>
		</main>
	);
}
