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

  global.SHUDH_ROBOTS_CONFIG = {
    SITE_ORIGIN: SITE_ORIGIN,
    getRobotsTxt: getRobotsTxt
  };
})(typeof window !== "undefined" ? window : this);
