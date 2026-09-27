import Image from "next/image";
import Link from "next/link";
import landing from "../landing.module.css";
import styles from "../legal.module.css";

export default function TermsPage() {
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
				<h1>Terms of Service</h1>

				<h2>1. Service description</h2>
				<p>
					Medinova Health provides a voice AI platform for healthcare practices
					 - including call handling, appointment booking, patient triage, and
					operational analytics - as a software-as-a-service subscription.
				</p>

				<h2>2. Eligibility</h2>
				<p>
					Services are available to UK-registered healthcare providers and their
					authorised staff. Each user must have a unique account. Credentials
					may not be shared.
				</p>

				<h2>3. Acceptable use</h2>
				<p>
					The platform must not be used for any unlawful purpose, to transmit
					harmful code, or in any way that could damage or impair the service.
					Practices are responsible for all activity under their accounts.
				</p>

				<h2>4. Service level</h2>
				<p>
					We target 99.7% uptime. Scheduled maintenance is communicated 48 hours
					in advance. Emergency maintenance may occur with minimal notice where
					required for security or stability.
				</p>

				<h2>5. Data processing</h2>
				<p>
					Medinova acts as a data processor. The practice is the data
					controller. A Data Processing Agreement is included as an annex to the
					service contract and signed at onboarding.
				</p>

				<h2>6. Fees and payment</h2>
				<p>
					Fees are as agreed in the service order. Invoices are issued monthly
					in arrears. Late payment may result in service suspension after 14
					days&apos; notice.
				</p>

				<h2>7. Termination</h2>
				<p>
					Either party may terminate with 30 days&apos; written notice. On
					termination, practice data is exported in standard formats and
					securely deleted within 60 days.
				</p>

				<h2>8. Limitation of liability</h2>
				<p>
					Medinova&apos;s liability is limited to the fees paid in the preceding
					12 months. Nothing in these terms limits liability for death, personal
					injury, or fraud.
				</p>

				<h2>9. Governing law</h2>
				<p>
					These terms are governed by English law. Disputes fall under the
					exclusive jurisdiction of the courts of England and Wales.
				</p>

				<p className={styles.legalUpdated}>Last updated: January 2026</p>
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
