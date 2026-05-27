/**
 * Default page SEO when Firestore has no record (auto fallback).
 */
(function (global) {
  var BRAND = "Shudh India Catering";

  var FALLBACK_BY_PAGE_KEY = {
    index: {
      pageName: "Home",
      slug: "index",
      metaTitle: BRAND + " | Best Veg Catering Services in Lucknow",
      metaDescription:
        "Shudh India Catering delivers fresh, hygienic veg catering in Lucknow for weddings, corporate events, and private celebrations with premium service.",
      metaKeywords:
        "veg catering lucknow, wedding catering lucknow, corporate catering lucknow, shudh india catering, hygienic catering services",
      canonicalUrl: ""
    },
    about: {
      pageName: "About Us",
      slug: "about",
      metaTitle: "About " + BRAND + " | Trusted Caterer in Lucknow",
      metaDescription:
        "Learn about Shudh India Catering, our culinary approach, service standards, and experience in delivering premium veg catering in Lucknow.",
      metaKeywords:
        "about shudh india catering, lucknow catering company, veg caterer profile, hospitality team lucknow",
      canonicalUrl: ""
    },
    packages: {
      pageName: "Packages",
      slug: "packages",
      metaTitle: "Catering Packages in Lucknow | " + BRAND,
      metaDescription:
        "Compare wedding and event catering packages with clear per-plate pricing, custom menus, and premium veg service by Shudh India Catering.",
      metaKeywords:
        "catering packages lucknow, wedding menu packages, per plate catering price, veg buffet packages, event catering plans",
      canonicalUrl: ""
    },
    inquiry: {
      pageName: "Get Quote",
      slug: "inquiry",
      metaTitle: "Get Catering Quote in Lucknow | " + BRAND,
      metaDescription:
        "Request a quick catering quote for weddings, receptions, corporate events, and parties in Lucknow with menu customization and expert planning.",
      metaKeywords:
        "catering quote lucknow, book caterer lucknow, wedding catering inquiry, event catering quote, veg catering booking",
      canonicalUrl: ""
    },
    gallery: {
      pageName: "Gallery",
      slug: "gallery",
      metaTitle: "Catering Event Gallery | " + BRAND,
      metaDescription:
        "See real photos from weddings, corporate functions, and private events catered by Shudh India Catering across Lucknow.",
      metaKeywords:
        "catering gallery lucknow, wedding catering photos, buffet setup images, event food presentation, shudh india events",
      canonicalUrl: ""
    },
    videos: {
      pageName: "Videos",
      slug: "videos",
      metaTitle: "Catering Videos & Event Highlights | " + BRAND,
      metaDescription:
        "Watch Shudh India Catering videos featuring wedding setups, live counters, and premium veg service highlights from real events.",
      metaKeywords:
        "catering videos lucknow, wedding catering highlights, live counter videos, event catering reels, veg catering showcase",
      canonicalUrl: ""
    },
    blog: {
      pageName: "Blog",
      slug: "blog",
      metaTitle: "Catering Tips & Event Ideas Blog | " + BRAND,
      metaDescription:
        "Read practical catering tips, menu ideas, and event planning insights from the Shudh India Catering team.",
      metaKeywords:
        "catering blog lucknow, event planning tips, wedding menu ideas, veg catering advice, party catering guide",
      canonicalUrl: ""
    },
    "blog-post": {
      pageName: "Blog Post",
      slug: "blog-post",
      metaTitle: "Catering Article | " + BRAND,
      metaDescription: "Read the latest catering and event article from " + BRAND + ".",
      metaKeywords: "catering article, event management tips, wedding catering blog, veg food trends",
      canonicalUrl: ""
    },
    careers: {
      pageName: "Careers",
      slug: "careers",
      metaTitle: "Careers in Catering & Hospitality | " + BRAND,
      metaDescription:
        "Explore job openings in catering operations, kitchen, service, and hospitality management at Shudh India Catering.",
      metaKeywords:
        "catering jobs lucknow, hospitality careers, kitchen staff jobs, event service jobs, shudh india careers",
      canonicalUrl: ""
    },
    contact: {
      pageName: "Contact",
      slug: "contact",
      metaTitle: "Contact " + BRAND + " | Book Catering in Lucknow",
      metaDescription:
        "Contact Shudh India Catering for bookings, menu consultation, pricing details, and event planning support in Lucknow.",
      metaKeywords:
        "contact caterer lucknow, book catering service, catering phone number, wedding catering contact, shudh india contact",
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
