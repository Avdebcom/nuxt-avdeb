export default defineNuxtConfig({
	modules: ["../src/module", "@nuxt/content"],
	compatibilityDate: "2026-11-01",
	devtools: { enabled: false },
	css: ["~/assets/site.css"],
	app: {
		head: { title: "Small Things Studio", htmlAttrs: { lang: "en" } },
	},
	content: {
		experimental: { sqliteConnector: "native" },
	},
	// The referral code comes from NUXT_AVDEB_REF_CODE or AVDEB_REF_CODE (environment or .env).
	avdeb: {
		accentColor: "#00a568",
	},
});
