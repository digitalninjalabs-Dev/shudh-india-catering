# Deploying this project

Ship the **repository root**: public HTML at the root, plus **`admin/`** and **`assets/`**.

## Folder layout

| Path | Purpose |
|------|---------|
| `index.html` | Homepage |
| `*.html` (root) | Other public pages (`about.html`, `gallery.html`, …) |
| `admin/` | Admin UI |
| `assets/` | CSS, JS, Firebase config, media |

## Before you upload

1. **`assets/js/firebase-config.js`** — Firebase web keys (see `README.md`).
2. **`assets/logo/logonew.png`** — logo for header, footer, favicon, loaders.

## Static hosting / GitHub Pages

- Source: branch **`main`**, folder **`/`** (root).
- Homepage: **`/index.html`** (or `/` with default document).
- Admin: **`/admin/login.html`**.
- Public HTML uses **`assets/...`** (relative). Loader markup in JS uses **`assets/logo/logonew.png`** (relative to each root-level page so it works on **local `file://` opens** and on the live host).
