/**
 * Application service — IPageSeoService equivalent.
 */
(function (global) {
  function PageSeoService(repository) {
    this._repo = repository;
  }

  PageSeoService.prototype.validate = function (dto) {
    return global.SHUDH_PAGE_SEO_VALIDATION.validatePageSeoDto(dto);
  };

  PageSeoService.prototype.getAll = function () {
    return this._repo.list();
  };

  PageSeoService.prototype.getForPage = function (pageKey) {
    var self = this;
    var key = global.SHUDH_SEO_FALLBACK.normalizePageKey(pageKey);
    return self._repo.getByPageKey(key).then(function (record) {
      return global.SHUDH_SEO_FALLBACK.resolveSeo(key, record);
    });
  };

  PageSeoService.prototype.save = function (dto) {
    var validation = this.validate(dto);
    if (!validation.valid) {
      return Promise.reject({ validationErrors: validation.errors });
    }
    var n = validation.normalized;
    var pageKey = global.SHUDH_SEO_FALLBACK.normalizePageKey(dto.pageKey || n.slug);
    return this._repo.upsert({
      docId: dto.docId || n.slug,
      pageName: n.pageName,
      slug: n.slug,
      pageKey: pageKey,
      blogId: dto.blogId || "",
      metaTitle: n.metaTitle,
      metaDescription: n.metaDescription,
      metaKeywords: n.metaKeywords,
      canonicalUrl: n.canonicalUrl
    });
  };

  PageSeoService.prototype.delete = function (slug) {
    return this._repo.remove(slug);
  };

  PageSeoService.prototype.seedDefaults = function () {
    var self = this;
    var map = global.SHUDH_SEO_FALLBACK.FALLBACK_BY_PAGE_KEY;
    var keys = Object.keys(map);
    var chain = Promise.resolve();
    keys.forEach(function (pageKey) {
      chain = chain.then(function () {
        var fb = map[pageKey];
        return self._repo.getBySlug(fb.slug).then(function (existing) {
          if (existing) return null;
          return self._repo.upsert({
            pageName: fb.pageName,
            slug: fb.slug,
            pageKey: pageKey,
            metaTitle: fb.metaTitle,
            metaDescription: fb.metaDescription,
            metaKeywords: fb.metaKeywords || "",
            canonicalUrl: fb.canonicalUrl || ""
          });
        });
      });
    });
    return chain;
  };

  function createService(db) {
    var Repo = global.SHUDH_PAGE_SEO_REPOSITORY.PageSeoRepository;
    return new PageSeoService(new Repo(db));
  }

  global.SHUDH_PAGE_SEO_SERVICE = {
    PageSeoService: PageSeoService,
    createService: createService
  };
})(typeof window !== "undefined" ? window : this);
