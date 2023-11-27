
document.querySelector(".button--show-publications").addEventListener("click", () => {
  document.querySelector(".publications__list").classList.toggle("hide-items");
});

document.querySelector(".edit-mark__search").addEventListener("focus", () => {
  document.querySelector(".marks-list").classList.remove("hidden")
})

document.querySelector(".edit-mark__burger").addEventListener("click", () => {
  document.querySelector(".marks-list").classList.toggle("hidden")

  
})

// Анимации

// Функция, которая добавляет класс 'visible' к элементу при его появлении в поле зрения
function revealOnScroll(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Отменить наблюдение после появления элемента
    }
  });
}

let delayCounter = 0; // Глобальный счётчик для управления задержкой

// Создание экземпляра IntersectionObserver
let observer = new IntersectionObserver(revealOnScroll, {
  threshold: 0.2 // Можно настроить порог видимости
});

// Применение наблюдателя 
observer.observe(document.querySelector(".hero__title"))

document.querySelectorAll('.service').forEach(card => {
  observer.observe(card);
});

document.querySelectorAll('.publications__item').forEach((item, index) => {
  // Проверка, что элемент не скрыт
  if (window.getComputedStyle(item)) {
    let observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 150); // Здесь 200 мс - базовая задержка

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(item);
  }
});

document.querySelectorAll('.ellipses').forEach((item, index) => {
  // Проверка, что элемент не скрыт
  if (window.getComputedStyle(item)) {
    let observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, 750);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(item);
  }
});

// Исчезающий хедер

let lastScrollTop = 0;
let header = document.querySelector(".header");

window.addEventListener("scroll", function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Scrolling down, hide the header
        header.classList.add("hide")
  
    } else {
        // Scrolling up, show the header
        header.classList.remove("hide")
    }

    lastScrollTop = scrollTop;
});
