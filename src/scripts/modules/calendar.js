import modalManager from "./modal.js";
import Swal from "sweetalert2";
import { checkoutStripe } from "./checkout.js";
import PRICE_CONFIG from "./price_data.js";

class CalendarWidget {
  static CONSTANTS = {
    DEFAULT_PRICE: 599,
    TIME: "10:00",
    MIN_TICKETS: 0,
    MAX_TICKETS: 10,
    MONTH_NAMES: [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ],
  };

  constructor() {
    // DOM Elements bleiben gleich
    this.elements = {
      panel: document.getElementById("ticket-panel"),
      dialog: document.querySelector("dialog"),
      dateHeader: document.getElementById("selected-date-header"),
      ticketCounter: document.getElementById("ticket-counter"),
      totalPrice: document.getElementById("total-price"),
      calendarDays: document.getElementById("calendar-days"),
      decreaseBtn: document.getElementById("decrease-tickets"),
      increaseBtn: document.getElementById("increase-tickets"),
      cartTotal: document.getElementById("cart-total"),
      totalSum: document.getElementById("ticket-sum"),
      soldOutDate: document.querySelector(".sold-out-date"),
    };

    // State
    this.currentDate = new Date();
    this.selectedDate = null;
    this.totalTickets = 0;
    this.totalHaveToPay = 0;
    this.tickets = {};

    this.priceData = {
      ...PRICE_CONFIG.PRICES,
    };

    // Testpreise hinzufügen wenn in Entwicklungsumgebung
    if (this.isDevelopment()) {
      this.addTestPrices();
    }

    this.eventDays = Object.keys(this.priceData);

    this.init();
    this.handleStripeRedirect();

    this.Toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: false,
      customClass: {
        container: "calendar-toast",
      },
    });
  }

  init() {
    try {
      this.renderCalendar();
      this.setupEventListeners();
      this.updateCartDisplay();
      this.calculateTotalHaveToPay();
    } catch (error) {
      console.error("Initialisierungsfehler:", error);
      // Fehlerbehandlung für Benutzer
      this.Toast?.fire({
        icon: "error",
        title: "Initialisierungsfehler. Bitte laden Sie die Seite neu.",
      });
    }
  }

  isDevelopment() {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }

  addTestPrices() {
    const testPrices = {
      ...PRICE_CONFIG.TEST_PRICES,
    };

    // Testpreise zum priceData-Objekt hinzufügen
    this.priceData = {
      ...this.priceData,
      ...testPrices,
    };

    // Visuellen Indikator für Testmodus hinzufügen
    this.addTestModeIndicator();
  }

  addTestModeIndicator() {
    const testBadge = document.createElement("div");
    testBadge.style.cssText = `
      position: fixed;
      top: 56px;
      right: 0;
      background: #ff4444;
      color: white;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: bold;
      z-index: 9999;
      border-radius: 0 0 0 4px;
    `;
    testBadge.textContent = "TEST MODE - Testpreise aktiv";
    document.body.appendChild(testBadge);
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
  }

  isEventDay(dateString) {
    return this.eventDays.includes(dateString);
  }

  createCartSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "mini-cart");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("role", "img");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
    );
    svg.appendChild(path);

    return svg;
  };

  renderCalendar() {
    // Monat und Jahr Berechnung
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Monat/Jahr Anzeige aktualisieren
    document.getElementById(
      "current-month"
    ).textContent = `${CalendarWidget.CONSTANTS.MONTH_NAMES[month]} ${year}`;

    // Kalender-Berechnungen
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fragment für effizientes DOM-Rendering erstellen
    const fragment = document.createDocumentFragment();

    // Leere Zellen für Monatsbeginn
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day empty-day";
      fragment.appendChild(emptyDay);
    }

    // Kalendertage erstellen
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = this.formatDate(currentDate);
      const isEventDay = this.isEventDay(dateString);
      const ticketCount = this.tickets[dateString] || 0;
      const isSelected = this.selectedDate === dateString;
      const priceInfo = this.getPriceInfo(dateString);

      // Kalendertag-Element erstellen
      const dayElement = document.createElement("div");
      dayElement.className = `calendar-day ${isEventDay ? "event-day" : ""} ${
        isSelected ? "selected" : ""
      }`;
      dayElement.dataset.date = dateString;

      if (isEventDay) {
        dayElement.setAttribute("role", "button");
        dayElement.setAttribute("tabindex", "0");
      }

      // Tagesnummer hinzufügen
      const dayNumber = document.createElement("div");
      dayNumber.className = "day-number";
      dayNumber.textContent = day;
      dayElement.appendChild(dayNumber);

      // Preisanzeige für Event-Tage
      if (isEventDay && priceInfo) {
        const priceInfoDiv = document.createElement("div");
        priceInfoDiv.className = "price-info";

        if (priceInfo.isDiscounted) {
          const currentPrice = document.createElement("span");
          currentPrice.className = "current-price";
          currentPrice.textContent = `${priceInfo.currentPrice}€`;
          priceInfoDiv.appendChild(currentPrice);
        } else {
          const originalPrice = document.createElement("span");
          originalPrice.className = "original-price";
          originalPrice.textContent = `${priceInfo.originalPrice}€`;
          priceInfoDiv.appendChild(originalPrice);
        }

        dayElement.appendChild(priceInfoDiv);
      }

      // Ticket-Anzeige falls vorhanden
      if (ticketCount > 0) {
        const ticketCountDiv = document.createElement("div");
        ticketCountDiv.className = "ticket-count";

        const cartSvg = this.createCartSvg();
        ticketCountDiv.appendChild(cartSvg);

        const countSpan = document.createElement("span");
        countSpan.textContent = ticketCount;
        ticketCountDiv.appendChild(countSpan);

        dayElement.appendChild(ticketCountDiv);
      }
      fragment.appendChild(dayElement);
    }

    // Einmaliges DOM-Update mit allen erstellten Elementen
    this.elements.calendarDays.replaceChildren(fragment);
  }

  setupEventListeners() {
    // Navigation
    this.setupNavigationListeners();

    // Tagesauswahl
    this.setupDaySelectionListener();

    // Modal Events
    this.setupModalListener();

    // Ticket Controls
    this.setupTicketControlListeners();
  }

  setupNavigationListeners() {
    const prevMonth = document.getElementById("prev-month");
    const nextMonth = document.getElementById("next-month");

    prevMonth.addEventListener("click", () => {
      // Sicherer Monatsübergang
      const currentMonth = this.currentDate.getMonth();
      const currentYear = this.currentDate.getFullYear();

      // Setze das Datum auf den ersten des Monats, um Überlauf zu verhindern
      const newDate = new Date(currentYear, currentMonth - 1, 1);

      this.currentDate = newDate;
      this.renderCalendar();
    });

    nextMonth.addEventListener("click", () => {
      const currentMonth = this.currentDate.getMonth();
      const currentYear = this.currentDate.getFullYear();

      // Setze das Datum auf den ersten des Monats, um Überlauf zu verhindern
      const newDate = new Date(currentYear, currentMonth + 1, 1);

      this.currentDate = newDate;
      this.renderCalendar();
    });
  }

  setupDaySelectionListener() {
    this.elements.calendarDays.addEventListener("click", (e) => {
      const dayElement = e.target.closest(".calendar-day");
      if (!dayElement?.classList.contains("event-day")) return;

      this.selectedDate = dayElement.dataset.date;
      this.renderCalendar();
      this.showTicketPanel();
      modalManager.openModal();
    });
  }

  setupModalListener() {
    document.addEventListener("modalClosed", () => this.resetPanel());
  }

  setupTicketControlListeners() {
    this.elements.decreaseBtn.addEventListener("click", () =>
      this.updateTicketCount(-1)
    );
    this.elements.increaseBtn.addEventListener("click", () =>
      this.updateTicketCount(1)
    );
  }

  resetPanel() {
    this.selectedDate = null;
    this.elements.panel.style.display = "none";
  }

  getNextDay(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return this.formatDisplayDate(this.formatDate(date));
  }

  showTicketPanel() {
    if (!this.selectedDate) {
      this.resetPanel();
      return;
    }

    this.initializePanel();
    this.updateDateDisplay();
    this.initializeTickets();
    this.updateDisplays();
  }

  // Neue Methode zum Aktualisieren der Preisdaten
  updatePriceData(priceData) {
    this.priceData = priceData;
    this.eventDays = Object.keys(priceData);
    this.renderCalendar(); // Kalender neu rendern mit aktualisierten Preisen
  }

  // Neue Methode zum Abrufen des Preises für ein Datum
  getPriceForDate(date) {
    if (!this.priceData[date]) {
      return CalendarWidget.CONSTANTS.DEFAULT_PRICE;
    }
    return this.priceData[date].price;
  }

  // Neue Methode für Preisinformationen
  getPriceInfo(date) {
    if (!date) return null;

    const priceInfo = this.priceData[date];
    if (!priceInfo) return null;

    return {
      currentPrice:
        Number(priceInfo.price) || CalendarWidget.CONSTANTS.DEFAULT_PRICE,
      originalPrice:
        Number(priceInfo.originalPrice) ||
        CalendarWidget.CONSTANTS.DEFAULT_PRICE,
      isDiscounted: priceInfo.price < priceInfo.originalPrice,
      validUntil: priceInfo.validUntil || null,
    };
  }

  // Neue Hilfsmethoden
  initializePanel() {
    this.elements.dialog.classList.remove("active");
    this.elements.panel.style.display = "block";
  }

  updateDateDisplay() {
    const displayDate = this.formatDisplayDate(this.selectedDate);
    const nextDay = this.getNextDay(this.selectedDate);
    this.elements.dateHeader.textContent = `${displayDate} - ${nextDay}`;
  }

  initializeTickets() {
    if (!(this.selectedDate in this.tickets)) {
      this.tickets[this.selectedDate] = CalendarWidget.CONSTANTS.MIN_TICKETS;
    }
  }

  updateDisplays() {
    this.updateTicketDisplay();
    this.updateHaveToPayDisplay();
    this.checkMaxTickets();
  }

  checkMaxTickets() {
    const count = this.tickets[this.selectedDate] || 0;
    const isMaxReached = count >= CalendarWidget.CONSTANTS.MAX_TICKETS;

    if (isMaxReached) {
      const displayEventDate = this.formatDisplayDate(this.selectedDate);
      this.elements.soldOutDate.textContent = displayEventDate;
    }

    this.elements.dialog.classList.toggle("active", isMaxReached);
  }

  updateTicketCount(change) {
    if (!this.selectedDate) return;

    const currentCount = this.tickets[this.selectedDate] || 0;
    const newCount = currentCount + change;

    // Frühe Validierung mit Guard Clause
    if (
      newCount < CalendarWidget.CONSTANTS.MIN_TICKETS ||
      newCount > CalendarWidget.CONSTANTS.MAX_TICKETS
    ) {
      return;
    }

    // Update total tickets
    this.totalTickets += change;
    this.tickets[this.selectedDate] = newCount;

    // Update displays
    this.updateTicketDisplay();
    this.updateCartDisplay();
    this.calculateTotalHaveToPay();
    this.renderCalendar();
    this.checkMaxTickets();
  }

  updateCartDisplay() {
    // Debounce-Funktion definieren
    const debounce = (fn, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId); // Vorherigen Timer löschen
        timeoutId = setTimeout(() => fn.apply(this, args), delay); // Neuen Timer setzen
      };
    };

    // Animation mit 150ms Verzögerung
    const debouncedAnimation = debounce(() => {
      this.elements.cartTotal.classList.add("update-animation");
      setTimeout(() => {
        this.elements.cartTotal.classList.remove("update-animation");
      }, 300);
    }, 150);

    // Counter sofort aktualisieren
    this.elements.cartTotal.textContent = this.totalTickets;

    // Animationen debounced ausführen
    debouncedAnimation();
  }

  calculateTotalHaveToPay() {
    this.totalHaveToPay = Object.entries(this.tickets).reduce(
      (sum, [date, count]) => {
        return sum + count * this.getPriceForDate(date);
      },
      0
    );
    this.updateHaveToPayDisplay();
  }

  updateTicketDisplay() {
    const selectedDate = this.selectedDate;
    const count = this.tickets[this.selectedDate] || 0;
    const priceInfo = this.getPriceInfo(this.selectedDate);

    // Update counter
    this.elements.ticketCounter.textContent = count;

    // Update buttons
    this.elements.decreaseBtn.disabled =
      count === CalendarWidget.CONSTANTS.MIN_TICKETS;
    this.elements.increaseBtn.disabled =
      count === CalendarWidget.CONSTANTS.MAX_TICKETS;

    // Vorherigen Inhalt löschen
    this.elements.totalPrice.innerHTML = "";

    if (priceInfo && priceInfo.isDiscounted) {
      if (count === 0) {
        // Nur Originalpreis
        const originalSpan = document.createElement("span");
        originalSpan.textContent = `${priceInfo.originalPrice.toLocaleString(
          "de-DE"
        )} €`;
        originalSpan.className = "original-price";
        this.elements.totalPrice.appendChild(originalSpan);
      } else {
        // Original- und Current Price
        const originalSpan = document.createElement("span");
        originalSpan.textContent = `${(
          count * priceInfo.originalPrice
        ).toLocaleString("de-DE")} €`;
        originalSpan.className = "original-price";

        const currentSpan = document.createElement("span");
        currentSpan.textContent = `${(
          count * priceInfo.currentPrice
        ).toLocaleString("de-DE")} €`;
        currentSpan.className = "current-price";

        this.elements.totalPrice.appendChild(originalSpan);
        this.elements.totalPrice.appendChild(currentSpan);
      }
    } else {
      // Standard-Preisanzeige
      const total = (count || 1) * this.getPriceForDate(selectedDate);
      this.elements.totalPrice.textContent = `${total.toLocaleString(
        "de-DE"
      )} €`;
    }
  }

  updateHaveToPayDisplay() {
    const formattedPrice = this.totalHaveToPay.toLocaleString("de-DE");
    this.elements.totalSum.textContent = `${formattedPrice} €`;
  }

  prepareTicketData() {
    // Saubere Datenaufbereitung
    return {
      tickets: Object.entries(this.tickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([date, quantity]) => ({
          date: date,
          quantity: Number(quantity),
          price: Number(this.getPriceForDate(date)),
        })),
      totalAmount: Number(this.totalHaveToPay),
    };
  }

  validateCheckoutPreconditions() {
    // AGBs Check (bereits vorhanden)
    if (!document.getElementById("agb-checkbox").checked) {
      this.Toast.fire({
        icon: "warning",
        title: "Bitte akzeptieren Sie die AGBs",
      });
      return false;
    }

    // Ticket Check (bereits vorhanden)
    if (this.totalTickets === 0) {
      this.Toast.fire({
        icon: "info",
        title: "Bitte wählen Sie mindestens ein Ticket aus!",
      });
      return false;
    }

    return true;
  }

  async initiateCheckout() {
    // Frontend-Validierung
    if (!this.validateCheckoutPreconditions()) return;

    // Datenaufbereitung
    const ticketData = this.prepareTicketData();

    try {
      await checkoutStripe(ticketData);
    } catch (error) {
      console.error("Checkout error:", error);
      this.Toast.fire({
        icon: "error",
        title: "Checkout konnte nicht gestartet werden",
      });
    }
  }

  handleStripeRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get("result");

    if (result === "success") {
      Swal.fire({
        title: "Vielen Dank für Ihre Bestellung!",
        text: "Sie erhalten in Kürze eine Bestätigungs-E-Mail mit ihrem persönlichen Ticket.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // Reset erst nach Bestätigung des Dialogs
        this.resetCart();

        // Entferne die URL-Parameter
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      });
    } else if (result === "cancel") {
      Swal.fire({
        title: "Bestellung abgebrochen",
        text: "Sie können den Vorgang jederzeit fortsetzen.",
        icon: "info",
        confirmButtonText: "OK",
      }).then(() => {
        // Entferne die URL-Parameter
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      });
    }
  }

  resetCart() {
    this.tickets = {};
    this.totalTickets = 0;
    this.totalHaveToPay = 0;
    this.selectedDate = null;

    // Update all displays
    this.renderCalendar();
    this.updateCartDisplay();
    this.updateHaveToPayDisplay();

    // Clear any open panels/modals
    if (this.elements.panel) {
      this.elements.panel.style.display = "none";
    }

    // Optional: Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Initialize the widget
document.addEventListener("DOMContentLoaded", () => {
  try {
    const widget = new CalendarWidget();

    // Event Listener für Checkout
    const agbCheckbox = document.getElementById("agb-checkbox");
    const checkoutButton = document.getElementById("checkout-button");

    if (agbCheckbox && checkoutButton) {
      agbCheckbox.addEventListener("change", () => {
        checkoutButton.disabled = !agbCheckbox.checked;
      });

      checkoutButton.addEventListener("click", async () => {
        if (agbCheckbox.checked) {
          await widget.initiateCheckout();
        } else {
          widget.Toast.fire({
            icon: "warning",
            title: "Bitte akzeptieren Sie die AGBs",
          });
        }
      });
    }
  } catch (error) {
    console.error("Kalendar Widget Initialisierungsfehler:", error);
    // Benutzerfreundliche Fehlerbehandlung
    Swal.fire({
      title: "Initialisierungsfehler",
      text: "Der Kalender konnte nicht geladen werden. Bitte laden Sie die Seite neu.",
      icon: "error",
    });
  }
});
