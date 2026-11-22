import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
	collections: {
		posts: defineCollection({
			type: "page",
			source: "posts/*.md",
			schema: z.object({ date: z.string(), summary: z.string() }),
		}),
	},
});
