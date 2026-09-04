import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
	poweredByHeader: false,
	compress: true,
	turbopack: {
		root: projectRoot,
	},
	async redirects() {
		return [
			{
				source: "/dashboard",
				destination: "/user/dashboard",
				permanent: false,
			},
			{
				source: "/voice-desk",
				destination: "/user/voice-desk",
				permanent: false,
			},
			{ source: "/calls", destination: "/user/calls", permanent: false },
			{ source: "/booking", destination: "/user/booking", permanent: false },
			{
				source: "/analytics",
				destination: "/user/analytics",
				permanent: false,
			},
			{ source: "/reports", destination: "/user/reports", permanent: false },
			{ source: "/costs", destination: "/user/costs", permanent: false },
			{
				source: "/notifications",
				destination: "/user/notifications",
				permanent: false,
			},
			{ source: "/patients", destination: "/user/patients", permanent: false },
			{
				source: "/ai-bot-settings",
				destination: "/user/ai-bot-settings",
				permanent: false,
			},
		];
	},
	async headers() {
		return [
			{
				source: "/assets/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/:path*.(svg|ico|png|jpg|webp)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=86400, stale-while-revalidate=31536000",
					},
				],
			},
		];
	},
};

export default nextConfig;
