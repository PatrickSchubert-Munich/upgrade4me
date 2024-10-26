"use strict";

// Service Worker nur registrieren, wenn er unterstützt wird
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      // Wichtig: Der Pfad muss relativ zur Domain-Wurzel sein
      const registration = await navigator.serviceWorker.register(
        "./scripts/sw.js"
      );

      console.log(
        "Service Worker erfolgreich registriert:",
        registration.scope
      );
    } catch (error) {
      console.error("Service Worker Registrierung fehlgeschlagen:", error);
    }
  } else {
    console.log("Service Worker werden in diesem Browser nicht unterstützt");
  }
}

// Bei Seitenladung registrieren
window.addEventListener("load", registerServiceWorker);
