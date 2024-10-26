const CACHE_NAME = "upgrade4me-cache-v1";

// Zu cachende URLs
const URLS_TO_CACHE = [
  "/", // Root-Pfad
  "/index.html",
  "/assets/fonts/Roboto-Regular.woff2",
  "/assets/fonts/Roboto-Medium.woff2",
  "/assets/fonts/Roboto-Bold.woff2",
  "/assets/img/logo.jpg",
  "/styles/fonts.css",
  "/styles/global.css",
  "/styles/nav.css",
  "/styles/section.css",
  "/styles/components.css",
  "/styles/footer.css",
  "/styles/media.css",
  "/scripts/script_nav.js",
  "/scripts/script_video.js",
];

// Debug-Funktion
function logDebug(message, data = null) {
  const debug = true; // Auf false setzen für Produktion
  if (debug) {
    if (data) {
      console.log(`[ServiceWorker Debug] ${message}`, data);
    } else {
      console.log(`[ServiceWorker Debug] ${message}`);
    }
  }
}

// Installation
self.addEventListener("install", (event) => {
  logDebug("Service Worker Installation startet");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        logDebug("Cache geöffnet");

        // URLs einzeln cachen für besseres Debugging
        for (const url of URLS_TO_CACHE) {
          try {
            await cache.add(url);
            logDebug(`Erfolgreich gecacht: ${url}`);
          } catch (error) {
            logDebug(`Fehler beim Cachen von ${url}:`, error);
          }
        }

        await self.skipWaiting();
        logDebug("Installation abgeschlossen");
      } catch (error) {
        logDebug("Cache-Installation fehlgeschlagen:", error);
      }
    })()
  );
});

// Aktivierung
self.addEventListener("activate", (event) => {
  logDebug("Service Worker Aktivierung startet");

  event.waitUntil(
    (async () => {
      try {
        // Cache-Überprüfung
        const cacheKeys = await caches.keys();
        logDebug("Vorhandene Caches:", cacheKeys);

        // Alte Caches löschen
        await Promise.all(
          cacheKeys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              logDebug(`Lösche alten Cache: ${key}`);
              return caches.delete(key);
            })
        );

        // Prüfen des aktiven Caches
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        logDebug(
          "Aktuelle Cache-Einträge:",
          keys.map((k) => k.url)
        );

        await self.clients.claim();
        logDebug("Aktivierung abgeschlossen");
      } catch (error) {
        logDebug("Aktivierung fehlgeschlagen:", error);
      }
    })()
  );
});

// Fetch-Strategie mit verbessertem Debugging
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        // URL-Informationen loggen
        const url = new URL(event.request.url);
        logDebug(`Fetch-Request für: ${url.pathname}`);

        // Cache überprüfen
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          logDebug(`Gefunden im Cache: ${url.pathname}`);
          return cachedResponse;
        }

        logDebug(`Nicht im Cache, lade von Netzwerk: ${url.pathname}`);
        const response = await fetch(event.request);

        // Response-Überprüfung
        if (!response || response.status !== 200 || response.type !== "basic") {
          logDebug(`Ungültige Response für: ${url.pathname}`, {
            status: response.status,
            type: response.type,
          });
          return response;
        }

        // Caching
        try {
          const responseToCache = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, responseToCache);
          logDebug(`Neu gecacht: ${url.pathname}`);
        } catch (error) {
          logDebug(`Fehler beim Cachen von ${url.pathname}:`, error);
        }

        return response;
      } catch (error) {
        logDebug("Fetch fehlgeschlagen:", error);
        throw error;
      }
    })()
  );
});

// Cache-Inspektion Hilfsfunktion
self.addEventListener("message", async (event) => {
  if (event.data === "inspect-cache") {
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      const cacheContent = keys.map((request) => request.url);
      logDebug("Cache-Inhalt:", cacheContent);

      // Sende Ergebnis zurück an Client
      if (event.source) {
        event.source.postMessage({
          type: "cache-content",
          content: cacheContent,
        });
      }
    } catch (error) {
      logDebug("Cache-Inspektion fehlgeschlagen:", error);
    }
  }
});
