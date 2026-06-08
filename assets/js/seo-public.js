/**
 * Public site — apply Page SEO meta tags with Firestore + fallback.
 */
(function () {
  function getPageKey() {
    var name = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!name || name === "") return "index";
    return name.replace(/\.html$/i, "") || "index";
  }

  function upsertMeta(attrName, attrValue, content) {
    if (!content) return;
    var selector = 'meta[' + attrName + '="' + attrValue + '"]';
    var el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function upsertCanonical(href) {
    if (!href) return;
    var el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }

  function defaultCanonical(seo) {
    var cfg = window.SHUDH_ROBOTS_CONFIG;
    var origin =
      (cfg && cfg.SITE_ORIGIN) || window.location.origin || "https://shudhindiacatering.com";
    if (cfg && cfg.publicUrlFromSlug) {
      return cfg.publicUrlFromSlug(seo && seo.slug, origin);
    }
    var base = origin.replace(/\/$/, "");
    var slug = String((seo && seo.slug) || "")
      .trim()
      .toLowerCase()
      .replace(/\.html$/i, "");
    if (!slug || slug === "index" || slug === "home") return base + "/";
    return base + "/" + slug;
  }

  function applySeo(seo) {
    if (!seo) return;
    document.title = seo.metaTitle || document.title;
    upsertMeta("name", "description", seo.metaDescription || "");
    upsertMeta("name", "keywords", seo.metaKeywords || "");
    upsertMeta("property", "og:title", seo.metaTitle || "");
    upsertMeta("property", "og:description", seo.metaDescription || "");
    upsertMeta("name", "twitter:title", seo.metaTitle || "");
    upsertMeta("name", "twitter:description", seo.metaDescription || "");
    var canonical = String(seo.canonicalUrl || "").trim() || defaultCanonical(seo);
    upsertCanonical(canonical);
  }

  function init() {
    if (!window.SHUDH_CONFIG || !window.SHUDH_CONFIG.firebase) return Promise.resolve();
    if (typeof firebase === "undefined") return Promise.resolve();
    if (!window.SHUDH_PAGE_SEO_SERVICE || !window.SHUDH_SEO_FALLBACK) return Promise.resolve();
    if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);

    var pageKey = getPageKey();
    if (pageKey === "blog-post" && new URLSearchParams(window.location.search).get("id")) {
      return Promise.resolve();
    }

    var service = window.SHUDH_PAGE_SEO_SERVICE.createService();

    return service
      .getForPage(pageKey)
      .then(applySeo)
      .catch(function () {
        applySeo(window.SHUDH_SEO_FALLBACK.getFallback(pageKey));
      });
  }

  window.SHUDH_PUBLIC_SEO = {
    apply: applySeo,
    defaultCanonical: defaultCanonical
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
