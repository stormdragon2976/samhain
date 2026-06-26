# Samhain Modernization Progress

## Current State
- Phase: 0 - Tracking and baseline
- Status: complete
- Last updated: 2026-06-26 19:27:00 EDT
- Last verified command: `git diff --check`; `shellcheck bin/backup-mastodon-data.sh`; JSON parse check for `package.json` and `src/build/manifest.json`; changed JS syntax checks; `yarn lint`
- Last verified result: Static checks passed; `yarn lint` failed before running because the local Node 22.22.2 does not satisfy the legacy package engine range.
- Current blocker: Legacy app scripts need Node 12/14/16/18 or an intentional engine bypass if a full legacy build baseline is required.
- Next safe action: Start Phase 1 by converting package management to pnpm and creating the modern SvelteKit project shell, or first run a Node 16 legacy build baseline if desired.

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
- [ ] Phase 1: Modern project shell
- [ ] Phase 2: App foundation
- [ ] Phase 3: Core daily use
- [ ] Phase 4: Tests and verification
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

## Stop Points

### Phase 0 Stop Point
- Working state: Phase 0 complete; static baseline reached; full legacy build baseline not reached.
- Verified commands: `git diff --check`; `shellcheck bin/backup-mastodon-data.sh`; JSON parse check; changed JS syntax checks.
- Known issues: Legacy `yarn lint` is blocked by local Node 22.22.2 versus the old engine range.
- Resume command/action: Start by reading this file, run `git status --short`, then begin Phase 1 or run a Node 16 legacy build baseline if desired.

## Decisions
- Fresh browser login and fresh app state are acceptable after modernization.
- The migration will happen in-place instead of creating a parallel app.
- Samhain itself does not use PostgreSQL at runtime; PostgreSQL only belongs to the legacy Mastodon test harness.
- Do not switch the client to SQLite. If a real integration backend is needed later, prefer a lightweight Mastodon-compatible server that already supports SQLite rather than modifying Mastodon.
- Core daily-use release scope: login, timelines, status detail, compose, notifications, settings, themes, and accessibility basics.

## Verification Policy
- Every phase should finish with `pnpm install --frozen-lockfile`, `pnpm check` when available, `pnpm build`, and at least one browser smoke test or Playwright equivalent once the app shell exists.
- Core release acceptance requires fresh login, home timeline, notifications, status detail, successful compose, settings persistence, keyboard navigation through primary controls, and accessible labels for navigation, compose, status actions, dialogs, and settings.
