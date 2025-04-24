/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
/* eslint-disable linebreak-style */
const { defineSecret } = require("firebase-functions/params");
const emailjs = require("@emailjs/nodejs");
const xss = require("xss");

const emailjsServiceId = defineSecret("EMAILJS_SERVICE_ID");
const emailjsTemplateId = defineSecret("EMAILJS_TEMPLATE_ID");
const emailjsPublicKey = defineSecret("EMAILJS_PUBLIC_KEY");
const emailjsPrivateKey = defineSecret("EMAILJS_PRIVATE_KEY");

class EmailService {
  constructor(sendTo, qrCode, ticketDates) {
    if (!sendTo) throw new Error("Email-Adresse ist erforderlich");
    if (!qrCode) throw new Error("QR-Code ist erforderlich");
    if (!ticketDates) throw new Error("Ticket-Datum ist erforderlich");

    this.validateConstructorParams(sendTo, qrCode, ticketDates);
    this.from_name = "Upgrade4me";
    this.to_email = sendTo;
    this.qr_code = qrCode;
    this.ticketDates = this.helperFunctionTicketDates(ticketDates);
  }

  validateConstructorParams(sendTo, qrCode, ticketDates) {
    if (!this.isValidEmail(sendTo?.trim())) throw new Error("Ungültige Email-Adresse");
    if (!this.isValidQRCode(qrCode)) throw new Error("Ungültiger QR-Code");
    if (!this.isValidTicketDate(ticketDates)) throw new Error("Ungültiges Ticketdatum");
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidQRCode(qrCode) {
    if (!qrCode) return false;
    const validPrefixes = ["data:image/", "https://"];
    return validPrefixes.some((prefix) =>
      qrCode.toLowerCase().startsWith(prefix),
    );
  }

  isValidTicketDate(ticketDates) {
    if (typeof ticketDates !== "string") {
      console.log("Datum ist kein String");
      return false;
    }
    if (!ticketDates.trim()) {
      console.log("Datum ist leer nach Trim");
      return false;
    }
    if (typeof ticketDates !== "undefined" && ticketDates !== null) {
      return true;
    } else {
      console.log("Datum ist undefined or null");
    }
    return false;
  }

  helperFunctionTicketDates(ticketDates) {
    if (!ticketDates) return "";
    try {
      const dates = [];
      const splittedDates = ticketDates.split(",");
      splittedDates.forEach((date) => {
        if (date.length > 9) {
          const currentDate = date.trim().split("-");
          dates.push(
            `${currentDate.at(-1)}.${currentDate.at(1)}.${currentDate.at(0)}`,
          );
        }
      });
      return dates.join(", ") || ticketDates;
    } catch (error) {
      console.error("Fehler bei Datums-Formatierung:", error);
      return ticketDates;
    }
  }

  createEmailTemplate() {
    try {
      const sanitizedContent = {
        to_email: xss(this.to_email?.trim()),
        from_name: xss(this.from_name?.trim()),
        qr_code: xss(this.qr_code || ""),
        event_date: xss(this.ticketDates?.trim()),
      };

      if (
        !sanitizedContent.to_email ||
        !sanitizedContent.from_name ||
        !sanitizedContent.qr_code ||
        !sanitizedContent.event_date
      ) {
        throw new Error("Fehlende Required Parameter für Email-Template");
      }

      let firstName = "";
      try {
        // Extract name from email address
        const beforeATSign = sanitizedContent.to_email.split("@")[0];
        firstName = beforeATSign.split(/[\s.\-{}[];]+/)[0];

        console.log("Name formatiert:", {
          original: sanitizedContent.to_email,
          beforeATSign: beforeATSign,
          firstName: firstName,
        });
      } catch (error) {
        console.warn(
          "Name-Formatierung fehlgeschlagen, nutze Original:",
          error,
        );
        firstName = sanitizedContent.to_email.split("@")[0];
      }

      console.log("Email Template Parameter erstellt:", {
        to_email: sanitizedContent.to_email,
        to_name: firstName,
        has_qr_code: sanitizedContent.qr_code ? true : false,
        event_date: sanitizedContent.event_date,
      });

      return {
        template_params: {
          user_email: sanitizedContent.to_email,
          from_name: sanitizedContent.from_name,
          to_name: firstName,
          qr_code: sanitizedContent.qr_code,
          event_date: sanitizedContent.event_date,
          content: sanitizedContent.qr_code, // dynamic file attachement
        },
      };
    } catch (error) {
      console.error("Fehler beim Erstellen des Email-Templates:", error);
      throw new Error(`Template-Generierung fehlgeschlagen: ${error.message}`);
    }
  }

  init() {
    try {
      emailjs.init({
        publicKey: emailjsPublicKey.value(),
        privateKey: emailjsPrivateKey.value(),
        limitRate: {
          // Allow 1 request per 10s
          throttle: 10000,
        },
      });
    } catch (error) {
      console.error("EmailJS Initialisierungsfehler:", error);
      throw new Error("Email-Service konnte nicht initialisiert werden");
    }
  }

  async send() {
    try {
      if (
        !emailjsServiceId.value() ||
        !emailjsTemplateId.value() ||
        !emailjsPrivateKey.value()
      ) {
        throw new Error("Fehlende EmailJS Konfiguration!");
      }

      this.init();
      const emailContent = this.createEmailTemplate();

      console.log("Sende Email mit folgenden Parametern:", {
        serviceId: emailjsServiceId.value(),
        templateId: emailjsTemplateId.value(),
        hasPrivateKey: emailjsPrivateKey.value() ? true : false,
        empfänger:
          emailContent?.template_params?.user_email || "upgrade4me@outlook.de",
        template_params: emailContent?.template_params,
      });

      const response = await emailjs.send(
        emailjsServiceId.value(),
        emailjsTemplateId.value(),
        emailContent?.template_params,
      );

      if (response.status === 422) {
        throw new Error(`Ungültige Email-Konfiguration: ${response?.text}`);
      }

      if (response.status !== 200) {
        throw new Error(
          `Email-Versand fehlgeschlagen: Status ${response?.status}, ${response?.text}`,
        );
      }

      return {
        success: true,
        status: response?.status,
      };
    } catch (error) {
      console.error("Email-Versand fehlgeschlagen:", error);
      console.error("EmailJS Fehlerdetails:", {
        status: error?.status,
        text: error?.text,
        name: error?.name,
        message: error?.message,
      });
      throw error;
    }
  }
}

module.exports = {
  EmailService,
  emailjsServiceId,
  emailjsTemplateId,
  emailjsPublicKey,
  emailjsPrivateKey,
};
