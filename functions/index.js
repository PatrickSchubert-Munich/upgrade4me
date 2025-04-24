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

// Firebase functions imports
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// Service scripts imports
const { CONFIG, getEnvironmentConfig } = require("./services/config");
const { validateTicketData } = require("./services/validate_ticketData");
const generateTicketQR = require("./services/create_qrcode");
const { EmailService } = require("./services/email_service");
const {
  emailjsServiceId,
  emailjsTemplateId,
  emailjsPublicKey,
  emailjsPrivateKey,
} = require("./services/email_service");

// Secrets definieren
const stripeSecret = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// Initialize Firebase Admin
initializeApp({
  projectId: CONFIG.FIREBASE.FIREBASE_PROJECT_ID,
});

// Firestore-Referenz mit zentralisierter Konfiguration
const COLLECTION_NAME = CONFIG.FIRESTORE.COLLECTION_NAMES.BOOKINGS;
const db = getFirestore(COLLECTION_NAME);

// CORS configuration helper
const configureCORS = (req, res) => {
  res.set("Access-Control-Allow-Credentials", "true");
  const origin = req.headers.origin;
  const allowedOrigins = getEnvironmentConfig().ORIGINS;

  if (allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  } else {
    // Fallback auf die erste erlaubte Origin
    res.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }
};

exports.createCheckoutSession = onRequest(
  {
    secrets: [stripeSecret],
    cors: {
      origin: getEnvironmentConfig().ORIGINS,
      methods: ["POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
    region: CONFIG.FIREBASE.FIREBASE_REGION,
    rateLimit: {
      maxConcurrentRequests: CONFIG.RATE_LIMIT.MAX_CONCURRENT_REQUESTS,
      maxRequestsPerSecond: CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_SECOND,
      windowMs: CONFIG.RATE_LIMIT.WINDOWS_MS,
      message: CONFIG.RATE_LIMIT.MESSAGE,
    },
  },

  async (req, res) => {
    // Debugging nur in Entwicklungsumgebung
    const currentConfig = getEnvironmentConfig();
    if (currentConfig.DEBUG) {
      console.log("Aktuelle Umgebung:", {
        isDev: currentConfig === CONFIG.ENV.DEVELOPMENT,
        isProd: currentConfig === CONFIG.ENV.PRODUCTION,
        origins: currentConfig.ORIGINS,
      });
    }

    // Stripe
    const stripe = require("stripe")(stripeSecret.value());

    // CORS
    configureCORS(req, res);
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Max-Age", "3600");
      return res.status(204).send("");
    }

    try {
      // Data from Body
      const { ticketData } = req.body;

      // Validierung der Ticketdaten
      const validatedTicketData = validateTicketData(ticketData);

      // Stripe Line Items erstellen
      const lineItems = createLineItems(validatedTicketData.tickets);

      // Stripe Checkout Session erstellen
      const session = await createStripeSession(
        stripe,
        lineItems,
        req.headers.origin,
        validatedTicketData
      );

      // Erfolgreiche Antwort senden
      return res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("❌ Checkout Session Fehler:", error);
      return res.status(400).json({
        error: "Checkout fehlgeschlagen",
        details: error.message,
      });
    }
  }
);

exports.stripeWebhook = onRequest(
  {
    secrets: [
      stripeSecret,
      stripeWebhookSecret,
      emailjsServiceId,
      emailjsTemplateId,
      emailjsPublicKey,
      emailjsPrivateKey,
    ],
    cors: false,
    region: "europe-west3",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "❌ Method not allowed",
        message: "Only POST requests are accepted",
      });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({
        error: "❌ Missing stripe-signature header",
      });
    }

    let event;

    try {
      const stripe = require("stripe")(stripeSecret.value());
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        stripeWebhookSecret.value()
      );
      // Empfohlene Ergänzung
      if (!event?.type || !event?.data?.object) {
        throw new Error("Ungültiges Event Format");
      }
    } catch (error) {
      console.error("❌ Webhook Error:", error);
      return res.status(200).json({
        received: true,
        error: `❌ Error: ${error.message}`,
      });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
          const sessionData = event.data.object;
          console.log("🔔 Checkout Session was successful!");
          const isCheckout = await handleCheckoutSession(event, sessionData);
          isCheckout
            ? console.log(
                `✅ Buchung erfolgreich gespeichert: Session ID [${sessionData?.id}]; Payment Intent [${sessionData?.payment_intent}]`
              )
            : console.error("❌ Checkout not succesful!");
          break;

        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          try {
            // First update payment status and handle email dispatch
            const { success } = await handlePaymentSuccess(
              event,
              paymentIntent,
              {
                emailFlag: false,
              }
            );

            if (!success) {
              throw new Error("Payment status update failed");
            }

            // Get booking data for logging
            const docRef = db
              .collection(COLLECTION_NAME)
              .doc(paymentIntent?.id);
            const bookingData = (await docRef.get()).data();

            console.log(
              `✅ Payment processed successfully for [${paymentIntent?.id}]`,
              {
                email: bookingData?.email ? "Valid email present" : "No email",
                status: bookingData?.paymentStatus,
                qrCode: bookingData?.qrCodeGenerated
                  ? "Generated"
                  : "Not generated",
                emailSent: bookingData?.sendEmail ? "Sent" : "Not sent",
              }
            );

            // Update email status
          } catch (error) {
            console.error("Payment processing failed:", {
              error: error.message,
              paymentId: paymentIntent?.id,
            });

            // Update error state
            const docRef = db
              .collection(COLLECTION_NAME)
              .doc(paymentIntent?.id);
            await docRef.update({
              lastError: error.message,
              lastUpdate: FieldValue.serverTimestamp(),
            });
          }
          break;

        case "checkout.session.expired":
          console.log("⚠️ Checkout Session expired");
          break;

        case "payment_intent.canceled":
          console.error("❌ Payment canceled with status: ", event.type);
          break;

        case "payment_intent.payment_failed":
          console.error("❌ Payment failed with status: ", event.type);
          break;

        default:
          console.log(`❌ Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error(`❌ Error processing webhook: ${error.message}`);
      return res.status(500).send(`❌ Server Error: ${error.message}`);
    }
  }
);

// Helper Functions
function createLineItems(tickets) {
  return tickets.map((ticket) => ({
    quantity: ticket.quantity,
    price_data: {
      currency: "eur",
      unit_amount: ticket.price * 100,
      product_data: {
        name: `Workshop Ticket für ${ticket.date}`,
        description: `Workshop am ${ticket.date}`,
      },
    },
  }));
}

async function createStripeSession(stripe, lineItems, origin, ticketData) {
  try {
    return await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/calendar?result=success`,
      cancel_url: `${origin}/calendar?result=cancel`,
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      // Metadaten
      metadata: {
        tickets: JSON.stringify(ticketData.tickets),
        totalAmount: ticketData.totalAmount.toString(),
      },
      // Zusätzliche Sicherheitsoptionen
      payment_intent_data: {
        setup_future_usage: "off_session",
      },
    });
  } catch (error) {
    console.error("❌ Stripe Session Erstellung fehlgeschlagen:", error);
    throw new Error(`Stripe Session Fehler: ${error.message}`);
  }
}

async function handleCheckoutSession(event, sessionData) {
  try {
    // Prüfung auf Paymentid
    const paymentId = sessionData?.payment_intent ?? null;
    if (!paymentId) throw new Error("❌ Keine gültige Payment Intent ID");

    // metadata from stripe only JSON.parse() as strings visible
    const tickets = JSON.parse(sessionData?.metadata?.tickets || "[]");

    // connect to db
    const docRef = db.collection(COLLECTION_NAME).doc(paymentId);

    // check, if document already exits
    const doc = await docRef.get();
    if (doc.exists) {
      const bookingData = doc.data();

      // Prüfen ob bereits in Bearbeitung
      if (bookingData.processingEmail) {
        console.log(`Email-Versand für ${paymentId} wird bereits verarbeitet`);
        return true;
      }

      // Lock setzen
      await docRef.update({
        processingEmail: true,
        lastUpdate: FieldValue.serverTimestamp(),
      });

      try {
        const isPaymentSuccessful = ["succeeded", "processing"].includes(
          bookingData.paymentStatus
        );
        if (
          isPaymentSuccessful &&
          (!bookingData.qrCodeGenerated || !bookingData.sendEmail)
        ) {
          await handleTicketEmailDispatch(paymentId, bookingData);
        }
      } catch (error) {
        // Lock bei Fehler zurücksetzen
        await docRef.update({
          processingEmail: false,
          lastError: error.message,
          lastUpdate: FieldValue.serverTimestamp(),
        });
        throw error;
      }

      return true;
    }

    // Neues Dokument erstellen
    await docRef.set({
      eventType: event?.type ?? null,
      sessionId: sessionData?.id ?? null,
      paymentId: paymentId,
      paymentStatus: sessionData?.payment_status ?? "processing",
      sendEmail: false,
      qrCodeGenerated: false,
      totalPrice: sessionData?.amount_total / 100,
      currency: sessionData?.currency ?? "eur",
      tickets: sessionData?.metadata?.tickets ?? null,
      ticketQuantity: tickets.reduce((total, ticket) => {
        return total + (Number(ticket.quantity) || 0);
      }, 0),
      ticketDates: tickets
        .map((ticket) => ticket.date + ", ")
        .join(" ")
        .slice(0, -1),
      email: sessionData?.customer_details?.email ?? null,
      name: sessionData?.customer_details?.name ?? null,
      phone: sessionData?.customer_details?.phone ?? null,
      address: sessionData?.customer_details?.address ?? null,
      customerId: sessionData?.customer ?? null,
      lastError: "no error",
      lastUpdate: FieldValue.serverTimestamp(),
    });

    // return flag
    return true;
  } catch (error) {
    console.error("❌ Fehler beim Verarbeiten der Checkout Session:", error);
    throw error;
  }
}

async function handlePaymentSuccess(event, paymentIntent, options = {}) {
  // Parameter-Validierung
  const paymentId = paymentIntent?.id;
  if (!event || !paymentId) {
    throw new Error("Ungültige Parameter für handlePaymentSuccess");
  }

  // Konstanten & Optionen
  const maxRetries = 3;
  const retryDelay = 5000;
  const { emailFlag = false } = options;

  // Retry-Logik
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // DB-Referenz
      const docRef = db.collection(COLLECTION_NAME).doc(paymentId);
      const doc = await docRef.get();

      // Dokument nicht gefunden
      if (!doc.exists) {
        console.log(
          `Versuch ${attempt + 1}/${maxRetries}: ` +
            `Dokument nicht gefunden für Payment ID ${paymentId}`
        );

        // Beim letzten Versuch: Fehlerfall dokumentieren
        if (attempt === maxRetries - 1) {
          // Dokumentiere den Fehlerfall
          await docRef.set({
            eventType: event.type,
            paymentStatus: "furthermore processing",
            paymentId: paymentId,
            lastUpdate: FieldValue.serverTimestamp(),
            createdFromPaymentIntent: true,
            sendEmail: false,
          });

          throw new Error(
            `Keine Buchung für Payment Intent ID [${paymentId}] gefunden!`
          );
        }

        // Warte vor dem nächsten Versuch
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      const bookingData = doc.data();

      // Status-Updates
      if (!bookingData.qrCodeGenerated || !bookingData.sendEmail) {
        await handleTicketEmailDispatch(paymentId, bookingData);
      }

      // Payment Status aktualisieren
      await docRef.update({
        eventType: event.type,
        paymentStatus: paymentIntent?.status ?? "paid",
        lastUpdate: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        paymentId,
        updateTime: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `Fehler bei Payment Intent ${paymentId} (Versuch ${attempt + 1}):`,
        error
      );

      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
}

async function handleTicketEmailDispatch(paymentId, bookingData) {
  const docRef = db.collection(COLLECTION_NAME).doc(paymentId);

  // 1. Prüfung ob Email bereits gesendet wurde
  const currentDoc = await docRef.get();
  const currentData = currentDoc.data();

  if (currentData.sendEmail && currentData.qrCodeGenerated) {
    console.log(`Email wurde bereits für Payment ID ${paymentId} gesendet.`);
    return { success: true, alreadySent: true };
  }

  if (!bookingData.email) {
    throw new Error("Keine Email-Adresse für Ticket-Versand vorhanden");
  }

  try {
    // 2. Lock setzen mit Timestamp
    await docRef.update({
      processingEmail: true,
      processingStartedAt: FieldValue.serverTimestamp(),
      lastUpdate: FieldValue.serverTimestamp(),
    });

    // 3. QR-Code prüfen/generieren
    let qrCodeUrl = currentData.qrCodeUrl;
    if (!qrCodeUrl) {
      qrCodeUrl = await withRetry(
        async () =>
          generateTicketQR({
            customer: bookingData.email,
            ticketCount: bookingData.ticketQuantity,
            price: bookingData.totalPrice,
            eventDates: bookingData.ticketDates,
          }),
        "QR-Code Generierung"
      );

      if (!qrCodeUrl) {
        throw new Error("QR-Code konnte nicht generiert werden");
      }
    }

    // 4. Email mit Retry versenden - nur wenn noch nicht gesendet
    const freshDoc = await docRef.get(); // Erneute Prüfung direkt vor Versand
    if (!freshDoc.data().sendEmail) {
      await withRetry(async () => {
        const emailService = new EmailService(
          bookingData.email,
          qrCodeUrl,
          bookingData.ticketDates
        );
        return emailService.send();
      }, "Email-Versand");
    }

    // 5. Erfolg dokumentieren
    await docRef.update({
      sendEmail: true,
      emailSentAt: FieldValue.serverTimestamp(),
      lastUpdate: FieldValue.serverTimestamp(),
      qrCodeGenerated: true,
      qrCodeUrl: qrCodeUrl,
      processingEmail: false,
      lastError: null,
      retryCount: 0,
    });

    return { success: true };
  } catch (error) {
    // 6. Fehler dokumentieren und Lock aufheben
    const errorUpdate = {
      lastError: `Email-Versand fehlgeschlagen: ${error.message}`,
      lastUpdate: FieldValue.serverTimestamp(),
      processingEmail: false,
      retryCount: FieldValue.increment(1),
    };

    try {
      await docRef.update(errorUpdate);
    } catch (dbError) {
      console.error("Fehler beim Update des Fehlerstatus:", dbError);
    }

    throw error;
  }
}

// Konfigurationskonstanten für Retry-Mechanismus
const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3, // Maximale Anzahl von Versuchen
  INITIAL_DELAY: 1000, // Initiale Verzögerung (1 Sekunde)
  MAX_DELAY: 5000, // Maximale Verzögerung (5 Sekunden)
  BACKOFF_FACTOR: 2, // Multiplikator für exponentiellen Backoff
};

/**
 * Führt eine Operation mit automatischen Wiederholungsversuchen aus
 * @param {Function} operation - Async Function die ausgeführt werden soll
 * @param {string} operationName - Name der Operation für Logging
 * @param {number} [maxAttempts] - Maximale Anzahl von Versuchen
 * @return {Promise<any>} - Ergebnis der Operation
 * @throws {Error} - Letzter aufgetretener Fehler nach allen Versuchen
 */
async function withRetry(
  operation,
  operationName,
  maxAttempts = RETRY_CONFIG.MAX_ATTEMPTS
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Operation ausführen
      const result = await operation();

      // Bei Erfolg: Log und Return
      if (attempt > 1) {
        console.log(`✅ ${operationName} erfolgreich beim ${attempt}. Versuch`);
      }
      return result;
    } catch (error) {
      lastError = error;

      // Bei letztem Versuch: Fehler werfen
      if (attempt === maxAttempts) {
        console.error(
          `❌ ${operationName} endgültig fehlgeschlagen nach ${maxAttempts} Versuchen:`,
          {
            error: error.message,
            stack: error.stack,
            attempts: attempt,
          }
        );
        break;
      }

      // Exponential Backoff berechnen
      const delay = Math.min(
        RETRY_CONFIG.INITIAL_DELAY *
          Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt - 1),
        RETRY_CONFIG.MAX_DELAY
      );

      // Warnung loggen
      console.warn(
        `⚠️ ${operationName} fehlgeschlagen beim ${attempt}. Versuch`,
        {
          error: error.message,
          nextRetryIn: `${delay}ms`,
          attemptsLeft: maxAttempts - attempt,
        }
      );

      // Warten vor nächstem Versuch
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Nach allen Versuchen: Letzten Fehler werfen
  throw lastError;
}
