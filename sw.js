// Pixel Kart GP - offline cache. Bump VERSION when you update the game
// so phones download the new files.
var VERSION = "pixel-kart-v33";
var FILES = ["./", "index.html", "play.html", "manifest.json",
             "icon-192.png", "icon-512.png", "apple-touch-icon.png",
             "shot-meadow.png", "shot-frost.png",
             "shot-dune.png", "shot-neon.png", "shot-sky.png",
             "shot-lava.png", "shot-coral.png", "shot-crystal.png", "race.mp3"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; })
      .map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
// Network first (so updates arrive), falling back to the cache offline.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") { return; }
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(VERSION).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (m) {
      return m || caches.match("play.html");
    });
  }));
});
