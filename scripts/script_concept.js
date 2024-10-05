"use strict";

// IntersectionObserver

const paragraphfirstChildLeft = document.getElementById("first-child-left");
const paragraphSecondChildRight = document.getElementById("second-child-right");
const paragraphThirdChildLeft = document.getElementById("third-child-left");
const paragraphFifthChildRight = document.getElementById("fifth-child-right");
const paragraphSixthChildLeft = document.getElementById("sixth-child-left");
const paragraphSeventhChildRight = document.getElementById(
  "seventh-child-right"
);

const options = {
  rootMargin: "-200px",
  treshold: 1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      console.log(entry.target.id);

      if (entry.target.id === "first-child-left") {
        entry.target.classList.add("fade-in-left");
      }

      if (entry.target.id === "second-child-right") {
        entry.target.classList.add("fade-in-right");
      }

      if (entry.target.id === "third-child-left") {
        entry.target.classList.add("fade-in-left");
      }

      if (entry.target.id === "fifth-child-right") {
        entry.target.classList.add("fade-in-right");
      }

      if (entry.target.id === "sixth-child-left") {
        entry.target.classList.add("fade-in-left");
      }

      if (entry.target.id === "seventh-child-right") {
        entry.target.classList.add("fade-in-right");
      }

      observer.unobserve(entry.target);
    }
  });
}, options);

observer.observe(paragraphfirstChildLeft);
observer.observe(paragraphSecondChildRight);
observer.observe(paragraphThirdChildLeft);
observer.observe(paragraphFifthChildRight);
observer.observe(paragraphSixthChildLeft);
observer.observe(paragraphSeventhChildRight);
