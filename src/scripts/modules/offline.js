// Definiere die Funktion außerhalb des Eventlisteners
function updateLinksForOffline() {
  const impressumLink = document.querySelector(".footer-impressum");
  const datenschutzLink = document.querySelector(".footer-datenschutz");

  if (!navigator.onLine) {
    impressumLink.href = "/impressum.html";
    datenschutzLink.href = "/datenschutz.html";
  } else {
    impressumLink.href = "https://itrk.legal/WIA.75.QO0.html?impressum=&imp=1";
    datenschutzLink.href = "https://itrk.legal/WIA.8U.QO0.html?datenschutz";
  }
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