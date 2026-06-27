# Samhain Modernization Progress

## Current State
- Phase: 4 - Tests and verification
- Status: complete
- Last updated: 2026-06-27 10:18 EDT
- Last verified command: `pnpm check`; `pnpm build`; `pnpm lint`; `pnpm exec playwright test --reporter=list` (escalated run; see Phase 4 notes).
- Last verified result: svelte-check found 0 errors and 0 warnings; production build completed; eslint completed; Playwright e2e suite passed 27/27.
- Current blocker: None for Phase 4. Real OAuth round-trip and live API responses still require a real Mastodon instance and are tracked outside the mocked e2e suite.
- Next safe action: Start Phase 5 cleanup and hardening. Keep the Playwright suite escalated when running locally from this sandbox because Vite cannot bind localhost inside the sandbox.


## Target Stack
- OS package baseline: Arch current repo packages as queried on 2026-06-26.
- Node: `nodejs 26.4.0-1` target; local installed version currently `nodejs-lts-jod 22.22.2-1`.
- Package manager: `pnpm 11.3.0-1`.
- npm: `11.16.0-1`.
- Framework: SvelteKit `2.68.0` with Svelte `5.56.4`.
- Build tool: Vite `8.1.0`.
- Test runner: Playwright `1.61.1`.
- Deployment target: local/self-host first, using `@sveltejs/adapter-node 5.5.7`.
- Optional later target: static export with `@sveltejs/adapter-static 3.0.10`.
- Browser smoke targets: Chromium `149.0.7827.200-1` and Firefox `152.0.3-1`.
- Container tooling: Docker `1:29.6.0-1`, Docker Compose `5.1.4-1`.

## Phase Checklist
- [x] Phase 0: Tracking and baseline
- [x] Phase 1: Modern project shell
- [x] Phase 2: App foundation
- [x] Phase 3: Core daily use
- [x] Phase 4: Tests and verification
- [ ] Phase 5: Cleanup and hardening

## Task Log

### 2026-06-26 Phase 0
- [x] Task: Create restartable modernization progress ledger.
  - Files touched: `update.md`
  - Commands run: `date`, `git status --short`, local runtime version checks, `yay -Ss` for target Arch package versions.
  - Result: `update.md` created with target stack, checkpoint format, and current baseline notes.
  - Notes: AUR lookup failed with DNS resolution for `aur.archlinux.org`; official repo package versions were still returned by `yay -Ss`.
- [x] Task: Preserve current Samhain rename baseline.
  - Files touched: repository-wide Samhain rename files plus `update.md`
  - Commands run: `git add .`; `git commit`; `git push`
  - Result: Baseline preservation requested for this checkpoint commit.
  - Notes: The commit containing this file is the restart point before package manager or framework modernization.
- [x] Task: Run legacy baseline checks.
  - Files touched:
  - Commands run: `git diff --check`; `shellcheck bin/backup-mastodon-data.sh`; `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('package.json','utf8')); JSON.parse(fs.readFileSync('src/build/manifest.json','utf8')); console.log('json ok')"`; changed JS syntax checks with `node --check`; `node --input-type=module --check < src/intl/ru-RU.JS`; `yarn lint`
  - Result: `git diff --check`, shellcheck, JSON parse, and JS syntax checks passed. `yarn lint` failed before linting because local Node is 22.22.2 and `package.json` allows only `^12.20.0 || ^14.13.1 || ^16.0.0 || ^18.0.0`.
  - Notes: This is enough to confirm the current rename state is syntactically sane, but not enough to prove the legacy app builds. Prefer a Node 16 container or equivalent if a true legacy build baseline is needed before Phase 1.

### 2026-06-26 Phase 1
- [x] Task: Convert package management to pnpm and create SvelteKit shell.
  - Files touched: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `svelte.config.js`, `vite.config.js`, `jsconfig.json`, `eslint.config.js`, `src/app.html`, `src/app.css`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/legacy-service-worker.js`, removed `yarn.lock`.
  - Commands run: `pnpm view` for package version checks; `pnpm install`; `pnpm install --frozen-lockfile`; `pnpm check`; `pnpm build`; `pnpm lint`; `pnpm preview --host 127.0.0.1 --port 4173`; `curl -I --max-redirs 10 -sS http://127.0.0.1:4173/`.
  - Result: SvelteKit 2 shell builds with adapter-node, pnpm is the active package manager, lint/check/build pass, and local preview serves HTTP 200.
  - Notes: npm registry did not have the initially planned `@eslint/js@10.1.1`, `@sveltejs/vite-plugin-svelte@7.3.1`, `svelte-check@5.1.2`, or `eslint-plugin-svelte@4.5.0` pins. Direct tooling pins were adjusted to published versions. The old Sapper service worker was preserved as `src/legacy-service-worker.js` because `src/service-worker.js` is a reserved SvelteKit path.

### 2026-06-26 Phase 2
- [x] Task: Add app foundation routes, state, and shared UI primitives.
  - Files touched: `src/lib/components/AppShell.svelte`, `src/lib/components/PageHeader.svelte`, `src/lib/components/StatusCard.svelte`, `src/lib/state/app-state.js`, `src/lib/mastodon/instance.js`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/routes/login/+page.svelte`, `src/routes/notifications/+page.svelte`, `src/routes/compose/+page.svelte`, `src/routes/settings/+page.svelte`, `src/routes/statuses/[statusId]/+page.svelte`, `src/app.css`, `update.md`.
  - Commands run: `pnpm install --frozen-lockfile`; `pnpm check`; `pnpm build`; `pnpm lint`; `curl -I --max-redirs 10 -sS http://127.0.0.1:5173/`; `curl -I --max-redirs 10 -sS http://127.0.0.1:5173/login`; `curl -I --max-redirs 10 -sS http://127.0.0.1:5173/settings`; `curl -I --max-redirs 10 -sS http://127.0.0.1:5173/compose`; `curl -I --max-redirs 10 -sS http://127.0.0.1:5173/notifications`; `curl -I --max-redirs 10 -sS http://127.0.0.1:5173/statuses/foundation-checkpoint`.
  - Result: App now has accessible shared navigation, route placeholders for core daily-use surfaces, persisted local settings, persisted instance state, and Mastodon instance URL normalization helpers.
  - Notes: This phase intentionally does not authenticate or call a live Mastodon server. Login currently stores and previews the instance endpoints needed for the Phase 3 OAuth implementation.

## Stop Points

### Phase 0 Stop Point
- Working state: Phase 0 complete; static baseline reached; full legacy build baseline not reached.
- Verified commands: `git diff --check`; `shellcheck bin/backup-mastodon-data.sh`; JSON parse check; changed JS syntax checks.
- Known issues: Legacy `yarn lint` is blocked by local Node 22.22.2 versus the old engine range.
- Resume command/action: Start by reading this file, run `git status --short`, then begin Phase 1 or run a Node 16 legacy build baseline if desired.

### Phase 1 Stop Point
- Working state: Phase 1 complete; modern SvelteKit shell builds and serves locally; legacy source remains in tree for phased porting.
- Verified commands: `pnpm install`; `pnpm install --frozen-lockfile`; `pnpm check`; `pnpm build`; `pnpm lint`; `curl -I --max-redirs 10 -sS http://127.0.0.1:4173/`.
- Known issues: Phase 1 shell is only a placeholder UI and does not yet implement Mastodon login, timelines, compose, notifications, settings, or persisted app state.
- Resume command/action: Start Phase 2 by adding the shared route/layout foundation and first real app state modules.

### Phase 2 Stop Point
- Working state: Phase 2 complete; app foundation routes and local state are in place; dev server route smoke checks pass.
- Verified commands: `pnpm install --frozen-lockfile`; `pnpm check`; `pnpm build`; `pnpm lint`; route smoke checks for `/`, `/login`, `/settings`, `/compose`, `/notifications`, and `/statuses/foundation-checkpoint`.
- Known issues: OAuth, authenticated API calls, real timelines, real notifications, status context loading, and posting are not implemented yet.
- Resume command/action: Start Phase 3 by implementing Mastodon app registration/OAuth storage, authenticated fetch helpers, home timeline loading, notification loading, status detail context, and compose posting.

### 2026-06-27 Phase 3
- [x] Task: Wire real Mastodon app registration, OAuth, authenticated API, timelines, notifications, status detail, and compose posting.
  - Files touched: `src/lib/mastodon/api.js`, `src/lib/mastodon/instance.js`, `src/lib/state/app-state.js`, `src/lib/util/errors.js`, `src/lib/util/sanitize.js`, `src/lib/components/AppShell.svelte`, `src/lib/components/StatusCard.svelte`, `src/routes/+page.svelte`, `src/routes/login/+page.svelte`, `src/routes/auth/callback/+page.svelte`, `src/routes/notifications/+page.svelte`, `src/routes/compose/+page.svelte`, `src/routes/statuses/[statusId]/+page.svelte`, `src/app.css`, `update.md`.
  - Commands run: `node --check` on new JS modules; `pnpm check`; `pnpm build`; `pnpm lint`; dev server started on `127.0.0.1:5174`; route smoke checks for `/`, `/login`, `/notifications`, `/compose`, `/settings`, `/auth/callback`, and `/statuses/phase3-checkpoint`.
  - Result: Login now registers a Mastodon app and redirects to the instance OAuth authorize endpoint; `/auth/callback` exchanges the code for an access token, stores it, verifies credentials, and shows the logged-in account. Home timeline, notifications, status detail with thread context, and compose posting call the authenticated Mastodon API. Status content is sanitized through a tag/attribute allowlist before rendering. `pnpm check`, `pnpm build`, and `pnpm lint` pass with zero errors; all smoke-tested routes return HTTP 200.
  - Notes: The OAuth round-trip and live API responses were not exercised against a real Mastodon instance inside the sandbox because instance network calls require user approval; the implementation is verified by build, type-check, lint, and dev-server route smoke checks. HTML sanitization uses a built-in allowlist (`src/lib/util/sanitize.js`) rather than a dependency, and `svelte/no-at-html-tags` is suppressed per-render with a justification comment. Real-instance login, posting, timeline, notifications, status context, settings persistence, and keyboard navigation acceptance remain Phase 4 work.

### Phase 3 Stop Point
- Working state: Phase 3 complete; OAuth flow, authenticated API helpers, home timeline, notifications, status detail with context, and compose posting are implemented and route-smoke-checked.
- Verified commands: `pnpm check`; `pnpm build`; `pnpm lint`; dev server route smoke checks for `/`, `/login`, `/notifications`, `/compose`, `/settings`, `/auth/callback`, and `/statuses/phase3-checkpoint`.
- Known issues: Live OAuth round-trip and live Mastodon API responses are not verified against a real instance; status action buttons (reply, boost, favorite, more) are still placeholders; pagination (load more / infinite scroll) is not implemented; media upload, polls, emoji, and advanced compose features are out of scope for Phase 3.
- Resume command/action: Start Phase 4 by adding Playwright tests covering fresh login, home timeline, notifications, status detail, successful compose, settings persistence, keyboard navigation through primary controls, and accessible labels for navigation, compose, status actions, dialogs, and settings.

### 2026-06-27 Phase 4
- [x] Task: Add Playwright e2e tests for the modern SvelteKit shell.
  - Files touched: `.gitignore`, `package.json`, `pnpm-lock.yaml`, `playwright.config.js`, `tests/e2e/helpers.js`, `tests/e2e/login.spec.js`, `tests/e2e/timeline.spec.js`, `tests/e2e/status-detail.spec.js`, `tests/e2e/compose.spec.js`, `tests/e2e/settings.spec.js`, `tests/e2e/a11y.spec.js`, `update.md`.
  - Commands run: `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm add -D @playwright/test@1.61.1`; `pnpm exec playwright test --reporter=list` (run escalated because the sandbox uses an isolated network namespace, so the dev server cannot bind 127.0.0.1:4173 and Chromium cannot reach it from inside the sandbox); `pnpm check`; `pnpm build`; `pnpm lint`.
  - Result: `@playwright/test` 1.61.1 installed; `playwright.config.js` configured to use the system `/usr/bin/chromium` (no browser download) with `--no-sandbox`, a single chromium project, and a `webServer` that starts `pnpm exec vite dev --port 4173 --host 127.0.0.1`; `package.json` gained `test:e2e` and `test` now chains `pnpm check && pnpm build && pnpm test:e2e`. Six spec files cover login/OAuth, home timeline, notifications, status detail, compose, settings persistence, and accessibility/keyboard navigation. Final full e2e run passed 27/27.
  - Findings fixed (test harness, not app regressions):
    1. `page.route` glob patterns did not intercept some instance API URLs under this Chromium build, so the helpers now use `RegExp` routes and register the broad fallback before specific mocks.
    2. `page.addInitScript` was unreliable for localStorage seeding before the SvelteKit store initialized, so `seed_state` now uses `goto(route) -> evaluate(set localStorage) -> reload()` and waits for the page to settle.
    3. Immediate post-`goto` clicks on login/settings could happen before hydration, so affected tests wait for the page to settle before interacting.
    4. The compose content-warning test now uses an exact label match so the checkbox label `Add content warning` is not counted as the text input.
  - Notes: No real Mastodon instance is used; all instance traffic is mocked via `page.route`. Tests must be run escalated (`sandbox_permissions: require_escalated`) in this environment because the sandbox network namespace cannot bind or reach localhost. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` was used so no Playwright browser binaries are downloaded; the system Chromium at `/usr/bin/chromium` is used via `launchOptions.executablePath`.

### Phase 4 Stop Point
- Working state: Phase 4 complete; Playwright e2e coverage is in place and green.
- Verified commands: `pnpm check`; `pnpm build`; `pnpm lint`; `pnpm exec playwright test --reporter=list` (escalated).
- Known issues: Live OAuth round-trip and live Mastodon API responses are still not verified against a real instance; status action buttons, pagination, media upload, polls, emoji, and advanced compose features remain outside this phase.
- Resume command/action: Start Phase 5 cleanup and hardening.

## Decisions
- Fresh browser login and fresh app state are acceptable after modernization.
- The migration will happen in-place instead of creating a parallel app.
- Samhain itself does not use PostgreSQL at runtime; PostgreSQL only belongs to the legacy Mastodon test harness.
- Do not switch the client to SQLite. If a real integration backend is needed later, prefer a lightweight Mastodon-compatible server that already supports SQLite rather than modifying Mastodon.
- Core daily-use release scope: login, timelines, status detail, compose, notifications, settings, themes, and accessibility basics.

## Verification Policy
- Every phase should finish with `pnpm install --frozen-lockfile`, `pnpm check` when available, `pnpm build`, and at least one browser smoke test or Playwright equivalent once the app shell exists.
- Core release acceptance requires fresh login, home timeline, notifications, status detail, successful compose, settings persistence, keyboard navigation through primary controls, and accessible labels for navigation, compose, status actions, dialogs, and settings.
