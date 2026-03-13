# Release Note 2026-03-14

## Summary

This release turns the fork into a smoother long-running local control center with clearer boundaries, safer defaults, and more reviewable code.

## Fork-vs-Upstream Snapshot

Compared with `upstream/main`, the fork currently carries downstream work across:

- security and local auth boundaries
- overview / usage correctness
- homepage and operator UX polish
- dark-theme readability
- UI render-path and read-model performance
- local setup and deployment documentation

Current local diff footprint against `upstream/main`:

- 31 files changed
- about 4003 insertions
- about 781 deletions

Most visible operator-facing differences:

1. Overview and Usage correctness
- `Overview` and `Usage` now share the same runtime/subscription truth source
- homepage usage cards no longer drift away from the detail page
- the homepage now includes a fork-intro card that explains what this fork fixed and added

2. Safer local-default posture
- local-token auth is treated as the normal entry gate
- readonly mode is the preferred first-run posture
- risky mutation routes stay constrained by default

3. Faster UI reads
- local file-backed paths are preferred over slower CLI reads for sessions, cron, and approvals
- stale-while-revalidate behavior keeps page transitions responsive after cache expiry
- heavier data only loads when the active page actually needs it

4. More operator-readable interface
- dark theme contrast is stronger on nested cards and utility panels
- homepage sections are organized around intervention, staff activity, runtime checkpoints, and AI burn
- docs and memory workbenches make it easier to inspect source-backed files from inside the control center

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
- added a homepage fork-intro card that explains what this fork fixed, added, and changed for operators
- clarified the fork homepage and README copy so the value of the fork is visible without reading code

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
