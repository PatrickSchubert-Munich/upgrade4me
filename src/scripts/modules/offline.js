// Definiere die Funktion außerhalb des Eventlisteners
function updateLinksForOffline() {
  const impressumLink = document.querySelector(".footer-impressum");
  const datenschutzLink = document.querySelector(".footer-datenschutz");
  const agbLink = document.querySelector("a[href*='agb']");

  if (impressumLink && datenschutzLink) {
    // Verwende immer die lokalen HTML-Dateien
    impressumLink.href = "/impressum.html";
    datenschutzLink.href = "/datenschutz.html";

    console.log("Links updated:", {
      impressum: impressumLink.href,
      datenschutz: datenschutzLink.href,
    });
  }

  if (agbLink) {
    agbLink.href = "/agb.html";
    console.log("AGB link updated:", agbLink.href);
  }
}

// Mehrfache Sicherstellung, dass die Links korrekt gesetzt werden
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - updating links");
  updateLinksForOffline();

  // Zusätzliche Überprüfung nach kurzer Verzögerung
  setTimeout(updateLinksForOffline, 100);
  setTimeout(updateLinksForOffline, 500);
  setTimeout(updateLinksForOffline, 1000);

  // Event-Listener für direkte Link-Klicks hinzufügen
  const impressumLink = document.querySelector(".footer-impressum");
  const datenschutzLink = document.querySelector(".footer-datenschutz");
  const agbLink = document.querySelector("a[href*='agb']");

  if (impressumLink) {
    impressumLink.addEventListener("click", (e) => {
      console.log(
        "Impressum link clicked, preventing default and navigating to:",
        "/impressum.html"
      );
      e.preventDefault();
      window.location.href = "/impressum.html";
    });
  }

  if (datenschutzLink) {
    datenschutzLink.addEventListener("click", (e) => {
      console.log(
        "Datenschutz link clicked, preventing default and navigating to:",
        "/datenschutz.html"
      );
      e.preventDefault();
      window.location.href = "/datenschutz.html";
    });
  }

  if (agbLink) {
    agbLink.addEventListener("click", (e) => {
      console.log(
        "AGB link clicked, preventing default and navigating to:",
        "/agb.html"
      );
      e.preventDefault();
      window.location.href = "/agb.html";
    });
  }

  // Aktualisiere Links bei Statusänderung
  window.addEventListener("online", updateLinksForOffline);
  window.addEventListener("offline", updateLinksForOffline);
});

// Exportiere die Funktion, damit sie auch außerhalb dieses Skripts verwendet werden kann
export { updateLinksForOffline };
