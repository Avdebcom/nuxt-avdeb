import { defineEventHandler, setResponseHeader } from "h3";

import type { AvdebSite } from "../../../core/payload";
import { avdebRef, useAvdeb } from "../../utils/avdeb";

/** GET {apiBase}/site — the referral code and the button display defaults. */
export default defineEventHandler(async (event): Promise<AvdebSite> => {
	setResponseHeader(event, "Cache-Control", "public, max-age=300");
	const { settings } = useAvdeb();
	return { ref: await avdebRef(), accentColor: settings.display.accentColor, newTab: settings.display.newTab };
});
