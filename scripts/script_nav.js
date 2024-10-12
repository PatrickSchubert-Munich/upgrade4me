"use strict";

// Sidenav icon (open sidenav)
const iconOpenSidenav = document.querySelector(".side-nav--icon");
iconOpenSidenav.classList.toggle("visible");

// Sidenav icon (close sidenav)
const iconCloseSidenav = document.querySelector(".closebtn");
iconCloseSidenav.classList.toggle("visible");

/* Set the width of the side navigation to 250px */
function openNav() {
  document.querySelector(".side-nav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.querySelector(".side-nav").style.width = "0";
}

iconOpenSidenav.addEventListener("click", () => {
  openNav();
});

iconCloseSidenav.addEventListener("click", () => {
  closeNav();
});
