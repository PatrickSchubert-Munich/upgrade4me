import Swal from "sweetalert2";

export async function checkoutStripe(ticketData) {
  try {
    // Datenvalidierung
    if (!ticketData?.tickets?.length) {
      throw new Error("Ungültige Ticket-Daten");
    }

    // Endpoint basierend auf Umgebung wählen
    const endpoint =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3001/upgrade4me-7a4f0/europe-west3/createCheckoutSession"
        : "/api/checkout";

    // Korrekte Cloud Functions URL für die Region europe-west3
    const response = await fetch(endpoint, {
      method: "POST",
      credentials:
        window.location.hostname === "localhost" ? "omit" : "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketData: {
          tickets: ticketData.tickets,
          totalAmount: ticketData.totalAmount,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `Checkout fehlgeschlagen: ${response.status}`
      );
    }

    const { url } = await response.json();

    // Sicherheitscheck für die URL
    if (!url || !url.startsWith("https://checkout.stripe.com")) {
      throw new Error("Ungültige Checkout-URL");
    }

    // Weiterleitung zur Stripe URL
    window.location = url;
  } catch (error) {
    console.error("Checkout Fehler:", error);

    await Swal.fire({
      title: "Es ist ein Fehler aufgetreten",
      text: "Bitte versuchen Sie es später erneut.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}
