export async function initializeFirebaseEmulators(app, db, functions) {
  if (window.location.hostname === "localhost") {
    // Stripe Endpoint für lokale Entwicklung
    window.stripeEndpoint =
      "http://localhost:3001/upgrade4me-7a4f0/europe-west3/createCheckoutSession";

    // Firebase Emulator Konfiguration
    const { connectFirestoreEmulator } = await import("firebase/firestore");
    const { connectFunctionsEmulator } = await import("firebase/functions");

    try {
      // Firestore Emulator verbinden
      connectFirestoreEmulator(db, "localhost", 5000);

      // Functions Emulator verbinden
      connectFunctionsEmulator(functions, "localhost", 3001);

      console.log("Firebase Emulatoren erfolgreich initialisiert!");
    } catch (error) {
      console.error("Fehler bei der Emulator-Initialisierung:", error);
      throw error;
    }
  }
}
