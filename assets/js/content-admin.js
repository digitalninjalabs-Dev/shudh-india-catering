(function () {
  var DOC_SCHEMAS = {
    global: {
      brandName: "brandName",
      contactPhone: "contactPhone",
      contactCity: "contactCity"
    },
    index: {
      navHome: "homeNavHome",
      navGallery: "homeNavGallery",
      navPackages: "homeNavPackages",
      navVideos: "homeNavVideos",
      navAbout: "homeNavAbout",
      navCareers: "homeNavCareers",
      navCta: "homeNavCta",
      mobileNavCta: "homeMobileNavCta",
      heroEyebrow: "homeHeroEyebrow",
      heroTitle: "homeHeroTitle",
      heroSubtitle: "homeHeroSubtitle",
      heroImage: "homeHeroImage",      heroPrimaryCta: "homeHeroPrimaryCta",
      heroSecondaryCta: "homeHeroSecondaryCta",
      heroStat1Number: "homeHeroStat1Number",
      heroStat1Label: "homeHeroStat1Label",
      heroStat2Number: "homeHeroStat2Number",
      heroStat2Label: "homeHeroStat2Label",
      heroStat3Number: "homeHeroStat3Number",
      heroStat3Label: "homeHeroStat3Label",
      stripStat1Number: "homeStripStat1Number",
      stripStat1Label: "homeStripStat1Label",
      stripStat2Number: "homeStripStat2Number",
      stripStat2Label: "homeStripStat2Label",
      stripStat3Number: "homeStripStat3Number",
      stripStat3Label: "homeStripStat3Label",
      stripStat4Number: "homeStripStat4Number",
      stripStat4Label: "homeStripStat4Label",
      expEyebrow: "homeExpEyebrow",
      expTitle: "homeExpTitle",
      expDescription: "homeExpDesc",
      expCard1Title: "homeExpCard1Title",
      expCard1Description: "homeExpCard1Desc",
      expCard1Cta: "homeExpCard1Cta",
      expCard1Image: "homeExpCard1Image",
      expCard2Title: "homeExpCard2Title",
      expCard2Description: "homeExpCard2Desc",
      expCard2Cta: "homeExpCard2Cta",
      expCard2Image: "homeExpCard2Image",
      expCard3Title: "homeExpCard3Title",
      expCard3Description: "homeExpCard3Desc",
      expCard3Cta: "homeExpCard3Cta",
      expCard3Image: "homeExpCard3Image",
      signatureFlowEyebrow: "homeSignatureFlowEyebrow",
      signatureFlowTitle: "homeSignatureFlowTitle",
      signatureFlowDescription: "homeSignatureFlowDesc",
      signatureFeatureKicker: "homeSignatureFeatureKicker",
      signatureFeatureTitle: "homeSignatureFeatureTitle",
      signatureFeatureImage: "homeSignatureFeatureImage",
      signatureStep1Title: "homeSignatureStep1Title",
      signatureStep1Description: "homeSignatureStep1Desc",
      signatureStep1Cta: "homeSignatureStep1Cta",
      signatureStep2Title: "homeSignatureStep2Title",
      signatureStep2Description: "homeSignatureStep2Desc",
      signatureStep2Cta: "homeSignatureStep2Cta",
      signatureStep3Title: "homeSignatureStep3Title",
      signatureStep3Description: "homeSignatureStep3Desc",
      signatureStep3Cta: "homeSignatureStep3Cta",
      visualTitle: "homeVisualTitle",
      visualDescription: "homeVisualDesc",
      visualImage: "homeVisualImage",
      galleryPreviewTitle: "homeGalleryPreviewTitle",
      galleryPreviewCta: "homeGalleryPreviewCta",
      galleryPreviewImages: "homeGalleryPreviewImages",
      quoteEyebrow: "homeQuoteEyebrow",
      quoteTitle: "homeQuoteTitle",
      quotePanelTitle: "homeQuotePanelTitle",
      quotePanelDescription: "homeQuotePanelDesc",
      quoteCallLabel: "homeQuoteCallLabel",
      quoteCallValue: "homeQuoteCallValue",
      quoteEmailLabel: "homeQuoteEmailLabel",
      quoteEmailValue: "homeQuoteEmailValue",
      quoteFormTitle: "homeQuoteFormTitle",
      quoteLabelName: "homeQuoteLabelName",
      quoteLabelPhone: "homeQuoteLabelPhone",
      quoteLabelEvent: "homeQuoteLabelEvent",
      quoteLabelGuests: "homeQuoteLabelGuests",
      quoteLabelDate: "homeQuoteLabelDate",
      quoteLabelLocation: "homeQuoteLabelLocation",
      quoteLabelRequests: "homeQuoteLabelRequests",
      quotePlaceholderName: "homeQuotePlaceholderName",
      quotePlaceholderPhone: "homeQuotePlaceholderPhone",
      quotePlaceholderGuests: "homeQuotePlaceholderGuests",
      quotePlaceholderLocation: "homeQuotePlaceholderLocation",
      quotePlaceholderRequests: "homeQuotePlaceholderRequests",
      quoteOption1: "homeQuoteOption1",
      quoteOption2: "homeQuoteOption2",
      quoteOption3: "homeQuoteOption3",
      quoteOption4: "homeQuoteOption4",
      quoteSubmitText: "homeQuoteSubmitText",
      closingTitleKicker: "homeClosingTitleKicker",
      closingTitleMain: "homeClosingTitleMain",
      closingTitleAccent: "homeClosingTitleAccent",
      closingContentEyebrow: "homeClosingContentEyebrow",
      closingContentTitle: "homeClosingContentTitle",
      closingContentAccent: "homeClosingContentAccent",
      closingContentDescription: "homeClosingContentDesc",
      closingCta1: "homeClosingCta1",
      closingCta2: "homeClosingCta2",
      closingMediaImage: "homeClosingMediaImage",
      closingPoint1Title: "homeClosingPoint1Title",
      closingPoint1Description: "homeClosingPoint1Desc",
      closingPoint2Title: "homeClosingPoint2Title",
      closingPoint2Description: "homeClosingPoint2Desc",
      closingPoint3Title: "homeClosingPoint3Title",
      closingPoint3Description: "homeClosingPoint3Desc",
      footerDescription: "homeFooterDesc",
      footerLinksTitle: "homeFooterLinksTitle",
      footerSignatureTitle: "homeFooterSignatureTitle",
      footerLinkHome: "homeFooterLinkHome",
      footerLinkGallery: "homeFooterLinkGallery",
      footerLinkPackages: "homeFooterLinkPackages",
      footerLinkVideos: "homeFooterLinkVideos",
      footerLinkAbout: "homeFooterLinkAbout",
      footerLinkCareers: "homeFooterLinkCareers",
      footerTag1: "homeFooterTag1",
      footerTag2: "homeFooterTag2",
      footerTag3: "homeFooterTag3",
      footerTag4: "homeFooterTag4",
      footerCert: "homeFooterCert",
      footerCallLabel: "homeFooterCallLabel",
      footerCallValue: "homeFooterCallValue",
      footerEmailLabel: "homeFooterEmailLabel",
      footerEmailValue: "homeFooterEmailValue",
      footerBottomText: "homeFooterBottomText",
      footerPrivacy: "homeFooterPrivacy",
      footerTerms: "homeFooterTerms",
      footerFaq: "homeFooterFaq"
    },
    about: {
      heroEyebrow: "aboutHeroEyebrow",
      heroTitle: "aboutHeroTitle",
      heroSubtitle: "aboutHeroSubtitle",
      visionLabel: "aboutVisionLabel",
      visionName: "aboutVisionName",
      visionRole: "aboutVisionRole",
      visionImage: "aboutVisionImage",
      visionQuote: "aboutVisionQuote",
      visionDescription: "aboutVisionDescription",
      journeyLabel: "aboutJourneyLabel",
      journeyTitle: "aboutJourneyTitle",
      journeySubtitle: "aboutJourneySubtitle",
      journeyHighlightLabel: "aboutJourneyHighlightLabel",
      journeyHighlightYear: "aboutJourneyHighlightYear",
      journeyHighlightText: "aboutJourneyHighlightText",
      journeyItems: "aboutJourneyItems",
      pillarsTitle: "aboutPillarsTitle",
      pillarsSubtitle: "aboutPillarsSubtitle",
      teamCards: "aboutTeamCards"
    }
  };

  var DEFAULTS = {
    global: {
      brandName: "Shudh India",
      contactPhone: "+91 99999 88888",
      contactCity: "New Delhi, India"
    },
    index: {
      navHome: "Home",
      navGallery: "Gallery",
      navPackages: "Packages",
      navVideos: "Videos",
      navAbout: "About",
      navCareers: "Careers",
      navCta: "Get Quote",
      mobileNavCta: "Get Quote",
      heroEyebrow: "shudh india catering",
      heroImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpDx9uyIMELKzoxjZlM_5ubKOaeuLItQ_jc_telsflSGWbE0oIj79sNCNHFW5WRn3R4G15oU7nVep7uLmKGtaNUajMIQ8Sn-e0ZDWXwJMM8t2qpAfSHSjvsxzCvNuQx_Jx24_0M4Bq_bJ55nSd9y_ysoRCQ8TkHPhAEfSMmPPoysN0Xdpwz7HfvzsPPF5A-mMlGhrQ99fQ2ilApSSWi2Hagjp0jkki08hMEN5wWDcgMCfZu1elP3Ijlo_-jAkYrjjylNTw3QpLvdz2",      heroTitle: "Elevating Culinary Tradition into an <span class=\"italic font-normal\">Art Form</span>",
      heroSubtitle: "Crafting bespoke gastronomic experiences for those who settle for nothing less than absolute luxury and heritage.",
      heroPrimaryCta: "Get Quote",
      heroSecondaryCta: "View Packages",
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
      expEyebrow: "Tailored Excellence",
      expTitle: "Culinary <span class=\"accent\">Experiences</span> for Every Occasion",
      expDescription: "Whether it's a dream wedding or a corporate gala, we curate menus that tell your unique story through flavor.",
      expCard1Title: "Wedding Catering",
      expCard1Description: "Grand celebratory menus featuring royal Indian delicacies and contemporary global fusions.",
      expCard1Cta: "Learn More",
      expCard1Image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmQdcwPnEgti_eNwXygB1GjOgVsCuuXvctPNu2oMq889mOsVb7qYZDI13kaykiGLrjs59q6GQNvBI6ylHZl3oKTLY6hEala7q1pqUAM-fdZ2Pw3QBGXMP79tyhBjHioQh7uDoABj3ZfklOmRo8oJ2quC2mKrors2Zh818N_lYoZy0vBuUW59UTSEqnguwE7xOPh7oqILw-NvJUcqvWUHMaQR1-RwBn7Zy2jUqbIrXs2SzTNCUdSyNUZW6NId7wLFEQP3HIm6C-Wt_y",
      expCard2Title: "Private Events",
      expCard2Description: "Bespoke dining experiences for anniversaries, birthdays, and high-profile house parties.",
      expCard2Cta: "Learn More",
      expCard2Image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX0iNUneTNT20W_3huiLf96Azu0X9_6zHRGXvwDnqMwUc0VdJhi6DGF-vdUCZYoXLxH9FodA5g8Rhyd3wZlPXnh_4Ev_1XjvZgSy3M18H0kAlKQ49OWd0sng5YskuifSVOSfb_0M5ZmekMqG1anfaxd0kyj4p8Ku56x799DbPjLoPwGwqfDW8SMCxBdsgY6VGz_izKfdDcXsKXfXqiTbPlxsDkr6HMj_F_OR5wf81cXaNVZHHi3wZBcBSFPD3aA2Z6NDpEgINh_Wiz",
      expCard3Title: "Corporate Catering",
      expCard3Description: "Efficient and impressive dining solutions for boardroom lunches and corporate galas.",
      expCard3Cta: "Learn More",
      expCard3Image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTSqM7uWE28Y94ifoUw762hSgp8ZZvkea0kV5KipOkeWnsAzo6KbVq-2IJGvhdx2sqEN383i9tkM6OamInp0aWtYQ2NiI7dkxGGm8x1CQKt9xK6doe43VV7ybGf2MmsgwrjPLl7ylDvMlg2jNVsTWyP23vbwrM5T7WTgpnp8yyHd90ZGjY6GQhiQXNnkYcXt1xaF1VwwqFAZd6-Gy_TciZBev22U7w5D-oUTSVjfPoQQiwVLYZ76lulgZANVBiHP1lSx_YiefNjhbd",
      signatureFlowEyebrow: "Our Signature Approach",
      signatureFlowTitle: "How We Shape <span class=\"accent\">Unforgettable</span> Events",
      signatureFlowDescription: "A process-led experience designed to feel effortless for hosts and exceptional for every guest.",
      signatureFeatureKicker: "Flagship Events",
      signatureFeatureTitle: "Destination & Grand Celebration Services",
      signatureFeatureImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmQdcwPnEgti_eNwXygB1GjOgVsCuuXvctPNu2oMq889mOsVb7qYZDI13kaykiGLrjs59q6GQNvBI6ylHZl3oKTLY6hEala7q1pqUAM-fdZ2Pw3QBGXMP79tyhBjHioQh7uDoABj3ZfklOmRo8oJ2quC2mKrors2Zh818N_lYoZy0vBuUW59UTSEqnguwE7xOPh7oqILw-NvJUcqvWUHMaQR1-RwBn7Zy2jUqbIrXs2SzTNCUdSyNUZW6NId7wLFEQP3HIm6C-Wt_y",
      signatureStep1Title: "Concept & Menu Story",
      signatureStep1Description: "We align cuisine, guest profile, and event mood into a clear culinary direction.",
      signatureStep1Cta: "Start Planning",
      signatureStep2Title: "Buffet Architecture",
      signatureStep2Description: "Flow-first layout planning with premium counters, thematic styling, and service rhythm.",
      signatureStep2Cta: "View Packages",
      signatureStep3Title: "Final Styling & Service",
      signatureStep3Description: "From plating aesthetics to on-ground execution, every touchpoint is refined and consistent.",
      signatureStep3Cta: "See Gallery",
      visualTitle: "Where Tradition Meets Fine Art",
      visualDescription: "Every dish is a canvas, every event a masterpiece. We don't just serve food; we create memories.",
      visualImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoRtVTZiICt-sjIzLQgzg-fv3rTmAldI-OuAW1rWNSzEQi3xgGE2YE3nl6NVJBwlO6t7f3d7FDT-FK91D9ujV-ng80uKpZiP3doutBV3wLE7CkbQwsbMsUuAwDAOZM_xR7tD11dJqiAmm1oM53jHn1ti6qc0fZsJxIDKjKtm4vsvF-1fXbOtm7he1ThKbqVNganOxMqk3738esO01nPqnHQyyciUPZoXmthpPRgiAhrsPQQo6l3JoAPvJ79IsgDUjLk-64WjBJVDwS",
      galleryPreviewTitle: "The Artisanal Gallery",
      galleryPreviewCta: "View All →",
      galleryPreviewImages: "",
      quoteEyebrow: "Let's Connect",
      quoteTitle: "Let's Plan Your <span class=\"accent\">Celebration</span>",
      quotePanelTitle: "Let's Plan Your Celebration",
      quotePanelDescription: "Our culinary architects are ready to design your perfect menu. Contact us for a personalized consultation.",
      quoteCallLabel: "Call Us",
      quoteCallValue: "+91 98765 43210",
      quoteEmailLabel: "Email Us",
      quoteEmailValue: "concierge@shudhindia.com",
      quoteFormTitle: "Tell us about your event",
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
      closingMediaImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYF7HEcqRlHo3OefqAguqYpk49mAMCfNs_PQWSDYHENcLL3-i88BSru-DSjg_7I0_Op0ZIy-BgOlm3b0Xj7M0tbrpZFnBaFXCPCNX1UPY2TJGCPOw_QrWyi9wTtiz4sOZPwfmzwjFnczAbaAFi23Bj8bnMkuLIsS75k7IEtlV-TowMAO8teBLjfLFS1IMpHXveTxL_yl8Xxi5UhH8xiaRWj5P4FBOH_wywDI4ZlGhhcTSGUZGtooksERg-8pVU5mA0175ws8zwLgXg",
      closingPoint1Title: "Quality Assured",
      closingPoint1Description: "Hygiene-first operations and consistently high food standards.",
      closingPoint2Title: "Guest-Centric Service",
      closingPoint2Description: "Attentive on-ground teams that keep service smooth and graceful.",
      closingPoint3Title: "Signature Presentation",
      closingPoint3Description: "Elegant styling that elevates every buffet, plate, and counter.",
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
    },
    about: {
      heroEyebrow: "Our Story",
      heroTitle: "About <span class=\"accent\">Us</span>",
      heroSubtitle: "Crafting memorable culinary experiences for over two decades",
      visionLabel: "The Visionary",
      visionName: "Dr. Mala kumari",
      visionRole: "Founder & Managing Director",
      visionImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcnNPxd-ADUYUtlJDqko9HqJKTpJsXpxX3xIgWDDAlNp1cmUmvMtCbBkHkT2-ENRq4Wu6eyQTm-wtAchA3fhUEYoqoAPRgWkXEpcohiMo2xoL50iDSMsAxVJCg0Lgi8TNe_-iqbONEDfWCCv_ezejdia--xxgTh0X_T75vmGin1kjzAVqAV2akwrNkQxW4RtYKLlEcubhkp6_8p5uHicaGSQy-EJfDplXsKMz8sojcL7kNkmjV8OG-Rrk7Ol-u7xguw8NKttVIoKTJ",
      visionQuote: "\"We didn't just want to serve food; we wanted to serve memories. My vision for Shudh India was to bring the sanctity of a home-cooked meal into the fast-paced corporate world, without compromising on quality or tradition.\"",
      visionDescription: "With over two decades of culinary expertise, Dr. Mala kumari founded Shudh India Catering with a single pot and a thousand dreams. Today, her philosophy of 'Atithi Devo Bhava' (The Guest is God) guides every plate we serve.",
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
    }
  };


  function getEl(id) {
    return document.getElementById(id);
  }

  function getVal(id) {
    var el = getEl(id);
    return el ? String(el.value || "").trim() : "";
  }

  function setVal(id, value) {
    var el = getEl(id);
    if (el && value != null) el.value = value;
  }

  function initGalleryImageEditor() {
    var hidden = getEl("homeGalleryPreviewImages");
    var rowsRoot = getEl("homeGalleryPreviewImagesRows");
    var addBtn = getEl("homeGalleryPreviewAddBtn");
    if (!hidden || !rowsRoot || !addBtn) return;

    function syncHiddenFromRows() {
      var vals = Array.prototype.slice.call(rowsRoot.querySelectorAll("input[data-gallery-url]"))
        .map(function (inp) { return String(inp.value || "").trim(); })
        .filter(Boolean);
      hidden.value = vals.join("\n");
    }

    function createRow(url) {
      var row = document.createElement("div");
      row.className = "flex items-center gap-2";
      row.innerHTML =
        '<img data-gallery-thumb src="" alt="Preview" class="w-14 h-14 rounded-lg border border-stone-700/80 object-cover bg-stone-900/60" />' +
        '<input data-gallery-url type="url" placeholder="https://your-image-url.jpg" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<button type="button" class="px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-xs font-semibold">Remove</button>';
      var input = row.querySelector("input[data-gallery-url]");
      var thumb = row.querySelector("img[data-gallery-thumb]");
      var removeBtn = row.querySelector("button");
      if (input) {
        input.value = url || "";
        if (thumb) thumb.src = url || "";
        input.addEventListener("input", function () {
          if (thumb) thumb.src = String(input.value || "").trim();
          syncHiddenFromRows();
        });
      }
      if (removeBtn) {
        removeBtn.addEventListener("click", function () {
          row.remove();
          syncHiddenFromRows();
        });
      }
      rowsRoot.appendChild(row);
    }

    function renderRowsFromHidden() {
      var urls = String(hidden.value || "")
        .split(/\r?\n/)
        .map(function (x) { return String(x || "").trim(); })
        .filter(Boolean);
      rowsRoot.innerHTML = "";
      if (!urls.length) {
        createRow("");
      } else {
        urls.forEach(function (u) { createRow(u); });
      }
      syncHiddenFromRows();
    }

    addBtn.addEventListener("click", function () {
      createRow("");
      syncHiddenFromRows();
    });

    hidden.addEventListener("change", renderRowsFromHidden);
    renderRowsFromHidden();
  }

  function initImagePreviews() {
    var pairs = [
      ["homeHeroImage", "homeHeroImagePreview"],
      ["homeExpCard1Image", "homeExpCard1ImagePreview"],
      ["homeExpCard2Image", "homeExpCard2ImagePreview"],
      ["homeExpCard3Image", "homeExpCard3ImagePreview"],
      ["homeSignatureFeatureImage", "homeSignatureFeatureImagePreview"],
      ["homeVisualImage", "homeVisualImagePreview"],
      ["homeClosingMediaImage", "homeClosingMediaImagePreview"],
      ["aboutVisionImage", "aboutVisionImagePreview"]
    ];
    pairs.forEach(function (pair) {
      var input = getEl(pair[0]);
      var preview = getEl(pair[1]);
      if (!input || !preview) return;
      function sync() {
        preview.src = String(input.value || "").trim();
      }
      input.addEventListener("input", sync);
      sync();
    });
  }

  function safeJsonParseArray(raw) {
    try {
      var parsed = JSON.parse(String(raw || "[]"));
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function initAboutJourneyEditor() {
    var hidden = getEl("aboutJourneyItems");
    var rowsRoot = getEl("aboutJourneyRows");
    var addBtn = getEl("aboutJourneyAddBtn");
    if (!hidden || !rowsRoot || !addBtn) return;

    function toPayload() {
      return Array.prototype.slice.call(rowsRoot.querySelectorAll("[data-about-journey-row]"))
        .map(function (row) {
          return {
            step: String((row.querySelector("[data-field='step']") || {}).value || "").trim(),
            title: String((row.querySelector("[data-field='title']") || {}).value || "").trim(),
            description: String((row.querySelector("[data-field='description']") || {}).value || "").trim(),
            tag: String((row.querySelector("[data-field='tag']") || {}).value || "").trim()
          };
        })
        .filter(function (x) { return x.step || x.title || x.description || x.tag; });
    }

    function syncHidden() {
      hidden.value = JSON.stringify(toPayload());
    }

    function createRow(item) {
      var data = item || {};
      var row = document.createElement("div");
      row.setAttribute("data-about-journey-row", "1");
      row.className = "rounded-xl border border-stone-700/70 bg-stone-950/40 p-3 space-y-2";
      row.innerHTML =
        '<div class="grid grid-cols-1 md:grid-cols-4 gap-2">' +
        '<input data-field="step" placeholder="Step (01)" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<input data-field="title" placeholder="Title" class="w-full bg-stone-800 rounded-xl border-none md:col-span-3" />' +
        '<textarea data-field="description" rows="2" placeholder="Description" class="w-full bg-stone-800 rounded-xl border-none md:col-span-3"></textarea>' +
        '<input data-field="tag" placeholder="Tag" class="w-full bg-stone-800 rounded-xl border-none" />' +
        "</div>" +
        '<div class="flex justify-end"><button type="button" class="px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-xs font-semibold">Remove</button></div>';
      row.querySelector("[data-field='step']").value = data.step || "";
      row.querySelector("[data-field='title']").value = data.title || "";
      row.querySelector("[data-field='description']").value = data.description || "";
      row.querySelector("[data-field='tag']").value = data.tag || "";
      Array.prototype.slice.call(row.querySelectorAll("input,textarea")).forEach(function (el) {
        el.addEventListener("input", syncHidden);
      });
      row.querySelector("button").addEventListener("click", function () {
        row.remove();
        syncHidden();
      });
      rowsRoot.appendChild(row);
    }

    function renderFromHidden() {
      var items = safeJsonParseArray(hidden.value);
      rowsRoot.innerHTML = "";
      if (!items.length) createRow({});
      else items.forEach(createRow);
      syncHidden();
    }

    addBtn.addEventListener("click", function () {
      createRow({});
      syncHidden();
    });
    hidden.addEventListener("change", renderFromHidden);
    renderFromHidden();
  }

  function initAboutTeamEditor() {
    var hidden = getEl("aboutTeamCards");
    var rowsRoot = getEl("aboutTeamRows");
    var addBtn = getEl("aboutTeamAddBtn");
    if (!hidden || !rowsRoot || !addBtn) return;

    function toPayload() {
      return Array.prototype.slice.call(rowsRoot.querySelectorAll("[data-about-team-row]"))
        .map(function (row) {
          return {
            roleBadge: String((row.querySelector("[data-field='roleBadge']") || {}).value || "").trim(),
            name: String((row.querySelector("[data-field='name']") || {}).value || "").trim(),
            title: String((row.querySelector("[data-field='title']") || {}).value || "").trim(),
            quote: String((row.querySelector("[data-field='quote']") || {}).value || "").trim(),
            email: String((row.querySelector("[data-field='email']") || {}).value || "").trim(),
            phone: String((row.querySelector("[data-field='phone']") || {}).value || "").trim(),
            image: String((row.querySelector("[data-field='image']") || {}).value || "").trim()
          };
        })
        .filter(function (x) { return x.roleBadge || x.name || x.title || x.quote || x.email || x.phone || x.image; });
    }

    function syncHidden() {
      hidden.value = JSON.stringify(toPayload());
    }

    function createRow(item) {
      var data = item || {};
      var row = document.createElement("div");
      row.setAttribute("data-about-team-row", "1");
      row.className = "rounded-xl border border-stone-700/70 bg-stone-950/40 p-3 space-y-2";
      row.innerHTML =
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-2">' +
        '<input data-field="roleBadge" placeholder="Role badge" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<input data-field="name" placeholder="Name" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<input data-field="title" placeholder="Title" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<input data-field="image" placeholder="Image URL" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<input data-field="email" placeholder="Email" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<input data-field="phone" placeholder="Phone" class="w-full bg-stone-800 rounded-xl border-none" />' +
        '<textarea data-field="quote" rows="2" placeholder="Quote / description" class="w-full bg-stone-800 rounded-xl border-none md:col-span-2"></textarea>' +
        "</div>" +
        '<div class="flex items-center justify-between gap-2">' +
        '<img data-thumb src="" alt="Preview" class="w-16 h-16 rounded-lg border border-stone-700/80 object-cover bg-stone-900/60" />' +
        '<button type="button" class="px-3 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-xs font-semibold">Remove</button>' +
        "</div>";
      row.querySelector("[data-field='roleBadge']").value = data.roleBadge || "";
      row.querySelector("[data-field='name']").value = data.name || "";
      row.querySelector("[data-field='title']").value = data.title || "";
      row.querySelector("[data-field='quote']").value = data.quote || "";
      row.querySelector("[data-field='email']").value = data.email || "";
      row.querySelector("[data-field='phone']").value = data.phone || "";
      row.querySelector("[data-field='image']").value = data.image || "";
      var thumb = row.querySelector("[data-thumb]");
      if (thumb) thumb.src = data.image || "";
      Array.prototype.slice.call(row.querySelectorAll("input,textarea")).forEach(function (el) {
        el.addEventListener("input", function () {
          if (el.getAttribute("data-field") === "image" && thumb) thumb.src = String(el.value || "").trim();
          syncHidden();
        });
      });
      row.querySelector("button").addEventListener("click", function () {
        row.remove();
        syncHidden();
      });
      rowsRoot.appendChild(row);
    }

    function renderFromHidden() {
      var items = safeJsonParseArray(hidden.value);
      rowsRoot.innerHTML = "";
      if (!items.length) createRow({});
      else items.forEach(createRow);
      syncHidden();
    }

    addBtn.addEventListener("click", function () {
      createRow({});
      syncHidden();
    });
    hidden.addEventListener("change", renderFromHidden);
    renderFromHidden();
  }

  function bindTabs() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-tab-scope]"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-tab-target]"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".cms-panel"));
    if (!tabs.length || !panels.length) return;
    var activeScope = scopes.length ? scopes[0].getAttribute("data-tab-scope") : null;

    function visibleTabs() {
      if (!activeScope) return tabs;
      return tabs.filter(function (btn) {
        return (btn.getAttribute("data-tab-group") || "") === activeScope;
      });
    }

    function setScope(scopeId) {
      activeScope = scopeId;
      scopes.forEach(function (btn) {
        var isActive = btn.getAttribute("data-tab-scope") === scopeId;
        btn.className =
          "cms-scope min-w-[150px] px-5 py-3 rounded-xl text-sm font-bold uppercase tracking-[0.18em] border " +
          (isActive
            ? "border-secondary text-secondary bg-secondary/15 shadow-[0_0_0_1px_rgba(250,204,21,0.22)]"
            : "border-stone-700 text-stone-300 bg-stone-900/50");
      });
      tabs.forEach(function (btn) {
        var group = btn.getAttribute("data-tab-group") || "";
        btn.classList.toggle("hidden", group !== scopeId);
      });
    }

    function activate(id) {
      panels.forEach(function (p) {
        p.classList.toggle("hidden", p.id !== id);
      });
      tabs.forEach(function (btn) {
        if (btn.classList.contains("hidden")) return;
        var active = btn.getAttribute("data-tab-target") === id;
        btn.className =
          "cms-tab px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border " +
          (active
            ? "border-secondary text-secondary bg-secondary/10"
            : "border-stone-700 text-stone-300");
      });
    }

    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activate(btn.getAttribute("data-tab-target"));
      });
    });

    scopes.forEach(function (scopeBtn) {
      scopeBtn.addEventListener("click", function () {
        var scopeId = scopeBtn.getAttribute("data-tab-scope");
        setScope(scopeId);
        var firstTab = visibleTabs()[0];
        if (firstTab) activate(firstTab.getAttribute("data-tab-target"));
      });
    });

    if (scopes.length) {
      setScope(activeScope);
      var firstVisible = visibleTabs()[0];
      if (firstVisible) activate(firstVisible.getAttribute("data-tab-target"));
      return;
    }
    activate(tabs[0].getAttribute("data-tab-target"));
  }

  function applyDocToForm(docKey, data) {
    var schema = DOC_SCHEMAS[docKey];
    if (!schema) return;
    Object.keys(schema).forEach(function (field) {
      var elId = schema[field];
      var val = data && data[field] != null ? data[field] : "";
      setVal(elId, val);
    });
  }

  function collectPayload(docKey) {
    var schema = DOC_SCHEMAS[docKey];
    var fallback = DEFAULTS[docKey] || {};
    var payload = {};
    Object.keys(schema).forEach(function (field) {
      var val = getVal(schema[field]);
      payload[field] = val || fallback[field] || "";
    });
    payload.updatedAt = new Date().toISOString();
    return payload;
  }


  async function init() {
    if (!window.SHUDH_CONFIG || !window.SHUDH_CONFIG.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);
    var db = firebase.firestore();
    bindTabs();
    initGalleryImageEditor();
    initAboutJourneyEditor();
    initAboutTeamEditor();

    var docKeys = Object.keys(DOC_SCHEMAS);
    var snaps = await Promise.all(
      docKeys.map(function (key) {
        return db.collection("siteContent").doc(key).get();
      })
    );

    docKeys.forEach(function (key, idx) {
      var snap = snaps[idx];
      if (snap.exists) applyDocToForm(key, snap.data());
    });
    initImagePreviews();
    var galleryHidden = getEl("homeGalleryPreviewImages");
    if (galleryHidden) galleryHidden.dispatchEvent(new Event("change"));
    var aboutJourneyHidden = getEl("aboutJourneyItems");
    if (aboutJourneyHidden) aboutJourneyHidden.dispatchEvent(new Event("change"));
    var aboutTeamHidden = getEl("aboutTeamCards");
    if (aboutTeamHidden) aboutTeamHidden.dispatchEvent(new Event("change"));

    var form = getEl("contentForm");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var msg = getEl("saveMsg");
      if (msg) msg.textContent = "Saving...";
      try {
        await Promise.all(
          docKeys.map(function (key) {
            return db
              .collection("siteContent")
              .doc(key)
              .set(collectPayload(key), { merge: true });
          })
        );
        if (msg) msg.textContent = "Content updated successfully.";
      } catch (err) {
        if (msg) msg.textContent = "Could not save right now. Please retry.";
        console.error(err);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof firebase === "undefined") return;
    if (!window.SHUDH_CONFIG || !window.SHUDH_CONFIG.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(window.SHUDH_CONFIG.firebase);
    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) return;
      init().catch(function (e) {
        var msg = document.getElementById("saveMsg");
        if (msg) msg.textContent = "Unable to load content config.";
        console.error(e);
      });
    });
  });
})();
