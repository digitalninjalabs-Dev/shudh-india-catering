/**
 * Default page SEO when Firestore has no record (auto fallback).
 */
(function (global) {
  var BRAND = "Shudh India Catering";

  var FALLBACK_BY_PAGE_KEY = {
    index: {
      pageName: "Home",
      slug: "index",
      metaTitle: BRAND + " | Premium Catering Experiences",
      metaDescription:
        "Premium vegetarian catering for weddings, corporate events, and celebrations across India. Custom menus and elegant service.",
      metaKeywords:
        "vegetarian catering, wedding catering, corporate catering, Indian catering, Shudh India Catering",
      canonicalUrl: ""
    },
    about: {
      pageName: "About Us",
      slug: "about",
      metaTitle: "About Us | " + BRAND,
      metaDescription:
        "Discover our story, culinary philosophy, and the team behind memorable catering experiences.",
      metaKeywords: "about Shudh India, catering company, vegetarian catering team, our story",
      canonicalUrl: ""
    },
    packages: {
      pageName: "Packages",
      slug: "packages",
      metaTitle: "Catering Packages | " + BRAND,
      metaDescription:
        "Explore Silver, Gold, Diamond, and Platinum catering packages with transparent per-pax pricing.",
      metaKeywords:
        "catering packages, per pax pricing, wedding packages, corporate catering packages, vegetarian menu",
      canonicalUrl: ""
    },
    inquiry: {
      pageName: "Get Quote",
      slug: "inquiry",
      metaTitle: "Get a Quote | " + BRAND,
      metaDescription:
        "Request a custom catering quote for your event. Tell us your date, guest count, and preferences.",
      metaKeywords: "catering quote, event inquiry, book catering, get quote, wedding quote",
      canonicalUrl: ""
    },
    gallery: {
      pageName: "Gallery",
      slug: "gallery",
      metaTitle: "Event Gallery | " + BRAND,
      metaDescription:
        "Browse photos from weddings, corporate events, and private celebrations catered by Shudh India.",
      metaKeywords: "catering gallery, wedding photos, event photos, food presentation, catering events",
      canonicalUrl: ""
    },
    videos: {
      pageName: "Videos",
      slug: "videos",
      metaTitle: "Videos | " + BRAND,
      metaDescription:
        "Watch highlights from our catering events, live counters, and signature presentations.",
      metaKeywords: "catering videos, event highlights, live counter, wedding catering video",
      canonicalUrl: ""
    },
    blog: {
      pageName: "Blog",
      slug: "blog",
      metaTitle: "Blog | " + BRAND,
      metaDescription:
        "Insights on Indian catering, event planning tips, and stories from the Shudh India kitchen.",
      metaKeywords: "catering blog, event planning tips, Indian food blog, wedding planning",
      canonicalUrl: ""
    },
    "blog-post": {
      pageName: "Blog Post",
      slug: "blog-post",
      metaTitle: "Blog | " + BRAND,
      metaDescription: "Read the latest article from " + BRAND + ".",
      metaKeywords: "catering article, event tips, Indian catering blog",
      canonicalUrl: ""
    },
    careers: {
      pageName: "Careers",
      slug: "careers",
      metaTitle: "Careers | " + BRAND,
      metaDescription:
        "Join our catering team. View open roles and apply to grow with Shudh India Catering.",
      metaKeywords: "catering jobs, careers, hospitality jobs, join our team",
      canonicalUrl: ""
    },
    contact: {
      pageName: "Contact",
      slug: "contact",
      metaTitle: "Contact Us | " + BRAND,
      metaDescription:
        "Call or email our concierge desk for bookings, menu questions, and event consultations.",
      metaKeywords: "contact catering, book event, catering phone, catering email, concierge",
      canonicalUrl: ""
    }
  };

  function normalizePageKey(pageKey) {
    return String(pageKey || "index")
      .replace(/\.html$/i, "")
      .trim()
      .toLowerCase() || "index";
  }

  function getFallback(pageKey) {
    var key = normalizePageKey(pageKey);
    var base = FALLBACK_BY_PAGE_KEY[key] || FALLBACK_BY_PAGE_KEY.index;
    return Object.assign({}, base);
  }

  function resolveSeo(pageKey, record) {
    var fallback = getFallback(pageKey);
    if (!record || typeof record !== "object") return fallback;
    return {
      pageName: record.pageName || fallback.pageName,
      slug: record.slug || fallback.slug,
      metaTitle: record.metaTitle || fallback.metaTitle,
      metaDescription: record.metaDescription || fallback.metaDescription,
      metaKeywords: record.metaKeywords || fallback.metaKeywords || "",
      canonicalUrl: record.canonicalUrl || fallback.canonicalUrl || ""
    };
  }

  global.SHUDH_SEO_FALLBACK = {
    FALLBACK_BY_PAGE_KEY: FALLBACK_BY_PAGE_KEY,
    getFallback: getFallback,
    resolveSeo: resolveSeo,
    normalizePageKey: normalizePageKey
  };
})(typeof window !== "undefined" ? window : this);
