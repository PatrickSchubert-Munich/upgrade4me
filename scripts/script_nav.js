"use strict";

// Konstanten für Breiten und Navigation
const DEFAULT_CLOSE_SIDENAV = 992;
const LESS_WITH_FADE_IN = 576;
const SIDE_NAV_FULL_WITH = "200px";
const SIDE_NAV_LESS_WITH = "165px";

// DOM-Elemente
const sideNav = document.querySelector(".side-nav");
const iconOpenSidenav = document.querySelector(".side-nav--icon");
const iconCloseSidenav = document.querySelector(".closebtn");

// Initialisierung der Fenstergröße
let currentWindowWidth = window.innerWidth;

// Hilfsfunktionen
function openNav(sidenavWidth) {
  if (!sideNav) return;
  sideNav.style.width = sidenavWidth;
}

function closeNav() {
  if (!sideNav) return;
  sideNav.style.width = "0";
}

// Hauptfunktion zum Überprüfen und Setzen der Navigation
function handleNavigation() {
  currentWindowWidth = window.innerWidth;

  if (currentWindowWidth >= DEFAULT_CLOSE_SIDENAV) {
    closeNav();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Prüfe initial die Fenstergröße
  handleNavigation();

  // Toggle Klassen für Icons
  if (iconOpenSidenav) iconOpenSidenav.classList.toggle("visible");
  if (iconCloseSidenav) iconCloseSidenav.classList.toggle("visible");

  // Resize Event-Listener
  window.addEventListener("resize", handleNavigation);

  // Click-Handler für das Öffnen
  if (iconOpenSidenav) {
    iconOpenSidenav.addEventListener("click", () => {
      const sidenavWidth =
        currentWindowWidth <= LESS_WITH_FADE_IN
          ? SIDE_NAV_LESS_WITH
          : SIDE_NAV_FULL_WITH;
      openNav(sidenavWidth);
    });
  }

  // Click-Handler für das Schließen
  if (iconCloseSidenav) {
    iconCloseSidenav.addEventListener("click", closeNav);
  }
});
