import Image from "next/image";
import Link from "next/link";
import landing from "../landing.module.css";
import styles from "../legal.module.css";

export default function ContactPage() {
	return (
		<div className={`${landing.landingPage} ${styles.legalPage}`}>
			<nav className={landing.landingNav}>
				<Link href="/" className={landing.landingNavBrand}>
					Medinova Health
				</Link>
				<div className={landing.landingNavLinks}>
					<Link href="/login" className={landing.landingNavSignin}>
						Sign In →
					</Link>
				</div>
			</nav>

			<div className={styles.legalContent}>
				<Link href="/" className={styles.legalBack}>
					← Back
				</Link>
				<h1>Contact us</h1>
				<p className={styles.legalLead}>
					We work with UK healthcare providers of every size. Reach us by email
					or phone and we will respond within one business day.
				</p>

				<div className={styles.contactGrid}>
					<div className={styles.contactCard}>
						<h2>General enquiries</h2>
						<p>hello@medinova-health.co.uk</p>
					</div>
					<div className={styles.contactCard}>
						<h2>Support</h2>
						<p>support@medinova-health.co.uk</p>
					</div>
					<div className={styles.contactCard}>
						<h2>Phone</h2>
						<p>+44 113 496 0782</p>
						<small className="subtle">Monday to Friday, 8am to 6pm</small>
					</div>
					<div className={styles.contactCard}>
						<h2>Registered office</h2>
						<p>
							Medinova Health Ltd
							<br />
							71-75 Shelton Street
							<br />
							London, WC2H 9JQ
							<br />
							United Kingdom
						</p>
					</div>
				</div>
			</div>

			<footer className={landing.landingFooter}>
				<div className={landing.landingFooterBrand}>
					<Image src="/medinova.svg" alt="" width={22} height={22} />
					<span>Medinova Health Ltd, Leeds, United Kingdom</span>
				</div>
				<div className={landing.landingFooterLinks}>
					<Link href="/privacy">Privacy</Link>
					<Link href="/terms">Terms</Link>
					<Link href="/contact">Contact</Link>
					<span className={landing.landingFooterCopy}>
						&copy; 2026 Medinova Health
					</span>
				</div>
			</footer>
		</div>
	);
}
