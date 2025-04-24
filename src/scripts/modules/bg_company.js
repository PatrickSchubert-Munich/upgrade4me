"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const companySection = document.querySelector(".scrolling-bg .third");

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
          if (
            entry.target.classList.value === "scrolling-bg--container third"
          ) {
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
