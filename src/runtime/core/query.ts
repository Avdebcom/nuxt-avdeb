/** Component props → the products route query. Pure module. */

export type AvdebInput = Record<string, string | number | boolean | null | undefined>;

/** Defined values as strings, keys sorted, so the same embed shares one request and one payload key. */
export function avdebQuery(input: AvdebInput): Record<string, string> {
	const out: Record<string, string> = {};
	for (const key of Object.keys(input).sort()) {
		const v = input[key];
		if (v === undefined || v === null || v === "") continue;
		out[key] = String(v);
	}
	return out;
}
