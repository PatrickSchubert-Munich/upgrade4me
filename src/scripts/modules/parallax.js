"use strict";

// Importiere SimpleParallax
import SimpleParallax from "simple-parallax-js/vanilla";

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".scrolling-bg--container");
  let parallaxInstances = [];

  const initParallax = () => {
    // Zuerst alle bestehenden Instanzen zerstören
    if (parallaxInstances.length > 0) {
      parallaxInstances.forEach((instance) => instance.destroy());
      parallaxInstances = [];
    }

    // Zurücksetzen der Styles
    images.forEach((image) => {
      image.style.transform = "";
      image.style.transition = "";
      image.style.backgroundAttachment = "";
    });

    // Nur für Bildschirme kleiner als 768px Parallax aktivieren
    if (window.innerWidth < 768) {
      images.forEach((image) => {
        const instance = new SimpleParallax(image, {
          delay: 0.1,
          scale: 1.6,
          overflow: true,
          transition: "linear",
          orientation: "down",
          MaxTransition: 90,
        });
        parallaxInstances.push(instance);
      });
    }
  };

  // Initial ausführen
  initParallax();

  // Debounce-Funktion für bessere Performance
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initParallax, 250);
  });
});
