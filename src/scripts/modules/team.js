"use strict";

// Catch intersection elements
const firstContainer = document.querySelector(
  ".team-container--item.first-item"
);
const secondContainer = document.querySelector(
  ".team-container--item.second-item"
);
const thirdContainer = document.querySelector(
  ".team-container--item.third-item"
);
const fourthContainer = document.querySelector(
  ".team-container--item.fourth-item"
);

// Catch "to fade in" elements
const firstFromLeft = firstContainer?.children[0];
const firstFromRight = firstContainer?.children[1];
const secondFromLeft = secondContainer?.children[0];
const secondFromRight = secondContainer?.children[1];
const thirdFromLeft = thirdContainer?.children[0];
const thirdFromRight = thirdContainer?.children[1];
const fourthFromLeft = fourthContainer?.children[0];
const fourthFromRight = fourthContainer?.children[1];

const options = {
  rootMargin: null,
  rootMargin: "0px",
  threshold: [0, 0.15, 0.25],
};

document.addEventListener("DOMContentLoaded", () => {
  if (
    !firstContainer ||
    !secondContainer ||
    !thirdContainer ||
    !fourthContainer
  ) {
    console.warn("Einige Team-Container konnten nicht gefunden werden");
    return;
  }

  // Create an Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.2 && entry.intersectionRatio <= 0.5) {
        if (entry.target.classList.contains("first-item")) {
          firstFromLeft?.classList.add("fade-in-left");
          firstFromRight?.classList.add("fade-in-right");
        }

        if (entry.target.classList.contains("second-item")) {
          secondFromLeft?.classList.add("fade-in-left");
          secondFromRight?.classList.add("fade-in-right");
        }

        if (entry.target.classList.contains("third-item")) {
          thirdFromLeft?.classList.add("fade-in-left");
          thirdFromRight?.classList.add("fade-in-right");
        }

        if (entry.target.classList.contains("fourth-item")) {
          fourthFromLeft?.classList.add("fade-in-left");
          fourthFromRight?.classList.add("fade-in-right");
        }

        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Start Observer observe mit try-catch
  try {
    observer.observe(firstContainer);
    observer.observe(secondContainer);
    observer.observe(thirdContainer);
    observer.observe(fourthContainer);
  } catch (error) {
    console.warn("Fehler bei der Darstellung Team:", error);
  }
});
