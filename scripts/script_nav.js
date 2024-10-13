"use strict";

const CLOSE_SIDENAV = 992;

document.addEventListener("DOMContentLoaded", () => {
  // Sidenav icon (open sidenav)
  const iconOpenSidenav = document.querySelector(".side-nav--icon");
  iconOpenSidenav.classList.toggle("visible");

  // Sidenav icon (close sidenav)
  const iconCloseSidenav = document.querySelector(".closebtn");
  iconCloseSidenav.classList.toggle("visible");

  /* Set the width of the side navigation to 250px */
  function openNav() {
    document.querySelector(".side-nav").style.width = "200px";
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

  window.addEventListener("resize", () => {
    let resize = window.innerWidth;
    if (resize === CLOSE_SIDENAV) {
      document.querySelector(".side-nav").style.width = "0";
    }
  });
});
