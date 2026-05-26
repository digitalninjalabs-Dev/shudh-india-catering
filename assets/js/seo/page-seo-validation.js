/**
 * Input validation (FluentValidation-style rules for Page SEO DTOs).
 */
(function (global) {
  var SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var MAX_TITLE = 60;
  var MAX_DESC = 160;
  var MAX_KEYWORDS = 320;
  var MAX_KEYWORD_TAGS = 15;

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
    if (parts.length > MAX_KEYWORD_TAGS) parts = parts.slice(0, MAX_KEYWORD_TAGS);
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
    if (!metaTitle) errors.push("Meta title is required.");
    else if (metaTitle.length > MAX_TITLE) {
      errors.push("Meta title must be " + MAX_TITLE + " characters or fewer (currently " + metaTitle.length + ").");
    }
    if (!metaDescription) errors.push("Meta description is required.");
    else if (metaDescription.length > MAX_DESC) {
      errors.push(
        "Meta description must be " + MAX_DESC + " characters or fewer (currently " + metaDescription.length + ")."
      );
    }
    if (metaKeywords.length > MAX_KEYWORDS) {
      errors.push(
        "Keywords must be " + MAX_KEYWORDS + " characters or fewer (currently " + metaKeywords.length + ")."
      );
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
    MAX_TITLE: MAX_TITLE,
    MAX_DESC: MAX_DESC,
    MAX_KEYWORDS: MAX_KEYWORDS,
    MAX_KEYWORD_TAGS: MAX_KEYWORD_TAGS,
    slugify: slugify,
    normalizeKeywords: normalizeKeywords,
    validatePageSeoDto: validatePageSeoDto
  };
})(typeof window !== "undefined" ? window : this);
