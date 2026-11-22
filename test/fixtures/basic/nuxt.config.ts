import avdeb from "../../../src/module";

export default defineNuxtConfig({
	modules: [avdeb],
	compatibilityDate: "2026-11-01",
	avdeb: { refCode: "E2ETEST", accentColor: "#123456" },
});
