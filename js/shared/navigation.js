const menuButton = document.querySelector("#nav-menu");
const navigationLinks = document.querySelector("#nav-links");

function toggleNavigation() {
    const isOpen = navigationLinks.classList.toggle("active");
    menuButton.setAttribute("aria-expanded", String(isOpen));
}

menuButton.addEventListener("click", toggleNavigation);
