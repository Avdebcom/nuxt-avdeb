# Changelog

## 0.1.0 - 2026-11-22

- First release: global `<AvdebProducts>`, `<AvdebProduct>` and `<AvdebButton>` components (pages, components and Nuxt Content / MDC) and the `useAvdebProducts()` composable.
- Grid, carousel, list and spotlight layouts; horizontal, hero and card single products; referral buttons.
- Server route keeps the secret key on the server; products cached in Nitro storage, with the last good copy served for a week if AVDEB can't be reached.
- Works with SSR, `nuxt generate` and client-side navigation.
