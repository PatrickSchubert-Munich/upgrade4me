// ShopCardManager.js
import PRICE_CONFIG from "./price_data.js";

export default class ShopCardManager {
  // Constants
  static CONSTANTS = {
    DEFAULT_PRICE: 599,
    CACHE_DURATION: 60000,
    DATE_FORMAT: {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  };

  constructor() {
    // Preisdaten initialisieren mit Fehlerbehandlung
    this.priceData = this.initializePriceData();
    this.priceContainer = document.getElementById("regular-price-container");

    // Frühe Validierung der DOM-Elemente
    if (!this.priceContainer) {
      console.warn(
        "Preis-Container nicht gefunden - Widget möglicherweise nicht verfügbar"
      );
      return;
    }

    this.init();
  }

  initializePriceData() {
    try {
      // Basis-Preisdaten laden
      const baseData = { ...PRICE_CONFIG.PRICES };

      // Testpreise nur in Entwicklungsumgebung hinzufügen
      if (process.env.ENABLE_TEST_PRICES && this.isDevelopment()) {
        return { ...baseData, ...PRICE_CONFIG.TEST_PRICES };
      }

      return baseData;
    } catch (error) {
      console.error("Fehler beim Initialisieren der Preisdaten:", error);
      // Fallback zu Standard-Preisdaten
      return {
        [this.getNextValidDate()]: {
          price: ShopCardManager.CONSTANTS.DEFAULT_PRICE,
          originalPrice: ShopCardManager.CONSTANTS.DEFAULT_PRICE,
        },
      };
    }
  }

  isDevelopment() {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }

  getNextValidDate() {
    // Nächstes verfügbares Datum generieren (3 Monate in der Zukunft)
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return this.formatDateToISO(date);
  }

  formatDateToISO(date) {
    return date.toISOString().split("T")[0];
  }

  getActiveSpecialOffer() {
    try {
      const today = new Date();

      // Durchsuche alle Preise nach aktiven Sonderangeboten
      for (const [date, priceInfo] of Object.entries(this.priceData)) {
        if (!priceInfo || !priceInfo.price || !priceInfo.originalPrice)
          continue;

        const isValid =
          priceInfo.validUntil &&
          new Date(priceInfo.validUntil) > today &&
          priceInfo.price < priceInfo.originalPrice;

        if (isValid) {
          return {
            date: new Date(date),
            ...priceInfo,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Fehler bei der Sonderangebotsprüfung:", error);
      return null;
    }
  }

  hasSpecialOffer() {
    return this.getActiveSpecialOffer() !== null;
  }

  getNextActiveDate() {
    try {
      const heute = new Date();
      heute.setHours(0, 0, 0, 0); // Setze auf Mitternacht für konsistenten Vergleich

      const dates = Object.keys(this.priceData)
        .map((date) => new Date(date))
        .filter((date) => {
          // Filtere ungültige UND vergangene Daten
          return !isNaN(date.getTime()) && date >= heute;
        })
        .sort((a, b) => a - b); // Kürzere Schreibweise für Sortierung

      if (!dates.length) {
        return new Date(this.getNextValidDate());
      }

      return dates[0]; // Erstes Datum ist automatisch das nächste
    } catch (error) {
      console.error(
        "Fehler beim Ermitteln des nächsten aktiven Datums:",
        error
      );
      return new Date(this.getNextValidDate());
    }
  }

  getNextActiveOriginalPrice() {
    try {
      const nearestDate = this.getNextActiveDate();
      const dateString = this.formatDateToISO(nearestDate);

      return (
        this.priceData[dateString]?.originalPrice ||
        ShopCardManager.CONSTANTS.DEFAULT_PRICE
      ); // Fallback-Preis
    } catch (error) {
      console.error(
        "Fehler beim Ermitteln des nächsten aktiven Preises:",
        error
      );
      return CONSTANTS.DEFAULT_PRICE; // Standard-Fallback-Preis
    }
  }

  generatePriceContent() {
    try {
      const specialOffer = this.getActiveSpecialOffer();
      const originalPrice = this.getNextActiveOriginalPrice();

      if (!specialOffer) {
        return `<p class="card-price">${originalPrice}<span>€</span></p>`;
      }

      // Sichere String-Interpolation mit korrekter Preisreihenfolge
      const specialOfferOriginalPrice = Number(specialOffer.originalPrice)
        .toFixed(2)
        .replace(/[<>"/'&]/g, "");
      const specialOfferPrice = Number(specialOffer.price)
        .toFixed(2)
        .replace(/[<>"/'&]/g, "");

      return `
            <div class="price-display">
                <div class="price-main">
                    <p class="card-price card-price--original">statt ${specialOfferOriginalPrice}<span>€</span></p>
                    <p class="card-price card-price--special">${specialOfferPrice}<span>€</span></p>
                </div>
                <p class="special-price-info">
                    ${this.formatDisplayDate(
                      specialOffer.date
                    )} - ${this.formatDisplayDate(
        this.getNextDay(specialOffer.date)
      )}<br>
          * nur solange der Vorrat reicht
                </p>
            </div>`;
    } catch (error) {
      console.error("Fehler beim Generieren der Preisanzeige:", error);
      return `<p class="card-price">599<span>€</span></p>`;
    }
  }

  formatDisplayDate(date) {
    if (!date) return "Datum nicht verfügbar";

    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) throw new Error("Ungültiges Datum");

      return new Intl.DateTimeFormat("de-DE", {
        day: ShopCardManager.CONSTANTS.DATE_FORMAT.day,
        month: ShopCardManager.CONSTANTS.DATE_FORMAT.month,
        year: ShopCardManager.CONSTANTS.DATE_FORMAT.year,
      }).format(dateObj);
    } catch (error) {
      console.error("Fehler beim Formatieren des Datums:", error);
      return "Datum nicht verfügbar";
    }
  }

  getNextDay(date) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }

  updatePrices() {
    if (!this.priceContainer) return;

    try {
      const hasSpecialOffer = this.hasSpecialOffer();

      // Preis-Container-Klassen aktualisieren
      this.priceContainer.className = `price-container${
        hasSpecialOffer ? " has-special-offer" : ""
      }`;

      // Preise aktualisieren
      this.priceContainer.innerHTML = this.generatePriceContent();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Preise:", error);
      // Fallback zu Standard-Preis
      this.priceContainer.innerHTML = `<p class="card-price">${ShopCardManager.CONSTANTS.DEFAULT_PRICE}<span>€</span></p>`;
    }
  }

  init() {
    try {
      this.updatePrices();

      // Styles nur injizieren, wenn nötig
      if (this.hasSpecialOffer()) {
        this.injectStyles();
      }
    } catch (error) {
      console.error("Fehler bei der Initialisierung:", error);
    }
  }

  injectStyles() {
    const styleId = "shop-card-styles";

    // Prüfen ob Styles bereits existieren
    if (document.getElementById(styleId)) return;

    const styles = `
      .price-container.has-special-offer .price-display {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-evenly;
        gap: 0.25rem;
      }

      .price-container.has-special-offer .price-main {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .price-container.has-special-offer .card-price--original {
        color: rgba(42, 48, 103, 1);
        text-decoration: line-through;
        font-size: clamp(1rem, 2vw, 1.25rem);
        opacity: 0.8;
      }

      .price-container.has-special-offer .card-price--special {
        color: rgba(42, 48, 103, 1);
        font-weight: bold;
        font-size: clamp(1.2rem, 2vw, 1.5rem);
      }

      .price-container.has-special-offer .special-price-info {
        font-size: 0.75em;
        margin: 0;
        text-align: left;
        color: #666; 
      }

      @media (max-width: 768px) {
        .price-container.has-special-offer .price-display {
          align-items: center;
          text-align: center;
        }
        
        .price-container.has-special-offer .price-main {
          flex-direction: column;
          gap: 0.25rem;
        }
      }

      @media (max-width: 480px) {
        .price-container.has-special-offer .card-price--original {
          font-size: 0.85em;
        }
        
        .price-container.has-special-offer .card-price--special {
          font-size: 1em;
        }
        
        .price-container.has-special-offer .special-price-info {
          font-size: 0.7em;
        }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  getPriceData() {
    return this.priceData;
  }
}
