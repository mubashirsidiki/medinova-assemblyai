import Image from "next/image";
import Link from "next/link";
import landing from "../landing.module.css";
import styles from "../legal.module.css";

export default function PrivacyPage() {
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
				<h1>Privacy Policy</h1>

				<h2>1. Information we collect</h2>
				<p>
					Medinova Health processes call recordings, transcriptions, patient
					names, phone numbers, and appointment details solely to provide our
					voice agent and practice management services.
				</p>

				<h2>2. How we use it</h2>
				<p>
					All data is used exclusively for delivering the Medinova service - 
					routing calls, booking appointments, generating analytics, and
					improving voice recognition accuracy. We do not sell or share data
					with third parties.
				</p>

				<h2>3. Legal basis</h2>
				<p>
					Processing is carried out under UK GDPR Article 6(1)(b) (contractual
					necessity) and Article 9(2)(h) (health or social care purposes).
					Medinova acts as a data processor on behalf of healthcare provider
					organisations.
				</p>

				<h2>4. Data storage</h2>
				<p>
					Data is stored within the UK and EEA on encrypted infrastructure. Call
					recordings are retained for 90 days by default. Practice
					administrators may configure shorter retention periods.
				</p>

				<h2>5. Your rights</h2>
				<p>
					Patients and practices have the right to access, rectify, or request
					deletion of their data. To exercise these rights, contact the
					healthcare provider that uses Medinova, or reach us at the contact
					page.
				</p>

				<h2>6. Security</h2>
				<p>
					All data is encrypted in transit and at rest. Access is restricted to
					authorised personnel via role-based controls. We maintain ISO
					27001-aligned security practices and conduct regular penetration
					testing.
				</p>

				<h2>7. Changes</h2>
				<p>
					This policy is reviewed quarterly. Material changes will be
					communicated to practice administrators 30 days in advance.
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
