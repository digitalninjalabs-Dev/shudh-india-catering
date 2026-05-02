(function () {
  var INDEX_DEFAULTS = {
    heroEyebrow: "shudh india catering",
    heroTitle: "Elevating Culinary Tradition into an <span class=\"italic font-normal\">Art Form</span>",
    heroSubtitle:
      "Crafting bespoke gastronomic experiences for those who settle for nothing less than absolute luxury and heritage.",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuACzG4JOe8DbsPwXuYgRtDTZdpJUKnEn-OVLfmpdDb8v734nOVCRNCV_E2atwE9aTlW8k8qLs3qDTaEN0KEcw_nTeS0mMdWpXvyfJuTsCJxrubbixlUfUs4ZmVLsywoDATiX42iPBxpL16kSuOsm0b0tDdaYswvxCgcO6wsfjUaEqGTHJxmKjaOA5h6RGmJHtV4_n_fPjwrkym3jf_NUJcresSHKyyDIBpJ6UfsEPGlt1VXoA0CZmyfjaMKRpfKBcHtM4VilXUcWqPG",
    heroPrimaryCta: "Get Quote",
    heroSecondaryCta: "View Packages",
    legacyEyebrow: "Our Legacy",
    legacyTitle: "Crafting Culinary Masterpieces Since 2004",
    legacyParagraph1:
      "For over two decades, Shudh India has been at the forefront of the luxury catering industry, transforming events into legendary galas. Our journey began with a single vision: to merge the rich traditions of Indian hospitality with contemporary artisanal excellence.",
    legacyParagraph2:
      "Every plate we serve tells a story of meticulous sourcing, seasonal inspiration, and the unwavering dedication of our master karigars. We don't just cater; we curate atmospheres where every bite is a dialogue between flavor and heritage.",
    legacyValue1: "Authenticity",
    legacyValue2: "Elegance",
    legacyValue3: "Artistry",
    legacyImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmdvW2zJ-ZdtX7y2UdCcJH1iM9NkY0GB-B3yLcwOha2TMYe9qD3AdPmJswQio8UVBuqlw4rtDYnBEaOQjpAJh3enq0hO-y4nBQMZ72y7fqiXChslXwNizeAaOLKow_l84SKKWVTJVnTFXDqjzzIyLqsfrPrwuSIEDm-uVoQVLwfEfHwLNkM8MIU0fmHtGK_0eAAmsQc7ORL2Wy7BRGYSmjYCIINn_DJtsho-KpW_uDI0snQh2r1e-eDQfDTEt7g-HD_blwIl9qH-hq",
    specializationsTitle: "Core Specializations",
    spec1Icon: "celebration",
    spec1Title: "Destination Wedding Catering",
    spec1Description:
      "Seamless luxury across borders, bringing world-class hospitality to your chosen sanctuary.",
    spec1Cta: "Start Planning",
    spec2Icon: "set_meal",
    spec2Title: "Buffet Designing",
    spec2Description:
      "Architectural food landscapes that engage the senses and redefine self-service dining.",
    spec2Cta: "Start Planning",
    spec3Icon: "brush",
    spec3Title: "Food Styling",
    spec3Description:
      "Precision aesthetics where every ingredient is placed with an artist’s steady hand.",
    spec3Cta: "Start Planning",
    signatureTitle: "Signature Experiences",
    videoSectionTitle: "Cinematic Stories",
    videoSectionVideoUrl: "videos.html",
    videoSectionCoverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfKT2QP2QEsMVOpR1f5RmtMvvWwjlVLIDzBsyeBNe9UyzySibVjMnpXxVhVhmxMp_U-SiywmDI58BkqsYfs8awQRWsf1tOSBsL_iMdHbToYilY_XaafHctK8Gnqq46hR7JIfhNApoThdUTHxrI1_TSz6k3gg0iLP8GMbpZH5GiHPmXAerM5Y1KzK2LvU1fwmXd4ZYKHd0jI-Jc-CQWEDXv0GdCMQipccxPCVfS8Z6ZXMbHo_gCWxu15Ks5qaaRPIM3IKIcakDChzie",
    galleryEyebrow: "Visual Anthology",
    galleryTitle: "The Karigari Gallery",
    galleryCtaText: "View All Work",
    leadTitle: "Let's Plan Your Event",
    leadSubtitle:
      "Leave your details, and our event curators will connect with you within 24 hours.",
    leadSubmitText: "Get My Quote",
    leadPrivacyNote:
      "** Your privacy is our priority. We only contact you regarding your event inquiry.",
    footerTagline:
      "Crafting culinary legacies for those who appreciate the finer nuances of Indian hospitality and global artistry.",
    expEyebrow: "Tailored Excellence",
    expTitle: "Culinary <span class=\"accent\">Experiences</span> for Every Occasion",
    expDescription: "Whether it's a dream wedding or a corporate gala, we curate menus that tell your unique story through flavor.",
    expCard1Title: "Wedding Catering",
    expCard1Description: "Grand celebratory menus featuring royal Indian delicacies and contemporary global fusions.",
    expCard1Cta: "Learn More",
    expCard1Image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmQdcwPnEgti_eNwXygB1GjOgVsCuuXvctPNu2oMq889mOsVb7qYZDI13kaykiGLrjs59q6GQNvBI6ylHZl3oKTLY6hEala7q1pqUAM-fdZ2Pw3QBGXMP79tyhBjHioQh7uDoABj3ZfklOmRo8oJ2quC2mKrors2Zh818N_lYoZy0vBuUW59UTSEqnguwE7xOPh7oqILw-NvJUcqvWUHMaQR1-RwBn7Zy2jUqbIrXs2SzTNCUdSyNUZW6NId7wLFEQP3HIm6C-Wt_y",
    expCard2Title: "Private Events",
    expCard2Description: "Bespoke dining experiences for anniversaries, birthdays, and high-profile house parties.",
    expCard2Cta: "Learn More",
    expCard2Image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBX0iNUneTNT20W_3huiLf96Azu0X9_6zHRGXvwDnqMwUc0VdJhi6DGF-vdUCZYoXLxH9FodA5g8Rhyd3wZlPXnh_4Ev_1XjvZgSy3M18H0kAlKQ49OWd0sng5YskuifSVOSfb_0M5ZmekMqG1anfaxd0kyj4p8Ku56x799DbPjLoPwGwqfDW8SMCxBdsgY6VGz_izKfdDcXsKXfXqiTbPlxsDkr6HMj_F_OR5wf81cXaNVZHHi3wZBcBSFPD3aA2Z6NDpEgINh_Wiz",
    expCard3Title: "Corporate Catering",
    expCard3Description: "Efficient and impressive dining solutions for boardroom lunches and corporate galas.",
    expCard3Cta: "Learn More",
    expCard3Image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSqM7uWE28Y94ifoUw762hSgp8ZZvkea0kV5KipOkeWnsAzo6KbVq-2IJGvhdx2sqEN383i9tkM6OamInp0aWtYQ2NiI7dkxGGm8x1CQKt9xK6doe43VV7ybGf2MmsgwrjPLl7ylDvMlg2jNVsTWyP23vbwrM5T7WTgpnp8yyHd90ZGjY6GQhiQXNnkYcXt1xaF1VwwqFAZd6-Gy_TciZBev22U7w5D-oUTSVjfPoQQiwVLYZ76lulgZANVBiHP1lSx_YiefNjhbd",
    signatureFlowEyebrow: "Our Signature Approach",
    signatureFlowTitle: "How We Shape <span class=\"accent\">Unforgettable</span> Events",
    signatureFlowDescription: "A process-led experience designed to feel effortless for hosts and exceptional for every guest.",
    signatureFeatureKicker: "Flagship Events",
    signatureFeatureTitle: "Destination & Grand Celebration Services",
    signatureFeatureImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmQdcwPnEgti_eNwXygB1GjOgVsCuuXvctPNu2oMq889mOsVb7qYZDI13kaykiGLrjs59q6GQNvBI6ylHZl3oKTLY6hEala7q1pqUAM-fdZ2Pw3QBGXMP79tyhBjHioQh7uDoABj3ZfklOmRo8oJ2quC2mKrors2Zh818N_lYoZy0vBuUW59UTSEqnguwE7xOPh7oqILw-NvJUcqvWUHMaQR1-RwBn7Zy2jUqbIrXs2SzTNCUdSyNUZW6NId7wLFEQP3HIm6C-Wt_y",
    signatureStep1Title: "Concept & Menu Story",
    signatureStep1Description: "We align cuisine, guest profile, and event mood into a clear culinary direction.",
    signatureStep1Cta: "Start Planning",
    signatureStep2Title: "Buffet Architecture",
    signatureStep2Description: "Flow-first layout planning with premium counters, thematic styling, and service rhythm.",
    signatureStep2Cta: "View Packages",
    signatureStep3Title: "Final Styling & Service",
    signatureStep3Description: "From plating aesthetics to on-ground execution, every touchpoint is refined and consistent.",
    signatureStep3Cta: "See Gallery",
    quoteEyebrow: "Let's Connect",
    quoteTitle: "Let's Plan Your <span class=\"accent\">Celebration</span>",
    quotePanelTitle: "Let's Plan Your Celebration",
    quotePanelDescription: "Our culinary architects are ready to design your perfect menu. Contact us for a personalized consultation.",
    quoteFormTitle: "Tell us about your event",
    quoteSubmitText: "Get My Quote",
    closingTitleKicker: "WHY SHUDH INDIA",
    closingTitleMain: "Your Trusted Partner for",
    closingTitleAccent: "Premium Events",
    closingContentEyebrow: "Hospitality Promise",
    closingContentTitle: "Designed to Impress, Delivered with",
    closingContentAccent: "Shudh India Precision",
    closingContentDescription: "From first tasting to final service, we combine culinary artistry, disciplined execution, and warm guest care for events that feel effortless and unforgettable.",
    closingCta1: "Book Consultation",
    closingCta2: "See Real Events",
    closingMediaImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYF7HEcqRlHo3OefqAguqYpk49mAMCfNs_PQWSDYHENcLL3-i88BSru-DSjg_7I0_Op0ZIy-BgOlm3b0Xj7M0tbrpZFnBaFXCPCNX1UPY2TJGCPOw_QrWyi9wTtiz4sOZPwfmzwjFnczAbaAFi23Bj8bnMkuLIsS75k7IEtlV-TowMAO8teBLjfLFS1IMpHXveTxL_yl8Xxi5UhH8xiaRWj5P4FBOH_wywDI4ZlGhhcTSGUZGtooksERg-8pVU5mA0175ws8zwLgXg",
    closingPoint1Title: "Quality Assured",
    closingPoint1Description: "Hygiene-first operations and consistently high food standards.",
    closingPoint2Title: "Guest-Centric Service",
    closingPoint2Description: "Attentive on-ground teams that keep service smooth and graceful.",
    closingPoint3Title: "Signature Presentation",
    closingPoint3Description: "Elegant styling that elevates every buffet, plate, and counter.",
    navHome: "Home",
    navGallery: "Gallery",
    navPackages: "Packages",
    navVideos: "Videos",
    navAbout: "About",
    navCareers: "Careers",
    navCta: "Get Quote",
    mobileNavCta: "Get Quote",
    heroStat1Number: "20+",
    heroStat1Label: "Years of Heritage",
    heroStat2Number: "1000+",
    heroStat2Label: "Grand Events",
    heroStat3Number: "50+",
    heroStat3Label: "Master Chefs",
    stripStat1Number: "98%",
    stripStat1Label: "Client Satisfaction",
    stripStat2Number: "5★",
    stripStat2Label: "Google Rating",
    stripStat3Number: "10M+",
    stripStat3Label: "Meals Served",
    stripStat4Number: "150+",
    stripStat4Label: "Signature Dishes",
    visualTitle: "Where Tradition Meets Fine Art",
    visualDescription: "Every dish is a canvas, every event a masterpiece. We don't just serve food; we create memories.",
    visualImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDoRtVTZiICt-sjIzLQgzg-fv3rTmAldI-OuAW1rWNSzEQi3xgGE2YE3nl6NVJBwlO6t7f3d7FDT-FK91D9ujV-ng80uKpZiP3doutBV3wLE7CkbQwsbMsUuAwDAOZM_xR7tD11dJqiAmm1oM53jHn1ti6qc0fZsJxIDKjKtm4vsvF-1fXbOtm7he1ThKbqVNganOxMqk3738esO01nPqnHQyyciUPZoXmthpPRgiAhrsPQQo6l3JoAPvJ79IsgDUjLk-64WjBJVDwS",
    galleryPreviewTitle: "The Artisanal Gallery",
    galleryPreviewCta: "View All →",
    galleryPreviewImages: "",
    quoteCallLabel: "Call Us",
    quoteCallValue: "+91 98765 43210",
    quoteEmailLabel: "Email Us",
    quoteEmailValue: "concierge@shudhindia.com",
    quoteLabelName: "Full Name",
    quoteLabelPhone: "Phone Number",
    quoteLabelEvent: "Event Type",
    quoteLabelGuests: "Expected Guests",
    quoteLabelDate: "Event Date",
    quoteLabelLocation: "Location",
    quoteLabelRequests: "Special Requests",
    quotePlaceholderName: "Your Name",
    quotePlaceholderPhone: "+91 00000 00000",
    quotePlaceholderGuests: "e.g. 200",
    quotePlaceholderLocation: "City / Venue",
    quotePlaceholderRequests: "Any dietary requirements, theme, or special wishes...",
    quoteOption1: "Wedding",
    quoteOption2: "Corporate",
    quoteOption3: "Private Party",
    quoteOption4: "Other",
    footerDescription: "Pioneering the art of Indian catering for over two decades. We combine ancestral recipes with avant-garde presentation.",
    footerLinksTitle: "Quick Links",
    footerSignatureTitle: "Our Signature",
    footerLinkHome: "Home",
    footerLinkGallery: "Gallery",
    footerLinkPackages: "Packages",
    footerLinkVideos: "Videos",
    footerLinkAbout: "About Us",
    footerLinkCareers: "Careers",
    footerTag1: "Aromatic Spices",
    footerTag2: "Farm Fresh",
    footerTag3: "Artisanal Plating",
    footerTag4: "Vegan Friendly",
    footerCert: "View Hygiene Certification",
    footerCallLabel: "Call Us:",
    footerCallValue: "+91 98765 43210",
    footerEmailLabel: "Email:",
    footerEmailValue: "concierge@shudhindia.com",
    footerBottomText: "© 2024 Shudh India Catering. Artisanal Culinary Excellence.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms",
    footerFaq: "FAQ"
  };

  var ABOUT_DEFAULTS = {
    heroEyebrow: "Our Story",
    heroTitle: "About <span class=\"accent\">Us</span>",
    heroSubtitle: "Crafting memorable culinary experiences for over two decades",
    visionLabel: "The Visionary",
    visionName: "Dr. Mala kumari",
    visionRole: "Founder & Managing Director",
    visionImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcnNPxd-ADUYUtlJDqko9HqJKTpJsXpxX3xIgWDDAlNp1cmUmvMtCbBkHkT2-ENRq4Wu6eyQTm-wtAchA3fhUEYoqoAPRgWkXEpcohiMo2xoL50iDSMsAxVJCg0Lgi8TNe_-iqbONEDfWCCv_ezejdia--xxgTh0X_T75vmGin1kjzAVqAV2akwrNkQxW4RtYKLlEcubhkp6_8p5uHicaGSQy-EJfDplXsKMz8sojcL7kNkmjV8OG-Rrk7Ol-u7xguw8NKttVIoKTJ",
    visionQuote:
      "\"We didn't just want to serve food; we wanted to serve memories. My vision for Shudh India was to bring the sanctity of a home-cooked meal into the fast-paced corporate world, without compromising on quality or tradition.\"",
    visionDescription:
      "With over two decades of culinary expertise, Dr. Mala kumari founded Shudh India Catering with a single pot and a thousand dreams. Today, her philosophy of 'Atithi Devo Bhava' (The Guest is God) guides every plate we serve.",
    journeyLabel: "Our",
    journeyTitle: "Timeless Journey",
    journeySubtitle: "We don't just count years; we count the milestones that defined us. Scroll to walk through our history.",
    journeyHighlightLabel: "Est.",
    journeyHighlightYear: "2008",
    journeyHighlightText: "20,000+ Happy Guests",
    journeyItems: JSON.stringify([
      { step: "01", title: "2008: The Foundation", description: "Shudh India starts as a small kitchen in Uttar Pradesh serving 50 tiffins a day. Our mission was simple: Pure, Sattvic food that nourishes the soul.", tag: "Humble Beginnings" },
      { step: "02", title: "2012: The Breakthrough", description: "We bridged the gap between traditional taste and corporate efficiency. Major multinationals trusted us to fuel their workforce with hygiene and punctuality.", tag: "First Corporate Contract" },
      { step: "03", title: "2016: Innovation", description: "Opened our state-of-the-art central kitchen. Introduced automated roti makers and eco-friendly packaging to meet growing demand.", tag: "Technological Leap" },
      { step: "04", title: "2020: Resilience", description: "During global challenges, we set the benchmark for hygiene, introducing 'Touch-Free Buffet' systems for essential workers.", tag: "Safety First" },
      { step: "05", title: "Today: The Grand Scale", description: "Experience isn't just time; it's capacity. Today, our centralized kitchens and logistics network allow us to execute gala events for thousands seamlessly.", tag: "20,000+ Happy Guests" }
    ]),
    pillarsTitle: "The Pillars of Excellence",
    pillarsSubtitle: "Behind every successful event is a dedicated team ensuring perfection.",
    teamCards: JSON.stringify([
      { roleBadge: "HR Manager", name: "Komal Umar", title: "Head of Human Resources", quote: "\"Building a family, not just a workforce. We ensure every staff member carries the values of Shudh India.\"", email: "shudh.hrkomal@gmail.com", phone: "+91 9621051619", image: "https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?auto=format&fit=crop&w=900&q=80" },
      { roleBadge: "Administration", name: "Madhukar Tripathi", title: "Administration", quote: "\"Organization is my strength. From planning workflows to managing operations, I keep everything aligned and on track.\"", email: "madhukartripathi2020@gmail.com", phone: "+91 9151088270", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80" },
      { roleBadge: "Accountant", name: "Sunaina Yadav", title: "Accountant", quote: "\"Accuracy is my craft. From the first entry to the final balance, I ensure financial clarity.\"", email: "yadavsunaina754@gmail.com", phone: "+91 6387343878", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80" },
      { roleBadge: "Team member", name: "Mahima Chaudhary", title: "Team Member", quote: "Dedicated to service excellence and seamless guest experiences.", email: "mahichaudhary.sudh@gmail.com", phone: "+91 9621051620", image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80" }
    ])
  };

  function getPageName() {
    return (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  }

  function safeSetText(selector, value) {
    if (value == null || value === "") return;
    var normalized = String(value).replace(/\bget\s+quate\b/gi, "Get Quote");
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = normalized;
    });
  }

  function safeSetHtml(selector, value) {
    if (value == null || value === "") return;
    document.querySelectorAll(selector).forEach(function (node) {
      node.innerHTML = value;
    });
  }

  function safeSetImage(selector, value) {
    if (value == null || value === "") return;
    document.querySelectorAll(selector).forEach(function (node) {
      if (node && node.tagName === "IMG") node.src = value;
    });
  }

  function safeSetBackgroundImage(selector, value) {
    if (value == null || value === "") return;
    document.querySelectorAll(selector).forEach(function (node) {
      if (node) node.style.backgroundImage = 'url("' + String(value).replace(/"/g, "") + '")';
    });
  }

  function safeSetPlaceholder(selector, value) {
    if (value == null || value === "") return;
    document.querySelectorAll(selector).forEach(function (node) {
      if (node && ("placeholder" in node)) node.placeholder = value;
    });
  }

  function safeSetByAttr(attr, key, value) {
    if (value == null || value === "") return;
    document.querySelectorAll("[" + attr + '="' + key + '"]').forEach(function (node) {
      if (attr === "data-shudh-image" && node.tagName === "IMG") node.src = value;
      else if (attr === "data-shudh-link") {
        if (node.tagName === "A") node.href = value;
        else node.setAttribute("data-href", value);
      }
      else if (attr === "data-shudh-html") node.innerHTML = value;
      else node.textContent = value;
    });
  }

  function mergeWithDefaults(defaults, source) {
    var merged = Object.assign({}, defaults || {});
    Object.keys(source || {}).forEach(function (k) {
      var incoming = source[k];
      if (incoming == null) return;
      if (typeof incoming === "string" && incoming.trim() === "") return;
      merged[k] = incoming;
    });
    return merged;
  }

  function safeParseJsonArray(raw) {
    try {
      var parsed = JSON.parse(String(raw || "[]"));
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderGalleryPreviewGrid(rawUrls) {
    var root = document.querySelector(".home-gallery-grid");
    if (!root) return;

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

    function optimizedGallerySrc(url) {
      var raw = String(url || "").trim();
      var driveId = getDriveFileId(raw);
      // Use Drive thumbnail endpoint for faster first paint than full-res file endpoint.
      if (driveId) return "https://drive.google.com/thumbnail?id=" + driveId + "&sz=w1400";
      return raw;
    }

    var list = String(rawUrls || "")
      .split(/\r?\n/)
      .map(function (x) { return String(x || "").trim(); })
      .filter(Boolean);
    if (!list.length) return;
    root.innerHTML = list.map(function (url, idx) {
      var cls = "";
      if (idx % 5 === 0) cls = "masonry-large";
      else if (idx % 5 === 2) cls = "masonry-wide";
      var loading = idx < 2 ? "eager" : "lazy";
      var priority = idx === 0 ? "high" : (idx < 3 ? "auto" : "low");
      return (
        '<div class="' + cls + '" style="overflow:hidden;border-radius:.75rem">' +
        '<img src="' + optimizedGallerySrc(url).replace(/"/g, "") + '" alt="Gallery preview image" style="width:100%;height:100%;object-fit:cover" loading="' + loading + '" fetchpriority="' + priority + '" decoding="async" onerror="this.closest(\'div\').style.display=\'none\'"/>' +
        "</div>"
      );
    }).join("");
  }

  function applyIndexSelectorContent(content) {
    var textMap = {
      navHome: ".home-nav-home, .home-mnav-home",
      navGallery: ".home-nav-gallery, .home-mnav-gallery",
      navPackages: ".home-nav-packages, .home-mnav-packages",
      navVideos: ".home-nav-videos, .home-mnav-videos",
      navAbout: ".home-nav-about, .home-mnav-about",
      navCareers: ".home-nav-careers, .home-mnav-careers",
      navCta: ".home-nav-cta",
      mobileNavCta: ".home-mnav-cta",
      heroEyebrow: ".home-hero-eyebrow",
      heroSubtitle: ".home-hero__desc",
      heroPrimaryCta: ".home-hero-primary-cta",
      heroSecondaryCta: ".home-hero-secondary-cta",
      heroStat1Number: ".home-hero-stat1-number",
      heroStat1Label: ".home-hero-stat1-label",
      heroStat2Number: ".home-hero-stat2-number",
      heroStat2Label: ".home-hero-stat2-label",
      heroStat3Number: ".home-hero-stat3-number",
      heroStat3Label: ".home-hero-stat3-label",
      stripStat1Number: ".home-strip-stat1-number",
      stripStat1Label: ".home-strip-stat1-label",
      stripStat2Number: ".home-strip-stat2-number",
      stripStat2Label: ".home-strip-stat2-label",
      stripStat3Number: ".home-strip-stat3-number",
      stripStat3Label: ".home-strip-stat3-label",
      stripStat4Number: ".home-strip-stat4-number",
      stripStat4Label: ".home-strip-stat4-label",
      expEyebrow: ".home-exp-eyebrow",
      expDescription: ".home-exp-desc",
      expCard1Title: ".home-exp-card1-title",
      expCard1Description: ".home-exp-card1-desc",
      expCard1Cta: ".home-exp-card1-cta",
      expCard2Title: ".home-exp-card2-title",
      expCard2Description: ".home-exp-card2-desc",
      expCard2Cta: ".home-exp-card2-cta",
      expCard3Title: ".home-exp-card3-title",
      expCard3Description: ".home-exp-card3-desc",
      expCard3Cta: ".home-exp-card3-cta",
      signatureFlowEyebrow: ".home-signature-eyebrow",
      signatureFlowDescription: ".home-signature-desc",
      signatureFeatureKicker: ".home-signature-feature-kicker",
      signatureFeatureTitle: ".home-signature-feature-title",
      signatureStep1Title: ".home-signature-step1-title",
      signatureStep1Description: ".home-signature-step1-desc",
      signatureStep1Cta: ".home-signature-step1-cta",
      signatureStep2Title: ".home-signature-step2-title",
      signatureStep2Description: ".home-signature-step2-desc",
      signatureStep2Cta: ".home-signature-step2-cta",
      signatureStep3Title: ".home-signature-step3-title",
      signatureStep3Description: ".home-signature-step3-desc",
      signatureStep3Cta: ".home-signature-step3-cta",
      visualTitle: ".home-visual-title",
      visualDescription: ".home-visual-desc",
      galleryPreviewCta: ".home-gallery-cta",
      quoteEyebrow: ".home-quote-eyebrow",
      quotePanelTitle: ".home-quote-panel-title",
      quotePanelDescription: ".home-quote-panel-desc",
      quoteCallLabel: ".home-quote-call-label",
      quoteCallValue: ".home-quote-call-value",
      quoteEmailLabel: ".home-quote-email-label",
      quoteEmailValue: ".home-quote-email-value",
      quoteFormTitle: ".home-quote-form-title",
      quoteLabelName: ".home-quote-label-name",
      quoteLabelPhone: ".home-quote-label-phone",
      quoteLabelEvent: ".home-quote-label-event",
      quoteLabelGuests: ".home-quote-label-guests",
      quoteLabelDate: ".home-quote-label-date",
      quoteLabelLocation: ".home-quote-label-location",
      quoteLabelRequests: ".home-quote-label-requests",
      quoteOption1: ".home-quote-option1",
      quoteOption2: ".home-quote-option2",
      quoteOption3: ".home-quote-option3",
      quoteOption4: ".home-quote-option4",
      quoteSubmitText: ".home-quote-submit-text",
      closingTitleKicker: ".home-closing-title-kicker",
      closingTitleAccent: ".home-closing-title-accent",
      closingContentEyebrow: ".home-closing-content-eyebrow",
      closingContentTitle: ".home-closing-content-title",
      closingContentAccent: ".home-closing-content-accent",
      closingContentDescription: ".home-closing-content-desc",
      closingCta1: ".home-closing-cta1",
      closingCta2: ".home-closing-cta2",
      closingPoint1Title: ".home-closing-point1-title",
      closingPoint1Description: ".home-closing-point1-desc",
      closingPoint2Title: ".home-closing-point2-title",
      closingPoint2Description: ".home-closing-point2-desc",
      closingPoint3Title: ".home-closing-point3-title",
      closingPoint3Description: ".home-closing-point3-desc",
      footerDescription: ".home-footer-desc",
      footerLinksTitle: ".home-footer-links-title",
      footerSignatureTitle: ".home-footer-signature-title",
      footerLinkHome: ".home-footer-link-home",
      footerLinkGallery: ".home-footer-link-gallery",
      footerLinkPackages: ".home-footer-link-packages",
      footerLinkVideos: ".home-footer-link-videos",
      footerLinkAbout: ".home-footer-link-about",
      footerLinkCareers: ".home-footer-link-careers",
      footerTag1: ".home-footer-tag1",
      footerTag2: ".home-footer-tag2",
      footerTag3: ".home-footer-tag3",
      footerTag4: ".home-footer-tag4",
      footerCert: ".home-footer-cert",
      footerCallLabel: ".home-footer-call-label",
      footerCallValue: ".home-footer-call-value",
      footerEmailLabel: ".home-footer-email-label",
      footerEmailValue: ".home-footer-email-value",
      footerBottomText: ".home-footer-bottom-text",
      footerPrivacy: ".home-footer-privacy",
      footerTerms: ".home-footer-terms",
      footerFaq: ".home-footer-faq"
    };

    var htmlMap = {
      heroTitle: ".home-hero__title",
      expTitle: ".home-exp-title",
      signatureFlowTitle: ".home-signature-title",
      quoteTitle: ".home-quote-title",
      galleryPreviewTitle: ".home-gallery-title",
      closingTitleMain: ".home-closing-title-main"
    };

    Object.keys(textMap).forEach(function (key) {
      safeSetText(textMap[key], content[key]);
    });
    Object.keys(htmlMap).forEach(function (key) {
      safeSetHtml(htmlMap[key], content[key]);
    });
    renderGalleryPreviewGrid(content.galleryPreviewImages);
    safeSetImage(".home-hero-image", content.heroImage);
    safeSetImage(".home-exp-card1-image", content.expCard1Image);
    safeSetImage(".home-exp-card2-image", content.expCard2Image);
    safeSetImage(".home-exp-card3-image", content.expCard3Image);
    safeSetImage(".home-signature-feature-image", content.signatureFeatureImage);
    safeSetImage(".home-visual-image", content.visualImage);
    safeSetBackgroundImage(".home-closing-signature__media", content.closingMediaImage);
    safeSetPlaceholder(".home-quote-input-name", content.quotePlaceholderName);
    safeSetPlaceholder(".home-quote-input-phone", content.quotePlaceholderPhone);
    safeSetPlaceholder(".home-quote-input-guests", content.quotePlaceholderGuests);
    safeSetPlaceholder(".home-quote-input-location", content.quotePlaceholderLocation);
    safeSetPlaceholder(".home-quote-input-requests", content.quotePlaceholderRequests);
  }

  function applyAboutContent(content) {
    safeSetText(".about-hero-eyebrow", content.heroEyebrow);
    safeSetHtml(".about-hero-title", content.heroTitle);
    safeSetText(".about-hero-subtitle", content.heroSubtitle);
    safeSetText(".about-vision-label", content.visionLabel);
    safeSetText(".about-vision-name", content.visionName);
    safeSetText(".about-vision-role", content.visionRole);
    safeSetText(".about-vision-quote", content.visionQuote);
    safeSetText(".about-vision-description", content.visionDescription);
    safeSetImage(".about-vision-image", content.visionImage);
    safeSetText(".about-journey-label", content.journeyLabel);
    safeSetText(".about-journey-title", content.journeyTitle);
    safeSetText(".about-journey-subtitle", content.journeySubtitle);
    safeSetText(".about-journey-highlight-label", content.journeyHighlightLabel);
    safeSetText(".about-journey-highlight-year", content.journeyHighlightYear);
    safeSetText(".about-journey-highlight-text", content.journeyHighlightText);
    safeSetText(".about-pillars-title", content.pillarsTitle);
    safeSetText(".about-pillars-subtitle", content.pillarsSubtitle);

    var journeyRoot = document.getElementById("about-journey-items-root");
    var journeyItems = safeParseJsonArray(content.journeyItems);
    if (journeyRoot && journeyItems.length) {
      journeyRoot.innerHTML = journeyItems.map(function (item) {
        return (
          '<article class="journey-card journey-item" style="padding:1.35rem">' +
          '<p class="journey-step">' + escapeHtml(item.step) + "</p>" +
          '<h3 style="margin:0 0 .45rem;font-family:var(--font-headline);font-size:1.1rem;font-weight:700">' + escapeHtml(item.title) + "</h3>" +
          '<p style="margin:0 0 .65rem;color:var(--color-on-surface-variant);font-size:.95rem;line-height:1.65">' + escapeHtml(item.description) + "</p>" +
          '<p class="journey-tag">' + escapeHtml(item.tag) + "</p>" +
          "</article>"
        );
      }).join("");
    }

    var teamRoot = document.getElementById("about-team-cards-root");
    var teamCards = safeParseJsonArray(content.teamCards);
    if (teamRoot && teamCards.length) {
      teamRoot.innerHTML = teamCards.map(function (item) {
        var email = escapeHtml(item.email);
        var phone = escapeHtml(item.phone);
        return (
          '<article class="card employee-card" style="padding:1.35rem">' +
          '<div class="employee-card__image-wrap"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml((item.name || "Team Member") + " photo") + '"/></div>' +
          '<p class="employee-role-badge">' + escapeHtml(item.roleBadge) + "</p>" +
          '<h3 style="margin:0 0 .2rem;font-family:var(--font-headline);font-size:1.22rem;font-weight:700">' + escapeHtml(item.name) + "</h3>" +
          '<p style="margin:0 0 .7rem;color:var(--color-on-surface-variant);font-size:.92rem">' + escapeHtml(item.title) + "</p>" +
          '<p class="employee-quote">' + escapeHtml(item.quote) + "</p>" +
          '<p class="employee-contact"><a href="mailto:' + email + '" style="color:var(--color-primary)">' + email + "</a><br/>" +
          '<a href="tel:' + phone.replace(/\s+/g, "") + '" style="color:var(--color-on-surface-variant)">' + phone + "</a></p>" +
          "</article>"
        );
      }).join("");
    }
  }

  function setHomeLoaderVisible(visible) {
    if (!window.SHUDH_LOADER) return;
    if (visible) window.SHUDH_LOADER.show("Loading Excellence");
    else window.SHUDH_LOADER.hide();
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
        if (!loader.classList.contains("is-visible")) shownAt = Date.now();
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

  function applyGlobal(globalContent) {
    safeSetText(".brand-text, .text-2xl.font-serif, .text-2xl.font-headline", globalContent.brandName);
    if (globalContent.contactPhone) {
      safeSetText("[data-shudh='footer-phone']", globalContent.contactPhone);
    }
    if (globalContent.contactCity) {
      safeSetText("[data-shudh='footer-city']", globalContent.contactCity);
    }
  }

  function applyPageContent(pageName, content) {
    if (pageName === "index.html") {
      var merged = mergeWithDefaults(INDEX_DEFAULTS, content || {});
      Object.keys(merged).forEach(function (key) {
        safeSetByAttr("data-shudh-text", key, merged[key]);
        safeSetByAttr("data-shudh-html", key, merged[key]);
        safeSetByAttr("data-shudh-image", key, merged[key]);
        safeSetByAttr("data-shudh-link", key, merged[key]);
      });
      applyIndexSelectorContent(merged);
      return;
    }
    if (pageName === "about.html") {
      applyAboutContent(mergeWithDefaults(ABOUT_DEFAULTS, content || {}));
      return;
    }

    var maps = {
      "packages.html": {
        pageTitle: { type: "html", selector: "main header h1" },
        pageSubtitle: { type: "text", selector: "main header p" }
      },
      "gallery.html": {
        pageTitle: { type: "html", selector: "main header h1" },
        pageSubtitle: { type: "text", selector: "main header p" }
      },
      "videos.html": {
        pageTitle: { type: "html", selector: "main header h1" },
        pageSubtitle: { type: "text", selector: "main header p" }
      },
      "inquiry.html": {
        pageTitle: { type: "html", selector: "main h1" },
        pageSubtitle: { type: "text", selector: "main .lg\\:col-span-5 p.text-lg.text-on-surface-variant.max-w-md" }
      },
      "careers.html": {
        pageTitle: { type: "html", selector: ".page-hero__title" },
        pageSubtitle: { type: "text", selector: ".page-hero__subtitle" }
      }
    };

    var pageMap = maps[pageName];
    if (!pageMap) return;

    Object.keys(pageMap).forEach(function (key) {
      var rule = pageMap[key];
      var value = content[key];
      if (value == null || value === "") return;
      if (rule.type === "text") safeSetText(rule.selector, value);
      if (rule.type === "html") safeSetHtml(rule.selector, value);
      if (rule.type === "image") safeSetImage(rule.selector, value);
    });
  }

  function init() {
    if (!window.SHUDH_CONFIG || !window.SHUDH_CONFIG.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);
    var db = firebase.firestore();

    var pageName = getPageName();
    var pageKey = pageName.replace(".html", "");

    return Promise.all([
      db.collection("siteContent").doc("global").get(),
      db.collection("siteContent").doc(pageKey).get()
    ]).then(function (snaps) {
      var globalDoc = snaps[0];
      var pageDoc = snaps[1];
      if (globalDoc.exists) applyGlobal(globalDoc.data());
      if (pageDoc.exists) applyPageContent(pageName, pageDoc.data());
    });
  }

  function startContentBootLoader() {
    if (window.SHUDH_CONTENT_BOOTSTRAPPED) return;
    window.SHUDH_CONTENT_BOOTSTRAPPED = true;
    window.SHUDH_CONTENT_READY = false;
    ensureGlobalLoader();
    if (!window.SHUDH_CONTENT_LOADER_LOCKED) {
      window.SHUDH_CONTENT_LOADER_LOCKED = true;
    }
    var loaderEl = document.getElementById("shudh-global-loader");
    if (!loaderEl || !loaderEl.classList.contains("is-visible")) {
      setHomeLoaderVisible(true);
    }
  }

  startContentBootLoader();

  document.addEventListener("DOMContentLoaded", function () {
    startContentBootLoader();
    init().catch(function (err) {
      console.error("content load failed", err);
    }).finally(function () {
      window.SHUDH_CONTENT_READY = true;
      document.dispatchEvent(new Event("shudh:content-loaded"));
      if (window.SHUDH_CONTENT_LOADER_LOCKED) {
        window.SHUDH_CONTENT_LOADER_LOCKED = false;
        setHomeLoaderVisible(false);
      }
    });
  });
})();
