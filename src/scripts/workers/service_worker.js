"use strict";

// Konstanten und Konfiguration
const DEBUG = false;
const CACHE_VERSION = "1.4.3";
const CACHE_NAME = `upgrade4me-cache-v${CACHE_VERSION}`;

// Gruppiere Assets nach Priorität
const CRITICAL_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/datenschutz.html",
  "/impressum.html",
  "/assets/fonts/Roboto-Regular.woff2",
  "/assets/fonts/Roboto-Medium.woff2",
  "/assets/fonts/Roboto-Bold.woff2",
  "/assets/logo/logo_450.webp",
  "/assets/favicon/favicon-16x16.png",
  "/assets/favicon/favicon-32x32.png",
  "/assets/favicon/android-chrome-192x192.png",
  "/assets/favicon/android-chrome-512x512.png",
  "/assets/favicon/apple-touch-icon.png",
];

const IMAGES = [
  "/assets/img/poster_intro.jpg",
  "/assets/img/poster_main.jpg",
  "/assets/img/concept_background.webp",
  "/assets/img/team_background.webp",
  "/assets/img/shop_background.webp",
  "/assets/img/company_background.webp",
  "/assets/img/faq_background.webp",
  "/assets/img/location_background.webp",
  "/assets/img/faq_background.webp",
  "/assets/img/kontakt_background.webp",
  "/assets/img/team_elena.webp",
  "/assets/img/team_mischa.webp",
  "/assets/img/team_phillip.webp",
  "/assets/img/team_regina.webp",
  "/assets/img/shopping_cart_company.webp",
  "/assets/img/shopping_cart_regular.webp",
  "/assets/img/gallery_1.webp",
  "/assets/img/gallery_2.webp",
  "/assets/img/gallery_3.webp",
  "/assets/img/gallery_4.webp",
  "/assets/img/gallery_5.webp",
  "/assets/img/gallery_6.webp",
  "/assets/img/gallery_7.webp",
  "/assets/img/gallery_8.webp",
  "/assets/img/gallery_9.webp",
  "/assets/img/gallery_10.webp",
  "/assets/img/gallery_11.webp",
  "/assets/img/concept_background_medium.webp",
  "/assets/img/team_background_medium.webp",
  "/assets/img/shop_background_medium.webp",
  "/assets/img/company_background_medium.webp",
  "/assets/img/location_background_medium.webp",
  "/assets/img/faq_background_medium.webp",
  "/assets/img/kontakt_background_medium.webp",
  "/assets/img/concept_background_small.webp",
  "/assets/img/team_background_small.webp",
  "/assets/img/shop_background_small.webp",
  "/assets/img/company_background_small.webp",
  "/assets/img/location_background_small.webp",
  "/assets/img/faq_background_small.webp",
  "/assets/img/feedbak_background.webp",
  "/assets/img/faq_background_small.webp",
  "/assets/img/kontakt_background_small.webp",
  "/assets/img/shop_background_very_small.webp",
  "/assets/img/kontakt_termin_vereinbaren.webp",
  "/assets/img/ssl_certificate.webp",
  "/assets/img/four-secrets.webp",
  "/assets/img/personal-coaching.webp",
  "/assets/img/tcm.webp",
];

const VIDEOS = [
  "/assets/video/intro.mp4",
  "/assets/video/intro_wa.mp4",
  "/assets/video/main_wa.mp4",
];

const ASSETS_TO_CACHE = [...CRITICAL_ASSETS, ...IMAGES, ...VIDEOS];

// Cache Strategien als Konstanten
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
};

// Asset Typen und ihre Cache-Strategien
const ASSET_STRATEGIES = {
  CRITICAL: CACHE_STRATEGIES.CACHE_FIRST,
  IMAGES: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  VIDEOS: CACHE_STRATEGIES.NETWORK_FIRST,
};

// Verbesserte Speicher-Schwellwerte
const STORAGE_THRESHOLDS = {
  MINIMUM: 100 * 1024 * 1024, // 100MB
  MEDIUM: 500 * 1024 * 1024, // 500MB
};

// Erweiterte Blocked Domains und Protocols
const BLOCKED_PROTOCOLS = [
  "chrome-extension:",
  "moz-extension:",
  "safari-extension:",
  "edge-extension:",
];

const BLOCKED_DOMAINS = [
  "google-analytics.com",
  "doubleclick.net",
  "facebook.com",
  "google.com",
  "stripe.com",
  "googleapis.com",
  "gstatic.com",
  "firebase.com",
  "emailjs.com",
  "firebaseapp.com",
  "firebaseio.com",
  "firebase-settings.crashlytics.com",
  "cloudflareinsights.com",
];

// Helper für Debugging
async function logDebug(message, data) {
  if (DEBUG) {
    console.log(message, data);
  }
}

// Verbesserte Storage-Prüfung
async function checkStorageAndDevice() {
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      const availableSpace = quota - usage;

      // Logging nur im Development
      if (DEBUG) {
        console.log("Verfügbarer Speicher:", {
          total: quota / 1024 / 1024 + "MB",
          used: usage / 1024 / 1024 + "MB",
          available: availableSpace / 1024 / 1024 + "MB",
        });
      }

      if (availableSpace < STORAGE_THRESHOLDS.MINIMUM || isMobile) {
        return CRITICAL_ASSETS;
      }
      if (availableSpace < STORAGE_THRESHOLDS.MEDIUM) {
        return [...CRITICAL_ASSETS, ...IMAGES];
      }
    }
    return ASSETS_TO_CACHE;
  } catch (error) {
    console.warn("Fehler bei Storage-Prüfung:", error);
    return CRITICAL_ASSETS; // Fallback auf kritische Assets
  }
}

// Verbesserte Cache-Funktion mit Retry-Logik
async function cacheAsset(cache, asset, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(asset);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      await cache.put(asset, response);
      return;
    } catch (error) {
      if (i === retries - 1) {
        console.warn(
          `Failed to cache ${asset} after ${retries} attempts:`,
          error
        );
        return Promise.resolve();
      }
      // Exponentielles Backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}

// Install Event - Optimiert
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const assetsToCache = await checkStorageAndDevice();

        // Paralleles Caching mit Fortschrittsüberwachung
        let completed = 0;
        const total = assetsToCache.length;

        await Promise.all(
          assetsToCache.map(async (asset) => {
            await cacheAsset(cache, asset);
            completed++;

            if (DEBUG) {
              console.log(`Caching progress: ${completed}/${total}`);
            }
          })
        );

        await self.skipWaiting();

        if (DEBUG) {
          console.log(`Caching progress: ${completed}/${total}`);
        }
      } catch (error) {
        console.error("Install failed:", error);
      }
    })()
  );
});

// Verbesserte Aktivierungs-Logik - Alle alten Caches löschen
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Alle alten Caches löschen
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter((name) => {
              // Prüfe auf alte Versionen
              const oldVersionMatch = name.match(
                /upgrade4me-cache-v(\d+\.\d+\.\d+)/
              );
              if (!oldVersionMatch) return true;
              const cacheVersion = oldVersionMatch[1];
              return cacheVersion !== CACHE_VERSION;
            })
            .map((name) => caches.delete(name))
        );

        // Kontrolle übernehmen
        await clients.claim();

        if (DEBUG) {
          console.log("Service Worker aktiviert und alte Caches gelöscht");
        }
      } catch (error) {
        console.error("Activation failed:", error);
      }
    })()
  );
});

// Verbesserte Fetch-Event-Logik mit STW-Strategie
async function handleFetch(request, strategy) {
  const cache = await caches.open(CACHE_NAME);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;
      return fetchAndCache(request, cache);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      try {
        return await fetchAndCache(request, cache);
      } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        throw error;
      }

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      const cachedResult = await cache.match(request);
      const fetchPromise = fetchAndCache(request, cache); // Cache wird später aktualisiert, aber der Request ist schon bearbeitet
      return cachedResult || fetchPromise;

    default:
      return fetchAndCache(request, cache);
  }
}

// Verbesserte Fetch-Event-Behandlung
self.addEventListener("fetch", (event) => {
  // Verbesserte Funktion zum Prüfen von blockierten Requests
  function shouldBlockCaching(request) {
    try {
      const url = new URL(request.url);

      // Protokoll-Check
      if (BLOCKED_PROTOCOLS.includes(url.protocol)) {
        return true;
      }

      // Domain-Check mit effizientem some()
      if (BLOCKED_DOMAINS.some((domain) => url.hostname.includes(domain))) {
        return true;
      }

      // API Endpoints blockieren
      if (url.pathname.includes("/api/")) {
        return true;
      }

      // Stripe-spezifische Pfade blockieren
      if (url.pathname.includes("/stripe/")) {
        return true;
      }

      return false;
    } catch (error) {
      console.warn("URL-Parsing fehlgeschlagen:", error);
      return true; // Im Zweifelsfall blockieren
    }
  }

  // Prüfe auf blockierte Domains und Protocols
  if (shouldBlockCaching(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Nur GET-Requests vom eigenen Origin behandeln
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Bestimme Cache-Strategie basierend auf Request-Typ
        let strategy = CACHE_STRATEGIES.CACHE_FIRST;
        const url = new URL(event.request.url);

        if (url.pathname.startsWith("/assets/video/")) {
          strategy = CACHE_STRATEGIES.NETWORK_FIRST;
        } else if (url.pathname.startsWith("/assets/img/")) {
          strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
        }

        return await handleFetch(event.request, strategy);
      } catch (error) {
        console.error("Fetch failed:", error);

        // Offline-Fallback für Navigation
        if (event.request.mode === "navigate") {
          const offlineResponse = await caches.match("/offline.html");
          if (offlineResponse) return offlineResponse;
        }

        throw error;
      }
    })()
  );
});

// Helper für Fetch und Cache
async function fetchAndCache(request, cache) {
  const response = await fetch(request);

  if (response.status === 200) {
    const isVideo = request.url.endsWith(".mp4");
    if (!isVideo || (await checkStorageAndDevice()) === ASSETS_TO_CACHE) {
      await cache.put(request, response.clone());
    }
  }

  return response;
}
