// Definiere die Funktion außerhalb des Eventlisteners
function updateLinksForOffline() {
  const impressumLink = document.querySelector(".footer-impressum");
  const datenschutzLink = document.querySelector(".footer-datenschutz");

  // Verwende immer die lokalen HTML-Dateien
  impressumLink.href = "/impressum.html";
  datenschutzLink.href = "/datenschutz.html";
}

document.addEventListener("DOMContentLoaded", () => {
  // Links direkt bei Laden der Seite aktualisieren
  updateLinksForOffline();

  // Aktualisiere Links bei Statusänderung
  window.addEventListener("online", updateLinksForOffline);
  window.addEventListener("offline", updateLinksForOffline);
});

// Exportiere die Funktion, damit sie auch außerhalb dieses Skripts verwendet werden kann
export { updateLinksForOffline };
