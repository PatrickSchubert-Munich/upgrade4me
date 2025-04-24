"use strict";

// Marker Position und Map Styling
const MAP_CONFIG = {
  position: { lat: 48.186936089563986, lng: 11.60708953125863 },
  mapId: "69987af2fbff417d",
  zoom: 16,
  mapTypeControl: false,
  streetViewControl: false,
};

async function initializeMap() {
  try {
    // Warten auf das Maps-Objekt und importieren der benötigten Bibliotheken
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // Map Element erzeugen und überprüfen
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      console.error("Map-Container nicht gefunden!");
      handleMapError();
    }

    let map;
    try {
      map = new Map(mapElement, {
        ...MAP_CONFIG,
        center: MAP_CONFIG.position,
      });
      // console.log("Karte erfolgreich initialisiert");
    } catch (mapInitError) {
      console.error("Fehler bei der Karteninitialisierung:", mapInitError);
      handleMapError();
    }

    // Marker-Container erstellen
    const markerContent = createMarkerContent();
    const infoWindow = createInfoWindow();

    // Marker mit dem Container erstellen
    const marker = new AdvancedMarkerElement({
      map: map,
      position: MAP_CONFIG.position,
      content: markerContent,
      title: "Milk.city studio München",
    });

    // Klick-Ereignis zum Öffnen des Infowindows hinzufügen
    marker.addListener("click", () => {
      infoWindow.open({
        anchor: marker,
        map,
      });
    });
  } catch (error) {
    console.error("Fehler beim Laden der Maps-Bibliothek:", error);
    handleMapError();
  }
}

function createMarkerContent() {
  // Marker-Container erstellen
  const container = document.createElement("div");
  container.className = "custom-marker";

  // SVG direkt in den Container einfügen
  container.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#2A3067">
      <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z"/>
    </svg>
  `;
  return container;
}

// InfoWindow Content erstellen
function createInfoWindow() {
  return new google.maps.InfoWindow({
    content: `
      <div id="content">
        <div id="siteNotice">
          <p>
            Adresse:<br>
            milk.city studio<br>
            Frankfurter Ring 247<br>
            München
          </p>
        </div>
      </div>
    `,
    ariaLabel: "Munich milk.city Studio",
  });
}

// Maps Styles initialisieren
function initializeMapStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .custom-marker {
      cursor: pointer;
      animation: bounce 2s infinite ease-in-out;
    }

    .custom-marker:hover {
      animation-play-state: paused;
    }

    .map-error {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
    }
  `;
  return document.head.appendChild(style);
}

// Fehlerbehandlung
function handleMapError() {
  const mapContainer = document.getElementById("map");
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div class="map-error">
        <p>Karte konnte nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initializeMapStyles();
  initializeMap();
});
