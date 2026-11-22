<script setup lang="ts">
/**
 * A referral button to any avdeb.com page.
 *
 * <AvdebButton href="/creators/cleo/" label="Visit my shop" variant="outline" align="center" />
 */
import { computed } from "vue";

import { avdebLink } from "../core/catalog";
import { parseButton, safeColor } from "../core/options";
import { relFor } from "../core/view";
import { useAvdebSite } from "../composables/useAvdebProducts";

const props = defineProps({
	/** An avdeb.com link or path, e.g. "/creators/cleo/". */
	href: { type: String, default: "/" },
	label: { type: String, default: undefined },
	/** solid (default), outline or link. */
	variant: { type: String, default: undefined },
	/** start (default), center or end. */
	align: { type: String, default: undefined },
	newTab: { type: [Boolean, String], default: undefined },
	accentColor: { type: String, default: undefined },
});

const { data: site } = await useAvdebSite();

const button = computed(() => parseButton({ href: props.href, label: props.label, variant: props.variant, align: props.align }));
const url = computed(() => avdebLink(button.value.href, site.value?.ref ?? ""));
const accent = computed(() => safeColor(props.accentColor) || site.value?.accentColor || "");
const newTab = computed(() =>
	props.newTab === undefined ? Boolean(site.value?.newTab) : props.newTab === true || props.newTab === "" || props.newTab === "true",
);
</script>

<template>
	<p
		v-if="url"
		:class="['avdeb-cta', `avdeb-cta--${button.align}`]"
		:style="accent ? { '--_avdeb-accent': accent } : undefined"
	>
		<a
			:class="['avdeb-btn', `avdeb-btn--${button.variant}`]"
			:href="url"
			:rel="relFor(url)"
			:target="newTab ? '_blank' : undefined"
		>{{ button.label }}<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h9.5M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></a>
	</p>
</template>
