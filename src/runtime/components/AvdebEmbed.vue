<script setup lang="ts">
/**
 * Renders an AVDEB payload in every layout: grid, carousel, list, spotlight, and the single-product
 * variants (card / horizontal / hero). Same markup and BEM classes as the other AVDEB integrations,
 * so avdeb.css is shared. The only script is the carousel arrows (no network, no cookies).
 */
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import type { AvdebPayload } from "../core/payload";
import { relFor } from "../core/view";

const props = defineProps<{
	payload: AvdebPayload;
	headingLevel?: number | string;
	viewAllLabel?: string;
}>();

const o = computed(() => props.payload.options);
const single = computed(() => o.value.mode === "product");
const layout = computed(() => (single.value ? "single" : o.value.layout));
const isCarousel = computed(() => layout.value === "carousel");
const heading = computed(() => (single.value ? "" : o.value.heading));
const intro = computed(() => (single.value ? "" : o.value.intro));
const level = computed(() => Math.max(2, Math.min(5, Math.trunc(Number(props.headingLevel)) || 2)));
const featuredFirst = computed(() => (single.value ? o.value.variant !== "card" : layout.value === "spotlight"));
const label = computed(() => heading.value || (single.value ? props.payload.cards[0]?.title : "") || "AVDEB products");
const newTab = computed(() => (o.value.newTab ? "_blank" : undefined));
const hasHeader = computed(() => Boolean(heading.value || intro.value || props.payload.viewAll || isCarousel.value));
const classes = computed(() => [
	"avdeb",
	"not-prose",
	`avdeb--${layout.value}`,
	single.value ? `avdeb--${o.value.variant}` : "",
	`avdeb--${o.value.cardStyle}`,
]);

// Carousel arrows and ←/→ keys over the native scroll-snap track. Without JS it still scrolls.
const root = ref<HTMLElement | null>(null);
const track = ref<HTMLElement | null>(null);
const canPrev = ref(false);
const canNext = ref(false);
const overflow = ref(false);
let observer: ResizeObserver | null = null;

function update() {
	const t = track.value;
	if (!t) return;
	const max = t.scrollWidth - t.clientWidth - 2;
	const x = Math.abs(t.scrollLeft);
	canPrev.value = x > 2;
	canNext.value = x < max;
	overflow.value = max > 0;
}

function rtl() {
	return track.value ? getComputedStyle(track.value).direction === "rtl" : false;
}

function go(dir: number) {
	const t = track.value;
	if (!t) return;
	const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
	t.scrollBy({ left: dir * (rtl() ? -1 : 1) * t.clientWidth * 0.9, behavior: smooth ? "smooth" : "auto" });
}

function onKey(e: KeyboardEvent) {
	if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
	e.preventDefault();
	go((e.key === "ArrowRight") !== rtl() ? 1 : -1);
}

onMounted(() => {
	if (!isCarousel.value || !track.value) return;
	update();
	if ("ResizeObserver" in window) {
		observer = new ResizeObserver(update);
		observer.observe(track.value);
	}
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
	<section
		ref="root"
		:class="classes"
		:data-theme="o.theme"
		:data-avdeb-carousel="isCarousel ? '' : undefined"
		:data-avdeb-overflow="isCarousel && overflow ? '' : undefined"
		:style="payload.style"
		:aria-label="label"
	>
		<header v-if="hasHeader" class="avdeb__header">
			<div v-if="heading || intro" class="avdeb__titles">
				<component :is="`h${level}`" v-if="heading" class="avdeb__heading">{{ heading }}</component>
				<p v-if="intro" class="avdeb__intro">{{ intro }}</p>
			</div>
			<div v-if="payload.viewAll || isCarousel" class="avdeb__tools">
				<a
					v-if="payload.viewAll"
					class="avdeb__all"
					:href="payload.viewAll"
					:rel="relFor(payload.viewAll)"
					:target="newTab"
				>{{ viewAllLabel || "View all" }}<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></a>
				<div v-if="isCarousel" class="avdeb__nav">
					<button
						type="button"
						class="avdeb__navbtn"
						data-avdeb-prev
						aria-label="Previous products"
						:hidden="!overflow"
						:disabled="!canPrev"
						@click="go(-1)"
					>
						<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3.5 5.5 8 10 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
					</button>
					<button
						type="button"
						class="avdeb__navbtn"
						data-avdeb-next
						aria-label="Next products"
						:hidden="!overflow"
						:disabled="!canNext"
						@click="go(1)"
					>
						<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
					</button>
				</div>
			</div>
		</header>
		<ul
			ref="track"
			class="avdeb__items"
			role="list"
			:data-avdeb-track="isCarousel ? '' : undefined"
			:tabindex="isCarousel ? 0 : undefined"
			:aria-label="isCarousel ? `${label} — scroll for more` : undefined"
			@scroll.passive="isCarousel && update()"
			@keydown="isCarousel && onKey($event)"
		>
			<li v-for="(c, i) in payload.cards" :key="c.key" class="avdeb__item">
				<article
					:class="[
						'avdeb-card',
						featuredFirst && i === 0 ? 'avdeb-card--featured' : '',
						single && o.variant === 'hero' ? 'avdeb-card--hero' : '',
					]"
				>
					<div class="avdeb-card__media">
						<img
							v-if="c.image"
							:src="c.image"
							:alt="c.title"
							:width="c.width"
							:height="c.height"
							:loading="single ? 'eager' : 'lazy'"
							decoding="async"
						>
						<svg v-else class="avdeb-card__placeholder" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z M4 7.5l8 4.5 8-4.5 M12 12v9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" /></svg>
						<div v-if="(single && o.badge) || c.discount || c.isNew" class="avdeb-card__badges" aria-hidden="true">
							<span v-if="single && o.badge" class="avdeb-badge avdeb-badge--pick">{{ o.badge }}</span>
							<span v-if="c.discount" class="avdeb-badge avdeb-badge--sale">−{{ c.discount }}%</span>
							<span v-if="c.isNew" class="avdeb-badge">New</span>
						</div>
					</div>
					<div class="avdeb-card__body">
						<div class="avdeb-card__main">
							<p v-if="c.creator" class="avdeb-card__by">by {{ c.creator }}</p>
							<component :is="`h${Math.min(6, level + 1)}`" class="avdeb-card__title">
								<a class="avdeb-card__link" :href="c.href" :rel="c.rel" :target="c.target">{{ c.title }}</a>
							</component>
							<p v-if="single && o.note" class="avdeb-card__note">{{ o.note }}</p>
						</div>
						<div class="avdeb-card__footer">
							<p v-if="c.price" class="avdeb-card__price">
								<del v-if="c.compareAt"><span class="avdeb-sr">Was </span>{{ c.compareAt }}</del>
								<span><span v-if="c.compareAt" class="avdeb-sr">now </span>{{ c.price }}</span>
							</p>
							<span class="avdeb-card__cta" aria-hidden="true"><span class="avdeb-card__cta-label">{{ o.ctaLabel }}</span><svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8h9.5M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
						</div>
					</div>
				</article>
			</li>
		</ul>
		<p v-if="payload.disclosure" class="avdeb__disclosure">
			<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.3" /><path d="M8 7.2v4M8 4.8v.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>{{ payload.disclosure }}
		</p>
	</section>
</template>
