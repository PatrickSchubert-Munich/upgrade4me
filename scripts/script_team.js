"use strict";

// Catch intersection elements
const firstContainer = document.querySelector(".team-container--item:first-child");
const secondContainer = document.querySelector(".team-container--item:nth-child(2)");
const thirdContainer = document.querySelector(".team-container--item:nth-child(3)");
const fourthContainer = document.querySelector(".team-container--item:last-child");

// Catch "to fade in" elements
const firstFromLeft = document.querySelector(".team-container--item:first-child img");
const firstFromRight = document.querySelector(".team-container--item:first-child p");
const secondFromLeft = document.querySelector(".team-container--item:nth-child(2) p");
const secondFromRight = document.querySelector(".team-container--item:nth-child(2) img");
const thirdFromLeft = document.querySelector(".team-container--item:nth-child(3) img");
const thirdFromRight = document.querySelector(".team-container--item:nth-child(3) p");
const fourthFromLeft = document.querySelector(".team-container--item:nth-child(4) p");
const fourthFromRight = document.querySelector(".team-container--item:nth-child(4) img");

// company section
const companySection = document.getElementById("scrolling-background-third");
const companySectionDiv = document.querySelector("#scrolling-background-third > article > div");

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

      if (entry.target.id === 'scrolling-background-third') {
        companySectionDiv.classList.add("animate__fadeInDownBig");
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
observer.observe(companySection);
