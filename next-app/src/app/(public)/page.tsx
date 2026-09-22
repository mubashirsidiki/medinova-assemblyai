"use client";

import { Loader2 } from "lucide-react";
import {
	motion,
	useMotionValueEvent,
	useReducedMotion,
	useScroll,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeroVisual } from "@/components/landing/hero-visual";
import {
	getTransition,
	getVariants,
	staggerContainer,
	viewportOnce,
} from "@/lib/motion-config";
import styles from "./landing.module.css";

export default function LandingPage() {
	const router = useRouter();
	const [navScrolled, setNavScrolled] = useState(false);
	const [navigating, setNavigating] = useState(false);
	const reduced = useReducedMotion();
	const v = getVariants(reduced);
	const t = getTransition(reduced);

	const { scrollY } = useScroll();
	useMotionValueEvent(scrollY, "change", (latest) => {
		setNavScrolled(latest > 100);
	});

	return (
		<div className={styles.landingPage}>
			{/* Nav */}
			<nav
				className={`${styles.landingNav} ${navScrolled ? styles.scrolled : ""}`}
			>
				<Link href="/" className={styles.landingNavBrand}>
					<Image
						src="/medinova.svg"
						alt="Medinova logo"
						width={36}
						height={36}
						priority
					/>
					<span>Medinova Health</span>
				</Link>
				<div className={styles.landingNavLinks}>
					<button
						type="button"
						className={styles.landingNavSignin}
						disabled={navigating}
						onClick={() => {
							setNavigating(true);
							router.push("/login");
						}}
					>
						{navigating ? <Loader2 size={14} className="spin" /> : null}
						{navigating ? (
							"Loading…"
						) : (
							<>
								Sign In <span aria-hidden="true">→</span>
							</>
						)}
					</button>
				</div>
			</nav>

			{/* Hero */}
			<section className={styles.landingHero}>
				<motion.div
					className={styles.landingHeroCopy}
					variants={staggerContainer}
					initial="hidden"
					animate="visible"
				>
					<motion.h1
						variants={v.fadeInUp}
						transition={{ ...t, delay: 0.3, duration: 0.6 }}
					>
						Voice AI for modern healthcare providers
					</motion.h1>
					<motion.p variants={v.fadeInUp} transition={{ ...t, delay: 0.5 }}>
						Medinova Health handles patient calls, books appointments, and flags
						urgent cases so your practice can focus on care, not admin.
					</motion.p>
					<motion.div
						className={styles.landingCtaRow}
						variants={v.fadeInUp}
						transition={{ ...t, delay: 0.65 }}
					>
						<Link href="/contact" className={styles.landingBtnPrimary}>
							Book a free discovery call with us
						</Link>
						<a href="tel:+14844812043" className={styles.landingBtnSecondary}>
							Call Agent: +1 (484) 481-2043
						</a>
					</motion.div>
				</motion.div>
				<motion.div
					className={styles.landingHeroVisual}
					aria-hidden="true"
					initial={
						reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, x: 24 }
					}
					animate={{ opacity: 1, scale: 1, x: 0 }}
					transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
				>
					<HeroVisual />
				</motion.div>
			</section>

			{/* Features */}
			<motion.section
				className={styles.landingFeatures}
				id="features"
				variants={staggerContainer}
				initial="hidden"
				whileInView="visible"
				viewport={viewportOnce}
			>
				<motion.h2 variants={v.fadeInUp} transition={t}>
					Built for clinical excellence. Refined for your practice.
				</motion.h2>
				<div className={styles.landingFeaturesGrid}>
					<motion.div
						className={styles.landingFeatureCard}
						variants={v.fadeInUp}
						transition={t}
						whileHover={
							reduced
								? {}
								: { y: -4, boxShadow: "0 12px 40px rgba(53,70,109,0.12)" }
						}
					>
						<div className={styles.landingFeatureIcon} aria-hidden="true">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#3b6cff"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.08 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
							</svg>
						</div>
						<h3>Intelligent Call Handling</h3>
						<p>
							Natural voice conversations that understand diverse accents,
							clinical workflows, and patient urgency. Routes every call to the
							right team instantly.
						</p>
					</motion.div>

					<motion.div
						className={styles.landingFeatureCard}
						variants={v.fadeInUp}
						transition={t}
						whileHover={
							reduced
								? {}
								: { y: -4, boxShadow: "0 12px 40px rgba(53,70,109,0.12)" }
						}
					>
						<div className={styles.landingFeatureIcon} aria-hidden="true">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#22c98a"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
						</div>
						<h3>Automated Booking &amp; Sync</h3>
						<p>
							Patients book appointments by voice. Calendar syncs with practice
							calendars and sends SMS confirmations, zero admin overhead for
							your reception team.
						</p>
					</motion.div>

					<motion.div
						className={styles.landingFeatureCard}
						variants={v.fadeInUp}
						transition={t}
						whileHover={
							reduced
								? {}
								: { y: -4, boxShadow: "0 12px 40px rgba(53,70,109,0.12)" }
						}
					>
						<div className={styles.landingFeatureIcon} aria-hidden="true">
							<svg
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#f3b21f"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<line x1="18" y1="20" x2="18" y2="10" />
								<line x1="12" y1="20" x2="12" y2="4" />
								<line x1="6" y1="20" x2="6" y2="14" />
							</svg>
						</div>
						<h3>Real-Time Analytics &amp; Compliance</h3>
						<p>
							Live dashboards track every call, flag urgent cases, and support
							clinical data workflows with full audit logging and AssemblyAI
							transcription.
						</p>
					</motion.div>
				</div>
			</motion.section>

			{/* How It Works */}
			<motion.section
				className={styles.landingHow}
				variants={staggerContainer}
				initial="hidden"
				whileInView="visible"
				viewport={viewportOnce}
			>
				<motion.h2 variants={v.fadeInUp} transition={t}>
					How it works
				</motion.h2>
				<motion.p
					className={styles.landingSectionSub}
					variants={v.fadeIn}
					transition={{ ...t, delay: 0.1 }}
				>
					Three steps to a smarter practice. Typically live within 24 hours.
				</motion.p>
				<div className={styles.landingSteps}>
					<motion.div
						className={styles.landingStep}
						variants={v.fadeInUp}
						transition={t}
					>
						<motion.div
							className={styles.landingStepNum}
							variants={v.stepNum}
							transition={t}
						>
							1
						</motion.div>
						<h3>Connect your practice</h3>
						<p>
							We assign a local number and configure your department workflows,
							escalation rules, and calendar sync same day.
						</p>
					</motion.div>
					<motion.div
						className={styles.landingStep}
						variants={v.fadeInUp}
						transition={t}
					>
						<motion.div
							className={styles.landingStepNum}
							variants={v.stepNum}
							transition={t}
						>
							2
						</motion.div>
						<h3>Your AI voice agent goes live</h3>
						<p>
							Medinova Health answers incoming calls, understands patient needs
							in natural conversation, and routes or resolves each one
							automatically.
						</p>
					</motion.div>
					<motion.div
						className={styles.landingStep}
						variants={v.fadeInUp}
						transition={t}
					>
						<motion.div
							className={styles.landingStepNum}
							variants={v.stepNum}
							transition={t}
						>
							3
						</motion.div>
						<h3>Monitor, refine, scale</h3>
						<p>
							Your team views live dashboards. The AI learns from every
							interaction and adapts to your practice&apos;s unique patterns.
						</p>
					</motion.div>
				</div>
			</motion.section>

			{/* Trust */}
			<motion.section
				className={styles.landingTrust}
				variants={staggerContainer}
				initial="hidden"
				whileInView="visible"
				viewport={viewportOnce}
			>
				<motion.p
					className={styles.landingTrustLabel}
					variants={v.fadeIn}
					transition={t}
				>
					Engineered for clinics, outpatient centers, and healthcare networks
				</motion.p>
				<motion.div
					className={styles.landingTrustStats}
					variants={v.fadeInUp}
					transition={{ ...t, delay: 0.15 }}
				>
					<motion.div
						className={styles.landingTrustStat}
						variants={v.fadeIn}
						transition={{ ...t, delay: 0 }}
					>
						<strong>99.7%</strong>
						<span>Uptime</span>
					</motion.div>
					<div className={styles.landingTrustDivider} aria-hidden="true" />
					<motion.div
						className={styles.landingTrustStat}
						variants={v.fadeIn}
						transition={{ ...t, delay: 0.08 }}
					>
						<strong>24/7</strong>
						<span>Patient coverage</span>
					</motion.div>
					<div className={styles.landingTrustDivider} aria-hidden="true" />
					<motion.div
						className={styles.landingTrustStat}
						variants={v.fadeIn}
						transition={{ ...t, delay: 0.16 }}
					>
						<strong>&lt; 2s</strong>
						<span>Response time</span>
					</motion.div>
				</motion.div>
				<motion.p
					className={styles.landingTrustLocation}
					variants={v.fadeIn}
					transition={{ ...t, delay: 0.4 }}
				>
					Built for high-volume healthcare operations
				</motion.p>
			</motion.section>

			{/* Medical & Emergency Safety Notice */}
			<div className={styles.landingDisclaimer}>
				<strong>Medical &amp; Emergency Disclaimer</strong>
				<span>
					Medinova Health is an administrative voice AI assistant for patient
					intake and appointment scheduling. It does not provide medical
					diagnosis, clinical treatment, or emergency triage. If you are
					experiencing a medical emergency, please call 911 immediately.
				</span>
			</div>

			{/* Footer */}
			<motion.footer
				className={styles.landingFooter}
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={viewportOnce}
				transition={{ duration: 0.5 }}
			>
				<div className={styles.landingFooterBrand}>
					<Image
						src="/medinova.svg"
						alt="Medinova logo"
						width={22}
						height={22}
					/>
					<span>Medinova Health Network</span>
				</div>
				<div className={styles.landingFooterLinks}>
					<Link href="/privacy">Privacy</Link>
					<Link href="/terms">Terms</Link>
					<Link href="/contact">Contact</Link>
					<span className={styles.landingFooterCopy}>
						&copy; 2026 Medinova Health
					</span>
				</div>
			</motion.footer>
		</div>
	);
}
