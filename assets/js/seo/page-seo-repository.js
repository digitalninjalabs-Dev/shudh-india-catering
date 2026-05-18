/**
 * Firestore repository for pageSeo collection.
 */
(function (global) {
  var COLLECTION = "pageSeo";

  function getDb() {
    if (!global.firebase || !global.SHUDH_CONFIG || !global.SHUDH_CONFIG.firebase) return null;
    if (!firebase.apps.length) firebase.initializeApp(global.SHUDH_CONFIG.firebase);
    return firebase.firestore();
  }

  function docToEntity(doc) {
    if (!doc || !doc.exists) return null;
    var d = doc.data() || {};
    return {
      id: doc.id,
      pageName: d.pageName || "",
      slug: d.slug || doc.id,
      pageKey: d.pageKey || d.slug || doc.id,
      metaTitle: d.metaTitle || "",
      metaDescription: d.metaDescription || "",
      canonicalUrl: d.canonicalUrl || "",
      updatedAt: d.updatedAt || null
    };
  }

  function PageSeoRepository(db) {
    this._db = db || getDb();
  }

  PageSeoRepository.prototype.list = function () {
    var self = this;
    if (!self._db) return Promise.reject(new Error("Database not available."));
    return self._db
      .collection(COLLECTION)
      .get()
      .then(function (snap) {
        return snap.docs
          .map(docToEntity)
          .filter(Boolean)
          .sort(function (a, b) {
            return String(a.pageName).localeCompare(String(b.pageName));
          });
      });
  };

  PageSeoRepository.prototype.getBySlug = function (slug) {
    var self = this;
    if (!self._db) return Promise.resolve(null);
    var id = String(slug || "").trim();
    if (!id) return Promise.resolve(null);
    return self._db
      .collection(COLLECTION)
      .doc(id)
      .get()
      .then(docToEntity);
  };

  PageSeoRepository.prototype.getByPageKey = function (pageKey) {
    var self = this;
    if (!self._db) return Promise.resolve(null);
    var key = global.SHUDH_SEO_FALLBACK
      ? global.SHUDH_SEO_FALLBACK.normalizePageKey(pageKey)
      : String(pageKey || "index").replace(/\.html$/i, "");
    return self.getBySlug(key).then(function (bySlug) {
      if (bySlug) return bySlug;
      return self._db
        .collection(COLLECTION)
        .where("pageKey", "==", key)
        .limit(1)
        .get()
        .then(function (snap) {
          if (!snap.empty) return docToEntity(snap.docs[0]);
          return null;
        })
        .catch(function () {
          return null;
        });
    });
  };

  PageSeoRepository.prototype.upsert = function (entity) {
    var self = this;
    if (!self._db) return Promise.reject(new Error("Database not available."));
    var slug = String(entity.slug || "").trim();
    if (!slug) return Promise.reject(new Error("Slug is required."));
    var payload = {
      pageName: entity.pageName,
      slug: slug,
      pageKey: entity.pageKey || slug,
      metaTitle: entity.metaTitle,
      metaDescription: entity.metaDescription,
      canonicalUrl: entity.canonicalUrl || "",
      updatedAt: new Date().toISOString()
    };
    return self._db.collection(COLLECTION).doc(slug).set(payload, { merge: true });
  };

  PageSeoRepository.prototype.remove = function (slug) {
    var self = this;
    if (!self._db) return Promise.reject(new Error("Database not available."));
    return self._db.collection(COLLECTION).doc(String(slug || "").trim()).delete();
  };

  global.SHUDH_PAGE_SEO_REPOSITORY = {
    COLLECTION: COLLECTION,
    PageSeoRepository: PageSeoRepository,
    getDb: getDb
  };
})(typeof window !== "undefined" ? window : this);
