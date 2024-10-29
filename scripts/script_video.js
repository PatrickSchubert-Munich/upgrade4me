"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const backgroundVideo = document.querySelector(".aboutUs-video");
  const videoPopup = document.getElementById("videoPopup");
  const popupVideo = videoPopup.querySelector("video");
  const playButtons = document.querySelectorAll(".aboutUs-btn--video");
  const closeButton = document.getElementById("btn-video-close");

  let popupActive = false;

  // Video vorausladen, wenn der Browser es unterstützt
  if (backgroundVideo) {
    backgroundVideo.preload = "auto";
  }

  // IntersectionObserver für das Hintergrundvideo
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          !entry.isIntersecting ||
          entry.intersectionRatio < 0.3 ||
          popupActive
        ) {
          backgroundVideo.pause();
        } else if (!popupActive) {
          backgroundVideo.play().catch(() => {
            console.log("Autoplay wurde verhindert");
          });
        }
      });
    },
    {
      threshold: [0, 0.3],
      rootMargin: "50px",
    }
  );

  videoObserver.observe(backgroundVideo);

  function openVideoPopup() {
    popupActive = true;
    videoPopup.classList.add("active");

    // Hintergrundvideo stoppen und zurücksetzen
    backgroundVideo.pause();
    backgroundVideo.currentTime = 0;

    // Popup Video nur vorbereiten, aber nicht starten
    if (popupVideo) {
      popupVideo.currentTime = 0;
      popupVideo.volume = 0.75;
      // Kein automatischer Start mehr
    }
  }

  function closeVideoPopup() {
    popupActive = false;
    videoPopup.classList.remove("active");

    // Popup Video stoppen und zurücksetzen
    if (popupVideo) {
      popupVideo.pause();
      popupVideo.currentTime = 0;
    }

    // Prüfen ob Hintergrundvideo im Viewport ist
    const videoRect = backgroundVideo.getBoundingClientRect();
    const isVisible =
      videoRect.top < window.innerHeight && videoRect.bottom > 0;

    if (isVisible && !popupActive) {
      backgroundVideo.play().catch(() => {
        console.log("Autoplay wurde verhindert");
      });
    }
  }

  // Fehlerbehandlung für Video-Ereignisse
  if (popupVideo) {
    popupVideo.addEventListener("error", (e) => {
      console.error("Fehler beim Laden des Videos:", e);
    });
  }

  // Event Listeners
  playButtons.forEach((button) => {
    button.addEventListener("click", openVideoPopup);
  });

  closeButton.addEventListener("click", closeVideoPopup);

  videoPopup.addEventListener("click", (event) => {
    if (event.target === videoPopup) {
      closeVideoPopup();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popupActive) {
      closeVideoPopup();
    }
  });
});
