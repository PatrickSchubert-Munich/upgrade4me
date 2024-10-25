"use strict";

const scrollers = document.querySelectorAll(".gallery-container");

// Wenn reduzierte Bewegung nicht gewünscht ist, starte die Animation
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

function addAnimation() {
  scrollers.forEach((scroller) => {
    // Animation vorbereiten wie bisher
    scroller.setAttribute("data-animated", true);
    const scrollerInner = scroller.querySelector(".gallery-container--rows");
    const scrollerContent = Array.from(scrollerInner.children);

    // Bilder duplizieren wie bisher
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });

    // Neuer Code: Intersection Observer für Animation Control
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Hole die Animation
          const galleryRows = entry.target.querySelector(
            ".gallery-container--rows"
          );

          if (entry.isIntersecting) {
            // Starte Animation wenn sichtbar
            galleryRows.style.animationPlayState = "running";
          } else {
            // Pausiere Animation wenn nicht sichtbar
            galleryRows.style.animationPlayState = "paused";
          }
        });
      },
      {
        // Schwellenwert bei 10% Sichtbarkeit
        threshold: 0.1,
      }
    );

    // Beobachte den Gallery Container
    observer.observe(scroller);
  });
}
