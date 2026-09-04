import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "Medinova Health",
	description:
		"A healthcare voice-to-voice operations platform for clinics and hospitals.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={inter.variable}>
			{/* suppressHydrationWarning: Vercel SpeedInsights/Analytics inject client-only nodes */}
			<body suppressHydrationWarning>
				{children}
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
