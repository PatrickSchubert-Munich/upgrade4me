/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable linebreak-style */
const QRCode = require("qrcode");

const generateTicketQR = async ({
  customer,
  ticketCount,
  price,
  eventDates,
}) => {
  try {
    // Validierung der Eingabewerte
    if (typeof ticketCount !== "number" || ticketCount <= 0) {
      throw new Error("❌ Ungültige Ticketanzahl");
    }
    if (typeof price !== "number" || price <= 0) {
      throw new Error("❌ Ungültiger Preis");
    }
    if (typeof eventDates !== "string" || eventDates.trim() === "") {
      throw new Error("❌ Ungültiges Event-Datum");
    }

    const ticketData = [
      { data: customer, mode: "byte" },
      { data: ticketCount, mode: "numeric" },
      { data: price, mode: "numeric" },
      { data: eventDates, mode: "byte" },
    ];

    // Daten vor der Erstellung des QR-Codes loggen
    console.log("Ticket Data: ", ticketData);

    // JSON-Daten als String konvertieren
    const ticketDataString = JSON.stringify(ticketData);

    // Länge des JSON-Strings messen
    const dataSizeInBytes = Buffer.byteLength(ticketDataString, "utf8");

    // Setze ein Limit für die Größe des QR-Codes (z.B. 300 Bytes als Beispiel)
    const maxDataSize = 300; // Beispielwert, anpassbar je nach Bedarf

    if (dataSizeInBytes > maxDataSize) {
      throw new Error(
        // eslint-disable-next-line max-len
        `❌ Die QR-Code-Daten sind zu groß: ${dataSizeInBytes} Bytes. Maximal erlaubte Größe: ${maxDataSize} Bytes.`,
      );
    }

    const qrDataUrl = QRCode.toDataURL(ticketData, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error("❌ QR Code generation failed:", error);
    throw new Error("Fehler bei der QR-Code-Erstellung: " + error.message);
  }
};

module.exports = generateTicketQR;
