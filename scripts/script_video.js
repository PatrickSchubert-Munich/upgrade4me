"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".aboutUs-video");
  const videoPopup = document.getElementById("videoPopup");
  const popupVideo = document.getElementById("popupVideo");
  const playButtons = document.querySelectorAll(".aboutUs-btn--video");
  const closeButton = document.getElementById("btn-video-close");

  let popupActive = false;

  function checkScroll() {
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

  function openVideoPopup() {
    popupActive = true;
    videoPopup.classList.add("active");
    popupVideo.volume = 0.75;
    popupVideo.play();
    checkScroll();
  }

  function closeVideoPopup() {
    popupActive = false;
    videoPopup.classList.remove("active");
    popupVideo.pause();
    popupVideo.currentTime = 0;
    checkScroll();
  }

  playButtons.forEach((button) => {
    button.addEventListener("click", openVideoPopup);
  });

  closeButton.addEventListener("click", closeVideoPopup);

  videoPopup.addEventListener("click", (event) => {
    if (event.target === videoPopup) {
      closeVideoPopup();
    }
  });

  window.addEventListener("scroll", checkScroll);
  window.addEventListener("resize", checkScroll);

  // Initial check
  checkScroll();
});
