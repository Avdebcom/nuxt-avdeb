import type { PropType } from "vue";

const str = { type: String, default: undefined };
const num = { type: [Number, String] as PropType<number | string>, default: undefined };
// Booleans default to undefined (not false) so the module's site defaults apply.
const flag = { type: [Boolean, String] as PropType<boolean | string>, default: undefined };

/** Display options every embed can override. */
export const displayProps = {
	layout: str,
	columns: num,
	cardStyle: str,
	theme: str,
	accentColor: str,
	radius: num,
	imageRatio: str,
	ctaLabel: str,
	hidePrice: flag,
	hideCreator: flag,
	hideBadges: flag,
	newTab: flag,
	locale: str,
	/** Level of the section heading (card titles use the next level). Default 2. */
	headingLevel: num,
};

export function displayInput(p: Record<string, unknown>) {
	return {
		layout: p.layout as string | undefined,
		columns: p.columns as number | undefined,
		cardStyle: p.cardStyle as string | undefined,
		theme: p.theme as string | undefined,
		accentColor: p.accentColor as string | undefined,
		radius: p.radius as number | undefined,
		imageRatio: p.imageRatio as string | undefined,
		ctaLabel: p.ctaLabel as string | undefined,
		hidePrice: p.hidePrice as boolean | undefined,
		hideCreator: p.hideCreator as boolean | undefined,
		showBadges: p.hideBadges === undefined ? undefined : !(p.hideBadges === true || p.hideBadges === "" || p.hideBadges === "true"),
		newTab: p.newTab as boolean | undefined,
		locale: p.locale as string | undefined,
	};
}

export { str, num, flag };
