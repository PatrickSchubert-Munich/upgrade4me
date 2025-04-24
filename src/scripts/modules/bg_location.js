"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const loactionSection = document.querySelector(".scrolling-bg .fourth");

  if (!loactionSection) {
    console.error("Location section not found");
    return;
  }

  const locationSectionArticle = loactionSection.querySelector("article");

  if (!locationSectionArticle) {
    console.error("Location section article not found");
    return;
  }

  const bgLocationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (
            entry.target.classList.value === "scrolling-bg--container fourth"
          ) {
            locationSectionArticle.classList.add("animate__fadeInDownBig");
          }

          bgLocationObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.2,
    }
  );

  bgLocationObserver.observe(loactionSection);
});
