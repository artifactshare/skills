# AGENTS.md — `artifactshare/skills` Development Rules

This repository hosts official, MIT-licensed Agent Skills from Artifact Share.
Follow these rules whenever adding a new skill, updating an existing skill, or editing the live showcase.

## 1. Distribution Targets (Always Support Both)

Every skill pack in this repository must work in both environments:

1. **Local AI Tools** (Claude Code, Codex, GitHub Copilot, Cursor, Gemini CLI, Antigravity):
   - Installed via `npx skills add artifactshare/skills` or `/plugin marketplace add artifactshare/skills`.
   - Lives in `skills/<skill-name>/` as a self-contained directory (never rely on files outside `skills/<skill-name>/` at runtime).
2. **Web / Cloud AI** (`gemini.google.com` Skills & Gems, Gemini in Chrome, Microsoft 365 Copilot / Copilot Studio, Claude.ai):
   - Generated via `npm run build:web` into `dist/web-skills/*.zip` and attached to GitHub Releases.
   - Each `.zip` must have `SKILL.md` (exact uppercase) at the archive root, zero executable scripts (`.js`/`.mjs`/`.py`/`.sh`), and zero OS metadata (`.DS_Store`, `__MACOSX`).

## 2. Security Scanner Hygiene (`skills.sh` Gen / Socket / Snyk)

To keep 0 security alerts across scanners, **never** introduce these patterns in `skills/*/`, `src/`, or runtime scripts:

- `innerHTML` / `outerHTML` (use `document.createElement` + `textContent`)
- `postMessage` / `addEventListener('message', ...)`
- `eval(` / `new Function(`
- `child_process` / shell execution inside distributed skill scripts
- Network calls (`fetch(`, `http`, `https`, remote model downloads) inside distributed skill scripts
- `process.env` reads inside distributed skill scripts

This is enforced automatically by `npm run validate`.

## 3. Artifact Share CSP & Showcase Rules

- **No nested `<iframe>`**: Artifact Share sandbox hosts block nested frames via `frame-src`. Multi-demo showcases must render all panels in a single DOM.
- **No double scrollbars**: On desktop (`> 768px`), lock the shell to `100dvh; overflow: hidden` with a single scrollable stage container. On mobile (`<= 768px`), switch to normal single-document scrolling (`height: auto; overflow: visible`).
- **Clear install UX**: Provide one obvious install action (modal or copyable command + Web `.zip` download link) rather than raw unlabeled commands.

## 4. Mobile & Responsive Bar (390px Mandatory)

Every skill output and showcase page must pass at `390×844` (`isMobile: true`):

- `document.documentElement.scrollWidth <= window.innerWidth` (zero horizontal page overflow).
- Horizontal-scroll flex bars inside column flex shells must set `width: 100%; max-width: 100%; min-width: 0;`.
- Multi-column grids (cards, slide columns) must collapse to 1 column at `<= 768px`.
- Tables and wide code blocks must be contained in `overflow-x: auto` wrappers.
- Slides must be checked across **every slide (1 through N)**, not just the cover slide.

## 5. Attribution & Licensing

- When bundling third-party open-source assets (e.g., Digital Agency Design System), keep their `LICENSE` files intact, document attribution clearly in `README.md`, and include an independent-project disclaimer.
- Never include private customer names, internal issue numbers, or credentials in this public repository.

## 6. Verification Gate Before Commit / Release

Run these commands after any change:

```sh
npm run build:skills   # sync src/ & vendor/ -> skills/*/
npm run build:web      # generate script-free dist/web-skills/*.zip
npm run build:samples  # rebuild samples & live showcase
npm run validate       # drift check + unit tests + security & CSP tests
npm run verify:ui      # Playwright PC + Mobile (390px) full tab/slide layout audit
```

If `impeccable` is available, also run `impeccable detect` on generated sample HTML and confirm `slop: 0`.
