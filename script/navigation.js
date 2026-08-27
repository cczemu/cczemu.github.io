const navMenu = document.querySelector("#navMenu");
const navLinks = document.querySelector(".navLinkGroup");

function toggleNavigation() {
    const isOpen = navLinks.classList.toggle("active");
    navMenu.setAttribute("aria-expanded", String(isOpen));
}

navMenu.addEventListener("click", toggleNavigation);
navMenu.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleNavigation();
    }
});
