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
    var titleHint = $("seo-title-hint");
    var descHint = $("seo-desc-hint");
    if (titleHint) {
      titleHint.textContent = titleLen + " / 60";
      titleHint.className = "text-xs font-normal " + hintClass(titleLen, 50, 60);
    }
    if (descHint) {
      descHint.textContent = descLen + " / 160";
      descHint.className = "text-xs font-normal " + hintClass(descLen, 140, 160);
    }
    updateGooglePreview();
  }

  function updateGooglePreview() {
    var slug = ($("seo-slug") && $("seo-slug").value) || "index";
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
    if ($("seo-slug")) $("seo-slug").value = "";
    if ($("seo-page-name")) $("seo-page-name").value = "";
    if ($("seo-meta-title")) $("seo-meta-title").value = "";
    if ($("seo-meta-description")) $("seo-meta-description").value = "";
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
    if ($("seo-slug")) $("seo-slug").value = data.slug || fb.slug;
    if ($("seo-page-name")) $("seo-page-name").value = data.pageName || fb.pageName;
    if ($("seo-meta-title")) $("seo-meta-title").value = data.metaTitle || "";
    if ($("seo-meta-description")) $("seo-meta-description").value = data.metaDescription || "";

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
    var dto = {
      pageName: ($("seo-page-name") && $("seo-page-name").value) || (pageMeta && pageMeta.pageName) || pk,
      pageKey: pk,
      slug: ($("seo-slug") && $("seo-slug").value) || (pageMeta && pageMeta.slug) || pk,
      metaTitle: ($("seo-meta-title") && $("seo-meta-title").value) || "",
      metaDescription: ($("seo-meta-description") && $("seo-meta-description").value) || "",
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
        toast("Saved! Google title and description are live on your website now.");
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
