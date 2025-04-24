"use strict";

const accordion = document.querySelectorAll(".accordion");

accordion.forEach((acc) => {
  acc.addEventListener("click", (event) => {
    // Button toggle
    const questionElement = event.currentTarget;
    const svg = questionElement.querySelector(".add");
    questionElement.classList.toggle("active");
    const panel = questionElement.nextElementSibling;

    // Icon toggle und Drehung
    const addIcon = questionElement.querySelector(".add");
    const removeIcon = questionElement.querySelector(".remove");

    if (questionElement.classList.contains("active")) {
      // Akkordeon öffnen -> Drehung nach links um 90 Grad
      addIcon.style.animation = "rotateLeft 0.3s linear forwards";
      panel.style.maxHeight = panel.scrollHeight + "px"; // Antwort wird sichtbar

      // Verzögerung, um sicherzustellen, dass das add-Icon die Drehung zeigt
      setTimeout(() => {
        addIcon.style.display = "none"; // Das Plus-Symbol verschwindet
        removeIcon.style.display = "block"; // Das Minus-Symbol erscheint
      }, 400); // Verzögerung, die mit der Dauer der Drehung übereinstimmt
    } else {
      // Akkordeon schließen -> Drehung zurück auf 0 Grad
      addIcon.style.animation = "rotateBack 0.3s linear forwards";
      panel.style.maxHeight = null; // Antwort wird ausgeblendet

      // Verzögerung, um sicherzustellen, dass das remove-Icon erst nach der Drehung verschwindet
      setTimeout(() => {
        removeIcon.style.display = "none"; // Das Minus-Symbol verschwindet
        addIcon.style.display = "block"; // Das Plus-Symbol erscheint
      }, 100); // Verzögerung, die mit der Dauer der Drehung übereinstimmt
    }
  });
});
