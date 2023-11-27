document
  .querySelector(".button--show-publications")
  .addEventListener("click", () => {
    document
      .querySelector(".publications__list")
      .classList.toggle("hide-items");
  });

document.querySelector(".edit-mark__search").addEventListener("focus", () => {
  document.querySelector(".marks-list").classList.remove("hidden");
});

document.querySelector(".edit-mark__burger").addEventListener("click", () => {
  document.querySelector(".marks-list").classList.toggle("hidden");
});

// Анимации

// Функция, которая добавляет класс 'visible' к элементу при его появлении в поле зрения
function revealOnScroll(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target); // Отменить наблюдение после появления элемента
    }
  });
}

let delayCounter = 0; // Глобальный счётчик для управления задержкой

// Создание экземпляра IntersectionObserver
let observer = new IntersectionObserver(revealOnScroll, {
  threshold: 0.2, // Можно настроить порог видимости
});

// Применение наблюдателя
observer.observe(document.querySelector(".hero__title"));

document.querySelectorAll(".service").forEach((card) => {
  observer.observe(card);
});

document.querySelectorAll(".publications__item").forEach((item, index) => {
  // Проверка, что элемент не скрыт
  if (window.getComputedStyle(item)) {
    let observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, index * 150); // Здесь 200 мс - базовая задержка

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(item);
  }
});

document.querySelectorAll(".ellipses").forEach((item, index) => {
  // Проверка, что элемент не скрыт
  if (window.getComputedStyle(item)) {
    let observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible");
            }, 750);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(item);
  }
});

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

// Плавный скролл

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

// Свайпер

var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 10,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    "@0.00": {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    "@0.50": {
      slidesPerView: 1,
      spaceBetween: 12,
    },
    "@0.75": {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    "@1.00": {
      slidesPerView: 2,
      spaceBetween: 40,
    },
    "@1.50": {
      slidesPerView: 5,
      spaceBetween: 50,
    },
  },
});

document.querySelector(".our-team__member-button").addEventListener("click",(e)=>{
e.target.closest(".our-team__member").classList.toggle("hidden")

})