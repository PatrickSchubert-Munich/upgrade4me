"use strict";
import Swal from "sweetalert2";
import ShopCardManager from "./shop_cards.js";

class ModalManager {
  constructor() {
    // DOM Elements
    this.modal = document.getElementById("modal-overlay");
    this.closeButton = document.querySelector(".mc-close");
    this.body = document.querySelector("body");

    // Shop Card Manager Instanz
    this.shopCardManager = new ShopCardManager();

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Open Button Event Listeners
    this.openButtons = document.querySelectorAll(".btn-tickets");

    this.openButtons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        if (btn.classList.contains("regular")) {
          this.openModal();
        } else {
          this.handleCompanyRequest();
        }
      });
    });

    // Close Button Event Listener
    this.closeButton?.addEventListener("click", () => {
      this.closeModal();
    });

    // Optional: Escape Key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });
  }

  handleCompanyRequest() {
    const sectionMapsAndContact = document.getElementById("kontakt");
    if (sectionMapsAndContact) {
      sectionMapsAndContact.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    Swal.fire({
      title: "Termin vereinbaren!",
      text: "Bitte schreiben Sie uns eine Nachricht. Wir werden uns umgehend bei Ihnen melden.",
      imageUrl: "../../assets/img/kontakt_termin_vereinbaren.webp",
      imageHeight: 200,
      imageWidth: 300,
      imageAlt: "Custom Image",
      customClass: {
        confirmButton: "confirm-btn",
        image: "termin-vereinbaren--image",
      },
      didClose: () => window.scrollBy(0, 0),
    });
  }

  openModal() {
    if (window.calendarWidget) {
      const priceData = this.shopCardManager.getPriceData();
      window.calendarWidget.updatePriceData?.(priceData);
    }

    this.modal?.classList.add("active");
    this.body?.classList.add("freeze");
  }

  closeModal() {
    this.modal?.classList.remove("active");
    this.body?.classList.remove("freeze");
    const closeEvent = new CustomEvent("modalClosed");
    document.dispatchEvent(closeEvent);
  }
}

// Instanz erstellen
const modalManager = new ModalManager();
export default modalManager;
