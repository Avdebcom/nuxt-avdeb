import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { useFetch, useRuntimeConfig } from "#imports";

import type { AvdebPayload, AvdebSite } from "../core/payload";
import { avdebQuery, type AvdebInput } from "../core/query";

export type { AvdebInput };

/**
 * Products and render-ready cards for your own markup (or for <AvdebEmbed :payload>).
 *
 * @example
 * const { data } = await useAvdebProducts({ creator: "cleo", limit: 4 });
 * // data.value.cards → [{ href, title, image, price, … }]
 */
export function useAvdebProducts(input: MaybeRefOrGetter<AvdebInput>) {
	const { apiBase } = useRuntimeConfig().public.avdeb as { apiBase: string };
	const query = computed(() => avdebQuery(toValue(input)));
	return useFetch<AvdebPayload>(`${apiBase}/products`, {
		query,
		key: computed(() => `avdeb:${JSON.stringify(query.value)}`),
		dedupe: "defer",
	});
}

/** The referral code and the site's button defaults (shared by every <AvdebButton>). */
export function useAvdebSite() {
	const { apiBase } = useRuntimeConfig().public.avdeb as { apiBase: string };
	return useFetch<AvdebSite>(`${apiBase}/site`, { key: "avdeb:site", dedupe: "defer" });
}
