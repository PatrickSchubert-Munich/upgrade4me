"use strict";

// Cache-Version als Konstante
const CACHE_VERSION = "v2";
const CACHE_NAME = `upgrade4me-cache-${CACHE_VERSION}`;

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker wird von diesem Browser nicht unterstützt");
    return null;
  }

  try {
    // Zuerst alle alten Service Worker-Registrierungen entfernen
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    // Cache leeren
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    );

    // Neuen Service Worker registrieren
    const registration = await navigator.serviceWorker.register(
      "/service_worker.js",
      {
        scope: "/",
        updateViaCache: "none", // Verhindert Cache des Service Workers selbst
      }
    );

    // Update-Logik
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      newWorker?.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          showUpdateDialog(registration);
        }
      });
    });

    // Verbesserte Update-Dialog Funktion
    function showUpdateDialog(registration) {
      const shouldUpdate = confirm(
        "Eine neue Version ist verfügbar. Jetzt aktualisieren?"
      );

      if (shouldUpdate) {
        if (registration.waiting) {
          // Event an den Service Worker senden
          registration.waiting.postMessage({
            type: "SKIP_WAITING",
            version: CACHE_VERSION,
          });
        }

        // Seite erst neu laden, wenn der neue Service Worker aktiviert ist
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      }
    }

    // Debug-Logging im Entwicklungsmodus
    if (process.env.NODE_ENV === "development") {
      if (registration.installing) {
        console.log("Service Worker wird installiert");
      } else if (registration.waiting) {
        console.log("Service Worker wartet auf Aktivierung");
      } else if (registration.active) {
        console.log("Service Worker aktiv");
      }
    }

    return registration;
  } catch (error) {
    console.error("Service Worker Registrierung fehlgeschlagen:", error);
    return null;
  }
}

// Initialisierung
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", registerServiceWorker);
} else {
  registerServiceWorker().catch(console.error);
}
