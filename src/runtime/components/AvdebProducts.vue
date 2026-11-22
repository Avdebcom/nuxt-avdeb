<script setup lang="ts">
/**
 * AVDEB products: a creator's shop, a category, a search or the newest products.
 *
 * <AvdebProducts url="https://avdeb.com/category/stickers/" layout="carousel" />
 * <AvdebProducts creator="cleo" :limit="8" heading="From my shop" />
 */
import { computed } from "vue";

import { useAvdebProducts } from "../composables/useAvdebProducts";
import AvdebEmbed from "./AvdebEmbed.vue";
import { displayInput, displayProps, flag, num, str } from "./props";

const props = defineProps({
	/** Any AVDEB creator, category or product link (detected automatically), or search words. */
	url: str,
	creator: str,
	tag: str,
	type: str,
	q: str,
	/** How many products (default 6; up to 12 without a secret key, 48 with one). */
	limit: num,
	heading: str,
	intro: str,
	/** Show a "View all" link for creator and category embeds (default true). */
	viewAll: flag,
	viewAllLabel: { type: String, default: "View all" },
	...displayProps,
});

const { data } = await useAvdebProducts(
	computed(() => ({
		url: props.url,
		creator: props.creator,
		tag: props.tag,
		type: props.type,
		q: props.q,
		limit: props.limit,
		heading: props.heading,
		intro: props.intro,
		viewAll: props.viewAll as boolean | undefined,
		...displayInput(props),
	})),
);
</script>

<template>
	<AvdebEmbed
		v-if="data && data.cards.length"
		:payload="data"
		:heading-level="headingLevel"
		:view-all-label="viewAllLabel"
	/>
</template>
