# Shudh India Lead-Gen Website

Separate project focused on high-quality inquiries (not direct menu ordering).

## Folder layout (deploy bundle)

Ship the **repo root** together: public pages as **`index.html`** and **`*.html`** at the root, plus **`admin/`** and **`assets/`** (JS/CSS/media + Firebase config).

Deployment checklist and hosting notes: **`DEPLOY.md`**.

## Included
- Public pages (root): `index.html`, `about.html`, `packages.html`, `inquiry.html`, `gallery.html`, `videos.html`, `blog.html`, `blog-post.html`, `careers.html`, `contact.html`
- Admin pages: `admin/login.html`, `dashboard.html`, `packages.html`, `leads.html`, `gallery.html`, `content.html`, `settings.html`
- Shared theme: `assets/css/global.css` (admin), `assets/css/styles.css` (public site)
- Shared JS: `assets/js/public-site.js`, `assets/js/public-content.js`, `assets/js/shudh-first-paint.js`, `assets/js/content-admin.js`, `assets/js/admin-app.js`, `assets/js/admin-shell.js`, `assets/js/admin-auth-guard.js`

## Firebase setup
1. Create a new Firebase project (new account/project as requested).
2. Enable **Authentication > Email/Password**.
3. Create Firestore database in production mode (or test mode for initial setup).
4. Add a web app in Firebase and copy config.
5. Paste config in `assets/js/firebase-config.js`:
   ```js
   window.SHUDH_CONFIG = {
     firebase: {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "...",
       appId: "..."
     }
   };
   ```
6. Create first admin user in Firebase Authentication.
7. Open `admin/login.html` and login with that admin account.
8. Open `admin/content.html` and update website text/content.

## Firestore collections used
- `inquiries`: lead form submissions
- `packages`: package cards shown on website
- `media`: gallery/video entries
- `siteSettings`: homepage content settings (legacy / optional)
- `siteContent`: dynamic text/image content per page (`global`, `index`, etc.)
- `careersJobs`: job cards on `careers.html` (admin creates)
- `careersApplications`: applications from the careers modal form
- `blogs`: dynamic blog posts (list + detail pages)
- `pageSeo`: per-page Google title & description (SEO Manager)

## Google SEO (admin)

Two layers work together:

| Layer | What it does | Good for |
|-------|----------------|----------|
| **Save in admin** (`admin/seo.html`) | Writes to Firestore `pageSeo` | Live visitors (via `seo-public.js` after page load) |
| **Publish script** (`scripts/seo-publish.js`) | Copies SEO into each `.html` file `<head>` | **Google / crawlers** (reads static HTML) |

**Save alone does not update Git.** For reliable Google SEO, always run the publish script after saving, then commit and push.

Static crawl files: `robots.txt` and `sitemap.xml` at repo root (clean URLs, no `.html`).

---

### SEO workflow (every time you change title / description / keywords)

**Prerequisites:** [Node.js](https://nodejs.org/) installed (`node --version`).

1. **Edit SEO** — open `admin/seo.html`, pick a page, set title, description, keywords, slug → click **Save this page** (repeat per page or use setup-all for missing records only).

2. **Preview publish (optional)** — from repo root:
   ```bash
   node scripts/seo-publish.js --dry-run
   ```
   Shows which HTML files would change without writing files.

3. **Publish to HTML** — from repo root:
   ```bash
   node scripts/seo-publish.js
   ```
   - `update <page> -> file.html` = file was written from Firestore (+ fallback)
   - `ok <page> -> file.html` = file already matches Firestore (nothing to do)

4. **Deploy to live site** — commit and push so GitHub Pages serves new meta:
   ```bash
   git add index.html about.html packages.html inquiry.html gallery.html videos.html blog.html blog-post.html careers.html contact.html
   git commit -m "Publish SEO meta to static HTML"
   git push origin main
   ```
   (Or `git add -A` if you only changed those pages.)

5. **Google Search (optional, after deploy)** — [Search Console](https://search.google.com/search-console): URL Inspection → enter page URL → **Request indexing**. Snippets often update in a few days to ~2 weeks; not instant.

---

### Pages covered by `seo-publish.js`

All public site pages (10 files):

- `index.html` (home)
- `about.html`, `packages.html`, `inquiry.html`, `gallery.html`, `videos.html`
- `blog.html`, `blog-post.html`, `careers.html`, `contact.html`

Admin pages are **not** updated by this script.

---

### What the script reads and writes

**Reads:**

- `assets/js/firebase-config.js` — Firebase `projectId` + `apiKey` (Firestore REST API)
- Firestore collection `pageSeo` (must allow public `read` — see `firestore.rules`)
- `assets/js/seo/seo-fallback.js` — defaults when a page has no Firestore record

**Writes into each page `<head>`:**

- `<title>`
- `<meta name="description">`
- `<meta name="keywords">`
- `<link rel="canonical">` (clean URL, e.g. `https://shudhindiacatering.com/packages`)
- `og:title`, `og:description`, `og:url`
- `twitter:title`, `twitter:description`

`assets/js/seo-public.js` still runs in the browser for dynamic updates; static tags are what Google should rely on after publish + deploy.

---

### Troubleshooting

| Problem | Check |
|---------|--------|
| Script errors on fetch | Firebase rules include `pageSeo` read; config in `firebase-config.js` |
| All lines show `ok`, no `update` | HTML already matches Firestore — normal after a recent publish |
| Google still shows old title | Request indexing; wait for recrawl; confirm you pushed HTML after `seo-publish.js` |
| Wrong text on live site | Run publish again, then push; hard-refresh browser (Ctrl+Shift+R) |

---

### Quick reference (copy-paste)

```bash
cd "path/to/Shudh-India-main_code"
node scripts/seo-publish.js --dry-run
node scripts/seo-publish.js
git status
git add index.html about.html packages.html inquiry.html gallery.html videos.html blog.html blog-post.html careers.html contact.html
git commit -m "Publish SEO meta to static HTML"
git push origin main
```

## Security rules (starter)
Use strict rules and relax only what is needed:
```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inquiries/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /packages/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /media/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /siteSettings/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /siteContent/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /careersJobs/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /careersApplications/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /blogs/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /pageSeo/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

If SEO Manager shows **Missing or insufficient permissions**, your live Firebase project is missing the `pageSeo` block above. Copy the full rules from `firestore.rules` in this repo, or add only the `pageSeo` block, then **Publish** in [Firebase Console → Firestore → Rules](https://console.firebase.google.com/).
