/**
 * nuxt-avdeb — AVDEB products in Nuxt, with your affiliate referral code on every link.
 *
 *   // nuxt.config.ts
 *   export default defineNuxtConfig({
 *     modules: ["nuxt-avdeb"],
 *     avdeb: { refCode: "YOURCODE", layout: "carousel" },
 *   });
 *
 * Adds the global components <AvdebProducts>, <AvdebProduct> and <AvdebButton> (usable in pages,
 * components and Nuxt Content / MDC), the useAvdebProducts() composable, and a small server route
 * that calls the AVDEB catalog API so your secret key never reaches the browser.
 */

import { addComponent, addImports, addServerHandler, createResolver, defineNuxtModule, useLogger } from "@nuxt/kit";

import type { Alignment, ButtonVariant, CardStyle, ImageRatio, Layout, ProductVariant, Theme } from "./runtime/core/constants";

export type { Alignment, ButtonVariant, CardStyle, ImageRatio, Layout, ProductVariant, Theme };
export type { AvdebPayload, AvdebSite } from "./runtime/core/payload";
export type { CardView } from "./runtime/core/view";
export type { Product } from "./runtime/core/catalog";

export interface ModuleOptions {
	/** Referral code added as ?ref= to every link. Env: NUXT_AVDEB_REF_CODE or AVDEB_REF_CODE. */
	refCode?: string;
	/** Secret key (avdeb_sk_…), server-only. Env: NUXT_AVDEB_API_KEY or AVDEB_SECRET_KEY. */
	apiKey?: string;
	/** Default layout for <AvdebProducts>. Default "grid". */
	layout?: Layout;
	/** Columns (1–6). Default 3. */
	columns?: number;
	cardStyle?: CardStyle;
	/** "site" (default) inherits your colours and fonts. */
	theme?: Theme | "inherit";
	/** Hex colour for buttons and highlights. */
	accentColor?: string;
	/** Corner radius in px (0–32). Default 16. */
	radius?: number;
	imageRatio?: ImageRatio;
	/** Button text on cards. Default "View product". */
	ctaLabel?: string;
	showPrice?: boolean;
	showCreator?: boolean;
	showBadges?: boolean;
	newTab?: boolean;
	/** Affiliate disclosure under embeds that carry a code. Default true. */
	showDisclosure?: boolean;
	disclosureText?: string;
	/** How long fetched products stay fresh, in minutes (5–2880). Default 360. */
	cacheMinutes?: number;
	/** Max catalog requests per minute. Default 120. */
	requestsPerMinute?: number;
	/** Locale for prices. Default "en-US". */
	locale?: string;
	/** Add the default stylesheet. Default true. */
	css?: boolean;
	/** Component name prefix. Default "Avdeb" (<AvdebProducts>). */
	prefix?: string;
	/** Route of the server endpoints. Default "/api/_avdeb". */
	apiBase?: string;
}

const SERVER_KEYS = [
	"refCode",
	"apiKey",
	"layout",
	"columns",
	"cardStyle",
	"theme",
	"accentColor",
	"radius",
	"imageRatio",
	"ctaLabel",
	"showPrice",
	"showCreator",
	"showBadges",
	"newTab",
	"showDisclosure",
	"disclosureText",
	"cacheMinutes",
	"requestsPerMinute",
	"locale",
] as const;

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: "nuxt-avdeb",
		configKey: "avdeb",
		compatibility: { nuxt: ">=3.17.0" },
	},
	defaults: {
		css: true,
		prefix: "Avdeb",
		apiBase: "/api/_avdeb",
	},
	setup(options, nuxt) {
		const logger = useLogger("nuxt-avdeb");
		const { resolve } = createResolver(import.meta.url);
		const apiBase = `/${String(options.apiBase || "/api/_avdeb").replace(/^\/+|\/+$/g, "")}`;

		// Server-only settings. Every key can be overridden at runtime with NUXT_AVDEB_* variables.
		// The referral code from .env / the build environment is baked in, so `node .output/server` and
		// `nuxt generate` work without extra runtime variables. The secret key is only read at runtime.
		const env = process.env;
		const server: Record<string, unknown> = { refCode: env.NUXT_AVDEB_REF_CODE || env.AVDEB_REF_CODE || "", apiKey: "" };
		for (const key of SERVER_KEYS) if (options[key] !== undefined) server[key] = options[key];
		const runtimeConfig = nuxt.options.runtimeConfig as Record<string, unknown> & { public: Record<string, unknown> };
		runtimeConfig.avdeb = { ...server, ...(runtimeConfig.avdeb as object | undefined) };
		runtimeConfig.public.avdeb = { apiBase, ...(runtimeConfig.public.avdeb as object | undefined) };

		if (typeof options.apiKey === "string" && options.apiKey && !options.apiKey.startsWith("$")) {
			logger.warn("Put the AVDEB secret key in NUXT_AVDEB_API_KEY (or AVDEB_SECRET_KEY) instead of nuxt.config so it isn't committed.");
		}

		// Product cache: memory unless you mount `avdeb` storage yourself (Redis, Cloudflare KV, fs…).
		nuxt.options.nitro.storage ||= {};
		nuxt.options.nitro.storage.avdeb ||= { driver: "memory" };

		addServerHandler({ route: `${apiBase}/products`, method: "get", handler: resolve("./runtime/server/api/_avdeb/products.get") });
		addServerHandler({ route: `${apiBase}/site`, method: "get", handler: resolve("./runtime/server/api/_avdeb/site.get") });

		const prefix = options.prefix || "Avdeb";
		for (const name of ["Products", "Product", "Button"]) {
			addComponent({ name: `${prefix}${name}`, filePath: resolve(`./runtime/components/Avdeb${name}.vue`), global: true });
		}
		addComponent({ name: `${prefix}Embed`, filePath: resolve("./runtime/components/AvdebEmbed.vue"), global: true });

		addImports([
			{ name: "useAvdebProducts", from: resolve("./runtime/composables/useAvdebProducts") },
			{ name: "useAvdebSite", from: resolve("./runtime/composables/useAvdebProducts") },
		]);

		if (options.css !== false) nuxt.options.css.push(resolve("./runtime/avdeb.css"));
	},
});
