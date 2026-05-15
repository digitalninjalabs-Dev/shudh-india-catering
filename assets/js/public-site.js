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
        '<img class="shudh-loader-logo" src="assets/logo/logonew.png" alt="Shudh India Catering" />' +
        "</div>" +
        '<p class="shudh-loader-brand">Shudh India Catering</p>' +
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

  var _shudhStRefreshTimer = null;
  function scheduleScrollTriggerRefresh() {
    if (!window.ScrollTrigger || typeof window.ScrollTrigger.refresh !== "function") return;
    if (_shudhStRefreshTimer != null) return;
    _shudhStRefreshTimer = setTimeout(function () {
      _shudhStRefreshTimer = null;
      try {
        window.ScrollTrigger.refresh();
      } catch (_e) {}
    }, 170);
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
        "main > section, body > section:not(.shudh-visual-story), body > footer, .page-hero, .shudh-hover-lift, .stats-strip, .cta-section"
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
      window.ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
      });
      /* normalizeScroll() intercepts touch momentum on iOS/Android and often feels sluggish; keep native scrolling. */

      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.gsap.set(targets, { clearProps: "all" });
        targets.forEach(function (node) {
          node.style.opacity = "";
          node.style.transform = "";
        });
        document.querySelectorAll("[data-shudh-img-reveal-wired]").forEach(function (img) {
          img.removeAttribute("data-shudh-img-reveal-wired");
          window.gsap.set(img, { clearProps: "opacity,transform,willChange" });
        });
        document.querySelectorAll("[data-shudh-tile-reveal-wired]").forEach(function (node) {
          node.removeAttribute("data-shudh-tile-reveal-wired");
          window.gsap.set(node, { clearProps: "opacity,transform,willChange" });
        });
        return true;
      }

      var coarsePointer =
        window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;

      // Sections / blocks: one-shot reveal. On phones/tablets keep motion light and avoid many
      // per-element ScrollTriggers (those refresh often and cost scroll performance).
      if (!coarsePointer) {
        window.gsap.set(targets, {
          opacity: 0,
          y: 32,
          scale: 0.992,
          force3D: true,
          willChange: "transform,opacity"
        });
        window.ScrollTrigger.batch(targets, {
          start: "top 93%",
          end: "bottom 6%",
          once: true,
          onEnter: function (batch) {
            window.gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.12,
              ease: "power2.out",
              stagger: { each: 0.09, from: "start" },
              clearProps: "willChange"
            });
          }
        });
      } else {
        window.gsap.set(targets, { opacity: 0, y: 18, scale: 1, force3D: true });
        window.ScrollTrigger.batch(targets, {
          start: "top 96%",
          once: true,
          onEnter: function (batch) {
            window.gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power1.out",
              stagger: { each: 0.035, from: "start" }
            });
          }
        });
      }

      function wireScrollRevealImages() {
        if (coarsePointer) return;
        if (!(window.gsap && window.ScrollTrigger)) return;
        var selectors = [
          ".home-hero-image",
          ".home-signature-flow__feature-media img",
          ".contact-panel__visual img",
          ".home-closing-signature__media img",
          ".home-exp-card1-image",
          ".home-exp-card2-image",
          ".home-exp-card3-image",
          ".about-vision-image",
          ".employee-card__image-wrap img",
          "#shudh-packages-root img",
          "#shudh-videos-live .video-card img",
          "#blog-posts-grid img",
          "#blog-post-image"
        ];
        selectors.forEach(function (sel) {
          try {
            document.querySelectorAll(sel).forEach(function (node) {
              if (!node || node.tagName !== "IMG" || node.getAttribute("data-shudh-img-reveal-wired")) return;
              if (node.closest && node.closest("figure.shudh-masonry-item")) return;
              if (node.closest && node.closest(".home-gallery-grid")) return;
              node.setAttribute("data-shudh-img-reveal-wired", "1");
              window.gsap.set(node, {
                opacity: 0,
                y: 14,
                scale: 0.987,
                force3D: true,
                willChange: "transform,opacity"
              });
              window.ScrollTrigger.create({
                trigger: node,
                start: "top 92%",
                once: true,
                onEnter: function () {
                  window.gsap.to(node, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.08,
                    ease: "sine.out",
                    clearProps: "willChange"
                  });
                }
              });
            });
          } catch (_e) {}
        });
      }

      function wireScrollRevealTiles() {
        if (coarsePointer) return;
        if (!(window.gsap && window.ScrollTrigger)) return;
        var tileSelectors = [".home-gallery-grid > div", "#shudh-gallery-live figure.shudh-masonry-item"];
        tileSelectors.forEach(function (sel) {
          try {
            document.querySelectorAll(sel).forEach(function (node) {
              if (!node || node.nodeType !== 1) return;
              if (!node.querySelector || !node.querySelector("img")) return;
              if (node.getAttribute("data-shudh-tile-reveal-wired")) return;
              node.setAttribute("data-shudh-tile-reveal-wired", "1");
              var isHomePreview = node.closest && node.closest(".home-gallery-grid");
              var yFrom = isHomePreview ? 14 : 26;
              var scaleFrom = isHomePreview ? 0.992 : 0.985;
              var dur = isHomePreview ? 0.58 : 1.08;
              window.gsap.set(node, {
                opacity: 0,
                y: yFrom,
                scale: scaleFrom,
                force3D: true,
                willChange: "transform,opacity"
              });
              window.ScrollTrigger.create({
                trigger: node,
                start: "top 91%",
                once: true,
                onEnter: function () {
                  window.gsap.to(node, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: dur,
                    ease: "power2.out",
                    clearProps: "willChange"
                  });
                }
              });
            });
          } catch (_e2) {}
        });
      }

      function wireAllScrollReveals() {
        wireScrollRevealImages();
        wireScrollRevealTiles();
        try {
          scheduleScrollTriggerRefresh();
        } catch (_r) {}
      }

      wireAllScrollReveals();
      window.SHUDH_wireScrollRevealImages = wireAllScrollReveals;
      if (window.SHUDH_CONTENT_READY === true) {
        window.setTimeout(wireAllScrollReveals, 120);
        window.setTimeout(wireAllScrollReveals, 550);
      }
      document.addEventListener("shudh:content-loaded", function onContent() {
        document.removeEventListener("shudh:content-loaded", onContent);
        window.setTimeout(wireAllScrollReveals, 40);
        window.setTimeout(wireAllScrollReveals, 400);
        window.setTimeout(function () {
          scheduleScrollTriggerRefresh();
        }, 900);
      });

      return true;
    }

    function scheduleWhenScrollRevealReady() {
      var t0 = Date.now();
      (function tick() {
        if (typeof window.SHUDH_wireScrollRevealImages === "function") {
          window.SHUDH_wireScrollRevealImages();
          scheduleScrollTriggerRefresh();
          return;
        }
        if (Date.now() - t0 < 8000) window.setTimeout(tick, 70);
      })();
    }

    window.SHUDH_scheduleScrollRevealImages = scheduleWhenScrollRevealReady;

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
    var ms = kind === "error" ? 3400 : 4800;
    root._timer = window.setTimeout(function () {
      root.className = "shudh-form-toast";
    }, ms);
  }

  function hideSuccessModal() {
    var root = document.getElementById("shudh-success-modal");
    if (!root) return;
    if (root._escHandler) {
      document.removeEventListener("keydown", root._escHandler);
      root._escHandler = null;
    }
    root.classList.add("hidden");
    root.setAttribute("aria-hidden", "true");
    setBodyScrollLocked(false);
  }

  function ensureSuccessModal() {
    var root = document.getElementById("shudh-success-modal");
    if (root) return root;
    root = document.createElement("div");
    root.id = "shudh-success-modal";
    root.className = "shudh-success-modal hidden";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "shudh-success-modal-title");
    root.innerHTML =
      '<div class="shudh-success-modal__backdrop" tabindex="-1"></div>' +
      '<div class="shudh-success-modal__wrap">' +
      '<div class="shudh-success-modal__card">' +
      '<div class="shudh-success-modal__icon-ring" aria-hidden="true">' +
      '<svg class="shudh-success-modal__check" viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">' +
      '<path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>' +
      "</svg></div>" +
      '<h2 id="shudh-success-modal-title" class="shudh-success-modal__title"></h2>' +
      '<p id="shudh-success-modal-body" class="shudh-success-modal__body"></p>' +
      '<button type="button" class="shudh-success-modal__ok"></button>' +
      "</div></div>";
    document.body.appendChild(root);
    root.querySelector(".shudh-success-modal__backdrop").addEventListener("click", hideSuccessModal);
    root.querySelector(".shudh-success-modal__ok").addEventListener("click", hideSuccessModal);
    return root;
  }

  function showSuccessModal(opts) {
    opts = opts || {};
    var root = ensureSuccessModal();
    var titleEl = root.querySelector("#shudh-success-modal-title");
    var bodyEl = root.querySelector("#shudh-success-modal-body");
    var okBtn = root.querySelector(".shudh-success-modal__ok");
    if (titleEl) titleEl.textContent = opts.title || "Thank you!";
    if (bodyEl) bodyEl.textContent = opts.body || "";
    if (okBtn) okBtn.textContent = opts.okLabel || "OK";
    hideSuccessModal();
    root.classList.remove("hidden");
    root.setAttribute("aria-hidden", "false");
    setBodyScrollLocked(true);
    root._escHandler = function (e) {
      if (e.key === "Escape") hideSuccessModal();
    };
    document.addEventListener("keydown", root._escHandler);
    window.setTimeout(function () {
      if (okBtn && typeof okBtn.focus === "function") okBtn.focus();
    }, 40);
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
        if (msg) {
          msg.textContent = "";
          msg.classList.remove("shudh-form-feedback-success");
        }
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
            if (msg) {
              msg.textContent = "";
              msg.classList.remove("shudh-form-feedback-success");
            }
            showSuccessModal({
              title: "Wonderful!",
              body:
                "Your inquiry was sent successfully. Our team will reach out shortly — please watch your phone or email.",
              okLabel: "OK"
            });
          })
          .catch(function () {
            if (msg) {
              msg.textContent = "Could not submit. Please try again or call us.";
              msg.classList.remove("shudh-form-feedback-success");
            }
            showFormToast("error", "Submission failed. Please try again.");
          })
          .finally(function () {
            hideLoader();
          });
      });
    });
  }

  function renderPackageCard(pkg, isGold, idx) {
    var name = pkg.name || "Package";
    var showPrice = pkg.showPrice !== false;
    var rawPrice = showPrice && pkg.startingPrice ? String(pkg.startingPrice).trim() : "";
    var description = String(pkg.description || pkg.tagline || "").trim();
    var badge = String(pkg.badge || "").trim();
    function formatDynamicPriceLine(raw) {
      var value = String(raw || "").trim();
      if (!value) return "Custom Quote";
      var compact = value.replace(/\s+/g, " ");
      if (/veg|non[-\s]?veg|tax/i.test(compact)) return compact;
      var digits = compact.match(/\d[\d,]*/);
      if (digits) return "Veg @ ₹" + digits[0].replace(/,/g, "");
      return compact;
    }
    var priceLine = formatDynamicPriceLine(rawPrice);
    var priceMeta = /tax/i.test(priceLine) ? "per pax" : "per pax, veg · + taxes";
    function normalizeQtyToken(rawQty) {
      var t = String(rawQty != null ? rawQty : "").trim();
      if (!t) return "";
      if (/^\d+\+$/.test(t)) {
        var n = t.slice(0, -1);
        return String(n).padStart(2, "0") + "+";
      }
      if (/^\d+$/.test(t)) return String(Number(t)).padStart(2, "0");
      return t;
    }

    function parsePackageHighlight(text) {
      var raw = String(text || "").replace(/\s+/g, " ").trim();
      if (!raw) return { qty: "", label: "", hasQty: false };
      if (raw.charAt(0) === "|") {
        var only = raw.slice(1).trim();
        return { qty: "", label: only, hasQty: false };
      }
      var pipeMatch = raw.match(/^([^|]*)\|(.+)$/);
      if (pipeMatch) {
        var left = String(pipeMatch[1] || "").trim();
        var right = String(pipeMatch[2] || "").trim();
        if (!right) return { qty: "", label: "", hasQty: false };
        if (!left) return { qty: "", label: right, hasQty: false };
        return {
          qty: normalizeQtyToken(left),
          label: right,
          hasQty: true
        };
      }
      var m = raw.match(/^(\d+(?:\+)?)\s+(.+)$/i);
      if (m) {
        return {
          qty: normalizeQtyToken(m[1]),
          label: String(m[2] || "").trim(),
          hasQty: true
        };
      }
      return { qty: "", label: raw, hasQty: false };
    }

    function normalizeItemsSource(candidate) {
      if (Array.isArray(candidate)) return candidate;
      if (typeof candidate === "string") {
        return candidate
          .split(/\n|,/)
          .map(function (x) { return x.trim(); })
          .filter(Boolean);
      }
      if (candidate && typeof candidate === "object") {
        return Object.keys(candidate)
          .sort()
          .map(function (k) { return candidate[k]; })
          .filter(Boolean);
      }
      return [];
    }
    var sourceItems = normalizeItemsSource(
      Array.isArray(pkg.menuItems) && pkg.menuItems.length ? pkg.menuItems : pkg.highlights
    );
    var parsed = sourceItems.map(function (h) {
      var parsedItem;
      if (typeof h === "string") {
        parsedItem = parsePackageHighlight(h);
      } else {
        var lbl = String(h.label || h.item || h.name || "").trim();
        var qRaw = h.qty != null ? h.qty : h.quantity;
        var qStr = normalizeQtyToken(qRaw);
        var hasQ = String(qRaw != null ? qRaw : "").trim() !== "";
        if (h.showQty === false || h.hasQuantity === false) hasQ = false;
        parsedItem = { qty: hasQ ? qStr : "", label: lbl, hasQty: hasQ };
      }
      if (!parsedItem.label) return null;
      if (parsedItem.hasQty == null) {
        parsedItem.hasQty = !!String(parsedItem.qty || "").trim();
      }
      return parsedItem;
    }).filter(Boolean);

    var tier = String(name || "").toLowerCase();
    var tone = "silver";
    if (tier.indexOf("gold") >= 0) tone = "gold";
    else if (tier.indexOf("diamond") >= 0) tone = "diamond";
    else if (tier.indexOf("platinum") >= 0) tone = "platinum";
    var shell = "pkgv2-card pkgv2-card--" + tone;
    var ctaClass = "pkgv2-btn pkgv2-btn--outline";
    if (tone === "gold") ctaClass = "pkgv2-btn pkgv2-btn--primary";
    if (tone === "diamond") ctaClass = "pkgv2-btn pkgv2-btn--secondary";
    var tierLabel = name;
    var badgeClass = "pkgv2-badge pkgv2-badge--red";
    if (/limited|premium|choice/i.test(badge)) badgeClass = "pkgv2-badge pkgv2-badge--green";

    function menuLineIcon(labelText) {
      var t = String(labelText || "").toLowerCase();
      if (/drink|mocktail|beverage|welcome/i.test(t)) return "wine_bar";
      if (/appetizer|starter|snack/i.test(t)) return "tapas";
      if (/raita|dal|gravy|curry|main|sabzi|paneer|rice|biryani|bread|roti|naan/i.test(t)) return "restaurant";
      if (/dessert|sweet|ice.?cream|cake|pastry|halwa|gulab/i.test(t)) return "cake";
      if (/salad/i.test(t)) return "eco";
      if (/counter|live/i.test(t)) return "storefront";
      return "restaurant_menu";
    }

    return (
      '<div class="' + shell + '" style="animation-delay:' + String((idx || 0) * 90) + 'ms">' +
      (badge
        ? '<div class="' + badgeClass + '">' +
          badge.replace(/</g, "&lt;") +
          "</div>"
        : "") +
      '<div class="pkgv2-tier"><span class="pkgv2-tier__dot"></span><span class="pkgv2-tier__label">' +
      tierLabel.replace(/</g, "&lt;") +
      "</span></div>" +
      '<h3 class="pkgv2-name">' + name.replace(/</g, "&lt;") + "</h3>" +
      '<h3 class="pkgv2-price">' +
      priceLine.replace(/</g, "&lt;") +
      "</h3>" +
      '<p class="pkgv2-sub">' + priceMeta.replace(/</g, "&lt;") + "</p>" +
      (description ? '<p class="pkgv2-desc">' + description.replace(/</g, "&lt;") + "</p>" : "") +
      '<ul class="pkgv2-lines">' +
      parsed.map(function (item) {
        var labelEsc = item.label.replace(/</g, "&lt;");
        var showQty = item.hasQty && String(item.qty || "").trim();
        var iconName = menuLineIcon(item.label).replace(/</g, "&lt;");
        if (showQty) {
          return (
            '<li class="pkgv2-line pkgv2-line--qty">' +
            '<span class="pkgv2-qty">' +
            String(item.qty).replace(/</g, "&lt;") +
            '</span><span class="pkgv2-label">' +
            labelEsc +
            '</span><span class="material-symbols-outlined pkgv2-item-icon" aria-hidden="true">' +
            iconName +
            "</span></li>"
          );
        }
        return '<li class="pkgv2-line pkgv2-line--plain"><span class="pkgv2-label">' + labelEsc + '</span><span class="material-symbols-outlined pkgv2-item-icon pkgv2-item-icon--plain" aria-hidden="true">' + iconName + "</span></li>";
      }).join("") +
      "</ul>" +
      '<a href="inquiry.html" class="' + ctaClass + '">Get Quote</a>' +
      "</div>"
    );
  }

  function loadPackages(db) {
    var root = document.getElementById("shudh-packages-root");
    var staticSection = document.getElementById("shudh-packages-static");
    if (!root) return Promise.resolve();
    if (!db) {
      root.innerHTML =
        '<div class="pkgv2-card pkgv2-card--silver" style="grid-column:1/-1;text-align:center;">' +
        '<h3 class="pkgv2-price">Packages unavailable</h3>' +
        '<p class="pkgv2-sub">Firebase not connected on this page. Please check config.</p>' +
        "</div>";
      root.classList.add("packages-grid");
      root.classList.remove("hidden");
      root.style.display = "";
      if (staticSection) staticSection.style.display = "none";
      return Promise.resolve();
    }
    showLoader("Loading packages...");
    return db.collection("packages")
      .get()
      .then(function (snap) {
        if (snap.empty) {
          root.innerHTML =
            '<div class="pkgv2-card pkgv2-card--silver" style="grid-column:1/-1;text-align:center;">' +
            '<h3 class="pkgv2-price">Packages Coming Soon</h3>' +
            '<p class="pkgv2-sub">Add packages from Admin panel to show them here.</p>' +
            '<a href="inquiry.html" class="pkgv2-btn pkgv2-btn--outline" style="max-width:220px;margin:1rem auto 0;">Get Quote</a>' +
            "</div>";
          root.classList.add("packages-grid");
          root.classList.remove("hidden");
          root.style.display = "";
          if (staticSection) staticSection.classList.add("hidden");
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
          html += renderPackageCard(pkg, gold, i);
        });
        root.innerHTML = html;
        root.classList.add("packages-grid");
        root.classList.remove("hidden");
        root.style.display = "";
        if (staticSection) staticSection.style.display = "none";
      })
      .catch(function (err) {
        var errText = "";
        if (err && (err.code || err.message)) {
          errText = String(err.code || err.message);
        }
        root.innerHTML =
          '<div class="pkgv2-card pkgv2-card--silver" style="grid-column:1/-1;text-align:center;">' +
          '<h3 class="pkgv2-price">Could not load packages</h3>' +
          '<p class="pkgv2-sub">Please check internet/Firebase permissions and refresh.</p>' +
          (errText ? ('<p class="pkgv2-sub" style="margin-top:.35rem;color:#b21422;">' + errText.replace(/</g, "&lt;") + "</p>") : "") +
          "</div>";
        root.classList.add("packages-grid");
        root.classList.remove("hidden");
        root.style.display = "";
      })
      .finally(function () {
        hideLoader();
        if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
          window.SHUDH_scheduleScrollRevealImages();
        } else if (typeof window.SHUDH_wireScrollRevealImages === "function") {
          window.setTimeout(window.SHUDH_wireScrollRevealImages, 50);
          window.setTimeout(function () {
            scheduleScrollTriggerRefresh();
          }, 200);
        }
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
    ensureGalleryImageFallbackHandler();
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
          var coverPack = cover ? buildCoverImageCandidates(cover, "card") : { primary: "", attr: "" };
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
            (coverPack.primary
              ? '<img src="' +
                coverPack.primary.replace(/"/g, "&quot;") +
                '" alt="' +
                title +
                '" style="width:100%;height:100%;object-fit:cover;min-height:240px" loading="lazy" decoding="async" data-fallback-srcs="' +
                coverPack.attr +
                '" data-fallback-index="0" data-soft-fail="1" data-min-h="240px" onerror="window.SHUDH_handleGalleryImageError(this)"/>'
              : '<div style="min-height:240px;background:var(--color-surface-container);display:flex;align-items:center;justify-content:center;color:var(--color-on-surface-variant)">No image</div>') +
            "</div></article>"
          );
        }).join("");
        if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
          window.SHUDH_scheduleScrollRevealImages();
        } else if (typeof window.SHUDH_wireScrollRevealImages === "function") {
          window.setTimeout(window.SHUDH_wireScrollRevealImages, 40);
        }
      })
      .catch(function () {});
  }

  function loadBlogPost(db) {
    if (currentPageName() !== "blog-post.html") return Promise.resolve();
    ensureGalleryImageFallbackHandler();
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
        if (imageEl && post.coverImage) {
          var heroPack = buildCoverImageCandidates(String(post.coverImage).trim(), "hero");
          if (heroPack.primary) {
            imageEl.src = heroPack.primary;
            imageEl.setAttribute("data-fallback-srcs", heroPack.list.join("||"));
            imageEl.setAttribute("data-fallback-index", "0");
            imageEl.setAttribute("data-soft-fail", "1");
            imageEl.setAttribute("data-min-h", "220px");
            imageEl.onerror = function () {
              if (window.SHUDH_handleGalleryImageError) window.SHUDH_handleGalleryImageError(imageEl);
            };
          }
        }
        if (contentEl) {
          contentEl.innerHTML = String(post.content || "")
            .split(/\n{2,}/)
            .map(function (block) {
              return "<p>" + escapeHtml(block).replace(/\n/g, "<br/>") + "</p>";
            })
            .join("");
        }
        if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
          window.SHUDH_scheduleScrollRevealImages();
        } else if (typeof window.SHUDH_wireScrollRevealImages === "function") {
          window.setTimeout(window.SHUDH_wireScrollRevealImages, 40);
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

  function normalizeImageUrl(url) {
    var val = String(url || "").trim();
    if (!val) return "";
    // Dropbox share links need raw=1 to be embeddable in <img>.
    if (/dropbox\.com/i.test(val) && /[?&]dl=0/.test(val)) {
      val = val.replace(/[?&]dl=0/, function (m) {
        return m.charAt(0) + "raw=1";
      });
    }
    // Encode spaces and unsafe chars while keeping URL delimiters intact.
    try {
      val = encodeURI(val);
    } catch (_) {}
    return val;
  }

  function proxyImageUrl(url, maxW) {
    var val = normalizeImageUrl(url);
    if (!val) return "";
    var w = Number(maxW) || 1200;
    w = Math.min(Math.max(w, 240), 2048);
    var bare = val.replace(/^https?:\/\//i, "");
    return "https://images.weserv.nl/?url=" + encodeURIComponent(bare) + "&w=" + w + "&q=78&output=webp";
  }

  function dedupeUrlList(list) {
    var seen = {};
    return (list || []).filter(function (u) {
      var key = String(u || "").trim();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function unsplashResize(url, width) {
    var val = String(url || "").trim();
    if (!val || !/images\.unsplash\.com/i.test(val)) return val;
    if (/[?&]w=\d+/.test(val)) return val;
    var join = val.indexOf("?") >= 0 ? "&" : "?";
    return val + join + "w=" + String(width || 900) + "&q=78&auto=format&fit=crop";
  }

  /** Card / list covers: small Drive thumbs first; hero: larger chain. Used by blog + video cards. */
  function buildCoverImageCandidates(rawUrl, profile) {
    var raw = String(rawUrl || "").trim();
    if (!raw) return { primary: "", attr: "", list: [] };
    var id = getDriveFileId(raw);
    var list = [];
    if (id) {
      if (profile === "hero") {
        list = [
          "https://drive.google.com/thumbnail?id=" + id + "&sz=w1280",
          "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600",
          "https://drive.google.com/uc?export=view&id=" + id,
          "https://drive.google.com/uc?export=download&id=" + id,
          "https://lh3.googleusercontent.com/d/" + id + "=w1600"
        ];
      } else {
        list = [
          "https://drive.google.com/thumbnail?id=" + id + "&sz=w640",
          "https://drive.google.com/thumbnail?id=" + id + "&sz=w960",
          "https://drive.google.com/thumbnail?id=" + id + "&sz=w1280",
          "https://drive.google.com/uc?export=view&id=" + id
        ];
      }
    } else {
      var main = normalizeImageUrl(raw);
      var w = profile === "hero" ? 1600 : 900;
      list = [
        unsplashResize(main, w),
        unsplashResize(main, 1200),
        main,
        proxyImageUrl(main, profile === "hero" ? 1600 : 800)
      ];
    }
    list = dedupeUrlList(list.filter(Boolean));
    if (list.length) {
      list.push(proxyImageUrl(list[0], profile === "hero" ? 1400 : 720));
      list = dedupeUrlList(list);
    }
    var primary = list[0] || "";
    var attr = list.join("||").replace(/"/g, "&quot;");
    return { primary: primary, attr: attr, list: list };
  }

  function isLikelyDirectVideo(url) {
    return /\.(mp4|webm|ogg)(\?|$)/i.test(String(url || ""));
  }

  function youtubeEmbed(url) {
    var val = String(url || "");
    var id = val.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]+)/);
    return id && id[1] ? "https://www.youtube.com/embed/" + id[1] : "";
  }

  function youtubeVideoIdFromPageUrl(url) {
    var val = String(url || "");
    var m = val.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{6,})/);
    return m && m[1] ? m[1] : "";
  }

  function youtubeVideoIdFromThumbSrc(src) {
    var m = String(src || "").match(/\/vi\/([a-zA-Z0-9_-]{6,})\//);
    return m && m[1] ? m[1] : "";
  }

  /** Loads poster JPEGs until one resolves; dimensions reflect display aspect for many uploads (esp. Shorts / vertical). */
  function probeYoutubeThumbnailAspect(videoId, cb) {
    if (!videoId || typeof cb !== "function") {
      if (typeof cb === "function") cb(null);
      return;
    }
    var qualities = ["maxresdefault", "sddefault", "hqdefault", "mqdefault"];
    var idx = 0;
    function attempt() {
      if (idx >= qualities.length) {
        cb(null);
        return;
      }
      var q = qualities[idx++];
      var img = new Image();
      img.onload = function () {
        var nw = img.naturalWidth;
        var nh = img.naturalHeight;
        if (nw < 120 || nh < 90 || nw > 4800 || nh > 4800) {
          attempt();
          return;
        }
        if (nw === 480 && nh === 360) {
          attempt();
          return;
        }
        cb({ w: nw, h: nh });
      };
      img.onerror = function () {
        attempt();
      };
      img.src = "https://img.youtube.com/vi/" + videoId + "/" + q + ".jpg";
    }
    attempt();
  }

  function vimeoEmbed(url) {
    var val = String(url || "");
    var id = val.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    return id && id[1] ? "https://player.vimeo.com/video/" + id[1] : "";
  }

  function gcdWhole(a, b) {
    a = Math.abs(Math.round(Number(a) || 0));
    b = Math.abs(Math.round(Number(b) || 0));
    if (!a || !b) return 1;
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function simplifyRatio(w, h) {
    var wi = Math.max(1, Math.round(Number(w) || 1));
    var hi = Math.max(1, Math.round(Number(h) || 1));
    var g = gcdWhole(wi, hi);
    return { w: Math.round(wi / g), h: Math.round(hi / g) };
  }

  /** Optional Firestore: aspectRatio "16:9"|"9:16", aspectW/aspectH numbers, orientation portrait|landscape|square */
  function parseMediaAspect(raw) {
    var item = raw || {};
    var w = Number(item.aspectW);
    var h = Number(item.aspectH);
    if (w > 0 && h > 0) return simplifyRatio(w, h);
    var str = String(item.aspectRatio || item.videoAspectRatio || "").trim();
    if (str && str.indexOf(":") !== -1) {
      var parts = str.split(":").map(function (x) {
        return parseFloat(String(x).trim());
      });
      if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
        return simplifyRatio(Math.round(parts[0] * 1000), Math.round(parts[1] * 1000));
      }
    }
    var o = String(item.orientation || "").toLowerCase();
    if (o === "portrait" || o === "vertical") return { w: 9, h: 16 };
    if (o === "square") return { w: 1, h: 1 };
    if (o === "landscape" || o === "horizontal") return { w: 16, h: 9 };
    return null;
  }

  function defaultAspectFromVideoUrl(url) {
    var u = String(url || "");
    if (/youtube\.com\/shorts\/|youtu\.be\/shorts\/|m\.youtube\.com\/shorts\//i.test(u)) return { w: 9, h: 16 };
    return null;
  }

  function normalizeMediaRecord(raw) {
    var item = Object.assign({}, raw || {});
    item.type = item.type === "video" ? "video" : "photo";
    item.title = String(item.title || "");
    // Keep video playback URLs raw (YouTube/Vimeo/Drive/mp4); normalizeImageUrl is for image fetches only.
    var rawVideoUrl = String(raw.url || "").trim();
    item.url = item.type === "video" ? rawVideoUrl : normalizeImageUrl(raw.url || "");
    item.thumbnail = normalizeImageUrl(item.thumbnail || item.thumb || item.coverImage || "");
    item.layout = String(item.layout || "standard");
    item.sortOrder = Number(item.sortOrder || 0);
    item.createdAtTs = new Date(item.createdAt || "").getTime() || 0;
    item.driveId = getDriveFileId(item.url);
    item.videoAspect = parseMediaAspect(item);

    if (item.driveId && item.type === "photo") {
      // Grid: small Drive thumbnails first (fast). Modal: larger variants + fallbacks.
      var id = item.driveId;
      var grid = [];
      if (item.thumbnail) grid.push(item.thumbnail);
      grid.push(
        "https://drive.google.com/thumbnail?id=" + id + "&sz=w480",
        "https://drive.google.com/thumbnail?id=" + id + "&sz=w800",
        "https://drive.google.com/thumbnail?id=" + id + "&sz=w1200",
        "https://drive.google.com/uc?export=view&id=" + id
      );
      item.gridThumbCandidates = dedupeUrlList(grid);
      item.gridThumbUrl = item.gridThumbCandidates[0] || "";
      item.gridThumbCandidates.push(proxyImageUrl(item.gridThumbUrl || item.url, 720));
      item.gridThumbCandidates = dedupeUrlList(item.gridThumbCandidates);
      item.gridThumbUrl = item.gridThumbCandidates[0] || "";

      item.displayCandidates = dedupeUrlList([
        "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600",
        "https://drive.google.com/thumbnail?id=" + id + "&sz=w1280",
        "https://drive.google.com/uc?export=view&id=" + id,
        "https://drive.google.com/uc?export=download&id=" + id,
        "https://lh3.googleusercontent.com/d/" + id + "=w1600",
        item.thumbnail,
        item.url
      ].filter(Boolean));
      item.displayCandidates.push(proxyImageUrl(item.displayCandidates[0] || item.url, 1400));
      item.displayCandidates = dedupeUrlList(item.displayCandidates);
      item.displayUrl = item.displayCandidates[0] || item.url;
    } else {
      var main = item.url;
      var thumb = item.thumbnail && item.thumbnail !== main ? item.thumbnail : "";
      var gridMain = unsplashResize(main, 900);
      item.gridThumbCandidates = dedupeUrlList([thumb, gridMain, main, proxyImageUrl(main, 800)]);
      item.gridThumbUrl = item.gridThumbCandidates[0] || main;
      item.displayCandidates = dedupeUrlList([main, thumb, unsplashResize(main, 1600), proxyImageUrl(main, 1600)]);
      item.displayUrl = main;
    }

    return item;
  }

  function sortMedia(a, b) {
    var sa = Number(a.sortOrder || 0);
    var sb = Number(b.sortOrder || 0);
    if (sa !== sb) return sa - sb;
    return (b.createdAtTs || 0) - (a.createdAtTs || 0);
  }

  function ensureGalleryImageFallbackHandler() {
    if (window.SHUDH_handleGalleryImageError) return;
    window.SHUDH_handleGalleryImageError = function (img) {
      if (!img) return;
      var raw = img.getAttribute("data-fallback-srcs") || "";
      var list = raw ? raw.split("||").filter(Boolean) : [];
      var idx = Number(img.getAttribute("data-fallback-index") || 0);
      var next = idx + 1;
      if (next < list.length) {
        img.setAttribute("data-fallback-index", String(next));
        img.src = list[next];
        return;
      }
      if (img.getAttribute("data-soft-fail") === "1") {
        img.classList.add("gallery-img--failed");
        img.style.opacity = "0.45";
        img.style.minHeight = img.getAttribute("data-min-h") || "120px";
        img.style.background = "linear-gradient(145deg, rgba(228,227,215,.85), rgba(239,238,227,.95))";
        img.removeAttribute("src");
        return;
      }
      var inModal = img.closest && img.closest("#shudh-gallery-photo-modal");
      if (inModal) {
        img.style.opacity = "0.4";
        img.alt = "Unable to load this image";
        return;
      }
      img.removeAttribute("src");
      img.setAttribute("data-lazy-loaded", "1");
      img.classList.add("gallery-img--failed");
      img.alt = (img.getAttribute("alt") || "Gallery photo") + " (unavailable)";
      img.style.minHeight = "140px";
      img.style.background = "linear-gradient(145deg, rgba(228,227,215,.85), rgba(239,238,227,.95))";
    };
  }

  function initLazyGalleryImages(root) {
    if (!root) return;
    var imgs = Array.prototype.slice.call(root.querySelectorAll("img[data-lazy-gallery='1']"));
    if (!imgs.length) return;

    function loadNow(img) {
      if (!img || img.getAttribute("data-lazy-loaded") === "1") return;
      var src = img.getAttribute("data-src") || "";
      if (!src) return;
      img.setAttribute("data-lazy-loaded", "1");
      img.src = src;
      img.addEventListener(
        "load",
        function onImgLoad() {
          img.removeEventListener("load", onImgLoad);
          scheduleScrollTriggerRefresh();
        },
        { once: true }
      );
    }

    if (!("IntersectionObserver" in window)) {
      imgs.forEach(loadNow);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          loadNow(entry.target);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "420px 0px", threshold: 0.01 }
    );

    imgs.forEach(function (img, idx) {
      if (idx < 2) loadNow(img);
      else io.observe(img);
    });
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

  function applyVideoModalPlayerSizing(host, w, h) {
    if (!host || !w || !h) return;
    var rw = Number(w);
    var rh = Number(h);
    if (!(rw > 0) || !(rh > 0)) return;
    var r = rw / rh;
    host.style.boxSizing = "border-box";
    host.style.overflow = "hidden";
    host.style.marginLeft = "auto";
    host.style.marginRight = "auto";
    host.style.aspectRatio = rw + " / " + rh;
    if (r >= 1) {
      host.style.width = "100%";
      host.style.maxWidth = "100%";
      host.style.height = "auto";
      host.style.maxHeight = "70vh";
    } else {
      host.style.width = "min(100%, calc(70vh * " + rw + " / " + rh + "))";
      host.style.height = "auto";
      host.style.maxHeight = "70vh";
      host.style.maxWidth = "100%";
    }
  }

  function isYoutubeGeneratedThumbSrc(src) {
    return /img\.youtube\.com\/vi\//i.test(String(src || ""));
  }

  function wireVideoCardPosterAspects(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll(".video-card img").forEach(function (img) {
      function pushAspectToCardButton(nw, nh) {
        if (!nw || !nh) return;
        var card = img.closest(".video-card");
        var btn = card && card.querySelector("[data-video-open]");
        if (!btn || btn.getAttribute("data-video-aspect-locked") === "1") return;
        var s = simplifyRatio(nw, nh);
        btn.setAttribute("data-video-aspect-w", String(s.w));
        btn.setAttribute("data-video-aspect-h", String(s.h));
      }
      function sync() {
        if (!img.naturalWidth || !img.naturalHeight) return;
        var src = img.getAttribute("src") || "";
        if (isYoutubeGeneratedThumbSrc(src)) {
          var yid = youtubeVideoIdFromThumbSrc(src);
          if (!yid) return;
          probeYoutubeThumbnailAspect(yid, function (dim) {
            if (!dim) return;
            pushAspectToCardButton(dim.w, dim.h);
          });
          return;
        }
        pushAspectToCardButton(img.naturalWidth, img.naturalHeight);
      }
      if (img.complete) sync();
      else img.addEventListener("load", sync, { once: true });
    });
  }

  function resolvePlaybackAspect(launcher, url) {
    var lw = parseInt(launcher.getAttribute("data-video-aspect-w"), 10);
    var lh = parseInt(launcher.getAttribute("data-video-aspect-h"), 10);
    if (lw > 0 && lh > 0) return simplifyRatio(lw, lh);
    var card = launcher.closest(".video-card");
    var img = card && card.querySelector("img");
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      var src = img.getAttribute("src") || "";
      if (!isYoutubeGeneratedThumbSrc(src)) {
        return simplifyRatio(img.naturalWidth, img.naturalHeight);
      }
    }
    var fromUrl = defaultAspectFromVideoUrl(url);
    if (fromUrl) return fromUrl;
    return { w: 16, h: 9 };
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
    ensureGalleryImageFallbackHandler();
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
        photos = photos.map(function (m) {
          if (!m.displayCandidates || !m.displayCandidates.length) {
            m.displayCandidates = [m.url].filter(Boolean);
          }
          m.displayCandidates = dedupeUrlList(m.displayCandidates);
          m.displayUrl = m.displayCandidates[0] || m.url;
          if (!m.gridThumbCandidates || !m.gridThumbCandidates.length) {
            m.gridThumbCandidates = dedupeUrlList([m.thumbnail, m.url].filter(Boolean));
            m.gridThumbUrl = m.gridThumbCandidates[0] || m.displayUrl;
          } else {
            m.gridThumbCandidates = dedupeUrlList(m.gridThumbCandidates);
            m.gridThumbUrl = m.gridThumbCandidates[0] || m.displayUrl;
          }
          return m;
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
        var currentViewItems = photos.slice();
        var galleryModalIndex = 0;

        function ensurePhotoModal() {
          var modal = document.getElementById("shudh-gallery-photo-modal");
          if (modal) return modal;
          modal = document.createElement("div");
          modal.id = "shudh-gallery-photo-modal";
          modal.className = "hidden fixed inset-0 z-[145] bg-black/86 backdrop-blur-md p-3 sm:p-4 md:p-6 items-center justify-center";
          modal.innerHTML =
            '<div class="relative w-full max-w-6xl max-h-[92vh] flex flex-col items-center justify-center">' +
            '<button type="button" data-gallery-close class="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-10 h-10 rounded-full bg-black/55 border border-white/25 text-white hover:bg-black/72">' +
            '<span class="material-symbols-outlined">close</span></button>' +
            '<button type="button" data-gallery-prev class="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/55 border border-white/25 text-white hover:bg-black/72">' +
            '<span class="material-symbols-outlined">chevron_left</span></button>' +
            '<button type="button" data-gallery-next class="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/55 border border-white/25 text-white hover:bg-black/72">' +
            '<span class="material-symbols-outlined">chevron_right</span></button>' +
            '<img data-gallery-modal-image src="" alt="Gallery photo" class="max-w-full max-h-[80vh] rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.55)]" />' +
            '<div class="mt-3 px-2 text-center text-white/90 text-sm sm:text-base" data-gallery-modal-title></div>' +
            "</div>";
          document.body.appendChild(modal);
          return modal;
        }

        function openGalleryModalAt(index) {
          if (!currentViewItems.length) return;
          var modal = ensurePhotoModal();
          var img = modal.querySelector("[data-gallery-modal-image]");
          var title = modal.querySelector("[data-gallery-modal-title]");
          galleryModalIndex = Math.max(0, Math.min(index, currentViewItems.length - 1));
          var item = currentViewItems[galleryModalIndex];
          if (img) {
            img.style.opacity = "";
            var modalCands = (item.displayCandidates && item.displayCandidates.length
              ? item.displayCandidates
              : [item.displayUrl || item.url]).map(function (x) {
              return String(x || "").replace(/\|/g, "");
            }).filter(Boolean);
            img.setAttribute("data-fallback-srcs", modalCands.join("||").replace(/"/g, "&quot;"));
            img.setAttribute("data-fallback-index", "0");
            img.onerror = function () {
              if (window.SHUDH_handleGalleryImageError) window.SHUDH_handleGalleryImageError(img);
            };
            img.src = String(item.displayUrl || modalCands[0] || "");
          }
          if (title) title.textContent = String(item.title || "Shudh India Catering Event");
          modal.classList.remove("hidden");
          modal.classList.add("flex");
          document.body.style.overflow = "hidden";
        }

        function moveGalleryModal(step) {
          if (!currentViewItems.length) return;
          var nextIdx = galleryModalIndex + step;
          if (nextIdx < 0) nextIdx = currentViewItems.length - 1;
          if (nextIdx >= currentViewItems.length) nextIdx = 0;
          openGalleryModalAt(nextIdx);
        }

        function closeGalleryModal() {
          var modal = document.getElementById("shudh-gallery-photo-modal");
          if (!modal) return;
          modal.classList.add("hidden");
          modal.classList.remove("flex");
          document.body.style.overflow = "";
        }

        function bindGalleryModalControls() {
          var modal = ensurePhotoModal();
          if (!modal || modal.getAttribute("data-bound") === "1") return;
          modal.setAttribute("data-bound", "1");
          var closeBtn = modal.querySelector("[data-gallery-close]");
          var prevBtn = modal.querySelector("[data-gallery-prev]");
          var nextBtn = modal.querySelector("[data-gallery-next]");
          if (closeBtn) closeBtn.addEventListener("click", closeGalleryModal);
          if (prevBtn) prevBtn.addEventListener("click", function () { moveGalleryModal(-1); });
          if (nextBtn) nextBtn.addEventListener("click", function () { moveGalleryModal(1); });
          modal.addEventListener("click", function (e) {
            if (e.target === modal) closeGalleryModal();
          });
          document.addEventListener("keydown", function (e) {
            if (modal.classList.contains("hidden")) return;
            if (e.key === "Escape") closeGalleryModal();
            if (e.key === "ArrowLeft") moveGalleryModal(-1);
            if (e.key === "ArrowRight") moveGalleryModal(1);
          });
        }

        function renderCards(active) {
          var items = active === "all"
            ? photos
            : photos.filter(function (x) { return x.category === active; });
          currentViewItems = items.slice();
          if (!items.length) {
            return '<div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">No photos in this category yet.</div>';
          }
          return (
            '<div class="shudh-masonry-grid">' +
            items
              .map(function (m) {
                var openIdx = currentViewItems.findIndex(function (x) {
                  return x.id === m.id;
                });
                var fallbackSrcs = (m.gridThumbCandidates && m.gridThumbCandidates.length
                  ? m.gridThumbCandidates
                  : m.displayCandidates && m.displayCandidates.length
                    ? m.displayCandidates
                    : [m.gridThumbUrl || m.displayUrl])
                  .map(function (x) { return String(x || "").replace(/\|/g, ""); })
                  .filter(Boolean);
                var primarySrc = m.gridThumbUrl || fallbackSrcs[0] || "";
                var fetchAttr = openIdx < 6 ? ' fetchpriority="high"' : "";
                return (
                  '<figure class="shudh-masonry-item" data-gallery-open="' + String(openIdx) + '" style="cursor:zoom-in">' +
                  '<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="' +
                  primarySrc.replace(/"/g, "") +
                  '" alt="' +
                  escapeHtml(m.title || "Gallery photo") +
                  '" loading="' + (openIdx < 8 ? "eager" : "lazy") + '" decoding="async"' + fetchAttr + ' data-fallback-srcs="' +
                  fallbackSrcs.join("||").replace(/"/g, "&quot;") +
                  '" data-fallback-index="0" data-lazy-gallery="1" onerror="window.SHUDH_handleGalleryImageError(this)"/>' +
                  '<figcaption class="shudh-masonry-caption">' +
                  '<span class="shudh-masonry-cat">' +
                  categoryLabel(m.category) +
                  "</span>" +
                  '<span class="shudh-masonry-title">' +
                  escapeHtml(m.title || "Shudh India Catering Event") +
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
        bindGalleryModalControls();
        function bindGalleryImageOpeners() {
          if (!gridHost) return;
          gridHost.querySelectorAll("[data-gallery-open]").forEach(function (node) {
            node.addEventListener("click", function () {
              var idx = Number(node.getAttribute("data-gallery-open") || 0);
              openGalleryModalAt(idx);
            });
          });
        }
        el.querySelectorAll("[data-gallery-cat]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var cat = btn.getAttribute("data-gallery-cat") || "all";
            el.querySelectorAll("[data-gallery-cat]").forEach(function (x) {
              x.classList.remove("active");
            });
            btn.classList.add("active");
            if (gridHost) {
              gridHost.innerHTML = renderCards(cat);
              initLazyGalleryImages(gridHost);
              bindGalleryImageOpeners();
              if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
                window.SHUDH_scheduleScrollRevealImages();
              } else if (typeof window.SHUDH_wireScrollRevealImages === "function") {
                window.setTimeout(window.SHUDH_wireScrollRevealImages, 30);
              }
            }
          });
        });
        if (gridHost) {
          initLazyGalleryImages(gridHost);
          bindGalleryImageOpeners();
        }
        el.classList.remove("hidden");
        if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
          window.SHUDH_scheduleScrollRevealImages();
        } else if (typeof window.SHUDH_wireScrollRevealImages === "function") {
          window.setTimeout(window.SHUDH_wireScrollRevealImages, 40);
        }
      })
      .catch(function () {
        el.innerHTML =
          '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">Unable to load gallery right now. Please try again.</div></div></section>';
        el.classList.remove("hidden");
      })
      .finally(function () {
        hideLoader();
        if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
          window.SHUDH_scheduleScrollRevealImages();
        }
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
    ensureGalleryImageFallbackHandler();
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
            '<div class="shudh-video-modal-stage w-full flex items-center justify-center">' +
            '<div class="shudh-video-modal-player bg-black" data-video-modal-player></div></div></div>';
          document.body.appendChild(modal);
          function closeModal() {
            var host = modal.querySelector("[data-video-modal-player]");
            if (host) {
              host.innerHTML = "";
              host.removeAttribute("style");
            }
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
        function encAttr(s) {
          return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;");
        }
        function videoOpenAspectAttrs(m) {
          var asp = m.videoAspect;
          var hint = asp || defaultAspectFromVideoUrl(m.url || "");
          if (!hint) return "";
          var locked = asp ? " data-video-aspect-locked=\"1\"" : "";
          return (
            " data-video-aspect-w=\"" +
            encAttr(String(hint.w)) +
            "\" data-video-aspect-h=\"" +
            encAttr(String(hint.h)) +
            "\"" +
            locked
          );
        }
        function bindVideoLaunchers() {
          function openFromLauncher(launcher) {
            var url = launcher.getAttribute("data-video-url") || "";
            var title = launcher.getAttribute("data-video-title") || "Video";
            var drive = launcher.getAttribute("data-video-drive") || "";
            var modal = ensureVideoModal();
            var titleEl = modal.querySelector("[data-video-modal-title]");
            var host = modal.querySelector("[data-video-modal-player]");
            if (titleEl) titleEl.textContent = title;
            if (host) {
              var ar = resolvePlaybackAspect(launcher, url);
              applyVideoModalPlayerSizing(host, ar.w, ar.h);
              host.innerHTML = renderVideoPlayer(url, title, drive, "click");

              var locked = launcher.getAttribute("data-video-aspect-locked") === "1";
              function refineFromIntrinsicDimensions(nw, nh) {
                if (!nw || !nh || !host.isConnected) return;
                var s = simplifyRatio(nw, nh);
                applyVideoModalPlayerSizing(host, s.w, s.h);
              }

              var vidEl = host.querySelector("video");
              if (vidEl) {
                function onVideoMeta() {
                  refineFromIntrinsicDimensions(vidEl.videoWidth, vidEl.videoHeight);
                }
                if (vidEl.readyState >= 1) onVideoMeta();
                else vidEl.addEventListener("loadedmetadata", onVideoMeta, { once: true });
              } else if (!locked) {
                var ytIdOpen = youtubeVideoIdFromPageUrl(url);
                if (ytIdOpen) {
                  probeYoutubeThumbnailAspect(ytIdOpen, function (dim) {
                    if (!dim || !host.isConnected) return;
                    refineFromIntrinsicDimensions(dim.w, dim.h);
                  });
                }
              }
            }
            modal.classList.remove("hidden");
            modal.classList.add("flex");
          }
          if (el.getAttribute("data-shudh-video-delegation") === "1") return;
          el.setAttribute("data-shudh-video-delegation", "1");
          el.addEventListener("click", function (e) {
            var card = e.target.closest(".video-card");
            if (!card || !el.contains(card)) return;
            var launcher = card.querySelector("[data-video-open]");
            if (!launcher) return;
            openFromLauncher(launcher);
          });
        }
        function thumb(m) {
          return String(m.posterUrl || m.displayUrl || "").trim();
        }
        function thumbImgHtml(url, alt) {
          var u = String(url || "").trim();
          if (!u) return "";
          var pack = buildCoverImageCandidates(u, "card");
          if (!pack.primary) return "";
          return (
            '<img src="' +
            pack.primary.replace(/"/g, "&quot;") +
            '" alt="' +
            alt +
            '" loading="lazy" decoding="async" data-fallback-srcs="' +
            pack.attr +
            '" data-fallback-index="0" data-soft-fail="1" data-min-h="120px" onerror="window.SHUDH_handleGalleryImageError(this)"/>'
          );
        }
        var featured = vids[0];
        var rest = vids.slice(1);
        function renderCard(m) {
          var t = thumb(m);
          return (
            '<div class="video-card">' +
            (t
              ? thumbImgHtml(t, escapeHtml(m.title || "Video thumbnail"))
              : '<div style="width:100%;height:100%;background:#1b1c15"></div>') +
            '<div class="video-overlay"><button type="button" class="play-btn" style="width:52px;height:52px" data-video-open data-video-url="' +
            encAttr(m.url || "") +
            '" data-video-title="' +
            encAttr(m.title || "Video") +
            '" data-video-drive="' +
            encAttr(m.driveId || "") +
            '"' +
            videoOpenAspectAttrs(m) +
            '"><span class="material-symbols-outlined" style="font-size:1.5rem;font-variation-settings:\'FILL\' 1">play_arrow</span></button></div>' +
            '<div class="video-info"><h4 style="font-family:var(--font-headline);font-weight:700;color:#fff;font-size:1rem;margin-bottom:.2rem">' +
            escapeHtml(m.title || "Shudh India Catering Video") +
            '</h4><p style="color:rgba(255,255,255,.7);font-size:.8125rem">' +
            escapeHtml(m.duration || "Watch now") +
            "</p></div></div>"
          );
        }
        el.innerHTML =
          '<section class="section"><div class="section-inner"><div style="margin-bottom:1.5rem"><div class="section-eyebrow">Featured</div><h2 class="section-title">The <span class="accent">Grand</span> Experience</h2></div>' +
          '<div class="video-card" style="aspect-ratio:16/7;border-radius:1.25rem">' +
          (thumb(featured)
            ? thumbImgHtml(thumb(featured), escapeHtml(featured.title || "Featured video"))
            : '<div style="width:100%;height:100%;background:#1b1c15"></div>') +
          '<div class="video-overlay"><button type="button" class="play-btn" data-video-open data-video-url="' +
          encAttr(featured.url || "") +
          '" data-video-title="' +
          encAttr(featured.title || "Video") +
          '" data-video-drive="' +
          encAttr(featured.driveId || "") +
          '"' +
          videoOpenAspectAttrs(featured) +
          '"><span class="material-symbols-outlined" style="font-size:2rem;font-variation-settings:\'FILL\' 1">play_arrow</span></button><p style="color:#fff;font-weight:600;font-size:.9375rem;text-shadow:0 2px 8px rgba(0,0,0,.6)">Watch Full Event Reel</p></div>' +
          '<div class="video-info"><h3 style="font-family:var(--font-headline);font-weight:700;color:#fff;font-size:1.375rem;margin-bottom:.25rem">' +
          escapeHtml(featured.title || "Featured video") +
          '</h3><p style="color:rgba(255,255,255,.7);font-size:.875rem">' +
          escapeHtml(featured.summary || "Shudh India Catering cinematic showcase") +
          "</p></div></div></div></section>" +
          '<section class="section" style="background:var(--color-surface-container-low);padding-top:2rem"><div class="section-inner"><div style="text-align:center;margin-bottom:3rem"><div class="section-eyebrow">More Videos</div><h2 class="section-title" style="text-align:center">Explore Our <span class="accent">Portfolio</span></h2></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.75rem">' +
          (rest.length
            ? rest.map(renderCard).join("")
            : '<div style="grid-column:1/-1" class="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center text-on-surface-variant">Add more videos in admin to fill this section.</div>') +
          "</div></div></section>";
        wireVideoCardPosterAspects(el);
        bindVideoLaunchers();
        el.classList.remove("hidden");
        if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
          window.SHUDH_scheduleScrollRevealImages();
        } else if (typeof window.SHUDH_wireScrollRevealImages === "function") {
          window.setTimeout(window.SHUDH_wireScrollRevealImages, 40);
        }
      })
      .catch(function () {
        el.innerHTML =
          '<section class="section"><div class="section-inner"><div class="rounded-xl border border-outline-variant/20 bg-surface-container-low p-8 text-center text-on-surface-variant">Unable to load videos right now. Please try again.</div></div></section>';
        el.classList.remove("hidden");
      })
      .finally(function () {
        hideLoader();
        if (typeof window.SHUDH_scheduleScrollRevealImages === "function") {
          window.SHUDH_scheduleScrollRevealImages();
        }
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
      var msgEl = document.getElementById("careers-form-msg");
      if (msgEl) {
        msgEl.textContent = "";
        msgEl.classList.remove("shudh-form-feedback-success");
      }
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
      if (msg) {
        msg.textContent = "";
        msg.classList.remove("shudh-form-feedback-success");
      }
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
        showFormToast("error", "Please fill in your name, email, and desired role.");
        return;
      }
      if (!payload.resumeUrl) {
        if (msg) msg.textContent = "Please paste resume link.";
        showFormToast("error", "Please add a resume link (e.g. Google Drive).");
        return;
      }
      showLoader("Submitting application...");
      db.collection("careersApplications")
        .add(payload)
        .then(function () {
          form.reset();
          if (msg) {
            msg.textContent = "";
            msg.classList.remove("shudh-form-feedback-success");
          }
          closeModal();
          showSuccessModal({
            title: "You're all set!",
            body:
              "Thank you for applying to Shudh India Catering. We've received your application and will review it soon.",
            okLabel: "OK"
          });
        })
        .catch(function (err) {
          var errLine = (err && err.message) || "Could not submit application. Please try again.";
          if (msg) {
            msg.textContent = errLine;
            msg.classList.remove("shudh-form-feedback-success");
          }
          showFormToast("error", "Could not submit. Check your connection and try again.");
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
      if (kind === "facebook") {
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 8h3V4h-3c-3.31 0-6 2.69-6 6v2H5v4h3v8h4v-8h4l1-4h-5v-2c0-1.1.9-2 2-2z"/></svg>';
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
      callNumber: "+91-9621051619",
      whatsappNumber: "+91-9621051619",
      facebookUrl: "https://facebook.com/",
      instagramUrl: "https://instagram.com/",
      youtubeUrl: "videos.html"
    };

    function buildItems(cfg) {
      var callRaw = cleanPhone(cfg.callNumber, defaults.callNumber);
      var waRaw = cleanPhone(cfg.whatsappNumber, defaults.whatsappNumber).replace(/^\+/, "");
      return [
      {
        href: ensureUrl(cfg.facebookUrl, defaults.facebookUrl),
        label: "Facebook",
        icon: "facebook",
        cls: "shudh-contact-dock__item--facebook",
        external: true
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
  ensureGalleryImageFallbackHandler();

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
