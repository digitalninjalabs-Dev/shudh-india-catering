#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const FIREBASE_CONFIG_PATH = path.join(ROOT, "assets", "js", "firebase-config.js");
const SEO_FALLBACK_PATH = path.join(ROOT, "assets", "js", "seo", "seo-fallback.js");
const DEFAULT_SITE_ORIGIN = "https://shudhindiacatering.com";
const DRY_RUN = process.argv.includes("--dry-run");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function loadGlobalFromScript(filePath, globalName) {
  const code = readFile(filePath);
  const sandbox = {
    window: {},
    globalThis: {},
    console
  };
  sandbox.global = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: filePath });
  const value = sandbox.window[globalName] || sandbox.globalThis[globalName];
  if (!value) throw new Error(`Could not load ${globalName} from ${filePath}`);
  return value;
}

function htmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attrEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function normalizePageKey(pageKey) {
  return String(pageKey || "index")
    .toLowerCase()
    .trim()
    .replace(/\.html$/i, "") || "index";
}

function canonicalForSlug(slug, siteOrigin) {
  const base = String(siteOrigin || DEFAULT_SITE_ORIGIN).replace(/\/$/, "");
  const s = String(slug || "")
    .toLowerCase()
    .trim()
    .replace(/\.html$/i, "");
  if (!s || s === "index" || s === "home") return `${base}/`;
  return `${base}/${s}`;
}

function fromFirestoreValue(v) {
  if (!v || typeof v !== "object") return "";
  if (typeof v.stringValue === "string") return v.stringValue;
  if (typeof v.booleanValue === "boolean") return v.booleanValue;
  if (typeof v.integerValue === "string") return Number(v.integerValue);
  if (typeof v.doubleValue === "number") return v.doubleValue;
  return "";
}

function toSeoEntity(doc) {
  const fields = (doc && doc.fields) || {};
  return {
    id: String(doc && doc.name ? doc.name.split("/").pop() : ""),
    pageName: String(fromFirestoreValue(fields.pageName) || "").trim(),
    slug: String(fromFirestoreValue(fields.slug) || "").trim(),
    pageKey: normalizePageKey(fromFirestoreValue(fields.pageKey) || fromFirestoreValue(fields.slug) || ""),
    metaTitle: String(fromFirestoreValue(fields.metaTitle) || "").trim(),
    metaDescription: String(fromFirestoreValue(fields.metaDescription) || "").trim(),
    metaKeywords: String(fromFirestoreValue(fields.metaKeywords) || "").trim(),
    canonicalUrl: String(fromFirestoreValue(fields.canonicalUrl) || "").trim()
  };
}

async function fetchFirestoreSeo(firebaseConfig) {
  const projectId = firebaseConfig.projectId;
  const apiKey = firebaseConfig.apiKey;
  if (!projectId || !apiKey) {
    throw new Error("Missing Firebase projectId/apiKey in assets/js/firebase-config.js");
  }

  const endpoint =
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/pageSeo` +
    `?key=${encodeURIComponent(apiKey)}&pageSize=200`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore fetch failed (${res.status}): ${body}`);
  }
  const json = await res.json();
  const docs = Array.isArray(json.documents) ? json.documents : [];
  return docs.map(toSeoEntity).filter((x) => x && (x.slug || x.pageKey));
}

function replaceOrInsert(html, pattern, replacement, insertBeforeRegex) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(insertBeforeRegex, `${replacement}\n$&`);
}

function updateHtmlMeta(html, seo, siteOrigin) {
  const title = seo.metaTitle || "";
  const description = seo.metaDescription || "";
  const keywords = seo.metaKeywords || "";
  const canonical = seo.canonicalUrl || canonicalForSlug(seo.slug || seo.pageKey, siteOrigin);

  let out = html;
  out = replaceOrInsert(out, /<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(title)}</title>`, /<\/head>/i);
  out = replaceOrInsert(
    out,
    /<meta\s+[^>]*name=["']description["'][^>]*>/i,
    `<meta name="description" content="${attrEscape(description)}"/>`,
    /<\/head>/i
  );
  out = replaceOrInsert(
    out,
    /<meta\s+[^>]*name=["']keywords["'][^>]*>/i,
    `<meta name="keywords" content="${attrEscape(keywords)}"/>`,
    /<\/head>/i
  );
  out = replaceOrInsert(
    out,
    /<link\s+[^>]*rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${attrEscape(canonical)}"/>`,
    /<\/head>/i
  );

  // Social tags (recommended for consistent previews and snippets)
  out = replaceOrInsert(
    out,
    /<meta\s+[^>]*property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${attrEscape(title)}"/>`,
    /<\/head>/i
  );
  out = replaceOrInsert(
    out,
    /<meta\s+[^>]*property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${attrEscape(description)}"/>`,
    /<\/head>/i
  );
  out = replaceOrInsert(
    out,
    /<meta\s+[^>]*property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${attrEscape(canonical)}"/>`,
    /<\/head>/i
  );
  out = replaceOrInsert(
    out,
    /<meta\s+[^>]*name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${attrEscape(title)}"/>`,
    /<\/head>/i
  );
  out = replaceOrInsert(
    out,
    /<meta\s+[^>]*name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${attrEscape(description)}"/>`,
    /<\/head>/i
  );

  return out;
}

function filePathForPageKey(pageKey) {
  const key = normalizePageKey(pageKey);
  return path.join(ROOT, key === "index" ? "index.html" : `${key}.html`);
}

async function main() {
  const shudhConfig = loadGlobalFromScript(FIREBASE_CONFIG_PATH, "SHUDH_CONFIG");
  const fallback = loadGlobalFromScript(SEO_FALLBACK_PATH, "SHUDH_SEO_FALLBACK");
  const fallbackByKey = Object.assign({}, fallback.FALLBACK_BY_PAGE_KEY || {});

  const siteOrigin = process.env.SITE_ORIGIN || DEFAULT_SITE_ORIGIN;
  const firestoreRows = await fetchFirestoreSeo((shudhConfig && shudhConfig.firebase) || {});
  const firestoreByKey = {};
  firestoreRows.forEach((row) => {
    const key = normalizePageKey(row.pageKey || row.slug);
    firestoreByKey[key] = row;
  });

  const keys = Array.from(new Set(Object.keys(fallbackByKey).concat(Object.keys(firestoreByKey)))).sort();
  if (!keys.length) {
    console.log("No SEO pages found.");
    return;
  }

  let changed = 0;
  let processed = 0;
  for (const key of keys) {
    const filePath = filePathForPageKey(key);
    if (!fs.existsSync(filePath)) {
      console.log(`skip  ${key.padEnd(10)} -> missing file ${path.basename(filePath)}`);
      continue;
    }

    const fb = fallbackByKey[key] || {};
    const live = firestoreByKey[key] || {};
    const merged = {
      pageKey: key,
      slug: live.slug || fb.slug || key,
      metaTitle: live.metaTitle || fb.metaTitle || "",
      metaDescription: live.metaDescription || fb.metaDescription || "",
      metaKeywords: live.metaKeywords || fb.metaKeywords || "",
      canonicalUrl: live.canonicalUrl || fb.canonicalUrl || ""
    };

    const before = readFile(filePath);
    const after = updateHtmlMeta(before, merged, siteOrigin);
    processed += 1;
    if (after !== before) {
      changed += 1;
      if (!DRY_RUN) fs.writeFileSync(filePath, after, "utf8");
      console.log(`${DRY_RUN ? "would update" : "update"} ${key.padEnd(10)} -> ${path.basename(filePath)}`);
    } else {
      console.log(`ok     ${key.padEnd(10)} -> ${path.basename(filePath)}`);
    }
  }

  console.log("");
  console.log(
    `${DRY_RUN ? "Dry run complete" : "Publish complete"}: ${changed} file(s) changed out of ${processed} processed.`
  );
}

main().catch((err) => {
  console.error("SEO publish failed:", err && err.message ? err.message : err);
  process.exit(1);
});

