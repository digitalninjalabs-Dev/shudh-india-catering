/**
 * Robots.txt rules (static file at /robots.txt on the live site).
 */
(function (global) {
  var SITE_ORIGIN = "https://shudhindiacatering.com";

  function getRobotsTxt() {
    return [
      "User-agent: *",
      "Allow: /",
      "Disallow: /admin/",
      "Disallow: /admin",
      "Disallow: /api/private",
      "Disallow: /api/private/",
      "",
      "Sitemap: " + SITE_ORIGIN.replace(/\/$/, "") + "/sitemap.xml"
    ].join("\n") + "\n";
  }

  /** Public path without .html (GitHub Pages serves about.html at /about). */
  function publicPathFromSlug(slug) {
    var s = String(slug || "")
      .trim()
      .toLowerCase()
      .replace(/\.html$/i, "");
    if (!s || s === "index" || s === "home") return "/";
    return "/" + s;
  }

  function publicUrlFromSlug(slug, origin) {
    var base = String(origin || SITE_ORIGIN).replace(/\/$/, "");
    var path = publicPathFromSlug(slug);
    return path === "/" ? base + "/" : base + path;
  }

  global.SHUDH_ROBOTS_CONFIG = {
    SITE_ORIGIN: SITE_ORIGIN,
    publicPathFromSlug: publicPathFromSlug,
    publicUrlFromSlug: publicUrlFromSlug,
    getRobotsTxt: getRobotsTxt
  };
})(typeof window !== "undefined" ? window : this);
