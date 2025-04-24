/* eslint-disable linebreak-style */
/* eslint-disable comma-dangle */
/* eslint-disable require-jsdoc */
/* eslint-disable operator-linebreak */
/* eslint-disable no-trailing-spaces */
/* eslint-disable padded-blocks */
/* eslint-disable indent */
/* eslint-disable no-case-declarations */
/* eslint-disable max-len */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-unused-vars */

const CONFIG = {
  // Umgebungskonfigurationen
  ENV: {
    DEVELOPMENT: {
      ORIGINS: [
        "http://localhost:3000",
        "http://localhost:5000",
        "127.0.0.1:3000",
      ],
      DEBUG: true,
    },
    PRODUCTION: {
      ORIGINS: [
        "https://upgrade4-me.de",
        "https://www.upgrade4-me.de",
        "https://upgrade4me-7a4f0.web.app",
      ],
      DEBUG: false,
    },
  },

  // Preiskonfigurationen
  PRICES: {
    "2025-01-25": {
      price: 399, // angebotener Preis
      originalPrice: 599, // originaler Preis
      validUntil: "2025-01-25",
    },
    "2025-02-22": {
      price: 399, // angebotener Preis
      originalPrice: 599, // originaler Preis
      validUntil: "2025-02-22",
    },
    "2025-04-26": {
      price: 599, // angebotener Preis
      originalPrice: 599, // originaler Preis
      validUntil: "2025-04-26",
    },
  },

  TEST_PRICES: {
    // Separate Testpreise
    "2024-12-01": {
      price: 1,
      originalPrice: 599,
    },
  },

  getPrices: function() {
    const isDevelopment = process.env.NODE_ENV !== "development";
    return {
      ...this.PRICES,
      ...(isDevelopment ? this.TEST_PRICES : {}),
    };
  },

  // Rate limit für checkout
  RATE_LIMIT: {
    MAX_CONCURRENT_REQUESTS: 5, // 5 Versuche
    MAX_REQUESTS_PER_SECOND: 1, // 1 Versuch pro Sekunde
    WINDOWS_MS: 10 * 60 * 1000, // 10 Minuten
    MESSAGE: "Zu viele Anfragen, bitte später erneut versuchen",
  },

  // Retry-Konfiguration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 5000,
    BACKOFF_FACTOR: 2,
  },

  // Firestore-Konfiguration
  FIRESTORE: {
    COLLECTION_NAMES: {
      BOOKINGS: "bookings",
      WORKSHOPS: "workshops",
    },
  },

  FIREBASE: {
    FIREBASE_PROJECT_ID: "upgrade4me-7a4f0",
    FIREBASE_REGION: "europe-west3",
  },

  // Sicherheitskonfigurationen
  SECURITY: {
    MAX_TICKETS_PER_ORDER: 10,
    PRICE_TOLERANCE: 0.01,
  },
};

function getEnvironmentConfig() {
  // Möglichkeit zur manuellen Überschreibung
  if (process.env.FORCE_ENV) {
    return process.env.FORCE_ENV === "production"
      ? CONFIG.ENV.PRODUCTION
      : CONFIG.ENV.DEVELOPMENT;
  }

  // Automatische Konfiguration für Cloud Functions
  const isDevelopment = [
    process.env.FUNCTION_NAME,
    process.env.FUNCTION_TARGET,
    process.env.K_SERVICE,
  ].some((env) => env?.includes("local"));

  return isDevelopment ? CONFIG.ENV.DEVELOPMENT : CONFIG.ENV.PRODUCTION;
}

module.exports = {
  CONFIG,
  getEnvironmentConfig,
};
