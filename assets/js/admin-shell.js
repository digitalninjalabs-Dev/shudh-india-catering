(function () {
  var _pageAtLoad = (window.location.pathname.split("/").pop() || "dashboard.html").toLowerCase();
  var _currentUser = null;
  var _shellReady = false;
  var _authReady = false;
  var _appRevealed = false;

  function isAdminAppPage() {
    return _pageAtLoad !== "login.html";
  }

  function initAdminBootPending() {
    if (!isAdminAppPage() || !document.documentElement) return;
    document.documentElement.classList.add("admin-boot-pending");
  }

  initAdminBootPending();

  /** Leads-only admin: limited sidebar (Dashboard, Leads, Settings). */
  var LEADS_ONLY_EMAIL = "leadsshudhindia@gmail.com";
  var LEADS_ONLY_HREFS = ["dashboard.html", "leads.html", "settings.html"];

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function isLeadsOnlyUser(user) {
    return normalizeEmail(user && user.email) === LEADS_ONLY_EMAIL;
  }

  function allNavItems() {
    return [
      { href: "dashboard.html", icon: "dashboard", label: "Dashboard" },
      { href: "packages.html", icon: "inventory_2", label: "Packages" },
      { href: "leads.html", icon: "contact_mail", label: "Leads / Inquiries" },
      { href: "gallery.html", icon: "photo_library", label: "Gallery" },
      { href: "blog.html", icon: "article", label: "Blog" },
      { href: "content.html", icon: "edit_document", label: "Content Manager" },
      { href: "seo.html", icon: "travel_explore", label: "SEO Manager" },
      { href: "settings.html", icon: "settings", label: "Settings" }
    ];
  }

  function getNavItems(user) {
    if (isLeadsOnlyUser(user)) {
      return allNavItems().filter(function (item) {
        return LEADS_ONLY_HREFS.indexOf(item.href) >= 0;
      });
    }
    return allNavItems();
  }

  function enforcePageAccess(user) {
    var page = pageName();
    if (page === "login.html") return;
    if (!user) return;
    if (isLeadsOnlyUser(user) && LEADS_ONLY_HREFS.indexOf(page) < 0) {
      window.location.replace("dashboard.html");
    }
  }

  function sidebarRoleLabel(user) {
    if (isLeadsOnlyUser(user)) return "Leads";
    return "Admin";
  }

  function userRoleLabel(user) {
    return sidebarRoleLabel(user);
  }

  function pageName() {
    return (window.location.pathname.split("/").pop() || "dashboard.html").toLowerCase();
  }

  function pageTitle(page) {
    var map = {
      "dashboard.html": "Dashboard",
      "leads.html": "Leads / Inquiries",
      "packages.html": "Packages",
      "gallery.html": "Gallery",
      "blog.html": "Blog Manager",
      "content.html": "Content Manager",
      "seo.html": "SEO Manager",
      "settings.html": "Settings"
    };
    return map[page] || "Admin";
  }

  function pageIcon(page) {
    var map = {
      "dashboard.html": "dashboard",
      "leads.html": "contact_mail",
      "packages.html": "inventory_2",
      "gallery.html": "photo_library",
      "blog.html": "article",
      "content.html": "edit_document",
      "seo.html": "travel_explore",
      "settings.html": "settings"
    };
    return map[page] || "space_dashboard";
  }

  function navItem(item, active) {
    var cls = active
      ? "admin-nav-link admin-nav-link--active flex items-center px-4 py-2.5 rounded-lg text-primary font-semibold border-r-4 border-primary bg-surface-container-high transition-colors duration-200"
      : "admin-nav-link flex items-center px-4 py-2.5 rounded-lg text-stone-500 hover:text-on-surface transition-colors duration-200 hover:bg-surface-container-high";
    return (
      '<a class="' +
      cls +
      '" href="' +
      item.href +
      '"><span class="material-symbols-outlined mr-3">' +
      item.icon +
      "</span>" +
      item.label +
      "</a>"
    );
  }

  function initials(text) {
    var val = String(text || "").trim();
    if (!val) return "A";
    var parts = val.split(/\s+/);
    return ((parts[0][0] || "") + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  function closeMobileNav() {
    var aside = document.getElementById("admin-shell-aside");
    var overlay = document.getElementById("admin-shell-overlay");
    if (aside) {
      aside.classList.add("-translate-x-full");
      aside.classList.remove("translate-x-0");
    }
    if (overlay) {
      overlay.classList.add("hidden");
      overlay.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("overflow-hidden");
  }

  function openMobileNav() {
    var aside = document.getElementById("admin-shell-aside");
    var overlay = document.getElementById("admin-shell-overlay");
    if (aside) {
      aside.classList.remove("-translate-x-full");
      aside.classList.add("translate-x-0");
    }
    if (overlay) {
      overlay.classList.remove("hidden");
      overlay.setAttribute("aria-hidden", "false");
    }
    if (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
      document.body.classList.add("overflow-hidden");
    }
  }

  function bindMobileNav() {
    var toggle = document.getElementById("admin-shell-nav-toggle");
    var overlay = document.getElementById("admin-shell-overlay");
    var aside = document.getElementById("admin-shell-aside");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = aside && aside.classList.contains("translate-x-0");
        if (open) closeMobileNav();
        else openMobileNav();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", closeMobileNav);
    }
    if (aside && !aside.dataset.navDelegationBound) {
      aside.dataset.navDelegationBound = "1";
      aside.addEventListener("click", function (e) {
        if (!e.target.closest("nav a")) return;
        if (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
          closeMobileNav();
        }
      });
    }
    window.addEventListener(
      "resize",
      function () {
        if (window.matchMedia && window.matchMedia("(min-width: 768px)").matches) {
          closeMobileNav();
          document.body.classList.remove("overflow-hidden");
        }
      },
      { passive: true }
    );
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var aside = document.getElementById("admin-shell-aside");
      if (aside && aside.classList.contains("translate-x-0")) closeMobileNav();
    });
  }

  function renderShell() {
    var page = pageName();
    if (page === "login.html") return;

    if (document.body) document.body.classList.add("shudh-admin-body");

    var items = getNavItems(_currentUser);

    var overlay = document.getElementById("admin-shell-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "admin-shell-overlay";
      document.body.insertBefore(overlay, document.body.firstChild);
    }
    overlay.className =
      "hidden md:hidden fixed inset-0 z-[45] bg-black/50 backdrop-blur-[2px]";
    overlay.setAttribute("aria-hidden", "true");

    var aside = document.querySelector("aside");
    if (!aside) {
      aside = document.createElement("aside");
      document.body.insertBefore(aside, overlay.nextSibling);
    }
    aside.id = "admin-shell-aside";
    aside.className =
      "bg-surface-container-low font-body tracking-tight h-screen w-[min(18rem,88vw)] max-w-[288px] md:w-64 md:max-w-none shrink-0 fixed left-0 top-0 flex flex-col py-4 md:py-5 pl-3 pr-4 md:pl-4 md:pr-4 z-[55] border-r border-stone-800/70 -translate-x-full md:translate-x-0 transition-transform duration-200 ease-out shadow-2xl md:shadow-none overflow-y-hidden";
    aside.innerHTML =
      '<div class="mb-5 md:mb-6 px-2 md:px-4"><h1 class="text-base md:text-lg font-bold tracking-tight text-primary leading-snug">Shudh India Catering</h1><p class="text-[10px] text-stone-500 mt-1 uppercase tracking-[0.2em]" data-admin-sidebar-role>' +
      sidebarRoleLabel(_currentUser) +
      "</p></div>" +
      '<nav class="flex-1 space-y-0.5">' +
      items
        .map(function (x) {
          return navItem(x, x.href === page);
        })
        .join("") +
      '</nav><button type="button" data-admin-profile-trigger class="mt-4 w-full text-left px-2 md:px-4 py-3 bg-surface-container-high rounded-2xl flex items-center gap-3 hover:bg-surface-container-highest transition-colors">' +
      '<div class="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-300 shrink-0" data-admin-user-avatar>A</div>' +
      '<div class="overflow-hidden min-w-0"><p class="text-xs font-bold text-on-surface truncate" data-admin-user-name>Admin User</p><p class="text-[10px] text-stone-500 truncate" data-admin-user-role>Authenticated</p></div></button>' +
      '<div class="mt-2 px-2 md:px-4"><a href="../index.html" class="flex items-center gap-2 text-stone-600 hover:text-stone-400 text-xs tracking-wider py-2"><span class="material-symbols-outlined text-sm">arrow_back</span>View Website</a></div>';

    var header = document.querySelector("header");
    if (!header) {
      header = document.createElement("header");
      document.body.insertBefore(header, aside.nextSibling);
    }
    header.className =
      "bg-surface-container-low/95 backdrop-blur-xl fixed top-0 left-0 md:left-64 right-0 w-full md:w-[calc(100%-16rem)] h-14 md:h-16 flex items-center justify-between gap-2 px-3 sm:px-6 md:pl-6 md:pr-8 z-40 shadow-sm font-body text-sm border-b border-stone-800/50";
    header.innerHTML =
      '<div class="flex items-center gap-2 min-w-0 flex-1">' +
      '<button type="button" id="admin-shell-nav-toggle" class="md:hidden shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-stone-200 hover:bg-stone-800/80 border border-stone-700/60" aria-label="Open menu"><span class="material-symbols-outlined">menu</span></button>' +
      '<span class="material-symbols-outlined text-primary text-[1.05rem] hidden sm:inline-flex" style="font-variation-settings:\'FILL\' 1">' + pageIcon(page) + "</span>" +
      '<p class="text-sm sm:text-base font-semibold text-stone-200 truncate" data-admin-page-title>' +
      pageTitle(page) +
      "</p></div>" +
      '<div class="flex items-center gap-2 sm:gap-3 shrink-0">' +
      '<button type="button" class="admin-top-icon-btn text-stone-400 hover:text-secondary transition-colors relative">' +
      '<span class="material-symbols-outlined" data-icon="notifications">notifications</span>' +
      '<span class="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-stone-900"></span>' +
      "</button>" +
      '<button type="button" class="admin-top-icon-btn hidden sm:inline-flex text-stone-400 hover:text-tertiary transition-colors">' +
      '<span class="material-symbols-outlined" data-icon="help">help</span></button>' +
      '<div class="hidden sm:block h-8 w-px bg-stone-800"></div>' +
      '<button type="button" data-admin-profile-trigger class="flex items-center gap-2 sm:gap-3 md:pl-4 hover:opacity-90 transition-opacity min-w-0"><div class="text-right hidden sm:block min-w-0"><p class="text-[10px] text-stone-500 truncate max-w-[8rem] md:max-w-none" data-admin-user-email>...</p></div>' +
      '<div class="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-300 shrink-0" data-admin-user-avatar-small>A</div></button></div>';

    document.querySelectorAll("body > div.ml-64").forEach(function (el) {
      el.classList.remove("ml-64");
    });

    var main = document.querySelector("main");
    if (main) {
      main.classList.remove("ml-64");
      if (!main.classList.contains("md:ml-64")) main.classList.add("md:ml-64");
      if (!main.classList.contains("ml-0")) main.classList.add("ml-0");
      /* w-full + md:ml-64 alone overflows (100% width + sidebar margin). Pin width beside the drawer. */
      if (!main.classList.contains("w-full")) main.classList.add("w-full");
      if (!main.classList.contains("md:w-[calc(100%-16rem)]"))
        main.classList.add("md:w-[calc(100%-16rem)]");
      if (!main.classList.contains("max-w-full")) main.classList.add("max-w-full", "min-w-0", "overflow-x-hidden", "box-border");
      var hasTopOffset =
        main.classList.contains("mt-16") ||
        main.classList.contains("mt-14") ||
        main.classList.contains("pt-16") ||
        main.classList.contains("pt-24") ||
        main.classList.contains("pt-20") ||
        main.classList.contains("pt-28");
      if (!hasTopOffset) {
        main.classList.add("mt-14", "md:mt-16");
      }
    }

    bindMobileNav();
  }

  function ensureBootLoader() {
    if (document.getElementById("admin-boot-loader")) return;
    var el = document.createElement("div");
    el.id = "admin-boot-loader";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-busy", "true");
    el.innerHTML =
      '<div class="admin-boot-loader__card">' +
      '<div class="admin-boot-loader__spin" aria-hidden="true"></div>' +
      '<p class="admin-boot-loader__title">Loading admin</p>' +
      '<p class="admin-boot-loader__sub">Preparing your menu…</p>' +
      "</div>";
    if (document.body) document.body.appendChild(el);
    el.classList.add("is-active");
  }

  function showBootLoader() {
    if (!isAdminAppPage()) return;
    ensureBootLoader();
  }

  function hideBootLoader(done) {
    var el = document.getElementById("admin-boot-loader");
    if (!el) {
      if (done) done();
      return;
    }
    el.classList.add("is-hiding");
    el.classList.remove("is-active");
    el.setAttribute("aria-busy", "false");
    window.setTimeout(function () {
      el.classList.remove("is-hiding");
      el.style.display = "none";
      if (done) done();
    }, 380);
  }

  function revealAdminApp() {
    if (_appRevealed || !isAdminAppPage()) return;
    _appRevealed = true;
    hideBootLoader(function () {
      document.documentElement.classList.remove("admin-boot-pending");
      if (document.body) {
        document.body.classList.add("admin-shell-ready");
        document.body.style.removeProperty("visibility");
        document.body.style.removeProperty("opacity");
      }
    });
  }

  function tryRevealAdminApp() {
    if (_appRevealed || !isAdminAppPage()) return;
    if (!_shellReady || !_authReady) return;
    revealAdminApp();
  }

  function markShellReady() {
    _shellReady = true;
    tryRevealAdminApp();
  }

  function markAuthReady() {
    _authReady = true;
    tryRevealAdminApp();
  }

  function ensureGlobalLoader() {
    if (window.SHUDH_LOADER) return;
    var loader = document.createElement("div");
    loader.id = "shudh-global-loader";
    loader.className = "hidden fixed inset-0 z-[130] items-center justify-center";
    loader.innerHTML =
      '<div class="rounded-2xl px-6 py-5 flex items-center gap-3">' +
      '<div class="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>' +
      '<p class="text-sm text-on-surface" data-loader-text>Processing...</p>' +
      "</div>";
    document.body.appendChild(loader);

    var activeCount = 0;
    var textEl = loader.querySelector("[data-loader-text]");
    window.SHUDH_LOADER = {
      show: function (text) {
        activeCount += 1;
        if (textEl) textEl.textContent = text || "Processing...";
        loader.classList.remove("hidden");
        loader.classList.add("flex");
      },
      hide: function () {
        activeCount = Math.max(0, activeCount - 1);
        if (activeCount === 0) {
          loader.classList.add("hidden");
          loader.classList.remove("flex");
        }
      }
    };
  }

  function ensureProfileModal() {
    if (document.getElementById("admin-profile-modal")) return;
    var modal = document.createElement("div");
    modal.id = "admin-profile-modal";
    modal.className =
      "hidden fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm items-center justify-center p-4";
    modal.innerHTML =
      '<div class="w-full max-w-md bg-surface-container-high rounded-2xl border border-stone-700 shadow-2xl overflow-hidden">' +
      '<div class="px-6 py-4 border-b border-stone-800 flex items-center justify-between">' +
      '<h3 class="text-lg font-bold text-on-surface">Admin Profile</h3>' +
      '<button type="button" data-profile-close class="text-stone-500 hover:text-white"><span class="material-symbols-outlined">close</span></button></div>' +
      '<div class="p-6 space-y-5">' +
      '<div><label class="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Email</label>' +
      '<input id="admin-profile-email" readonly class="w-full bg-stone-900 border-none rounded-xl px-4 py-3 text-sm text-stone-400" /></div>' +
      '<div><label class="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-2">Name</label>' +
      '<input id="admin-profile-name" class="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-secondary/40" placeholder="Enter display name"/></div>' +
      '<p id="admin-profile-msg" class="text-xs text-stone-500 min-h-[16px]"></p>' +
      '<div class="flex gap-3 pt-2">' +
      '<button type="button" id="admin-profile-save" class="flex-1 px-4 py-3 rounded-xl bg-secondary text-on-secondary text-sm font-bold hover:opacity-90">Save Name</button>' +
      '<button type="button" id="admin-profile-signout" class="flex-1 px-4 py-3 rounded-xl border border-red-900/40 text-red-400 text-sm font-bold hover:bg-red-900/20">Sign out</button>' +
      "</div></div></div>";
    document.body.appendChild(modal);

    function closeModal() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
    function openModal() {
      var emailEl = document.getElementById("admin-profile-email");
      var nameEl = document.getElementById("admin-profile-name");
      var msgEl = document.getElementById("admin-profile-msg");
      if (emailEl) emailEl.value = _currentUser && _currentUser.email ? _currentUser.email : "";
      if (nameEl) {
        nameEl.readOnly = false;
        nameEl.classList.remove("opacity-70");
      }
      if (nameEl) {
        nameEl.value =
          (_currentUser && (_currentUser.displayName || _currentUser.email || "")) || "";
      }
      if (msgEl) msgEl.textContent = "";
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    modal.querySelectorAll("[data-profile-close]").forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-admin-profile-trigger]");
      if (!btn) return;
      openModal();
    });

    var saveBtn = document.getElementById("admin-profile-save");
    var signOutBtn = document.getElementById("admin-profile-signout");
    var nameInput = document.getElementById("admin-profile-name");
    var msg = document.getElementById("admin-profile-msg");

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        if (!_currentUser || !nameInput) return;
        var nextName = nameInput.value.trim();
        if (!nextName) {
          if (msg) msg.textContent = "Name cannot be empty.";
          return;
        }
        if (window.SHUDH_LOADER) window.SHUDH_LOADER.show("Saving profile...");
        _currentUser
          .updateProfile({ displayName: nextName })
          .then(function () {
            if (msg) msg.textContent = "Name updated.";
            document.querySelectorAll("[data-admin-user-name]").forEach(function (el) {
              el.textContent = nextName;
            });
            document
              .querySelectorAll("[data-admin-user-avatar], [data-admin-user-avatar-small]")
              .forEach(function (el) {
                el.textContent = initials(nextName);
              });
            closeModal();
          })
          .catch(function () {
            if (msg) msg.textContent = "Could not update name. Try again.";
          })
          .finally(function () {
            if (window.SHUDH_LOADER) window.SHUDH_LOADER.hide();
          });
      });
    }

    if (signOutBtn) {
      signOutBtn.addEventListener("click", function () {
        if (typeof firebase === "undefined") return;
        if (window.SHUDH_LOADER) window.SHUDH_LOADER.show("Signing out...");
        firebase
          .auth()
          .signOut()
          .then(function () {
            window.location.replace("login.html");
          })
          .finally(function () {
            if (window.SHUDH_LOADER) window.SHUDH_LOADER.hide();
          });
      });
    }
  }

  function refreshNavForUser(user) {
    var aside = document.getElementById("admin-shell-aside");
    var nav = aside && aside.querySelector("nav");
    if (!nav) return;
    var page = pageName();
    var items = getNavItems(user);
    nav.innerHTML = items
      .map(function (x) {
        return navItem(x, x.href === page);
      })
      .join("");
  }

  function applyUserToShell(user) {
    if (!user) return;
    _currentUser = user;
    enforcePageAccess(user);
    refreshNavForUser(user);
    var name = (user.displayName || user.email || "Admin").trim();
    var mail = (user.email || "Authenticated").trim();
    var role = userRoleLabel(user);
    document.querySelectorAll("[data-admin-user-name]").forEach(function (el) {
      el.textContent = name;
    });
    document.querySelectorAll("[data-admin-user-email]").forEach(function (el) {
      el.textContent = mail;
    });
    document.querySelectorAll("[data-admin-user-role]").forEach(function (el) {
      el.textContent = role;
    });
    document.querySelectorAll("[data-admin-sidebar-role]").forEach(function (el) {
      el.textContent = role;
    });
    document.querySelectorAll("[data-admin-user-avatar], [data-admin-user-avatar-small]").forEach(function (el) {
      el.textContent = initials(name);
    });
  }

  function bindUser() {
    if (typeof firebase === "undefined" || !window.SHUDH_CONFIG || !window.SHUDH_CONFIG.firebase) {
      markAuthReady();
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);
    var authHandled = false;
    firebase.auth().onAuthStateChanged(function (user) {
      if (!isAdminAppPage()) return;
      if (user) applyUserToShell(user);
      if (!authHandled) {
        authHandled = true;
        markAuthReady();
      }
    });
  }

  if (isAdminAppPage()) {
    window.setTimeout(function () {
      if (!_appRevealed) {
        markAuthReady();
        markShellReady();
      }
    }, 3500);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!isAdminAppPage()) return;

    showBootLoader();

    if (typeof firebase !== "undefined" && window.SHUDH_CONFIG && window.SHUDH_CONFIG.firebase) {
      if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);
      if (firebase.auth().currentUser) _currentUser = firebase.auth().currentUser;
    }

    renderShell();
    ensureGlobalLoader();
    ensureProfileModal();

    if (_currentUser) applyUserToShell(_currentUser);

    bindUser();
    markShellReady();
  });
})();
