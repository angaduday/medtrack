const CACHE = "medtrack-v1";
const ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request)).catch(() => caches.match("/index.html"))
  );
});

// Push notification handler
self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "MedTrack", {
      body: data.body || "Time to take your medication.",
      icon: "/manifest.json",
      badge: "/manifest.json",
      tag: data.tag || "medtrack",
      requireInteraction: true,
      actions: [
        { action: "done", title: "Taken" },
        { action: "snooze", title: "Snooze 15 min" }
      ]
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (e.action === "snooze") {
    // Post message to clients to handle snooze
    e.waitUntil(clients.matchAll().then(cs => cs.forEach(c => c.postMessage({ type: "snooze", tag: e.notification.tag }))));
  } else {
    e.waitUntil(clients.openWindow("/"));
  }
});
