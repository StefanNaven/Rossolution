"use strict";

// Mobilmeny med stöd för tangentbord, aria-expanded och stängning efter navigation.
const menuButton = document.querySelector(".menu-toggle");
const menu = document.getElementById("primary-nav");
if (menuButton && menu) {
  const closeMenu = () => {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Öppna menyn");
  };
  menuButton.addEventListener("click", () => {
    const nextOpen = menuButton.getAttribute("aria-expanded") !== "true";
    menu.classList.toggle("is-open", nextOpen);
    menuButton.setAttribute("aria-expanded", String(nextOpen));
    menuButton.setAttribute("aria-label", nextOpen ? "Stäng menyn" : "Öppna menyn");
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) closeMenu();
  });
}

// Kategorier för artiklar – fungerar utan externa bibliotek.
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const articles = [...document.querySelectorAll(".archive-grid .news-card")];
const emptyNotice = document.getElementById("filter-empty");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    let count = 0;
    articles.forEach((article) => {
      const visible = filter === "alla" || article.dataset.category === filter;
      article.hidden = !visible;
      if (visible) count += 1;
    });
    if (emptyNotice) emptyNotice.hidden = count > 0;
  });
});
