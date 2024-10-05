"use strict";

// Catch intersection elements
const firstContainer = document.querySelector("#team > #first-container");
const secondContainer = document.querySelector("#team > #second-container");
const thirdContainer = document.querySelector("#team > #third-container");
const fourthContainer = document.querySelector("#team > #fourth-container");

// Catch "to fade in" elements
const firstFromLeft = document.querySelector("#team > div:first-child img");
const firstFromRight = document.querySelector("#team > div:first-child div");
const secondFromLeft = document.querySelector("#team > div:nth-child(2) div");
const secondFromRight = document.querySelector("#team > div:nth-child(2) img");
const thirdFromLeft = document.querySelector("#team > div:nth-child(3) img");
const thirdFromRight = document.querySelector("#team > div:nth-child(3) div");
const fourthFromLeft = document.querySelector("#team > div:nth-child(4) div");
const fourthFromRight = document.querySelector("#team > div:nth-child(4) img");

const options = {
  rootMargin: "-200px",
  treshold: 1,
};

// Create an Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (entry.target.id === firstContainer.id) {
        firstFromLeft.classList.add("fade-in-left");
        firstFromRight.classList.add("fade-in-right");
      }

      if (entry.target.id === secondContainer.id) {
        secondFromLeft.classList.add("fade-in-left");
        secondFromRight.classList.add("fade-in-right");
      }

      if (entry.target.id === thirdContainer.id) {
        thirdFromLeft.classList.add("fade-in-left");
        thirdFromRight.classList.add("fade-in-right");
      }

      if (entry.target.id === fourthContainer.id) {
        fourthFromLeft.classList.add("fade-in-left");
        fourthFromRight.classList.add("fade-in-right");
      }

      observer.unobserve(entry.target);
    }
  });
}, options);

// Start Observer observe
observer.observe(firstContainer);
observer.observe(secondContainer);
observer.observe(thirdContainer);
observer.observe(fourthContainer);
