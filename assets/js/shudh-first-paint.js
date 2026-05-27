/* Runs synchronously as the first <body> child — before the rest of the page parses — so
   hardcoded HTML never flashes before the loader. */
(function () {
  var path = window.location.pathname || "";
  if (!/\/admin(\/|$)/i.test(path) && /\.html$/i.test(path)) {
    var file = path.split("/").pop() || "";
    var slug = file.replace(/\.html$/i, "").toLowerCase();
    var base = path.slice(0, path.length - file.length);
    var target = slug === "index" || !slug ? "/" : base + slug;
    var next = target + window.location.search + window.location.hash;
    if (next !== path + window.location.search + window.location.hash) {
      window.location.replace(next);
      return;
    }
  }
})();

(function (doc) {
  var root = doc.documentElement;
  root.classList.add("shudh-boot-pending");
  if (doc.getElementById("shudh-global-loader")) return;
  var loader = doc.createElement("div");
  loader.id = "shudh-global-loader";
  loader.className = "shudh-loader-overlay is-visible";
  loader.setAttribute("aria-busy", "true");
  loader.innerHTML =
    '<div class="shudh-loader-card">' +
    '<div class="shudh-loader-logo-wrap">' +
    '<img class="shudh-loader-logo" src="assets/logo/logonew.png" alt="Shudh India Catering" />' +
    "</div>" +
    '<p class="shudh-loader-brand">Shudh India Catering</p>' +
    '<p class="shudh-loader-text"><span data-loader-text>Preparing your experience</span><span class="shudh-loader-dots" aria-hidden="true"><span></span><span></span><span></span></span></p>' +
    "</div>";
  doc.body.appendChild(loader);
})(document);
