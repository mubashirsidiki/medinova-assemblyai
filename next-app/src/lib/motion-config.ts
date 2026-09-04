import type { Transition, UseInViewOptions, Variants } from "motion/react";

const EASE_SMOOTH: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export const sectionTransition: Transition = {
	duration: 0.6,
	ease: EASE_SMOOTH,
};

export const viewportOnce: UseInViewOptions = { once: true, margin: "-80px" };

export const staggerContainer: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.1, delayChildren: 0.05 },
	},
};

export function getVariants(reduced: boolean | null) {
	return {
		fadeInUp: reduced
			? ({ hidden: { opacity: 0 }, visible: { opacity: 1 } } satisfies Variants)
			: ({
					hidden: { opacity: 0, y: 24 },
					visible: { opacity: 1, y: 0 },
				} satisfies Variants),
		fadeIn: {
			hidden: { opacity: 0 },
			visible: { opacity: 1 },
		} satisfies Variants,
		scaleIn: reduced
			? ({ hidden: { opacity: 0 }, visible: { opacity: 1 } } satisfies Variants)
			: ({
					hidden: { opacity: 0, scale: 0.92 },
					visible: { opacity: 1, scale: 1 },
				} satisfies Variants),
		stepNum: reduced
			? ({ hidden: { opacity: 0 }, visible: { opacity: 1 } } satisfies Variants)
			: ({
					hidden: { opacity: 0, scale: 0.8 },
					visible: { opacity: 1, scale: 1 },
				} satisfies Variants),
	};
}

export function getTransition(reduced: boolean | null): Transition {
	return reduced ? { duration: 0.01 } : { duration: 0.6, ease: EASE_SMOOTH };
}
