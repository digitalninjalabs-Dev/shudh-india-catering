(function () {
  function getDb() {
    if (!window.SHUDH_CONFIG || !window.SHUDH_CONFIG.firebase) return null;
    if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);
    return firebase.firestore();
  }

  function currentPageName() {
    return (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  }

  function ensureGlobalLoader() {
    if (window.SHUDH_LOADER) return;
    var loader = document.getElementById("shudh-global-loader");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "shudh-global-loader";
      loader.className = "shudh-loader-overlay";
      loader.innerHTML =
        '<div class="shudh-loader-card">' +
        '<div class="shudh-loader-logo-wrap">' +
        '<img class="shudh-loader-logo" src="../assets/logo/logonew.png" alt="Shudh India" />' +
        "</div>" +
        '<p class="shudh-loader-brand">Shudh India</p>' +
        '<p class="shudh-loader-text"><span data-loader-text>Preparing your experience</span><span class="shudh-loader-dots" aria-hidden="true"><span></span><span></span><span></span></span></p>' +
        "</div>";
      document.body.appendChild(loader);
    }

    var textEl = loader.querySelector("[data-loader-text]");
    var activeCount = loader.classList.contains("is-visible") ? 1 : 0;
    var shownAt = activeCount ? Date.now() : 0;
    var minVisibleMs = 520;
    var hideTimer = null;

    function clearHideTimer() {
      if (!hideTimer) return;
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    function hideNow() {
      if (activeCount > 0) return;
      loader.classList.remove("is-visible");
      document.documentElement.classList.remove("shudh-boot-pending");
      document.dispatchEvent(new Event("shudh:loader-hidden"));
    }

    window.SHUDH_LOADER = {
      show: function (text) {
        activeCount += 1;
        clearHideTimer();
        if (!loader.classList.contains("is-visible")) {
          shownAt = Date.now();
        }
        if (textEl) textEl.textContent = text || "Preparing your experience";
        loader.classList.add("is-visible");
      },
      hide: function () {
        activeCount = Math.max(0, activeCount - 1);
        if (activeCount > 0) return;
        var elapsed = Date.now() - shownAt;
        var waitMs = Math.max(0, minVisibleMs - elapsed);
        clearHideTimer();
        hideTimer = setTimeout(hideNow, waitMs);
      }
    };
  }

  function showLoader(text) {
    if (window.SHUDH_LOADER && typeof window.SHUDH_LOADER.show === "function") {
      window.SHUDH_LOADER.show(text || "Processing...");
    }
  }

  function hideLoader() {
    if (window.SHUDH_LOADER && typeof window.SHUDH_LOADER.hide === "function") {
      window.SHUDH_LOADER.hide();
    }
  }

  function startPageBootLoader() {
    ensureGlobalLoader();
    if (window.SHUDH_BOOT_LOADER_SHOWN) return;
    window.SHUDH_BOOT_LOADER_SHOWN = true;
    var el = document.getElementById("shudh-global-loader");
    if (!el || !el.classList.contains("is-visible")) {
      showLoader("Preparing your experience");
    }
  }

  function setBodyScrollLocked(locked) {
    document.body.style.overflow = locked ? "hidden" : "";
  }

  function initImageSkeletons() {
    var images = Array.prototype.slice.call(
      document.querySelectorAll("img:not(.site-logo__image):not(.shudh-loader-logo):not(.footer-brand__image)")
    );
    if (!images.length) return;
    images.forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) return;
      img.classList.add("shudh-image-skeleton");
      img.addEventListener(
        "load",
        function () {
          img.classList.remove("shudh-image-skeleton");
        },
        { once: true }
      );
      img.addEventListener(
        "error",
        function () {
          img.classList.remove("shudh-image-skeleton");
        },
        { once: true }
      );
    });
  }

  function initHomeExperienceCounters() {
    var section = document.getElementById("home-experience-counters");
    if (!section) return;
    var counters = Array.prototype.slice.call(section.querySelectorAll(".shudh-counter-value"));
    if (!counters.length) return;

    var done = false;
    function formatValue(num, suffix) {
      var n = Math.max(0, Math.round(Number(num) || 0));
      return String(n) + String(suffix || "");
    }

    function runCounters() {
      if (done) return;
      done = true;
      counters.forEach(function (el) {
        var target = Number(el.getAttribute("data-counter-target") || 0);
        var suffix = String(el.getAttribute("data-counter-suffix") || "");
        var start = performance.now();
        var duration = 1400;
        function tick(now) {
          var p = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          var current = target * eased;
          el.textContent = formatValue(current, suffix);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    if (!("IntersectionObserver" in window)) {
      runCounters();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounters();
          io.disconnect();
        });
      },
      { threshold: 0.35 }
    );
    io.observe(section);
  }

  function initHomepageStatCounters() {
    var pageName = currentPageName();
    if (!(pageName === "index.html" || pageName === "")) return;

    var targets = Array.prototype.slice.call(
      document.querySelectorAll(".home-hero-stat__number, .stat-number")
    );
    if (!targets.length) return;

    function parseSpec(text) {
      var raw = String(text || "").trim();
      var m = raw.match(/^(\d[\d,]*(?:\.\d+)?)(.*)$/);
      if (!m) return null;
      var value = Number(String(m[1] || "").replace(/,/g, ""));
      if (Number.isNaN(value)) return null;
      var decimals = (m[1].split(".")[1] || "").length;
      return {
        target: value,
        suffix: m[2] || "",
        decimals: decimals
      };
    }

    function formatValue(value, spec) {
      var numText = spec.decimals > 0
        ? value.toFixed(spec.decimals)
        : String(Math.round(value));
      return numText + spec.suffix;
    }

    function animateCounter(el, spec, delayMs) {
      var startAt = performance.now() + delayMs;
      var duration = 2600;
      function tick(now) {
        if (now < startAt) {
          requestAnimationFrame(tick);
          return;
        }
        var p = Math.min(1, (now - startAt) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = formatValue(spec.target * eased, spec);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    var hasRun = false;
    function runCounters() {
      if (hasRun) return;
      hasRun = true;
      targets.forEach(function (el, idx) {
        var spec = parseSpec(el.textContent);
        if (!spec) return;
        el.textContent = formatValue(0, spec);
        animateCounter(el, spec, idx * 180);
      });
    }

    function isLoaderVisible() {
      var loaderEl = document.getElementById("shudh-global-loader");
      return !!(loaderEl && loaderEl.classList.contains("is-visible"));
    }

    function tryStartCounters() {
      if (hasRun) return;
      var waitingForContent = window.SHUDH_CONTENT_READY === false;
      if (waitingForContent) return;
      if (isLoaderVisible()) return;
      window.setTimeout(runCounters, 220);
    }

    document.addEventListener("shudh:content-loaded", tryStartCounters);
    document.addEventListener("shudh:loader-hidden", tryStartCounters);
    window.addEventListener("load", tryStartCounters);
    window.setTimeout(tryStartCounters, 350);
    window.setTimeout(tryStartCounters, 1400);
  }

  function initHomepageMotion() {
    var targets = Array.prototype.slice.call(
      document.querySelectorAll(
        "main > section, body > section, body > footer, .page-hero, .card, .shudh-hover-lift"
      )
    );
    if (!targets.length) return;

    function isLoaderVisible() {
      var loaderEl = document.getElementById("shudh-global-loader");
      return !!(loaderEl && loaderEl.classList.contains("is-visible"));
    }

    function initGsapMotion() {
      if (!(window.gsap && window.ScrollTrigger)) return false;
      window.gsap.registerPlugin(window.ScrollTrigger);

      // Staggered reveal with slightly stronger movement for visible smoothness.
      window.gsap.set(targets, { opacity: 0, y: 42, willChange: "transform, opacity" });
      window.ScrollTrigger.batch(targets, {
        start: "top 90%",
        end: "bottom 18%",
        once: true,
        onEnter: function (batch) {
          window.gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 1.05,
            ease: "power3.out",
            stagger: 0.14,
            clearProps: "willChange"
          });
        }
      });

      // Subtle parallax on key homepage imagery without changing design.
      var parallaxEls = Array.prototype.slice.call(
        document.querySelectorAll(
          ".home-hero-image, .home-signature-flow__feature-media img, .home-visual-media img, .contact-panel__visual img, .home-closing-signature__media img, .home-gallery-grid img, .page-hero + section img, .section-inner img, .video-card img"
        )
      );
      parallaxEls.forEach(function (el) {
        window.gsap.fromTo(
          el,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.4
            }
          }
        );
      });
      return true;
    }

    function startMotionWhenReady() {
      var waitingForContent = window.SHUDH_CONTENT_READY === false;
      if (waitingForContent || isLoaderVisible()) return;
      document.removeEventListener("shudh:content-loaded", startMotionWhenReady);
      document.removeEventListener("shudh:loader-hidden", startMotionWhenReady);
      if (initGsapMotion()) return;

      // Fallback (no GSAP): keep prior reveal behavior.
      targets.forEach(function (el, idx) {
        if (!el.classList.contains("shudh-reveal")) el.classList.add("shudh-reveal");
        var delay = Math.min(380, (idx % 8) * 55);
        el.style.transitionDelay = String(delay) + "ms";
      });

      if (!("IntersectionObserver" in window)) {
        targets.forEach(function (el) {
          el.classList.add("is-visible");
        });
        return;
      }

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      targets.forEach(function (el) {
        io.observe(el);
      });
    }

    document.addEventListener("shudh:content-loaded", startMotionWhenReady);
    document.addEventListener("shudh:loader-hidden", startMotionWhenReady);
    window.addEventListener("load", startMotionWhenReady);
    window.setTimeout(startMotionWhenReady, 450);
    window.setTimeout(startMotionWhenReady, 1450);
    return;

    targets.forEach(function (el, idx) {
      if (!el.classList.contains("shudh-reveal")) el.classList.add("shudh-reveal");
      var delay = Math.min(380, (idx % 8) * 55);
      el.style.transitionDelay = String(delay) + "ms";
    });

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  function initials(name) {
    if (!name || !name.trim()) return "?";
    var p = name.trim().split(/\s+/);
    return ((p[0][0] || "") + (p[1] ? p[1][0] : "")).toUpperCase();
  }

  function statusBadge(status) {
    var s = (status || "New").toLowerCase();
    if (s === "contacted") {
      return "bg-orange-900/20 text-orange-400 border border-orange-900/30";
    }
    if (s === "converted") {
      return "bg-emerald-900/20 text-emerald-400 border border-emerald-900/30";
    }
    return "bg-blue-900/20 text-blue-400 border border-blue-900/30";
  }

  function ensureFormToast() {
    var root = document.getElementById("shudh-form-toast");
    if (root) return root;
    root = document.createElement("div");
    root.id = "shudh-form-toast";
    root.className = "shudh-form-toast";
    document.body.appendChild(root);
    return root;
  }

  function showFormToast(kind, text) {
    var root = ensureFormToast();
    if (!root) return;
    root.className = "shudh-form-toast is-visible " + (kind === "error" ? "is-error" : "is-success");
    root.textContent = String(text || "");
    window.clearTimeout(root._timer);
    root._timer = window.setTimeout(function () {
      root.className = "shudh-form-toast";
    }, 3200);
  }

  function bindInquiryForms(db) {
    document.querySelectorAll("form.shudh-inquiry-form").forEach(function (form) {
      var fields = Array.prototype.slice.call(
        form.querySelectorAll('[name="name"],[name="phone"],[name="eventType"],[name="guestCount"],[name="date"],[name="location"],[name="requirements"]')
      );
      function clearFieldStates() {
        fields.forEach(function (f) {
          f.classList.remove("shudh-input-error");
        });
      }
      function markFieldError(name) {
        form.querySelectorAll('[name="' + name + '"]').forEach(function (f) {
          f.classList.add("shudh-input-error");
        });
      }
      function getNamedValue(name) {
        var checkedRadio = form.querySelector('[name="' + name + '"]:checked');
        if (checkedRadio) return String(checkedRadio.value || "").trim();
        var first = form.querySelector('[name="' + name + '"]');
        if (!first) return "";
        if (first.tagName === "SELECT") {
          var val = String(first.value || "").trim();
          if (val) return val;
          var opt = first.options[first.selectedIndex];
          return opt ? String(opt.textContent || "").trim() : "";
        }
        return String(first.value || "").trim();
      }
      function parseGuestCount(raw) {
        var text = String(raw || "").trim();
        if (!text) return 0;
        var num = Number(text);
        if (!Number.isNaN(num)) return num;
        var parts = text.match(/\d+/g);
        if (!parts || !parts.length) return 0;
        if (parts.length === 1) return Number(parts[0]) || 0;
        return Math.round((Number(parts[0]) + Number(parts[1])) / 2);
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = form.querySelector("[data-form-msg]");
        clearFieldStates();
        if (msg) msg.textContent = "";
        var get = function (sel) {
          var el = form.querySelector(sel);
          return el ? el.value.trim() : "";
        };
        var name = get('[name="name"]');
        var phone = get('[name="phone"]');
        var eventType = getNamedValue("eventType");
        var guestCountRaw = getNamedValue("guestCount");
        if (!eventType || /^select an event$/i.test(eventType)) {
          markFieldError("eventType");
          if (msg) msg.textContent = "Please choose an event type.";
          showFormToast("error", "Please choose an event type.");
          return;
        }
        var payload = {
          name: name,
          phone: phone,
          eventType: eventType || "General",
          guestCount: parseGuestCount(guestCountRaw),
          date: get('[name="date"]'),
          location: get('[name="location"]'),
          requirements: get('[name="requirements"]'),
          status: "New",
          createdAt: new Date().toISOString(),
          source: form.getAttribute("data-source") || "website"
        };
        if (!payload.name || !payload.phone) {
          if (!payload.name) markFieldError("name");
          if (!payload.phone) markFieldError("phone");
          if (msg) msg.textContent = "Please enter name and phone.";
          showFormToast("error", "Please enter name and phone.");
          return;
        }
        if (!/^[+0-9\s\-()]{8,}$/.test(payload.phone)) {
          markFieldError("phone");
          if (msg) msg.textContent = "Please enter a valid phone number.";
          showFormToast("error", "Please enter a valid phone number.");
          return;
        }
        if (!db) {
          if (msg) msg.textContent = "Configuration error: Firebase not loaded.";
          showFormToast("error", "Configuration error: Firebase not loaded.");
          return;
        }
        showLoader("Submitting inquiry...");
        db.collection("inquiries")
          .add(payload)
          .then(function () {
            form.reset();
            if (msg) msg.textContent = "Thank you. Our team will contact you shortly.";
            showFormToast("success", "Inquiry submitted successfully.");
          })
          .catch(function () {
            if (msg) msg.textContent = "Could not submit. Please try again or call us.";
            showFormToast("error", "Submission failed. Please try again.");
          })
          .finally(function () {
            hideLoader();
          });
      });
    });
  }

  function highlightList(highlights) {
    if (!highlights || !highlights.length) return "";
    return highlights
      .map(function (h) {
        return (
          '<li class="flex items-center gap-3 text-on-surface/90">' +
          '<span class="material-symbols-outlined text-secondary text-sm">check_circle</span>' +
          "<span>" +
          String(h).replace(/</g, "&lt;") +
          "</span></li>"
        );
      })
      .join("");
  }

  function renderPackageCard(pkg, isGold) {
    var name = pkg.name || "Package";
    var desc = pkg.description || pkg.tagline || "";
    var best = pkg.suitability || pkg.bestFor || "";
    var showPrice = pkg.showPrice !== false;
    var price = showPrice && pkg.startingPrice ? "<p class=\"text-secondary text-sm mb-4\">" + String(pkg.startingPrice).replace(/</g, "&lt;") + "</p>" : "";
    var ul = highlightList(pkg.highlights || []);
    var base =
      "group relative rounded-xl p-6 sm:p-8 md:p-10 min-w-0 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(18,13,13,0.3)]";
    var shell = isGold
      ? base +
        " bg-primary-container ring-1 ring-secondary/50 shadow-[0_30px_60px_rgba(42,10,10,0.5)] z-20 md:scale-105 md:-my-3"
      : base + " bg-surface-container-low";

    return (
      '<div class="' +
      shell +
      '">' +
      (pkg.badge
        ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-6 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg">' +
          String(pkg.badge).replace(/</g, "&lt;") +
          "</div>"
        : "") +
      '<div class="relative z-10">' +
      '<h3 class="text-3xl font-headline font-bold ' +
      (isGold ? "text-secondary" : "text-on-surface") +
      ' mb-2">' +
      name.replace(/</g, "&lt;") +
      "</h3>" +
      price +
      (desc ? '<p class="text-on-surface-variant mb-6 font-light">' + desc.replace(/</g, "&lt;") + "</p>" : "") +
      '<ul class="space-y-4 mb-8">' +
      ul +
      "</ul>" +
      (best
        ? '<div class="p-4 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10 mb-4"><span class="text-xs uppercase tracking-widest text-secondary block mb-1">Best For</span><span class="text-on-surface font-medium">' +
          best.replace(/</g, "&lt;") +
          "</span></div>"
        : "") +
      "</div>" +
      '<a href="inquiry.html" class="relative z-10 w-full py-4 rounded-xl border border-secondary/35 text-secondary font-semibold hover:bg-secondary/10 hover:border-secondary hover:text-secondary transition-all duration-300 text-center block">Get Custom Quote</a>' +
      "</div>"
    );
  }

  function loadPackages(db) {
    var root = document.getElementById("shudh-packages-root");
    var staticSection = document.getElementById("shudh-packages-static");
    if (!root || !db) return Promise.resolve();
    showLoader("Loading packages...");
    return db.collection("packages")
      .get()
      .then(function (snap) {
        if (snap.empty) {
          if (staticSection) staticSection.classList.remove("hidden");
          root.classList.add("hidden");
          root.style.display = "none";
          return;
        }
        var items = snap.docs.map(function (d) {
          var x = d.data();
          x._id = d.id;
          return x;
        }).filter(function (p) {
          return p.visible !== false;
        });
        items.sort(function (a, b) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        });
        var html = "";
        items.forEach(function (pkg, i) {
          var gold = !!(pkg.popular || (pkg.badge && String(pkg.badge).toLowerCase().indexOf("popular") >= 0) || i === 1);
          html += renderPackageCard(pkg, gold);
        });
        root.innerHTML = html;
        root.classList.remove("shudh-grid-auto");
        root.classList.add("packages-grid");
        root.classList.remove("hidden");
        if (staticSection) staticSection.classList.add("hidden");
      })
      .catch(function () {})
      .finally(function () {
        hideLoader();
      });
  }

  function sortBlogPosts(a, b) {
    var ao = Number(a.sortOrder || 9999);
    var bo = Number(b.sortOrder || 9999);
    if (ao !== bo) return ao - bo;
    var at = new Date(a.createdAt || 0).getTime() || 0;
    var bt = new Date(b.createdAt || 0).getTime() || 0;
    return bt - at;
  }

  function formatBlogDate(iso) {
    var t = new Date(iso || "");
    if (isNaN(t.getTime())) return "";
    return t.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function loadBlogList(db) {
    if (currentPageName() !== "blog.html") return Promise.resolve();
    var root = document.getElementById("blog-posts-grid");
    if (!root || !db) return Promise.resolve();
    return db.collection("blogs")
      .get()
      .then(function (snap) {
        var posts = snap.docs.map(function (d) {
          var item = d.data() || {};
          item.id = d.id;
          return item;
        }).filter(function (x) {
          return x.visible !== false;
        });
        posts.sort(sortBlogPosts);
        if (!posts.length) {
          root.innerHTML = '<article class="card" style="padding:1.1rem;background:var(--color-surface-container-low)"><h3 style="margin:0 0 .35rem;font-family:var(--font-headline)">Blog posts coming soon</h3><p style="margin:0;color:var(--color-on-surface-variant)">No posts are published yet. Please check back shortly.</p></article>';
          return;
        }
        root.innerHTML = posts.map(function (post, idx) {
          var cover = String(post.coverImage || "").trim();
          var category = escapeHtml(post.category || "Journal");
          var title = escapeHtml(post.title || "Untitled");
          var excerpt = escapeHtml(post.excerpt || "");
          var date = formatBlogDate(post.createdAt);
          var isEven = idx % 2 === 0;
          var shellBg = isEven ? "var(--color-surface-container-low)" : "var(--color-surface-container)";
          var accent = isEven ? "var(--color-primary)" : "var(--color-tertiary)";
          var textColOrder = isEven ? "1" : "2";
          var mediaColOrder = isEven ? "2" : "1";
          return (
            '<article class="card" style="padding:1rem;display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));align-items:center;background:' + shellBg + '">' +
            '<div style="order:' + textColOrder + '">' +
            '<p style="font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;font-weight:700;color:' + accent + ';margin-bottom:.45rem">' + category + "</p>" +
            '<h2 style="font-family:var(--font-headline);font-size:clamp(1.45rem,3vw,2.2rem);font-weight:800;line-height:1.2;margin:0 0 .7rem">' + title + "</h2>" +
            (date ? '<p style="margin:0 0 .45rem;color:var(--color-on-surface-variant);font-size:.86rem">' + escapeHtml(date) + "</p>" : "") +
            '<p style="margin:0;color:var(--color-on-surface-variant);line-height:1.75">' + excerpt + "</p>" +
            '<a href="blog-post.html?id=' + encodeURIComponent(post.id) + '" class="btn btn-secondary" style="margin-top:.9rem;display:inline-flex">Read More</a>' +
            "</div>" +
            '<div style="order:' + mediaColOrder + ';border-radius:1rem;overflow:hidden">' +
            (cover
              ? '<img src="' + cover.replace(/"/g, "&quot;") + '" alt="' + title + '" style="width:100%;height:100%;object-fit:cover;min-height:240px"/>'
              : '<div style="min-height:240px;background:var(--color-surface-container);display:flex;align-items:center;justify-content:center;color:var(--color-on-surface-variant)">No image</div>') +
            "</div></article>"
          );
        }).join("");
      })
      .catch(function () {});
  }

  function loadBlogPost(db) {
    if (currentPageName() !== "blog-post.html") return Promise.resolve();
    var titleEl = document.getElementById("blog-post-title");
    var categoryEl = document.getElementById("blog-post-category");
    var dateEl = document.getElementById("blog-post-date");
    var imageEl = document.getElementById("blog-post-image");
    var contentEl = document.getElementById("blog-post-content");
    if (!titleEl || !contentEl || !db) return Promise.resolve();
    var id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
      titleEl.textContent = "Post not found";
      contentEl.innerHTML = "<p>The blog link is invalid.</p>";
      return Promise.resolve();
    }
    return db.collection("blogs")
      .doc(id)
      .get()
      .then(function (doc) {
        if (!doc.exists) {
          titleEl.textContent = "Post not found";
          contentEl.innerHTML = "<p>This blog post does not exist or has been removed.</p>";
          return;
        }
        var post = doc.data() || {};
        if (post.visible === false) {
          titleEl.textContent = "Post not available";
          contentEl.innerHTML = "<p>This blog post is currently unpublished.</p>";
          return;
        }
        titleEl.textContent = String(post.title || "Untitled");
        if (categoryEl) categoryEl.textContent = String(post.category || "Journal");
        if (dateEl) dateEl.textContent = formatBlogDate(post.createdAt || post.updatedAt);
        if (imageEl && post.coverImage) imageEl.src = String(post.coverImage);
        if (contentEl) {
          contentEl.innerHTML = String(post.content || "")
            .split(/\n{2,}/)
            .map(function (block) {
              return "<p>" + escapeHtml(block).replace(/\n/g, "<br/>") + "</p>";
            })
            .join("");
        }
      })
      .catch(function () {});
  }

  function escapeHtml(v) {
    return String(v || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function getDriveFileId(url) {
    var val = String(url || "")
      .replace(/&amp;/gi, "&")
      .trim();
    var m1 = val.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1 && m1[1]) return m1[1];
    var m2 = val.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2 && m2[1]) return m2[1];
    return "";
  }

  function isLikelyDirectVideo(url) {
    return /\.(mp4|webm|ogg)(\?|$)/i.test(String(url || ""));
  }

  function youtubeEmbed(url) {
    var val = String(url || "");
    var id = val.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]+)/);
    return id && id[1] ? "https://www.youtube.com/embed/" + id[1] : "";
  }

  function vimeoEmbed(url) {
    var val = String(url || "");
    var id = val.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return id && id[1] ? "https://player.vimeo.com/video/" + id[1] : "";
  }

  function normalizeMediaRecord(raw) {
    var item = Object.assign({}, raw || {});
    item.type = item.type === "video" ? "video" : "photo";
    item.title = String(item.title || "");
    item.url = String(item.url || "");
    item.layout = String(item.layout || "standard");
    item.sortOrder = Number(item.sortOrder || 0);
    item.createdAtTs = new Date(item.createdAt || "").getTime() || 0;
    item.driveId = getDriveFileId(item.url);

    if (item.driveId && item.type === "photo") {
      // uc?export=view often returns HTML or blocks <img> hotlinking; thumbnail API works for public files.
      item.displayUrl = "https://drive.google.com/thumbnail?id=" + item.driveId + "&sz=w2000";
    } else {
      item.displayUrl = item.url;
    }

    return item;
  }

  function sortMedia(a, b) {
    var sa = Number(a.sortOrder || 0);
    var sb = Number(b.sortOrder || 0);
    if (sa !== sb) return sa - sb;
    return (b.createdAtTs || 0) - (a.createdAtTs || 0);
  }

  function photoLayoutClass(layout) {
    if (layout === "feature") return "md:col-span-8 md:row-span-2";
    if (layout === "wide") return "md:col-span-8 md:row-span-1";
    if (layout === "tall") return "md:col-span-4 md:row-span-2";
    if (layout === "standard") return "md:col-span-4 md:row-span-1";
    return "";
  }

  function videoLayoutClass(layout) {
    if (layout === "feature") return "md:col-span-2";
    return "";
  }

  function renderVideoPlayer(url, title, driveId, mode) {
    var safeTitle = escapeHtml(title || "Video");
    var safeUrl = String(url || "").replace(/"/g, "");
    var yt = youtubeEmbed(url);
    var vm = vimeoEmbed(url);
    var autoplay = mode === "hover" || mode === "click";
    if (yt) {
      return (
        '<iframe class="w-full h-full" loading="lazy" src="' +
        yt +
        (yt.indexOf("?") >= 0 ? "&" : "?") +
        "autoplay=" +
        (autoplay ? "1" : "0") +
        "&mute=1&rel=0&playsinline=1" +
        '" title="' +
        safeTitle +
        '" allow="autoplay; fullscreen" allowfullscreen></iframe>'
      );
    }
    if (vm) {
      return (
        '<iframe class="w-full h-full" loading="lazy" src="' +
        vm +
        (vm.indexOf("?") >= 0 ? "&" : "?") +
        "autoplay=" +
        (autoplay ? "1" : "0") +
        "&muted=1&background=1" +
        '" title="' +
        safeTitle +
        '" allow="autoplay; fullscreen" allowfullscreen></iframe>'
      );
    }
    if (driveId) {
      return '<iframe class="w-full h-full" loading="lazy" src="https://drive.google.com/file/d/' + driveId + '/preview" title="' + safeTitle + '" allow="autoplay; fullscreen" allowfullscreen></iframe>';
    }
    if (isLikelyDirectVideo(url)) {
      return (
        '<video class="w-full h-full object-contain bg-black" src="' +
        safeUrl +
        '" ' +
        (mode === "hover" ? "autoplay muted loop playsinline preload=\"metadata\"" : "controls autoplay playsinline preload=\"metadata\"") +
        "></video>"
      );
    }
    return '<div class="w-full h-full flex items-center justify-center text-center p-4 text-xs text-stone-300">Unsupported video link. <a class="text-secondary underline ml-1" href="' + safeUrl + '" target="_blank" rel="noopener">Open video</a></div>';
  }

  function renderVideoEmbed(m, fitMode) {
    var mode = fitMode === "contain" ? "contain" : "cover";
    function attr(v) {
      return String(v || "").replace(/"/g, "&quot;");
    }
    function posterUrl(item) {
      var custom = String(item.posterUrl || item.thumbnail || "").trim();
      if (custom) return custom;
      // Drive thumbnails often include overlays; only use as fallback when no custom cover is provided.
      if (item.driveId) return "https://drive.google.com/thumbnail?id=" + item.driveId + "&sz=w1200";
      var ytId = String(youtubeEmbed(item.url || "")).split("/embed/")[1] || "";
      if (ytId) return "https://img.youtube.com/vi/" + ytId.replace(/[^a-zA-Z0-9_-].*$/, "") + "/hqdefault.jpg";
      return "";
    }
    function previewVideoTag(item) {
      var src = "";
      if (item.driveId) src = "https://drive.google.com/uc?export=download&id=" + item.driveId;
      else if (isLikelyDirectVideo(item.url)) src = String(item.url || "").replace(/"/g, "");
      if (!src) return "";
      return (
        '<video class="w-full h-full object-' +
        mode +
        '" data-video-poster src="' +
        src +
        '" muted loop autoplay playsinline preload="metadata"></video>'
      );
    }
    var poster = posterUrl(m);
    var livePreview = poster ? "" : previewVideoTag(m);
    if (!poster && !livePreview) return renderVideoPlayer(m.url, m.title, m.driveId, "click");
    return (
      '<div class="relative w-full h-full overflow-hidden bg-transparent" data-video-shell data-video-url="' +
      attr(m.url || "") +
      '" data-video-title="' +
      attr(m.title || "") +
      '" data-video-drive="' +
      attr(m.driveId || "") +
      '">' +
      (livePreview || ('<img src="' + attr(poster) + '" alt="' + escapeHtml(m.title || "Video preview") + '" class="w-full h-full object-' + mode + '" data-video-poster />')) +
      '<div class="absolute inset-0 bg-black/35 flex items-center justify-center" data-video-overlay>' +
      '<button type="button" data-video-launch class="w-14 h-14 rounded-full bg-black/55 border border-white/30 text-white flex items-center justify-center hover:scale-105 transition-transform" data-video-url="' + attr(m.url || "") + '" data-video-title="' + attr(m.title || "") + '" data-video-drive="' + attr(m.driveId || "") + '">' +
      '<span class="material-symbols-outlined" style="font-variation-settings:\'FILL\' 1;">play_arrow</span></button></div>' +
      '<div class="hidden w-full h-full" data-video-host></div></div>'
    );
  }

  function loadGalleryPhotos(db) {
    var el = document.getElementById("shudh-gallery-live");
    if (!el) return Promise.resolve();
    if (!db) {
      el.innerHTML =
        '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">Gallery is unavailable right now. Please check Firebase configuration.</div></div></section>';
      el.classList.remove("hidden");
      return Promise.resolve();
    }
    showLoader("Loading gallery...");
    return db.collection("media")
      .get()
      .then(function (snap) {
        var photos = snap.docs
          .map(function (d) {
            return normalizeMediaRecord(Object.assign({ id: d.id }, d.data()));
          })
          .filter(function (m) {
            return m.visible !== false && (m.type || "photo") === "photo" && m.url;
          });
        photos.sort(sortMedia);
        if (!photos.length) {
          el.innerHTML =
            '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">No gallery photos uploaded yet.</div></div></section>';
          el.classList.remove("hidden");
          return;
        }
        function mapCategory(v) {
          var c = String(v || "weddings").toLowerCase().replace(/\s+/g, "-");
          if (c === "private-parties") return "private";
          if (c !== "weddings" && c !== "corporate" && c !== "private") return "weddings";
          return c;
        }
        function categoryLabel(c) {
          if (c === "private") return "Private Events";
          if (c === "corporate") return "Corporate";
          return "Weddings";
        }
        photos = photos.map(function (m) {
          m.category = mapCategory(m.category);
          return m;
        });
        var categories = [
          { key: "all", label: "All" },
          { key: "weddings", label: "Weddings" },
          { key: "corporate", label: "Corporate" },
          { key: "private", label: "Private Events" }
        ];
        function renderCards(active) {
          var items = active === "all"
            ? photos
            : photos.filter(function (x) { return x.category === active; });
          if (!items.length) {
            return '<div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">No photos in this category yet.</div>';
          }
          return (
            '<div class="shudh-masonry-grid">' +
            items
              .map(function (m) {
                return (
                  '<figure class="shudh-masonry-item">' +
                  '<img src="' +
                  String(m.displayUrl).replace(/"/g, "") +
                  '" alt="' +
                  escapeHtml(m.title || "Gallery photo") +
                  '" loading="lazy" decoding="async" onerror="this.closest(\'figure\').style.display=\'none\'"/>' +
                  '<figcaption class="shudh-masonry-caption">' +
                  '<span class="shudh-masonry-cat">' +
                  categoryLabel(m.category) +
                  "</span>" +
                  '<span class="shudh-masonry-title">' +
                  escapeHtml(m.title || "Shudh India Event") +
                  "</span>" +
                  "</figcaption>" +
                  "</figure>"
                );
              })
              .join("") +
            "</div>"
          );
        }
        el.innerHTML =
          '<section class="section--sm"><div style="display:flex;justify-content:center;padding:0 1.5rem"><div style="display:flex;gap:.5rem;padding:.5rem;background:var(--color-surface-container-low);border-radius:9999px;flex-wrap:wrap;justify-content:center">' +
          categories
            .map(function (c, idx) {
              return (
                '<button type="button" data-gallery-cat="' +
                c.key +
                '" class="filter-btn ' +
                (idx === 0 ? "active" : "") +
                '">' +
                c.label +
                "</button>"
              );
            })
            .join("") +
          "</div></div></section>" +
          '<section class="section" style="padding-top:1rem"><div class="section-inner" data-gallery-grid>' +
          renderCards("all") +
          "</div></section>";
        var gridHost = el.querySelector("[data-gallery-grid]");
        el.querySelectorAll("[data-gallery-cat]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var cat = btn.getAttribute("data-gallery-cat") || "all";
            el.querySelectorAll("[data-gallery-cat]").forEach(function (x) {
              x.classList.remove("active");
            });
            btn.classList.add("active");
            if (gridHost) {
              gridHost.innerHTML = renderCards(cat);
            }
          });
        });
        el.classList.remove("hidden");
      })
      .catch(function () {
        el.innerHTML =
          '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">Unable to load gallery right now. Please try again.</div></div></section>';
        el.classList.remove("hidden");
      })
      .finally(function () {
        hideLoader();
      });
  }

  function loadVideos(db) {
    var el = document.getElementById("shudh-videos-live");
    if (!el) return Promise.resolve();
    if (!db) {
      el.innerHTML =
        '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">Videos are unavailable right now. Please check Firebase configuration.</div></div></section>';
      el.classList.remove("hidden");
      return Promise.resolve();
    }
    showLoader("Loading videos...");
    return db.collection("media")
      .get()
      .then(function (snap) {
        var vids = snap.docs
          .map(function (d) {
            return normalizeMediaRecord(Object.assign({ id: d.id }, d.data()));
          })
          .filter(function (m) {
            return m.visible !== false && m.type === "video" && m.url;
          });
        vids.sort(sortMedia);
        if (!vids.length) {
          el.innerHTML =
            '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">No videos uploaded yet. Add videos from admin to show them here.</div></div></section>';
          el.classList.remove("hidden");
          return;
        }
        function ensureVideoModal() {
          var modal = document.getElementById("shudh-video-modal");
          if (modal) return modal;
          modal = document.createElement("div");
          modal.id = "shudh-video-modal";
          modal.className = "hidden fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm p-3 sm:p-4 md:p-6 items-center justify-center";
          modal.innerHTML =
            '<div class="w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/30">' +
            '<div class="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-outline-variant/30">' +
            '<h4 class="text-sm sm:text-base font-semibold" data-video-modal-title>Video</h4>' +
            '<button type="button" data-video-modal-close class="text-on-surface-variant hover:text-on-surface"><span class="material-symbols-outlined">close</span></button></div>' +
            '<div class="bg-black w-full" style="aspect-ratio:16 / 9; max-height:70vh;" data-video-modal-player></div></div>';
          document.body.appendChild(modal);
          function closeModal() {
            var host = modal.querySelector("[data-video-modal-player]");
            if (host) host.innerHTML = "";
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
          modal.addEventListener("click", function (e) {
            if (e.target === modal) closeModal();
          });
          modal.querySelector("[data-video-modal-close]").addEventListener("click", closeModal);
          document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
          });
          return modal;
        }
        function bindVideoLaunchers() {
          el.querySelectorAll("[data-video-open]").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var url = btn.getAttribute("data-video-url") || "";
              var title = btn.getAttribute("data-video-title") || "Video";
              var drive = btn.getAttribute("data-video-drive") || "";
              var modal = ensureVideoModal();
              var titleEl = modal.querySelector("[data-video-modal-title]");
              var host = modal.querySelector("[data-video-modal-player]");
              if (titleEl) titleEl.textContent = title;
              if (host) host.innerHTML = renderVideoPlayer(url, title, drive, "click");
              modal.classList.remove("hidden");
              modal.classList.add("flex");
            });
          });
        }
        function thumb(m) {
          return String(m.posterUrl || m.displayUrl || "").replace(/"/g, "");
        }
        var featured = vids[0];
        var rest = vids.slice(1);
        function renderCard(m) {
          return (
            '<div class="video-card">' +
            (thumb(m)
              ? '<img src="' + thumb(m) + '" alt="' + escapeHtml(m.title || "Video thumbnail") + '" onerror="this.closest(\'.video-card\').style.display=\'none\'"/>'
              : '<div style="width:100%;height:100%;background:#1b1c15"></div>') +
            '<div class="video-overlay"><button type="button" class="play-btn" style="width:52px;height:52px" data-video-open data-video-url="' +
            String(m.url || "").replace(/"/g, "&quot;") +
            '" data-video-title="' +
            escapeHtml(m.title || "Video") +
            '" data-video-drive="' +
            String(m.driveId || "").replace(/"/g, "&quot;") +
            '"><span class="material-symbols-outlined" style="font-size:1.5rem;font-variation-settings:\'FILL\' 1">play_arrow</span></button></div>' +
            '<div class="video-info"><h4 style="font-family:var(--font-headline);font-weight:700;color:#fff;font-size:1rem;margin-bottom:.2rem">' +
            escapeHtml(m.title || "Shudh India Video") +
            '</h4><p style="color:rgba(255,255,255,.7);font-size:.8125rem">' +
            escapeHtml(m.duration || "Watch now") +
            "</p></div></div>"
          );
        }
        el.innerHTML =
          '<section class="section"><div class="section-inner"><div style="margin-bottom:1.5rem"><div class="section-eyebrow">Featured</div><h2 class="section-title">The <span class="accent">Grand</span> Experience</h2></div>' +
          '<div class="video-card" style="aspect-ratio:16/7;border-radius:1.25rem">' +
          (thumb(featured)
            ? '<img src="' + thumb(featured) + '" alt="' + escapeHtml(featured.title || "Featured video") + '" onerror="this.closest(\'.video-card\').style.display=\'none\'"/>'
            : '<div style="width:100%;height:100%;background:#1b1c15"></div>') +
          '<div class="video-overlay"><button type="button" class="play-btn" data-video-open data-video-url="' +
          String(featured.url || "").replace(/"/g, "&quot;") +
          '" data-video-title="' +
          escapeHtml(featured.title || "Video") +
          '" data-video-drive="' +
          String(featured.driveId || "").replace(/"/g, "&quot;") +
          '"><span class="material-symbols-outlined" style="font-size:2rem;font-variation-settings:\'FILL\' 1">play_arrow</span></button><p style="color:#fff;font-weight:600;font-size:.9375rem;text-shadow:0 2px 8px rgba(0,0,0,.6)">Watch Full Event Reel</p></div>' +
          '<div class="video-info"><h3 style="font-family:var(--font-headline);font-weight:700;color:#fff;font-size:1.375rem;margin-bottom:.25rem">' +
          escapeHtml(featured.title || "Featured video") +
          '</h3><p style="color:rgba(255,255,255,.7);font-size:.875rem">' +
          escapeHtml(featured.summary || "Shudh India cinematic showcase") +
          "</p></div></div></div></section>" +
          '<section class="section" style="background:var(--color-surface-container-low);padding-top:2rem"><div class="section-inner"><div style="text-align:center;margin-bottom:3rem"><div class="section-eyebrow">More Videos</div><h2 class="section-title" style="text-align:center">Explore Our <span class="accent">Portfolio</span></h2></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.75rem">' +
          (rest.length
            ? rest.map(renderCard).join("")
            : '<div style="grid-column:1/-1" class="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-on-surface-variant">Add more videos in admin to fill this section.</div>') +
          "</div></div></section>";
        bindVideoLaunchers();
        el.classList.remove("hidden");
      })
      .catch(function () {
        el.innerHTML =
          '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">Unable to load videos right now. Please try again.</div></div></section>';
        el.classList.remove("hidden");
      })
      .finally(function () {
        hideLoader();
      });
  }

  function loadCareersJobs(db) {
    var root = document.getElementById("careers-jobs-root");
    if (!root || !db) return Promise.resolve();
    return db.collection("careersJobs")
      .get()
      .then(function (snap) {
        var jobs = snap.docs
          .map(function (d) {
            return Object.assign({ id: d.id }, d.data());
          })
          .filter(function (j) {
            return j.visible !== false;
          })
          .sort(function (a, b) {
            var oa = Number(a.sortOrder || 0);
            var ob = Number(b.sortOrder || 0);
            if (oa !== ob) return oa - ob;
            var ta = new Date(a.createdAt || 0).getTime() || 0;
            var tb = new Date(b.createdAt || 0).getTime() || 0;
            return tb - ta;
          });

        if (!jobs.length) {
          root.innerHTML =
            '<div class="col-span-full text-center p-8 sm:p-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-on-surface-variant">No openings right now. Please check back soon.</div>';
          return;
        }

        root.innerHTML = jobs
          .map(function (j) {
            var category = escapeHtml(j.category || "General");
            var title = escapeHtml(j.title || "Open Role");
            var summary = escapeHtml(j.summary || "Join our hospitality team.");
            var location = escapeHtml(j.location || "India");
            var jobType = escapeHtml(j.jobType || "Full-time");
            var exp = escapeHtml(j.experience || "Experience required");
            return (
              '<article class="group bg-surface-container-low rounded-xl p-8 hover:bg-surface-container-high transition-all duration-500 flex flex-col h-full border border-outline-variant/5">' +
              '<div class="flex justify-between items-start mb-10">' +
              '<span class="bg-secondary/10 text-secondary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">' +
              category +
              '</span>' +
              '<span class="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>' +
              "</div>" +
              '<h3 class="text-3xl font-headline mb-4 group-hover:text-secondary transition-colors" style="overflow-wrap:anywhere">' +
              title +
              "</h3>" +
              '<p class="text-on-surface-variant font-light leading-relaxed mb-8 flex-grow" style="overflow-wrap:anywhere">' +
              summary +
              "</p>" +
              '<div class="space-y-3 mb-8">' +
              '<div class="flex items-center gap-3 text-sm text-on-surface/60"><span class="material-symbols-outlined text-xs">location_on</span>' +
              location +
              "</div>" +
              '<div class="flex items-center gap-3 text-sm text-on-surface/60"><span class="material-symbols-outlined text-xs">schedule</span>' +
              jobType +
              " · " +
              exp +
              "</div></div>" +
              '<button type="button" data-career-role="' +
              title +
              '" class="w-full py-4 bg-surface-container-highest rounded-xl font-bold tracking-tight hover:bg-secondary hover:text-on-secondary transition-all">Apply Now</button>' +
              "</article>"
            );
          })
          .join("");

        root.classList.add("careers-grid");

        var roleSelect = document.getElementById("careers-role");
        if (roleSelect) {
          roleSelect.innerHTML =
            '<option value="">Select role</option>' +
            jobs
              .map(function (j) {
                var t = escapeHtml(j.title || "Open Role");
                return '<option value="' + t + '">' + t + "</option>";
              })
              .join("");
        }

        root.querySelectorAll("[data-career-role]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var modal = document.getElementById("application-modal");
            var role = btn.getAttribute("data-career-role") || "";
            if (roleSelect && role) roleSelect.value = role;
            if (modal) modal.classList.remove("hidden");
          });
        });
      })
      .catch(function () {});
  }

  function bindCareersApplication(db) {
    var modal = document.getElementById("application-modal");
    var form = document.getElementById("careers-application-form");
    if (!form || !db) return Promise.resolve();

    function openModal() {
      if (!modal) return;
      modal.classList.remove("hidden");
      setBodyScrollLocked(true);
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.add("hidden");
      setBodyScrollLocked(false);
    }

    document.querySelectorAll("[data-close-careers-modal]").forEach(function (x) {
      x.addEventListener("click", function () {
        closeModal();
      });
    });

    document.querySelectorAll("[data-open-careers-modal]").forEach(function (x) {
      x.addEventListener("click", function () {
        openModal();
      });
    });

    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeModal();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("careers-form-msg");
      var payload = {
        fullName: (form.querySelector('[name="fullName"]') || {}).value || "",
        email: (form.querySelector('[name="email"]') || {}).value || "",
        phone: (form.querySelector('[name="phone"]') || {}).value || "",
        role: (form.querySelector('[name="role"]') || {}).value || "",
        experience: (form.querySelector('[name="experience"]') || {}).value || "",
        resumeUrl: (form.querySelector('[name="resumeUrl"]') || {}).value || "",
        coverLetter: (form.querySelector('[name="coverLetter"]') || {}).value || "",
        status: "New",
        source: "careers-page",
        createdAt: new Date().toISOString()
      };
      payload.fullName = String(payload.fullName).trim();
      payload.email = String(payload.email).trim();
      payload.role = String(payload.role).trim();
      payload.resumeUrl = String(payload.resumeUrl).trim();
      payload.phone = String(payload.phone).trim();
      if (!payload.fullName || !payload.email || !payload.role) {
        if (msg) msg.textContent = "Please fill name, email and role.";
        return;
      }
      if (!payload.resumeUrl) {
        if (msg) msg.textContent = "Please paste resume link.";
        return;
      }
      showLoader("Submitting application...");
      db.collection("careersApplications")
        .add(payload)
        .then(function () {
          form.reset();
          if (msg) msg.textContent = "Application submitted successfully.";
          closeModal();
        })
        .catch(function (err) {
          if (msg) msg.textContent = (err && err.message) || "Could not submit application. Please try again.";
        })
        .finally(hideLoader);
    });
    return Promise.resolve();
  }

  function initQuickContactDock(db) {
    if (document.getElementById("shudh-contact-dock")) return;
    var dock = document.createElement("aside");
    dock.id = "shudh-contact-dock";
    dock.className = "shudh-contact-dock";
    dock.setAttribute("aria-label", "Quick contact links");

    function dockIconSvg(kind) {
      if (kind === "whatsapp") {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.52 3.48A11.8 11.8 0 0 0 12.1 0C5.58 0 .3 5.28.3 11.8c0 2.08.54 4.1 1.56 5.88L0 24l6.5-1.8a11.75 11.75 0 0 0 5.6 1.43h.01c6.52 0 11.8-5.28 11.8-11.8 0-3.15-1.22-6.1-3.4-8.35Zm-8.41 18.16h-.01a9.86 9.86 0 0 1-5.02-1.37l-.36-.21-3.86 1.07 1.03-3.75-.24-.39a9.84 9.84 0 0 1-1.5-5.19c0-5.42 4.42-9.84 9.86-9.84 2.63 0 5.1 1.02 6.95 2.88a9.79 9.79 0 0 1 2.88 6.96c0 5.43-4.42 9.84-9.83 9.84Zm5.39-7.37c-.29-.14-1.73-.85-2- .95-.27-.1-.47-.14-.67.15-.2.29-.77.95-.94 1.14-.17.2-.34.22-.63.07-.29-.15-1.2-.44-2.3-1.4-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.67-1.62-.91-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.51.07-.78.37-.27.29-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.2 3.06.15.2 2.08 3.18 5.03 4.45.7.3 1.25.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.2-.55-.34Z"/></svg>';
      }
      if (kind === "youtube") {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.12-2.12C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.38.48A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12c1.88.48 9.38.48 9.38.48s7.5 0 9.38-.48a3 3 0 0 0 2.12-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.58V8.42L15.82 12 9.6 15.58Z"/></svg>';
      }
      if (kind === "instagram") {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z"/></svg>';
      }
      if (kind === "call") {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.62 10.79a15.1 15.1 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.56 0 1 .44 1 1V20c0 .56-.44 1-1 1C10.3 21 3 13.7 3 4c0-.56.44-1 1-1h3.5c.56 0 1 .44 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z"/></svg>';
      }
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.06 9.02 5 18.08V21h2.92l9.06-9.06-2.92-2.92ZM17.66 5.42c.39-.39 1.03-.39 1.42 0l1.84 1.84c.39.39.39 1.03 0 1.42l-1.2 1.2-3.26-3.26 1.2-1.2ZM3 17.25V21h3.75l10.7-10.7-3.75-3.75L3 17.25Z"/></svg>';
    }

    function cleanPhone(raw, fallback) {
      var v = String(raw || fallback || "").trim();
      if (!v) return "";
      return v.replace(/[^\d+]/g, "");
    }

    function ensureUrl(url, fallback) {
      var v = String(url || "").trim();
      return v || fallback;
    }

    var defaults = {
      callNumber: "+91 98765 43210",
      whatsappNumber: "+91 98765 43210",
      instagramUrl: "https://instagram.com/",
      youtubeUrl: "videos.html"
    };

    function buildItems(cfg) {
      var callRaw = cleanPhone(cfg.callNumber, defaults.callNumber);
      var waRaw = cleanPhone(cfg.whatsappNumber, defaults.whatsappNumber).replace(/^\+/, "");
      return [
      {
        href: "inquiry.html",
        label: "Get Quote",
        icon: "quote",
        cls: "shudh-contact-dock__item--brand"
      },
      {
        href: "https://wa.me/" + waRaw,
        label: "WhatsApp",
        icon: "whatsapp",
        cls: "shudh-contact-dock__item--whatsapp",
        external: true
      },
      {
        href: "tel:" + callRaw,
        label: "Call",
        icon: "call",
        cls: "shudh-contact-dock__item--brand"
      },
      {
        href: ensureUrl(cfg.instagramUrl, defaults.instagramUrl),
        label: "Instagram",
        icon: "instagram",
        cls: "shudh-contact-dock__item--instagram",
        external: true
      },
      {
        href: ensureUrl(cfg.youtubeUrl, defaults.youtubeUrl),
        label: "YouTube",
        icon: "youtube",
        cls: "shudh-contact-dock__item--youtube",
        external: /^https?:\/\//i.test(ensureUrl(cfg.youtubeUrl, defaults.youtubeUrl))
      }
    ];
    }

    function renderDock(items) {
      dock.innerHTML = items
        .map(function (item) {
          return (
            '<a class="shudh-contact-dock__item ' +
            item.cls +
            '" href="' +
            item.href +
            '"' +
            (item.external ? ' target="_blank" rel="noopener noreferrer"' : "") +
            ' aria-label="' +
            item.label +
            '">' +
            '<span class="shudh-contact-dock__icon">' +
            dockIconSvg(item.icon) +
            "</span>" +
            '<span class="shudh-contact-dock__label">' +
            item.label +
            "</span></a>"
          );
        })
        .join("");
    }

    renderDock(buildItems(defaults));
    if (db) {
      db.collection("siteSettings")
        .doc("widgetContact")
        .get()
        .then(function (snap) {
          if (!snap.exists) return;
          renderDock(buildItems(Object.assign({}, defaults, snap.data() || {})));
        })
        .catch(function () {});
    }

    document.body.appendChild(dock);

    function syncDockVisibility() {
      if (window.innerWidth > 768) {
        dock.style.opacity = "";
        dock.style.pointerEvents = "";
        return;
      }
      var activeTag = document.activeElement && document.activeElement.tagName;
      var isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
      var modal = document.getElementById("application-modal");
      var modalOpen = modal && !modal.classList.contains("hidden");
      var hidden = isTyping || modalOpen;
      dock.style.opacity = hidden ? "0" : "1";
      dock.style.pointerEvents = hidden ? "none" : "";
    }

    document.addEventListener("focusin", syncDockVisibility);
    document.addEventListener("focusout", function () {
      setTimeout(syncDockVisibility, 120);
    });
    window.addEventListener("resize", syncDockVisibility);
    syncDockVisibility();
  }

  startPageBootLoader();

  document.addEventListener("DOMContentLoaded", function () {
    startPageBootLoader();
    var db = getDb();
    initImageSkeletons();
    initQuickContactDock(db);
    initHomepageMotion();
    initHomeExperienceCounters();
    initHomepageStatCounters();
    bindInquiryForms(db);
    Promise.allSettled([
      bindCareersApplication(db),
      loadPackages(db),
      loadGalleryPhotos(db),
      loadVideos(db),
      loadCareersJobs(db),
      loadBlogList(db),
      loadBlogPost(db)
    ]).finally(function () {
      if (window.SHUDH_CONTENT_LOADER_LOCKED) return;
      hideLoader();
    });
  });
})();
