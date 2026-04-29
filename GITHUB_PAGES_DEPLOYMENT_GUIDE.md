# Shudh India Catering - GitHub Pages Deployment Guide

This document explains:

1. How this website was deployed on GitHub.
2. What I will do when you provide your domain.
3. Whether production hosting is free and what limits apply.

---

## 1) What was done to deploy this website on GitHub Pages

The following setup was completed:

1. Created Git repository from your project.
2. Created GitHub repository:
   - `https://github.com/iamspyder/shudh-india-catering`
3. Pushed code to the `main` branch.
4. Reorganized project for simpler hosting:
   - Moved files from `sudh_india_catering/` to repository root.
5. Enabled GitHub Pages with source:
   - Branch: `main`
   - Folder: `/` (root)
6. Triggered a Pages build and verified deployment success.
7. Live URL:
   - `https://iamspyder.github.io/shudh-india-catering/`

---

## 2) What I will do when you give your domain

If you share your domain (for example `shudh-india.in`) and access to DNS panel, I will do this:

1. Add a `CNAME` file in repo root with your domain:
   - Example content: `shudh-india.in`
2. In GitHub repo settings:
   - Open `Settings -> Pages`
   - Set custom domain to your domain
   - Enable `Enforce HTTPS` (after DNS is valid)
3. Ask you to add DNS records at your domain provider:
   - `A` records for root (`@`) to:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - `CNAME` for `www` to:
     - `iamspyder.github.io`
4. Verify DNS propagation and SSL issuance.
5. Confirm final production URLs:
   - `https://shudh-india.in`
   - `https://www.shudh-india.in` (redirected to preferred domain)

Notes:
- DNS propagation may take a few minutes to 24 hours.
- HTTPS can take additional time after DNS is correct.

---

## 3) Is GitHub Pages free for production?

Yes, GitHub Pages hosting is free and can be used for production static websites.

### Typical free limits (important)

- Static hosting only (HTML/CSS/JS/assets).
- Recommended site size: about 1 GB maximum.
- Soft bandwidth guideline: about 100 GB/month.
- Deployment/build frequency guideline: about 10 builds/hour.
- No server-side backend runtime (no Node/PHP/Python server execution).

These are practical service limits; if your traffic becomes very high, you may need a CDN or paid hosting.

---

## 4) Production limitations you should know

1. No dynamic server backend on GitHub Pages.
2. Private/sensitive secrets must not be stored in frontend files.
3. Cold update propagation can take a short time after push.
4. If you need APIs, auth logic, heavy dynamic features, or background jobs, use:
   - Firebase / Supabase / custom backend / cloud functions.

For your current website (static frontend + Firebase client config), GitHub Pages is a good low-cost deployment choice.

---

## 5) Operations checklist for future updates

1. Edit files locally.
2. Commit and push to `main`.
3. Wait for GitHub Pages deploy.
4. Test:
   - Home page
   - Admin path
   - Forms and Firebase integration
   - Mobile layout
5. If domain is connected, verify HTTPS lock icon and redirects.

