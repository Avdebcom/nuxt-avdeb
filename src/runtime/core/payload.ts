/**
 * What the products endpoint returns: everything a component needs to render, already validated
 * and escaped by Vue. Pure module, shared by the server route and the components.
 */

import type { Product } from "./catalog";
import type { EmbedOptions } from "./options";
import type { CardView } from "./view";

export interface AvdebPayload {
	/** The embed's options after site defaults and validation. */
	options: EmbedOptions;
	/** Render-ready cards (formatted prices, rel, target, image size). */
	cards: CardView[];
	/** Validated products as returned by the catalog API (links already carry your referral code). */
	products: Product[];
	/** Referral code in use ("" when none). */
	ref: string;
	/** "View all" link for a creator or category embed, else null. */
	viewAll: string | null;
	/** Affiliate disclosure to show under the products, or null. */
	disclosure: string | null;
	/** Columns actually used (never more than there are products). */
	columns: number;
	/** Inline CSS custom properties for the embed root. */
	style: Record<string, string>;
	/** Set when AVDEB couldn't be reached (the last good copy may still be shown). */
	error: string | null;
}

export interface AvdebSite {
	ref: string;
	accentColor: string;
	newTab: boolean;
}
