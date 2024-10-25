"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const backgroundVideo = document.querySelector(".aboutUs-video");
  const videoPopup = document.getElementById("videoPopup");
  const popupVideo = document.getElementById("popupVideo");
  const playButtons = document.querySelectorAll(".aboutUs-btn--video");
  const closeButton = document.getElementById("btn-video-close");

  let popupActive = false;

  // IntersectionObserver für das Hintergrundvideo
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
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

    // Hintergrundvideo pausieren
    backgroundVideo.pause();

    // Popup Video nur vorbereiten, aber nicht automatisch starten
    popupVideo.currentTime = backgroundVideo.currentTime;
    popupVideo.volume = 0.75;
    // popupVideo.play() wurde entfernt - kein Autostart mehr
  }

  function closeVideoPopup() {
    popupActive = false;
    videoPopup.classList.remove("active");

    // Popup Video stoppen
    popupVideo.pause();
    popupVideo.currentTime = 0;

    // Prüfen ob Hintergrundvideo im Viewport ist
    const videoRect = backgroundVideo.getBoundingClientRect();
    const isVisible =
      videoRect.top < window.innerHeight && videoRect.bottom > 0;

    if (isVisible) {
      backgroundVideo.play().catch(() => {
        console.log("Autoplay wurde verhindert");
      });
    }
  }

  // Event Listeners bleiben gleich
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
