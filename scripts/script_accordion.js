"use strict";

const accordion = document.querySelectorAll(".accordion");
// var accordionAdd = document.querySelectorAll(".accordion .add");
// var accordionRemove = document.querySelectorAll(".accordion .remove");

accordion.forEach((acc) => {
  acc.addEventListener("click", (event) => {
    // Button toggle
    const questionElement = event.currentTarget;
    questionElement.classList.toggle("active");
    const panel = questionElement.nextElementSibling;

    // Icon toggle
    const addIcon = questionElement.querySelector(".add");
    const removeIcon = questionElement.querySelector(".remove");

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
      removeIcon.style.display = "none";
      addIcon.style.display = "block";
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
      addIcon.style.display = "none";
      removeIcon.style.display = "block";
    }
  });
});
