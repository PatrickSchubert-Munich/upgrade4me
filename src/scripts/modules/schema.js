"use strict";

// Schema.org JSON-LD Daten als JavaScript-Objekt
const schemaData = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "BeautySalon", "Organization"],
  name: "Upgrade4me",
  image: "https://www.upgrade4me.de/assets/logo/logo_450.webp",
  description:
    "Professionelle Beratung und Coaching für persönliche Transformation in Sachen Gesundheit, Styling & Typberatung in München",
  url: "https://www.upgrade4-me.de",
  sameAs: [
    "https://www.phillipschmitt.de/",
    "https://www.tcm-reginaseiler.de/",
    "https://www.4-secrets.de/",
  ],
  priceRange: "€€",
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: "48.186791241688425",
      longitude: "11.607266181458428",
    },
    geoRadius: "50000",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Upgrade4me Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Personal Coaching",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Styling Beratung",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Typberatung",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Gesundheitsberatung",
        },
      },
    ],
  },
  makesOffer: {
    "@type": "Offer",
    name: "Personal Transformation Workshop",
    price: "599.00",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Frankfurter Ring 247",
    addressLocality: "München",
    postalCode: "80807",
    addressCountry: {
      "@type": "Country",
      name: "DE",
    },
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "48.186791241688425",
    longitude: "11.607266181458428",
  },
};

/**
 * Fügt das Schema.org Markup in den Head ein
 * @throws {Error} Wenn das Markup nicht eingefügt werden kann
 * @returns {void}
 */
function insertSchemaMarkup() {
  try {
    // Prüfen ob bereits ein Schema existiert
    const existingSchema = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingSchema) {
      console.warn("Schema markup already exists, updating content...");
      existingSchema.text = JSON.stringify(schemaData, null, 2);
      return;
    }

    // Neues Schema erstellen
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemaData, null, 2);

    // Einfügen ins Head-Element
    const head = document.head || document.getElementsByTagName("head")[0];
    if (!head) {
      throw new Error("No head element found in document");
    }
    head.appendChild(script);

    if (process.env.NODE_ENV !== "production") {
      console.log("Schema markup successfully inserted");
    }
  } catch (error) {
    console.error("Failed to insert schema markup:", error);
    // In Produktion würden wir den Fehler an einen Error-Tracking-Service senden
  }
}

// Schema-Markup einfügen, wenn das DOM geladen ist
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", insertSchemaMarkup);
} else {
  insertSchemaMarkup();
}

// Export für mögliche Wiederverwendung
export { schemaData, insertSchemaMarkup };
