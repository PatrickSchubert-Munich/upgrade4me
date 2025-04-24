"use strict";
import "./scripts/workers/sw_registration.js";

// Async IIFE für die Firebase-Initialisierung
(async () => {
  try {
    // Firebase Module importieren
    const { initializeApp } = await import("firebase/app");
    const { getFirestore } = await import("firebase/firestore");
    const { getFunctions } = await import("firebase/functions");

    // Firebase Konfiguration
    const firebaseConfig = {
      projectId: "upgrade4me-7a4f0",
      // Weitere Konfigurationsoptionen hier...
    };

    // Firebase initialisieren
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const functions = getFunctions(app, "europe-west3");

    // Entwicklungsmodus: Emulatoren initialisieren
    if (process.env.NODE_ENV === "development") {
      const { initializeFirebaseEmulators } = await import(
        "./config/firebase-config"
      );
      await initializeFirebaseEmulators(app, db, functions);
    }

    // Firebase Instanzen global verfügbar machen (optional)
    window.firebaseApp = app;
    window.firebaseDb = db;
    window.firebaseFunctions = functions;
  } catch (error) {
    console.error("Firebase Initialisierungsfehler:", error, {
      umgebung: process.env.NODE_ENV,
      zeitstempel: new Date().toISOString(),
    });
  }
})();

// import css files
import "./styles/components.css";
import "./styles/fonts.css";
import "./styles/footer.css";
import "./styles/global.css";
import "./styles/nav.css";
import "./styles/section.css";
import "./styles/media.css";

// import js files
import "./scripts/modules/accordion.js";
import "./scripts/modules/bg_company.js";
import "./scripts/modules/bg_location.js";
import "./scripts/modules/calendar.js";
import "./scripts/modules/gallery.js";
import "./scripts/modules/gmaps.js";
import "./scripts/modules/modal.js";
import "./scripts/modules/nav.js";
import "./scripts/modules/offline.js";
import "./scripts/modules/parallax.js";
import "./scripts/modules/schema.js";
import "./scripts/modules/send_mail.js";
import "./scripts/modules/team.js";
import "./scripts/modules/video.js";
