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
const firstFromLeft = firstContainer.children[0];
const firstFromRight = firstContainer.children[1];
const secondFromLeft = secondContainer.children[0];
const secondFromRight = secondContainer.children[1];
const thirdFromLeft = thirdContainer.children[0];
const thirdFromRight = thirdContainer.children[1];
const fourthFromLeft = fourthContainer.children[0];
const fourthFromRight = fourthContainer.children[1];

// company section
const companySection = document.getElementById("scrolling-background-third");
const companySectionDiv = document.querySelector(
  "#scrolling-background-third > article > div"
);

const options = {
  rootMargin: "-200px",
  treshold: 1,
};

// Create an Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains("first-item")) {
        firstFromLeft.classList.add("fade-in-left");
        firstFromRight.classList.add("fade-in-right");
      }

      if (entry.target.classList.contains("second-item")) {
        secondFromLeft.classList.add("fade-in-left");
        secondFromRight.classList.add("fade-in-right");
      }

      if (entry.target.classList.contains("third-item")) {
        thirdFromLeft.classList.add("fade-in-left");
        thirdFromRight.classList.add("fade-in-right");
      }

      if (entry.target.classList.contains("fourth-item")) {
        fourthFromLeft.classList.add("fade-in-left");
        fourthFromRight.classList.add("fade-in-right");
      }

      if (entry.target.id === "scrolling-background-third") {
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
