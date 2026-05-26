/**
 * Admin SEO — save to Firebase; live page titles/descriptions update automatically.
 */
(function () {
  var service = null;
  var cachedRows = [];
  var currentPageKey = null;
  var SITE_ORIGIN =
    (window.SHUDH_ROBOTS_CONFIG && window.SHUDH_ROBOTS_CONFIG.SITE_ORIGIN) ||
    "https://shudhindiacatering.com";

  var SITE_PAGES = [];

  function buildSitePages() {
    var map = (window.SHUDH_SEO_FALLBACK && window.SHUDH_SEO_FALLBACK.FALLBACK_BY_PAGE_KEY) || {};
    SITE_PAGES = Object.keys(map).map(function (key) {
      var fb = map[key];
      return {
        pageKey: key,
        pageName: fb.pageName,
        slug: fb.slug,
        file: key === "index" ? "index.html" : key + ".html"
      };
    });
  }

  function getDb() {
    return window.SHUDH_PAGE_SEO_REPOSITORY && window.SHUDH_PAGE_SEO_REPOSITORY.getDb();
  }

  function $(id) {
    return document.getElementById(id);
  }

  function isPermissionError(err) {
    var code = err && (err.code || (err.message && err.message.indexOf("permission") >= 0 ? "permission-denied" : ""));
    if (code === "permission-denied") return true;
    var msg = String((err && err.message) || "").toLowerCase();
    return msg.indexOf("permission") >= 0 || msg.indexOf("insufficient") >= 0;
  }

  function toast(text, isError) {
    var el = $("seo-toast");
    if (!el) return;
    el.textContent = text || "";
    el.className = (isError ? "err" : "ok") + " show";
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 3800);
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function previewUrlForSlug(slug) {
    var base = SITE_ORIGIN.replace(/\/$/, "");
    var s = String(slug || "index").toLowerCase();
    if (!s || s === "index") return base + "/";
    return base + "/" + s + ".html";
  }

  function slugifyInput(value) {
    if (window.SHUDH_PAGE_SEO_VALIDATION && window.SHUDH_PAGE_SEO_VALIDATION.slugify) {
      return window.SHUDH_PAGE_SEO_VALIDATION.slugify(value);
    }
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getSlugValue() {
    if (currentPageKey === "index") return "index";
    var raw = ($("seo-slug-input") && $("seo-slug-input").value) || "";
    return slugifyInput(raw) || currentPageKey || "index";
  }

  function setSlugField(slug, pageKey) {
    var row = $("seo-url-row");
    var input = $("seo-slug-input");
    var suggest = $("seo-slug-suggest");
    var isHome = pageKey === "index";
    if (input) {
      input.value = isHome ? "index" : slug || "";
      input.readOnly = isHome;
    }
    if (row) row.classList.toggle("is-locked", isHome);
    if (suggest) suggest.classList.toggle("hidden", isHome);
    updateSlugHint(pageKey, slug);
  }

  function updateSlugHint(pageKey, slug) {
    var hint = $("seo-slug-hint");
    if (!hint) return;
    var pk = pageKey || currentPageKey;
    if (pk === "index") {
      hint.textContent = "Home page always uses your main domain URL.";
      return;
    }
    hint.textContent = "Live URL: " + previewUrlForSlug(slug || getSlugValue());
  }

  function suggestSlugFromPage() {
    if (!currentPageKey || currentPageKey === "index") return;
    var template = SITE_PAGES.find(function (p) {
      return p.pageKey === currentPageKey;
    });
    if (!template) return;
    var input = $("seo-slug-input");
    if (!input) return;
    input.value = slugifyInput(template.pageName || template.slug || currentPageKey);
    updateGooglePreview();
    updateSlugHint(currentPageKey, input.value);
  }

  function updateKeywordChips() {
    var wrap = $("seo-keywords-chips");
    var input = $("seo-meta-keywords");
    if (!wrap || !input) return;
    var norm =
      window.SHUDH_PAGE_SEO_VALIDATION && window.SHUDH_PAGE_SEO_VALIDATION.normalizeKeywords
        ? window.SHUDH_PAGE_SEO_VALIDATION.normalizeKeywords(input.value)
        : input.value;
    var parts = norm ? norm.split(/,\s*/) : [];
    wrap.innerHTML = parts
      .map(function (t) {
        return '<span class="seo-kw-chip">' + esc(t) + "</span>";
      })
      .join("");
  }

  function duplicateSlugMessage(slug, pageKey) {
    var conflict = cachedRows.find(function (r) {
      return (
        r.slug === slug &&
        r.pageKey !== pageKey &&
        r.slug !== pageKey
      );
    });
    if (!conflict) return "";
    return (
      'The link "' +
      slug +
      '" is already used by "' +
      (conflict.pageName || conflict.pageKey) +
      '". Pick another slug.'
    );
  }

  function rowForPageKey(pageKey) {
    return cachedRows.find(function (r) {
      return r.pageKey === pageKey || r.slug === pageKey;
    });
  }

  function isPageReady(pageKey) {
    var saved = rowForPageKey(pageKey);
    return !!(saved && saved.metaTitle && saved.metaDescription);
  }

  function hintClass(len, good, max) {
    if (len <= good) return "seo-hint-ok";
    if (len <= max) return "seo-hint-warn";
    return "seo-hint-bad";
  }

  function updateHints() {
    var titleLen = String(($("seo-meta-title") && $("seo-meta-title").value) || "").length;
    var descLen = String(($("seo-meta-description") && $("seo-meta-description").value) || "").length;
    var kwRaw = String(($("seo-meta-keywords") && $("seo-meta-keywords").value) || "");
    var kwNorm =
      window.SHUDH_PAGE_SEO_VALIDATION && window.SHUDH_PAGE_SEO_VALIDATION.normalizeKeywords
        ? window.SHUDH_PAGE_SEO_VALIDATION.normalizeKeywords(kwRaw)
        : kwRaw;
    var kwTags = kwNorm ? kwNorm.split(/,\s*/).filter(Boolean) : [];
    var titleHint = $("seo-title-hint");
    var descHint = $("seo-desc-hint");
    var kwHint = $("seo-keywords-hint");
    if (titleHint) {
      titleHint.textContent = titleLen + " / 60";
      titleHint.className = "text-xs font-normal " + hintClass(titleLen, 50, 60);
    }
    if (descHint) {
      descHint.textContent = descLen + " / 160";
      descHint.className = "text-xs font-normal " + hintClass(descLen, 140, 160);
    }
    if (kwHint) {
      kwHint.textContent = kwTags.length + " / 15 terms";
      kwHint.className =
        "text-xs font-normal " +
        (kwTags.length >= 5 && kwTags.length <= 15
          ? "seo-hint-ok"
          : kwTags.length > 0
            ? "seo-hint-warn"
            : "text-stone-500");
    }
    updateKeywordChips();
    updateSlugHint();
    updateGooglePreview();
  }

  function updateGooglePreview() {
    var slug = getSlugValue();
    var title = ($("seo-meta-title") && $("seo-meta-title").value) || "Your page title appears here";
    var desc =
      ($("seo-meta-description") && $("seo-meta-description").value) ||
      "Your description appears here. Write something clear and inviting.";
    if ($("seo-preview-url")) $("seo-preview-url").textContent = previewUrlForSlug(slug);
    if ($("seo-preview-title")) $("seo-preview-title").textContent = title;
    if ($("seo-preview-desc")) $("seo-preview-desc").textContent = desc;
  }

  function updateProgress() {
    var total = SITE_PAGES.length;
    var ready = SITE_PAGES.filter(function (p) {
      return isPageReady(p.pageKey);
    }).length;
    var pct = total ? Math.round((ready / total) * 100) : 0;
    if ($("seo-progress-text")) $("seo-progress-text").textContent = ready + " / " + total;
    if ($("seo-progress-bar")) $("seo-progress-bar").style.width = pct + "%";
    var welcome = $("seo-welcome");
    if (welcome) welcome.classList.toggle("hidden", ready >= Math.min(3, total));
  }

  function populatePageSelect() {
    var sel = $("seo-page-select");
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML =
      '<option value="">Choose a page...</option>' +
      SITE_PAGES.map(function (p) {
        var saved = isPageReady(p.pageKey);
        var label = p.pageName + (saved ? " ✓" : "");
        return '<option value="' + esc(p.pageKey) + '">' + esc(label) + "</option>";
      }).join("");
    if (current) sel.value = current;
  }

  function renderChips() {
    var wrap = $("seo-chips");
    if (!wrap) return;
    wrap.innerHTML = SITE_PAGES.map(function (p) {
      var done = isPageReady(p.pageKey);
      var active = currentPageKey === p.pageKey;
      var cls = "seo-chip" + (done ? " is-done" : "") + (active ? " is-active" : "");
      return (
        '<button type="button" class="' +
        cls +
        '" data-page-key="' +
        esc(p.pageKey) +
        '">' +
        esc(p.pageName) +
        (done ? " ✓" : "") +
        "</button>"
      );
    }).join("");
  }

  function setEditorVisible(show) {
    if ($("seo-editor")) $("seo-editor").classList.toggle("hidden", !show);
    if ($("seo-pick-hint")) $("seo-pick-hint").classList.toggle("hidden", show);
  }

  function clearEditor() {
    currentPageKey = null;
    if ($("seo-page-select")) $("seo-page-select").value = "";
    if ($("seo-edit-slug")) $("seo-edit-slug").value = "";
    if ($("seo-page-key")) $("seo-page-key").value = "";
    if ($("seo-page-name")) $("seo-page-name").value = "";
    if ($("seo-slug-input")) $("seo-slug-input").value = "";
    if ($("seo-meta-title")) $("seo-meta-title").value = "";
    if ($("seo-meta-description")) $("seo-meta-description").value = "";
    if ($("seo-meta-keywords")) $("seo-meta-keywords").value = "";
    if ($("seo-keywords-chips")) $("seo-keywords-chips").innerHTML = "";
    setSlugField("index", null);
    setEditorVisible(false);
    renderChips();
    updateHints();
  }

  function fillForm(pageKey) {
    var pk = pageKey;
    if (!pk) {
      clearEditor();
      return;
    }
    var template = SITE_PAGES.find(function (p) {
      return p.pageKey === pk;
    });
    if (!template) return;

    var saved = rowForPageKey(pk);
    var fb = window.SHUDH_SEO_FALLBACK.getFallback(pk);
    var data = saved && saved.metaTitle ? saved : fb;

    currentPageKey = pk;
    if ($("seo-page-select")) $("seo-page-select").value = pk;
    if ($("seo-edit-slug")) $("seo-edit-slug").value = saved && saved.slug ? saved.slug : "";
    if ($("seo-page-key")) $("seo-page-key").value = pk;
    if ($("seo-page-name")) $("seo-page-name").value = data.pageName || fb.pageName;
    setSlugField(data.slug || fb.slug, pk);
    if ($("seo-meta-title")) $("seo-meta-title").value = data.metaTitle || "";
    if ($("seo-meta-description")) $("seo-meta-description").value = data.metaDescription || "";
    if ($("seo-meta-keywords")) {
      $("seo-meta-keywords").value = data.metaKeywords || fb.metaKeywords || "";
    }

    setEditorVisible(true);
    renderChips();
    updateHints();
  }

  function navigatePage(delta) {
    if (!SITE_PAGES.length) return;
    var idx = SITE_PAGES.findIndex(function (p) {
      return p.pageKey === currentPageKey;
    });
    if (idx < 0) idx = 0;
    else idx = (idx + delta + SITE_PAGES.length) % SITE_PAGES.length;
    fillForm(SITE_PAGES[idx].pageKey);
  }

  function renderPageList() {
    var list = $("seo-page-list");
    if (!list) return;
    if (!SITE_PAGES.length) {
      list.innerHTML = '<p class="text-sm text-stone-500">No pages found.</p>';
      return;
    }
    list.innerHTML = SITE_PAGES.map(function (p) {
      var saved = rowForPageKey(p.pageKey);
      var ready = isPageReady(p.pageKey);
      var badge = ready
        ? '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-900/30 text-green-400">Ready</span>'
        : '<span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-800 text-stone-500">Default</span>';
      return (
        '<button type="button" class="seo-page-list-row w-full text-left rounded-xl border border-stone-700/50 bg-surface-container-highest p-3 flex items-start gap-3 hover:border-stone-600 transition" data-page-key="' +
        esc(p.pageKey) +
        '">' +
        '<span class="material-symbols-outlined text-stone-500 text-xl mt-0.5">article</span>' +
        '<span class="min-w-0 flex-1">' +
        '<span class="flex items-center justify-between gap-2 flex-wrap">' +
        '<span class="font-semibold text-stone-100 text-sm">' +
        esc(p.pageName) +
        "</span>" +
        badge +
        "</span>" +
        '<span class="text-[11px] text-stone-500 mt-1 block">' +
        esc(previewUrlForSlug(p.slug)) +
        "</span>" +
        (saved && saved.metaTitle
          ? '<span class="text-[11px] text-stone-600 mt-1 block truncate">' + esc(saved.metaTitle) + "</span>"
          : "") +
        (saved && saved.metaKeywords
          ? '<span class="text-[10px] text-stone-600 mt-1 block truncate">Keywords: ' +
            esc(saved.metaKeywords) +
            "</span>"
          : "") +
        "</span></button>"
      );
    }).join("");
  }

  function switchFeatureTab(tabId) {
    var tabs = document.querySelectorAll("[data-seo-tab]");
    tabs.forEach(function (btn) {
      var active = btn.getAttribute("data-seo-tab") === tabId;
      btn.classList.toggle("is-active", active);
      btn.classList.toggle("border-secondary", active);
      btn.classList.toggle("text-secondary", active);
      btn.classList.toggle("bg-secondary/15", active);
      btn.classList.toggle("border-stone-700", !active);
      btn.classList.toggle("text-stone-300", !active);
      btn.classList.toggle("bg-stone-900/50", !active);
    });
    document.querySelectorAll(".seo-panel").forEach(function (panel) {
      var id = panel.id || "";
      var show =
        (tabId === "meta" && id === "seo-panel-meta") ||
        (tabId === "pages" && id === "seo-panel-pages") ||
        (tabId === "crawl" && id === "seo-panel-crawl");
      panel.classList.toggle("hidden", !show);
    });
    if (tabId === "pages") renderPageList();
  }

  function bindFeatureTabs() {
    document.querySelectorAll("[data-seo-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchFeatureTab(btn.getAttribute("data-seo-tab") || "meta");
      });
    });
  }

  function openPageFromList(pageKey) {
    switchFeatureTab("meta");
    fillForm(pageKey);
    if ($("seo-page-select")) $("seo-page-select").value = pageKey;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadList() {
    return service.getAll().then(function (rows) {
      cachedRows = rows || [];
      populatePageSelect();
      renderChips();
      renderPageList();
      updateProgress();
      if (currentPageKey) fillForm(currentPageKey);
    });
  }

  function saveCurrentPage() {
    var pk = ($("seo-page-key") && $("seo-page-key").value) || currentPageKey;
    if (!pk) {
      toast("Pick a page first.", true);
      return;
    }
    var pageMeta = SITE_PAGES.find(function (p) {
      return p.pageKey === pk;
    });
    var slug = getSlugValue();
    var dupMsg = duplicateSlugMessage(slug, pk);
    if (dupMsg) {
      toast(dupMsg, true);
      return;
    }
    var dto = {
      pageName: ($("seo-page-name") && $("seo-page-name").value) || (pageMeta && pageMeta.pageName) || pk,
      pageKey: pk,
      slug: slug,
      metaTitle: ($("seo-meta-title") && $("seo-meta-title").value) || "",
      metaDescription: ($("seo-meta-description") && $("seo-meta-description").value) || "",
      metaKeywords: ($("seo-meta-keywords") && $("seo-meta-keywords").value) || "",
      canonicalUrl: ""
    };
    var editing = ($("seo-edit-slug") && $("seo-edit-slug").value.trim()) || "";
    var btn = $("seo-save-btn");
    if (btn) btn.disabled = true;

    service
      .save(dto)
      .then(function () {
        if (editing && editing !== dto.slug) return service.delete(editing);
      })
      .then(function () {
        return loadList();
      })
      .then(function () {
        toast("Saved! Title, description, keywords, and page link are live on your website.");
      })
      .catch(function (err) {
        if (err && err.validationErrors) toast(err.validationErrors.join(" "), true);
        else if (isPermissionError(err))
          toast("Firebase blocked this. Add pageSeo rules in Firestore → Rules, then Publish.", true);
        else toast((err && err.message) || "Save failed.", true);
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  }

  function initSeoAdmin(db) {
    buildSitePages();
    service = window.SHUDH_PAGE_SEO_SERVICE.createService(db);

    populatePageSelect();
    setEditorVisible(false);
    bindFeatureTabs();
    switchFeatureTab("meta");

    $("seo-page-list") &&
      $("seo-page-list").addEventListener("click", function (e) {
        var row = e.target.closest("[data-page-key]");
        if (!row) return;
        openPageFromList(row.getAttribute("data-page-key"));
      });

    $("seo-meta-title") && $("seo-meta-title").addEventListener("input", updateHints);
    $("seo-meta-description") && $("seo-meta-description").addEventListener("input", updateHints);
    $("seo-meta-keywords") &&
      $("seo-meta-keywords").addEventListener("input", updateHints);

    $("seo-meta-keywords") &&
      $("seo-meta-keywords").addEventListener("blur", function () {
        if (window.SHUDH_PAGE_SEO_VALIDATION && window.SHUDH_PAGE_SEO_VALIDATION.normalizeKeywords) {
          this.value = window.SHUDH_PAGE_SEO_VALIDATION.normalizeKeywords(this.value);
          updateHints();
        }
      });

    $("seo-slug-input") &&
      $("seo-slug-input").addEventListener("input", function () {
        updateGooglePreview();
        updateSlugHint();
      });

    $("seo-slug-input") &&
      $("seo-slug-input").addEventListener("blur", function () {
        if (currentPageKey === "index") return;
        this.value = slugifyInput(this.value) || currentPageKey || "";
        updateHints();
      });

    $("seo-slug-suggest") &&
      $("seo-slug-suggest").addEventListener("click", suggestSlugFromPage);

    $("seo-page-select") &&
      $("seo-page-select").addEventListener("change", function () {
        var pk = this.value;
        if (!pk) clearEditor();
        else fillForm(pk);
      });

    $("seo-save-btn") && $("seo-save-btn").addEventListener("click", saveCurrentPage);

    $("seo-prev-page") &&
      $("seo-prev-page").addEventListener("click", function () {
        navigatePage(-1);
      });

    $("seo-next-page") &&
      $("seo-next-page").addEventListener("click", function () {
        navigatePage(1);
      });

    $("seo-chips") &&
      $("seo-chips").addEventListener("click", function (e) {
        var chip = e.target.closest("[data-page-key]");
        if (!chip) return;
        fillForm(chip.getAttribute("data-page-key"));
      });

    $("seo-setup-all") &&
      $("seo-setup-all").addEventListener("click", function () {
        var btn = $("seo-setup-all");
        if (btn) btn.disabled = true;
        service
          .seedDefaults()
          .then(function () {
            toast("All pages set up. Titles and descriptions are live on the site.");
            if ($("seo-welcome")) $("seo-welcome").classList.add("hidden");
            return loadList();
          })
          .catch(function (err) {
            toast((err && err.message) || "Setup failed.", true);
          })
          .finally(function () {
            if (btn) btn.disabled = false;
          });
      });

    loadList().catch(function (err) {
      if (isPermissionError(err))
        toast("Cannot load SEO. Add pageSeo rules in Firebase Console → Firestore → Rules.", true);
      else toast((err && err.message) || "Could not load pages.", true);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var page = (window.location.pathname.split("/").pop() || "").toLowerCase();
    if (page !== "seo.html") return;
    var db = getDb();
    if (!db || typeof firebase === "undefined") return;
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) return;
      initSeoAdmin(db);
    });
  });
})();
