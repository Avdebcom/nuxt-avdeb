import { defineEventHandler, getQuery, setResponseHeader } from "h3";

import { avdebPayload } from "../../utils/avdeb";

/** GET {apiBase}/products?url=…&layout=… — products and cards for one embed (secret key stays here). */
export default defineEventHandler(async (event) => {
	const query = getQuery(event) as Record<string, unknown>;
	const attrs: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(query)) attrs[k] = Array.isArray(v) ? v[0] : v;
	setResponseHeader(event, "Cache-Control", "public, max-age=300");
	return avdebPayload(attrs);
});
