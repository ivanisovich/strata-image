// Перевод
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
      {
          pageLanguage: "en",
          includedLanguages: "en,pt",
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element"
  );
}

// Исчезающий хедер

let lastScrollTop = 0;
let header = document.querySelector(".header");

window.addEventListener("scroll", function () {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling down, hide the header
    header.classList.add("hide");
  } else {
    // Scrolling up, show the header
    header.classList.remove("hide");
  }

  lastScrollTop = scrollTop;
});


const smoothLinks = document.querySelectorAll('a[href^="#"]');
for (let smoothLink of smoothLinks) {
  smoothLink.addEventListener("click", function (e) {
    e.preventDefault();
    const id = smoothLink.getAttribute("href");

    document.querySelector(id).scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}