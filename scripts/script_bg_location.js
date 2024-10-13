"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const loactionSection = document.getElementById("scrolling-bg-fourth");

  if (!companySection) {
    console.error("Company section not found");
    return;
  }

  const locationSectionArticle = loactionSection.querySelector("article");

  if (!locationSectionArticle) {
    console.error("Company section article not found");
    return;
  }

  const bgLocationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === "scrolling-bg-fourth") {
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
