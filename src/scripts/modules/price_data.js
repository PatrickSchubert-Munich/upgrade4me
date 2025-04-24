// price_data.js
const PRICE_CONFIG = {
  PRICES: {
    // "2025-02-22": {
    //   price: 399,
    //   originalPrice: 599,
    //   validUntil: "2025-02-21", // Datum einen Tag vor dem Event
    // },
    "2025-04-26": {
      price: 599,
      originalPrice: 599,
      validUntil: "2025-04-25", // Datum einen Tag vor dem Event
    },
  },

  // Testpreise separieren
  TEST_PRICES: {
    "2025-02-22": {
      price: 399,
      originalPrice: 599,
      validUntil: "2025-02-21", // Datum einen Tag vor dem Event
    },
    "2025-04-26": {
      price: 599,
      originalPrice: 599,
      validUntil: "2025-04-25", // Datum einen Tag vor dem Event
    },
  },

  // Hilfsfunktionen für Preisberechnungen
  getPriceForDate(date) {
    return this.PRICES[date]?.price || 599; // Fallback auf Standardpreis
  },

  isSpecialOffer(date) {
    const priceInfo = this.PRICES[date];
    return priceInfo?.price < priceInfo?.originalPrice;
  },
};

// Freeze um unbeabsichtigte Änderungen zu verhindern
Object.freeze(PRICE_CONFIG);

export default PRICE_CONFIG;
