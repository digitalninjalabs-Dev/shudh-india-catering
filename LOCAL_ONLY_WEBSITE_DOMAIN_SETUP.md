# How This Website Was Made Live on a Real Domain

This guide explains, in simple steps, everything that was done to put the Shudh India site on **GitHub Pages** and connect it to **shudhindiacatering.com** (purchased on **GoDaddy**).

> **Note:** This file is meant to stay on your computer only. It is listed in `.gitignore` so it is **not** pushed to GitHub.

---

## 1. What we used

| Piece | What it is |
|--------|-------------|
| **GitHub** | Hosts your code and serves the public website (free tier: **GitHub Pages**). |
| **GitHub Pages** | Turns a branch of your repo (here: `main`, folder `/`) into a public website. |
| **Your domain** | `shudhindiacatering.com` — you buy it at a registrar (GoDaddy). |
| **DNS** | Settings at GoDaddy that tell the world: “when someone types your domain, send them to GitHub’s servers.” |
| **SSL (HTTPS)** | A certificate so browsers show the **padlock** and `https://`. GitHub requests this automatically after DNS is correct. |

---

## 2. Put the code on GitHub (second account: digitalninjalabs-Dev)

1. **Create an empty repository** on GitHub under the account **digitalninjalabs-Dev**, for example:  
   `digitalninjalabs-Dev/shudh-india-catering`

2. **On your computer**, in the project folder, point Git at that new repo:
   - The remote named `origin` was set to:  
     `https://github.com/digitalninjalabs-Dev/shudh-india-catering.git`
   - The old repo can stay as a second remote (backup), e.g. `iamspyder-origin`.

3. **Push the `main` branch** to `origin` so GitHub has all HTML, CSS, JS, and assets.

4. **GitHub CLI (`gh`)** was logged in as **digitalninjalabs-Dev** so pushes and settings use the correct account.

**Result:** Code lives at  
`https://github.com/digitalninjalabs-Dev/shudh-india-catering`

---

## 3. Turn on GitHub Pages

1. In the repo: **Settings → Pages** (or via API).

2. **Source:**
   - **Branch:** `main`
   - **Folder:** `/` (root of the repo)

3. Save. GitHub builds the site and publishes it.

**First public URL (before custom domain):**  
`https://digitalninjalabs-dev.github.io/shudh-india-catering/`

That URL proves hosting works. The real domain comes next.

---

## 4. Connect your own domain (custom domain)

### 4.1 Add a `CNAME` file in the repo (apex domain)

At the **root** of the repository, a file named **`CNAME`** (no extension) was added with **one line**:

```text
shudhindiacatering.com
```

This tells GitHub Pages: “this site should answer for **shudhindiacatering.com**.”

The file was committed and pushed to `main`.

### 4.2 Set the same in GitHub Settings

In **Settings → Pages → Custom domain**, set:

`shudhindiacatering.com`

GitHub and the `CNAME` file should match.

---

## 5. DNS at GoDaddy (this makes the domain point to GitHub)

Log in to GoDaddy → your domain → **DNS** → **DNS Records**.

### 5.1 Remove conflicts

- Remove any **A** record on **`@`** that pointed to **Website Builder** or anything other than GitHub (so only GitHub’s IPs remain for the root domain).

### 5.2 Add four **A** records for the root domain (`@`)

GitHub Pages uses these IPs for the **apex** (`shudhindiacatering.com` without `www`):

| Type | Name / Host | Value / Points to |
|------|-------------|-------------------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

### 5.3 Set **www** with a **CNAME**

| Type | Name / Host | Value / Points to |
|------|-------------|-------------------|
| CNAME | www | digitalninjalabs-dev.github.io |

Important: **`www`** must **not** point to `shudhindiacatering.com` in a loop. It must point to **`digitalninjalabs-dev.github.io`** (your GitHub Pages host for this user/org).

### 5.4 Do not delete by mistake

Usually **leave as-is** unless you know you need to change them:

- **NS** (nameserver) records  
- **SOA**  
- **TXT** for things like **DMARC** (email authentication), unless you are redoing email

Save all changes. DNS can take **minutes to a few hours** (rarely up to 24–48 hours) to update everywhere.

---

## 6. HTTPS (SSL) and the “connection not private” error

### What should happen

After DNS points to GitHub, GitHub requests a **Let’s Encrypt** certificate for:

- `shudhindiacatering.com`
- `www.shudhindiacatering.com`

### What went wrong at first

Browsers showed **`ERR_CERT_COMMON_NAME_INVALID`** because GitHub was still serving the **default** certificate for **`*.github.io`**, which does **not** match your domain name.

### What fixed it

The custom domain was **removed and re-added** in GitHub Pages settings (so GitHub **re-ran** certificate setup). After that:

- The certificate subject became **`shudhindiacatering.com`**
- **Enforce HTTPS** could be turned on in **Settings → Pages**

You can confirm in the repo’s Pages settings that the certificate is **approved** and HTTPS is **enforced**.

---

## 7. Checklist (quick)

- [ ] Code on GitHub under **digitalninjalabs-Dev** / correct repo  
- [ ] GitHub Pages: branch **`main`**, folder **`/`**  
- [ ] **`CNAME`** file at repo root = `shudhindiacatering.com`  
- [ ] **Settings → Pages**: custom domain = `shudhindiacatering.com`  
- [ ] GoDaddy: **4× A** on `@` → GitHub IPs above  
- [ ] GoDaddy: **CNAME** `www` → `digitalninjalabs-dev.github.io`  
- [ ] Wait for DNS, then wait for SSL  
- [ ] Open **`https://shudhindiacatering.com`** — padlock, no privacy error  

---

## 8. Useful URLs to remember

| Purpose | URL |
|--------|-----|
| Live site | `https://shudhindiacatering.com` |
| GitHub repo | `https://github.com/digitalninjalabs-Dev/shudh-india-catering` |
| Pages URL (fallback) | `https://digitalninjalabs-dev.github.io/shudh-india-catering/` |

---

## 9. If you update the website later

1. Edit files on your computer.  
2. Commit and push to **`main`**.  
3. Wait for GitHub Pages to finish building (usually a short wait).  
4. Refresh the site; hard refresh (**Ctrl+F5**) if you see an old page.

---

## 10. Note about private repositories

If you make this repository **private**, **GitHub Pages** for a public site may **stop working** or require a paid plan, depending on GitHub’s current rules. For a simple business site, keeping the repo **public** is the usual choice unless you move hosting (e.g. Vercel, Netlify, Cloudflare Pages) with a workflow that supports private repos.

---

*End of local guide — not intended for Git.*
