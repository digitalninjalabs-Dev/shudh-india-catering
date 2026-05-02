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
- Public HTML uses **`assets/...`** (relative). Shared loaders in JS use **`/assets/...`** (works with a **custom domain at site root**).
