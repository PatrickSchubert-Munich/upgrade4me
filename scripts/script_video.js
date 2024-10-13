"use strict";

let popupActive = false;
const video = document.querySelector(".aboutUs-video");
const videoPopup = document.querySelector(".aboutUs-video-popup");

function checkScroll(popupActive) {
  const boundingRect = video.getBoundingClientRect();
  const visible =
    boundingRect.top + boundingRect.height > 0 &&
    boundingRect.top < window.innerHeight;
  if (visible && !popupActive) {
    video.play();
  } else {
    video.pause();
  }
}

function checkPlayVideo() {
  const videoBtn = document.querySelectorAll(".aboutUs-btn--video");
  const videoElement = document.querySelector(".aboutUs-video-popup video");
  videoElement.volume = 0.75;
  videoBtn.forEach((playBtn) => {
    playBtn.addEventListener("click", (event) => {
      console.log("Button clicked"); // Debugging-Ausgabe
      const target = event.target.closest(".aboutUs--play-video");
      if (target) {
        console.log("Target found"); // Debugging-Ausgabe
        popupActive = true;
        videoPopup.classList.add("active");
        checkScroll(popupActive);
      }
    });
  });
}

function checkCloseVideo() {
  const closeBtn = document.querySelector("#btn-video-close");
  closeBtn.addEventListener("click", (event) => {
    if (event.target.id === "btn-video-close") {
      videoPopup.classList.remove("active");
      popupActive = false;
      checkScroll(popupActive);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  checkScroll(popupActive);

  // Scroll-Event Listener korrekt implementieren
  window.addEventListener("scroll", () => {
    checkScroll(popupActive);
  });

  // Resize-Event Listener, falls benötigt
  window.addEventListener("resize", () => {
    checkScroll(popupActive);
  });

  checkPlayVideo();
  checkCloseVideo();
});
