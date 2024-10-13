"use strict";

// window size
const DEFAULT_CLOSE_SIDENAV = 992;
const LESS_WITH_FADE_IN = 576;
let resize;

// side-nav with
const SIDE_NAV_FULL_WITH = "200px";
const SIDE_NAV_LESS_WITH = "165px";

// Sidenav icon (open sidenav)
const iconOpenSidenav = document.querySelector(".side-nav--icon");
iconOpenSidenav.classList.toggle("visible");

// Sidenav icon (close sidenav)
const iconCloseSidenav = document.querySelector(".closebtn");
iconCloseSidenav.classList.toggle("visible");

// Set the width of the side navigation to SIDE_NAV_FULL_WITH or SIDE_NAV_LESS_WITH
function openNav(sidenavWidth) {
  document.querySelector(".side-nav").style.width = sidenavWidth;
}

// Set the width of the side navigation to 0
function closeNav() {
  document.querySelector(".side-nav").style.width = "0";
}

document.addEventListener("DOMContentLoaded", () => {
  // Event-Listeners
  window.addEventListener("resize", () => {
    resize = window.innerWidth;

    if (resize >= DEFAULT_CLOSE_SIDENAV) {
      closeNav();
    }
  });

  iconOpenSidenav.addEventListener("click", () => {
    if (resize <= LESS_WITH_FADE_IN) {
      openNav(SIDE_NAV_LESS_WITH);
    } else {
      openNav(SIDE_NAV_FULL_WITH);
    }
  });

  iconCloseSidenav.addEventListener("click", () => {
    closeNav();
  });
});
