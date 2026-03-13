# Release Note 2026-03-14

## Summary

This release turns the fork into a smoother long-running local control center with clearer boundaries, safer defaults, and more reviewable code.

## Main Improvements

1. Security and auth
- tightened local-token boundaries
- protected sensitive localhost read routes
- added a UI login wall for protected local access

2. Performance and responsiveness
- added gzip for large HTML responses
- skipped unnecessary session-history reads for session preview
- preferred local session stores over slow CLI listing
- preferred local cron and approvals files over slow CLI reads
- switched snapshot serving to stale-while-revalidate so page switches stay fast after cache expiry

3. Runtime structure
- extracted UI read-model caching into `src/runtime/ui-read-model-cache.ts`
- extracted global visibility / overview data logic into `src/runtime/global-visibility.ts`
- kept `src/ui/server.ts` as a thinner route-and-render shell

4. UI and operator experience
- improved dark-theme readability and nested-surface consistency
- added safe nav prefetch for read-only routes
- reduced readonly log noise for missing UI preferences
- aligned health semantics so readonly UI mode is no longer penalized for expected missing monitor artifacts

## Validation

The current fork was validated with:

- `npm run build`
- `npm test`
- `npm run smoke:ui`

Local deployment checks:

- `GET /healthz`
- interactive navigation on `overview`, `usage`, `team`, `docs`, and `memory`

Observed local route timing after the latest round:

- `overview`: about `0.038s`
- `overview` after `35s`: about `0.040s`
- `usage`: about `0.008s`
- `team`: about `0.032s`

## Deployment Recommendation

Keep the local deployed source on the fork for now.

Why:

- the fork remains the easiest place to compare against upstream issues and PRs
- the deployed path is already aligned to the fork and is stable
- the independent enhanced repository is ready, but works best as the public product-facing repository until you decide to switch the deployment source permanently

## Attribution

Original upstream project:

- `TianyiDataScience/openclaw-control-center`
- https://github.com/TianyiDataScience/openclaw-control-center

This fork adds downstream hardening, performance work, UI polish, and maintainability improvements on top of the upstream base.
