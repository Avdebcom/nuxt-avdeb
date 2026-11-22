/**
 * Turns catalog products + the widget config into ready-to-render view models.
 * Pure module: render.js only prints these values.
 */

import { avdebLink, hasRef, isAvdebUrl, type CatalogQuery, type Product } from "./catalog";
import type { ImageRatio } from "./constants";
import type { EmbedOptions as WidgetConfig } from "./options";

export interface CardView {
	key: string;
	href: string;
	rel: string;
	target: "_blank" | undefined;
	title: string;
	image: string | null;
	width: number;
	height: number;
	price: string | null;
	compareAt: string | null;
	discount: number | null;
	isNew: boolean;
	creator: string | null;
}

type CardOptions = Pick<WidgetConfig, "imageRatio" | "showPrice" | "showBadges" | "showCreator" | "newTab">;

const RATIO_SIZE: Record<ImageRatio, [number, number]> = {
	square: [600, 600],
	portrait: [600, 750],
	landscape: [600, 450],
};

export const RATIO_CSS: Record<ImageRatio, string> = {
	square: "1 / 1",
	portrait: "4 / 5",
	landscape: "4 / 3",
};

const NEW_DAYS = 14;

export function formatPrice(amount: number | null, currency: string, locale = "en-US"): string | null {
	if (amount === null) return null;
	try {
		return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
	} catch {
		return `${amount.toFixed(2)} ${currency}`;
	}
}

/** Whole-number discount (e.g. 25 for 25 % off), or null when there's no real markdown. */
export function discountPercent(price: number | null, compareAt: number | null): number | null {
	if (price === null || compareAt === null || compareAt <= price || compareAt <= 0) return null;
	const pct = Math.round((1 - price / compareAt) * 100);
	return pct >= 1 && pct < 100 ? pct : null;
}

export function isNew(createdAt: string | null, now: number, days = NEW_DAYS): boolean {
	if (!createdAt) return false;
	const t = Date.parse(createdAt);
	return Number.isFinite(t) && t <= now && now - t < days * 86_400_000;
}

/** Referral links are paid links: `sponsored` (Google) — plus `noopener` for new tabs. */
export function relFor(url: string): string {
	return hasRef(url) ? "sponsored noopener" : "noopener";
}

export function buildCards(
	products: Product[],
	options: CardOptions,
	{ locale = "en-US", now = Date.now() }: { locale?: string; now?: number } = {},
): CardView[] {
	const [width, height] = RATIO_SIZE[options.imageRatio];
	const cards: CardView[] = [];
	for (const p of products) {
		if (!isAvdebUrl(p.url)) continue;
		const hasSale = options.showPrice && p.compareAtPrice !== null && p.price !== null && p.compareAtPrice > p.price;
		cards.push({
			key: p.handle,
			href: p.url,
			rel: relFor(p.url),
			target: options.newTab ? "_blank" : undefined,
			title: p.title,
			image: p.image,
			width,
			height,
			price: options.showPrice ? formatPrice(p.price, p.currency, locale) : null,
			compareAt: hasSale ? formatPrice(p.compareAtPrice, p.currency, locale) : null,
			discount: options.showBadges && options.showPrice ? discountPercent(p.price, p.compareAtPrice) : null,
			isNew: options.showBadges && isNew(p.createdAt, now),
			creator: options.showCreator && p.creator ? p.creator.name : null,
		});
	}
	return cards;
}

/** "View all" target for a creator or category embed (with the referral code), else null. */
export function viewAllHref(query: CatalogQuery, products: Product[], ref: string): string | null {
	if (query.handle || query.q || query.type) return null;
	if (query.creator && !query.tag) {
		const fromApi = products.find((p) => p.creator?.slug === query.creator)?.creator?.url;
		return fromApi ?? (avdebLink(`/creators/${query.creator}/`, ref) || null);
	}
	if (query.tag && !query.creator) return avdebLink(`/category/${query.tag}/`, ref) || null;
	return null;
}

/** CSS custom properties for the embed root. Values are validated numbers/hex only. */
export function rootStyle(config: Pick<WidgetConfig, "radius" | "imageRatio" | "accentColor">, columns: number) {
	const style: Record<string, string> = {
		"--_avdeb-cols": String(Math.min(6, Math.max(1, Math.trunc(columns)))),
		"--_avdeb-radius": `${config.radius}px`,
		"--_avdeb-ratio": RATIO_CSS[config.imageRatio],
	};
	if (config.accentColor) style["--_avdeb-accent"] = config.accentColor;
	return style;
}

/** Columns actually used: never more than there are products (a lone card shouldn't be 1/3 wide). */
export function effectiveColumns(config: Pick<WidgetConfig, "layout" | "columns">, count: number): number {
	if (config.layout === "list") return 1;
	return Math.max(1, Math.min(config.columns, count || 1));
}
