import { useRuntimeConfig, useStorage } from "nitropack/runtime";

import { maxLimit, sanitizeQuery } from "../../core/catalog";
import { createCatalogClient, type CatalogClient, type KVLike } from "../../core/client";
import { PACKAGE_NAME } from "../../core/constants";
import { parseEmbed, queryFor } from "../../core/options";
import type { AvdebPayload } from "../../core/payload";
import { disclosureFor, resolveSettings, type SiteSettings } from "../../core/settings";
import { buildCards, effectiveColumns, rootStyle, viewAllHref } from "../../core/view";

/** Nitro storage (memory by default; mount `avdeb` to Redis, KV, fs…) as the client's key-value store. */
function nitroKV(): KVLike {
	const storage = useStorage("avdeb");
	return {
		async get<T>(key: string) {
			return ((await storage.getItem(key)) as T | null) ?? null;
		},
		async set(key: string, value: unknown) {
			await storage.setItem(key, value as never);
		},
		async delete(key: string) {
			const had = await storage.hasItem(key);
			await storage.removeItem(key);
			return had;
		},
		async list(prefix = "") {
			const keys = await storage.getKeys(prefix);
			return Promise.all(keys.map(async (key) => ({ key, value: await storage.getItem(key) })));
		},
	};
}

interface State {
	id: string;
	settings: SiteSettings;
	client: CatalogClient;
	inflight: Map<string, Promise<{ products: AvdebPayload["products"]; ref: string; error: string | null }>>;
}

let state: State | null = null;

function env(): Record<string, string | undefined> {
	const e = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
	return { AVDEB_SECRET_KEY: e.AVDEB_SECRET_KEY, AVDEB_REF_CODE: e.AVDEB_REF_CODE };
}

export function useAvdeb(): State {
	const config = useRuntimeConfig().avdeb as Record<string, unknown>;
	const settings = resolveSettings(config, env());
	const id = JSON.stringify([settings.apiKey, settings.refCode, settings.cacheMinutes, settings.requestsPerMinute]);
	if (state?.id === id) {
		state.settings = settings;
		return state;
	}
	for (const w of settings.warnings) console.warn(`[${PACKAGE_NAME}] ${w}`);
	if (!settings.apiKey && !settings.refCode) {
		console.warn(`[${PACKAGE_NAME}] No AVDEB secret key or referral code set: product links won't earn commission.`);
	}
	state = {
		id,
		settings,
		client: createCatalogClient({
			kv: nitroKV(),
			fetch: (url, init) => fetch(url, init),
			apiKey: settings.apiKey,
			refCode: settings.refCode,
			cacheMinutes: settings.cacheMinutes,
			budgetPerMinute: settings.requestsPerMinute,
			log: { warn: (message, data) => console.warn(`[${PACKAGE_NAME}] ${message}`, (data as { error?: string })?.error ?? "") },
		}),
		inflight: new Map(),
	};
	return state;
}

const LOCALE_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

/** Products and render-ready cards for one embed. Never throws. */
export async function avdebPayload(attrs: Record<string, unknown>): Promise<AvdebPayload> {
	const s = useAvdeb();
	const options = parseEmbed(attrs, s.settings.display);
	const query = sanitizeQuery(queryFor(options), maxLimit(Boolean(s.settings.apiKey)));
	const key = JSON.stringify(query);
	let hit = s.inflight.get(key);
	if (!hit) {
		hit = s.client
			.products(query)
			.then((out) => ({ products: out.products, ref: out.ref || "", error: out.error ?? null }))
			.catch((error: unknown) => ({ products: [], ref: "", error: error instanceof Error ? error.message : String(error) }))
			.finally(() => s.inflight.delete(key));
		s.inflight.set(key, hit);
	}
	const out = await hit;
	const locale = typeof attrs.locale === "string" && LOCALE_RE.test(attrs.locale) ? attrs.locale : s.settings.locale;
	const single = options.mode === "product";
	const products = single ? out.products.slice(0, 1) : out.products;
	const cards = buildCards(products, options, { locale });
	const columns = single ? 1 : effectiveColumns(options, cards.length);
	return {
		options,
		cards,
		products,
		ref: out.ref,
		viewAll: !single && options.viewAll ? viewAllHref(query, out.products, out.ref) : null,
		disclosure: disclosureFor(s.settings, out.ref),
		columns,
		style: rootStyle(options, columns),
		error: out.error,
	};
}

/** The referral code links carry: the key owner's with a secret key, else `refCode`. */
export async function avdebRef(): Promise<string> {
	const s = useAvdeb();
	try {
		return (await s.client.ref()) || s.settings.refCode;
	} catch {
		return s.settings.refCode;
	}
}
