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

"use strict";

const { CONFIG } = require("./config");

const VALIDATION_CONSTANTS = {
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
};

function validateTicketData(ticketData) {
  try {
    // 1. Basis-Validierung der Ticketdaten-Struktur
    if (!ticketData?.tickets?.length) {
      throw new Error("Ungültige Ticket-Daten");
    }

    // 2. Aktuelle Preise laden
    const currentPrices = CONFIG.getPrices();
    let calculatedTotal = 0;

    // Debug-Logging hinzufügen
    console.log("Aktuelle Preise:", currentPrices);
    console.log("Übergebene Ticket-Daten:", ticketData);

    // 3. Ticket-Validierung
    ticketData.tickets.forEach((ticket, index) => {
      console.log(`Validiere Ticket ${index}:`, ticket);

      // Datum prüfen
      if (!ticket.date || !VALIDATION_CONSTANTS.DATE_FORMAT.test(ticket.date)) {
        throw new Error(`Ungültiges Datum: ${ticket.date}`);
      }

      // Preis validieren
      const priceConfig = currentPrices[ticket.date];
      if (!priceConfig) {
        throw new Error(`Kein gültiger Preis für ${ticket.date}`);
      }

      // Preis-Logik: Entweder Sonderpreis oder Originalpreis
      const isValidPrice =
        ticket.price === priceConfig.price ||
        ticket.price === priceConfig.originalPrice;

      if (!isValidPrice) {
        throw new Error(`Ungültiger Preis für Ticket ${index}`);
      }

      // Erweiterte Preis-Validierung
      const validPrices = [priceConfig.price, priceConfig.originalPrice];

      if (!validPrices.includes(ticket.price)) {
        console.error(`Ungültiger Preis für Ticket ${index}:`, {
          ticketPrice: ticket.price,
          validPrices: validPrices,
        });
        throw new Error(`Ungültiger Preis für Ticket ${index}`);
      }

      // Menge validieren
      if (!Number.isInteger(ticket.quantity) || ticket.quantity <= 0) {
        throw new Error(`Ungültige Ticketmenge: ${ticket.quantity}`);
      }

      calculatedTotal += ticket.price * ticket.quantity;
    });

    // 4. Gesamtbetrag prüfen
    if (Math.abs(calculatedTotal - ticketData.totalAmount) > 0.01) {
      throw new Error(`Ungültiger Gesamtbetrag`);
    }

    return ticketData;
  } catch (error) {
    throw new Error(`Ticket-Validierungsfehler: ${error.message}`);
  }
}

module.exports = { validateTicketData };
