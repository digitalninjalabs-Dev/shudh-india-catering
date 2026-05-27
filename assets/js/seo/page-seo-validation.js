/**
 * Input validation (FluentValidation-style rules for Page SEO DTOs).
 */
(function (global) {
  var SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var SUGGEST_TITLE = 60;
  var SUGGEST_DESC = 160;

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\.html$/i, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeKeywords(value) {
    var seen = {};
    var parts = String(value || "")
      .split(/[,;]+/)
      .map(function (s) {
        return s.trim().replace(/\s+/g, " ");
      })
      .filter(function (s) {
        if (!s) return false;
        var key = s.toLowerCase();
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
    return parts.join(", ");
  }

  function validatePageSeoDto(dto) {
    var errors = [];
    var data = dto || {};

    var pageName = String(data.pageName || "").trim();
    var slug = slugify(data.slug || data.pageName || "");
    var metaTitle = String(data.metaTitle || "").trim();
    var metaDescription = String(data.metaDescription || "").trim();
    var metaKeywords = normalizeKeywords(data.metaKeywords);
    var canonicalUrl = String(data.canonicalUrl || "").trim();

    if (!pageName) errors.push("Page name is required.");
    if (!slug) errors.push("Slug is required (use lowercase letters, numbers, and hyphens).");
    else if (!SLUG_RE.test(slug)) {
      errors.push("Slug must be SEO-friendly (e.g. about-us, packages).");
    }
    if (canonicalUrl) {
      try {
        var u = new URL(canonicalUrl);
        if (u.protocol !== "https:" && u.protocol !== "http:") {
          errors.push("Canonical URL must start with http:// or https://");
        }
      } catch (e) {
        errors.push("Canonical URL is not a valid URL.");
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      normalized: {
        pageName: pageName,
        slug: slug,
        metaTitle: metaTitle,
        metaDescription: metaDescription,
        metaKeywords: metaKeywords,
        canonicalUrl: canonicalUrl
      }
    };
  }

  global.SHUDH_PAGE_SEO_VALIDATION = {
    SUGGEST_TITLE: SUGGEST_TITLE,
    SUGGEST_DESC: SUGGEST_DESC,
    slugify: slugify,
    normalizeKeywords: normalizeKeywords,
    validatePageSeoDto: validatePageSeoDto
  };
})(typeof window !== "undefined" ? window : this);
