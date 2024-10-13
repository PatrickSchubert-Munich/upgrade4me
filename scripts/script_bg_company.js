"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const companySection = document.getElementById("scrolling-bg-third");

  if (!companySection) {
    console.error("Company section not found");
    return;
  }

  const companySectionArticle = companySection.querySelector("article");

  if (!companySectionArticle) {
    console.error("Company section article not found");
    return;
  }

  const bgCompanyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === "scrolling-bg-third") {
            companySectionArticle.classList.add("animate__fadeInDownBig");
          }

          bgCompanyObserver.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.2,
    }
  );

  bgCompanyObserver.observe(companySection);
});
