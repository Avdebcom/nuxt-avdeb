<script setup lang="ts">
/**
 * One featured product: a horizontal card, a hero or a compact card.
 *
 * <AvdebProduct product="https://avdeb.com/store/custom-qr-code-keychain/" variant="hero" badge="Editor's pick" />
 */
import { computed } from "vue";

import { useAvdebProducts } from "../composables/useAvdebProducts";
import AvdebEmbed from "./AvdebEmbed.vue";
import { displayInput, displayProps, str } from "./props";

const props = defineProps({
	/** A product link (https://avdeb.com/store/…/) or handle. */
	product: str,
	/** Alias of `product`. */
	url: str,
	handle: str,
	/** horizontal (default), hero or card. */
	variant: str,
	/** Small label on the image, e.g. "Editor's pick". */
	badge: str,
	/** A note in your own words under the title. */
	note: str,
	...displayProps,
});

const { data } = await useAvdebProducts(
	computed(() => ({
		product: props.product || props.url || props.handle,
		variant: props.variant,
		badge: props.badge,
		note: props.note,
		...displayInput(props),
	})),
);
</script>

<template>
	<AvdebEmbed v-if="data && data.cards.length" :payload="data" :heading-level="headingLevel" />
</template>
