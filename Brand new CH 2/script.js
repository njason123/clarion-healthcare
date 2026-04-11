document.addEventListener("DOMContentLoaded", function () {
    // Initialize Swiper
    var swiper = new Swiper(".swiper", {
        loop: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev"
        },
        autoplay: {
            delay: 4000,
            disableOnInteraction: false
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll(".nav-links a").forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const target = this.getAttribute("href");
            if (target.startsWith("#")) { // Only prevent default for internal links
                e.preventDefault();
                const section = document.querySelector(target);
                if (section) {
                    window.scrollTo({
                        top: section.offsetTop - 60,
                        behavior: "smooth"
                    });
                }
            }
        });
    });
});
