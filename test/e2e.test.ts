import { fileURLToPath } from "node:url";

import { $fetch, setup } from "@nuxt/test-utils/e2e";
import { describe, expect, it } from "vitest";

// Builds the fixture app and calls the live AVDEB catalog API.
describe("nuxt-avdeb in a Nuxt app", async () => {
	await setup({ rootDir: fileURLToPath(new URL("./fixtures/basic", import.meta.url)) });

	it("server-renders products, a featured product and a button with the referral code", async () => {
		const html = await $fetch<string>("/");
		expect(html).toContain('class="avdeb not-prose avdeb--carousel avdeb--elevated"');
		expect(html).toContain("avdeb--single avdeb--hero");
		expect(html).toContain("avdeb-badge--pick");
		expect(html).toContain("--_avdeb-accent:#123456");
		expect(html).toMatch(/href="https:\/\/avdeb\.com\/creators\/\?ref=E2ETEST"/);
		expect(html.match(/\?ref=E2ETEST/g)?.length).toBeGreaterThan(4);
	});

	it("the products route never exposes the key and validates input", async () => {
		const payload = await $fetch<Record<string, any>>("/api/_avdeb/products", {
			query: { tag: "stickers", limit: "99", layout: "nope", accent: "red;x" },
		});
		expect(payload.options.layout).toBe("grid");
		expect(payload.options.accentColor).toBe("#123456");
		expect(payload.cards.length).toBeLessThanOrEqual(12);
		expect(payload.ref).toBe("E2ETEST");
		expect(JSON.stringify(payload)).not.toContain("avdeb_sk_");
	});
});
