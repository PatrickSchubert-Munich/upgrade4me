"use strict";

const video = document.querySelector(".aboutUs-video");
const videoPopup = document.querySelector(".aboutUs-video-popup");

function checkScroll() {
  const boundingRect = video.getBoundingClientRect();
  const visible =
    boundingRect.top + boundingRect.height > 0 &&
    boundingRect.top < window.innerHeight;

  if (visible) {
    video.play();
  } else {
    video.pause();
  }
}

function checkPlayVideo() {
  const videoBtn = document.querySelectorAll(".aboutUs-btn--video");
  // Set default volume to 75%
  const videoElement = document.querySelector(".aboutUs-video-popup video");
  videoElement.volume = 0.75;
  videoBtn.forEach((playBtn) => {
    playBtn.addEventListener("click", (event) => {
      if (event.target.classList.contains("aboutUs--play-video")) {
        videoPopup.style.opacity = "1";
        videoPopup.style.visibility = "visible";
      }
    });
  });
}

function checkCloseVideo() {
  const closeBtn = document.querySelector("#btn-video-close");
  closeBtn.addEventListener("click", (event) => {
    if (event.target.id === "btn-video-close") {
      videoPopup.style.opacity = "0";
      videoPopup.style.visibility = "hidden";
    }
  });
}

// Call functions
checkScroll();
window.addEventListener("load", checkScroll, false);
window.addEventListener("scroll", checkScroll, false);
window.addEventListener("resize", checkScroll, false);

checkPlayVideo();
checkCloseVideo();
