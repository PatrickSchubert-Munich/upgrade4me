"use strict";

// Schema.org JSON-LD Daten als JavaScript-Objekt
const schemaData = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: "Upgrade4me",
  image: "https://www.upgrade4me.de/assets/logo/logo_450.webp", // Passen Sie die URL an
  description:
    "Professionelle Beratung und Coaching für persönliche Transformation in Sachen Gesundheit, Styling & Typberatung in München",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Frankfurter Ring 247",
    addressLocality: "München",
    postalCode: "80807",
    addressCountry: "DE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "48.186791241688425",
    longitude: "11.607266181458428",
  },
  openingHours: ["nach Vereinbahrung"],
  priceRange: "€€",
  sameAs: [
    "https://www.instagram.com/upgrade4me",
    "https://www.facebook.com/upgrade4me",
    "https://www.linkedin.com/company/upgrade4me",
  ],
  offers: {
    "@type": "Offer",
    price: "599.00",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
  },
  amenityFeature: [
    {
      "@type": "LocationFeatureSpecification",
      name: "Styling Workshops",
      value: true,
    },
    {
      "@type": "LocationFeatureSpecification",
      name: "Personal Coaching",
      value: true,
    },
  ],
  paymentAccepted: ["Cash", "Credit Card", "Debit Card"],
  currenciesAccepted: "EUR",
  email: "upgrade4me@outlook.de",
  url: "https://www.upgrade4-me.de",
  areaServed: ["München", "Bayern"],
  keywords:
    "Styling, Typberatung, Make-up, Beauty, Gesundheit, Fitness, Ernährung, Transformation, Beratung, Coaching, Workshop",
};

// Funktion zum Einfügen des Schema-Markups in den Head
function insertSchemaMarkup() {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(schemaData);
  document.head.appendChild(script);
}

// Schema-Markup einfügen, wenn das DOM geladen ist
document.addEventListener("DOMContentLoaded", insertSchemaMarkup);
