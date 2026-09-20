import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
	return (
		<main className={styles.wrapper}>
			<div className={styles.card}>
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

				<div className={styles.heroNumber}>404</div>

				<div className={styles.waveContainer} role="region">
					{Array.from({ length: 11 }).map((_, i) => (
						<div className={styles.waveBar} key={i} />
					))}
				</div>

				<h1 className={styles.title}>Page Not Found</h1>
				<p className={styles.subtitle}>
					This frequency doesn&apos;t exist or has been moved.
				</p>

				<div className={styles.actionsRow}>
					<Link href="/" className={styles.primaryBtn}>
						<Home size={15} />
						Reception
					</Link>

					<Link href="/user/dashboard" className={styles.secondaryBtn}>
						<ArrowLeft size={15} />
						Dashboard
					</Link>
				</div>
			</div>
		</main>
	);
}
