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
  }
}
```
