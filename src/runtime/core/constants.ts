/** Shared identifiers and limits. Pure module. */

export const PACKAGE_NAME = "nuxt-avdeb";
export const VERSION = "0.1.0";

export const API_HOST = "api.avdeb.com";
export const API_BASE = `https://${API_HOST}/v1/catalog`;
export const SITE_ORIGIN = "https://avdeb.com";
export const DOCS_URL = "https://avdeb.com/developers/#nuxt";
export const PARTNER_DASHBOARD_URL = "https://avdeb.com/affiliate/dashboard/developers/";
export const AFFILIATE_URL = "https://avdeb.com/affiliate/";

/** Secret keys are issued as `avdeb_sk_` + 32 letters/digits (partner dashboard → Embeds & API). */
export const SECRET_KEY_RE = /^avdeb_sk_[A-Za-z0-9]{32}$/;
export const PUBLISHABLE_KEY_PREFIX = "avdeb_pk_";

/** Catalog API tier limits. */
export const MAX_LIMIT_ANONYMOUS = 12;
export const MAX_LIMIT_SECRET = 48;
export const DEFAULT_LIMIT = 6;

export const DEFAULT_DISCLOSURE = "As an AVDEB affiliate, I earn a commission from qualifying purchases.";

export const MODES = ["collection", "product"] as const;
export const SOURCES = ["auto", "creator", "tag", "type", "search", "newest"] as const;
export const LAYOUTS = ["grid", "carousel", "list", "spotlight"] as const;
export const CARD_STYLES = ["elevated", "outline", "minimal"] as const;
/** `site` inherits colours and fonts from your CSS. */
export const THEMES = ["site", "light", "dark", "auto"] as const;
export const IMAGE_RATIOS = ["square", "portrait", "landscape"] as const;
export const PRODUCT_VARIANTS = ["card", "horizontal", "hero"] as const;
export const BUTTON_VARIANTS = ["solid", "outline", "link"] as const;
export const ALIGNMENTS = ["start", "center", "end"] as const;

export type Mode = (typeof MODES)[number];
export type Source = (typeof SOURCES)[number];
export type Layout = (typeof LAYOUTS)[number];
export type CardStyle = (typeof CARD_STYLES)[number];
export type Theme = (typeof THEMES)[number];
export type ImageRatio = (typeof IMAGE_RATIOS)[number];
export type ProductVariant = (typeof PRODUCT_VARIANTS)[number];
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type Alignment = (typeof ALIGNMENTS)[number];
