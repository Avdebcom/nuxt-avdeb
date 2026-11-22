import { describe, expect, it } from "vitest";

import { normalizeProduct } from "../src/runtime/core/catalog";
import { parseButton, parseDisplay, parseEmbed, queryFor } from "../src/runtime/core/options";
import { resolveSettings } from "../src/runtime/core/settings";
import { buildCards, rootStyle } from "../src/runtime/core/view";
import { avdebQuery } from "../src/runtime/core/query";

describe("options", () => {
	it("detects links and shorthands", () => {
		expect(queryFor(parseEmbed({ url: "https://avdeb.com/creators/cleo/" }))).toEqual({ limit: 6, creator: "cleo" });
		expect(queryFor(parseEmbed({ tag: "stickers", limit: "3" }))).toEqual({ limit: 3, tag: "stickers" });
		expect(queryFor(parseEmbed({ q: "cat mug" }))).toEqual({ limit: 6, q: "cat mug" });
		expect(queryFor(parseEmbed({ product: "https://avdeb.com/store/cat-sticker/" }))).toEqual({ handle: "cat-sticker", limit: 1 });
		expect(queryFor(parseEmbed({ product: "https://evil.example/store/x/" }))).toEqual({ limit: 1 });
	});

	it("applies site defaults and rejects bad values", () => {
		const site = parseDisplay({ layout: "carousel", accentColor: "#abcdef" });
		const o = parseEmbed({ columns: "9", "card-style": "outline", theme: "inherit", accent: "red;x", hidePrice: "true" }, site);
		expect(o).toMatchObject({ layout: "carousel", columns: 6, cardStyle: "outline", theme: "site", accentColor: "#abcdef", showPrice: false });
	});

	it("parses buttons", () => {
		expect(parseButton({ href: "/creators/cleo/", variant: "outline" })).toEqual({ href: "/creators/cleo/", label: "Shop on AVDEB", variant: "outline", align: "start" });
	});
});

describe("settings", () => {
	it("falls back to environment variables and warns about bad keys", () => {
		expect(resolveSettings({}, { AVDEB_REF_CODE: "ENV" }).refCode).toBe("ENV");
		expect(resolveSettings({ refCode: "OPT" }, { AVDEB_REF_CODE: "ENV" }).refCode).toBe("OPT");
		const key = `avdeb_sk_${"a".repeat(32)}`;
		expect(resolveSettings({}, { AVDEB_SECRET_KEY: key }).apiKey).toBe(key);
		expect(resolveSettings({ apiKey: "avdeb_pk_x" }).warnings).toHaveLength(1);
	});
});

describe("view", () => {
	it("builds cards with sponsored rel and formatted prices; style uses private custom properties", () => {
		const p = normalizeProduct({ handle: "cat", title: "Cat", url: "https://avdeb.com/store/cat/?ref=A", price: 4.9, currency: "USD", image: "https://cdn.avdeb.com/c.webp" });
		const cards = buildCards(p ? [p] : [], parseEmbed({}));
		expect(cards[0]).toMatchObject({ href: "https://avdeb.com/store/cat/?ref=A", rel: "sponsored noopener", price: "$4.90" });
		expect(rootStyle(parseEmbed({ accent: "#ff0000" }), 2)).toEqual({ "--_avdeb-cols": "2", "--_avdeb-radius": "16px", "--_avdeb-ratio": "1 / 1", "--_avdeb-accent": "#ff0000" });
	});
});

describe("avdebQuery", () => {
	it("drops empty values, stringifies and sorts keys", () => {
		expect(Object.keys(avdebQuery({ tag: "a", limit: 3, heading: "", newTab: false, layout: undefined }))).toEqual(["limit", "newTab", "tag"]);
	});
});
