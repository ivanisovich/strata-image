const teamContainer = document.querySelector(".our-team__members");
const servicesContainer = document.querySelector(".services__inner");
const publicationsContainer = document.querySelector("#publications__list");
const patentsContainer = document.querySelector("#patents__list");

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

function animateItems() {
  document.querySelectorAll(".service").forEach((card) => {
    observer.observe(card);
  });

  document.querySelectorAll(".our-team__member").forEach((card) => {
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
              }, index * 1); // Здесь 150 мс - базовая задержка

              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(item);
    }
  });
}

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
      { threshold: 0.3 }
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

  var mapSection = document.getElementById('map');
  var mapSectionPosition = mapSection.getBoundingClientRect();

  // Проверяем, находится ли карта в области видимости
  if (mapSectionPosition.top <= window.innerHeight && mapSectionPosition.bottom >= 0) {
      // Убираем обработчик события после загрузки карты, чтобы не загружать её повторно
      window.removeEventListener('scroll', arguments.callee);

      // Загружаем карту
      loadMap();
  }
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

fetch("/page-elements.json")
  .then((response) => response.json())
  .then((data) => {
    processTeamMembers(data.members);
    processArticles(data.services);
    processPublications(data.publications);
    processPatents(data.patents);

    animateItems();
  })
  .catch((error) => console.error(error));

document.querySelector(".edit-mark__search").addEventListener("focus", () => {
  document.querySelector(".marks-list").classList.remove("hidden");
});

// Загрузка элементов страницы
function processArticles(articles,lang) {
  articles.forEach((item) => {
    const article = document.createElement("article");
    const img = document.createElement("img");
    const imgWrapper = document.createElement("div");
    const textWrapper = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");

    article.className = "service";
    textWrapper.className = "service__text";
    imgWrapper.className = "service__image-wrapper";

    article.id = item.id;
    img.src = item.img;
    img.alt = item.title
    
    if(lang === "pt"){
      title.innerHTML = item.titlePt;
      description.innerHTML = item.descriptionPt;
    } else {
      title.innerHTML = item.title;
      description.innerHTML = item.description;
    }


    textWrapper.append(title, description);
    imgWrapper.append(img);
    article.append(imgWrapper, textWrapper);
    servicesContainer.append(article);
  });
}

function processTeamMembers(members,lang) {
  members.forEach((member) => {
    const memberArticle = document.createElement("article");
    const image = document.createElement("img");
    const imageWrapper = document.createElement("picture");
    const name = document.createElement("h3");
    const position = document.createElement("p");
    const description = document.createElement("p");
    const articleWrapper = document.createElement("div");

    memberArticle.className = "our-team__member";
    memberArticle.id = member.id;
    position.className = "our-team__member-position";
    description.className = "our-team__member-bio";
    articleWrapper.className = "our-team__member-wrapper";

    image.src = member.photo;
    name.innerHTML = member.name;
    image.alt = member.name

    if(lang === "pt"){
      position.innerHTML = member.positionPt;
      description.innerHTML = member.descriptionPt;
    } else {
      position.innerHTML = member.position;
      description.innerHTML = member.description;
    }

    if (member.srcset) {
      let source = document.createElement("source");
      source.media = "(max-width: 768px)";
      source.srcset = member.srcset;

      imageWrapper.append(source);
    }

    imageWrapper.append(image);
    articleWrapper.append(name, position, description);

    memberArticle.append(imageWrapper, articleWrapper);
    teamContainer.appendChild(memberArticle);
  });
}

function processPublications(publications,lang) {
  publications.forEach((item) => {
    let publication = document.createElement("li");
    publication.className = "publications__item";

    if(lang === "pt"){
      publication.innerHTML = item.descriptionPt;
    } else {
      publication.innerHTML = item.description;
    }
    publication.id = item.id;
    publicationsContainer.append(publication);
  });
}

function processPatents(patents,lang) {
  patents.forEach((item) => {
    let publication = document.createElement("li");
    publication.className = "publications__item";

    if(lang === "pt"){
      publication.innerHTML = item.descriptionPt;
    } else {
      publication.innerHTML = item.description;
    }
    publication.id = item.id;
    patentsContainer.append(publication);
  });
}

function processStatic(data){
  document.querySelectorAll(".nav-item").forEach((item,index)=>{
    item.innerText = data.navItems[index]
  })
  document.querySelector(".hero__title").innerText = data.heroText
  document.querySelector(".services__title").innerText = data.servicesTitle
  document.querySelectorAll(".services__subtitle").forEach((item,index)=>{
    item.innerText = data.servicesSubtitle[index]
  })

  const mapLink = document.createElement("a")
  mapLink.classList = "services__map-link"
  mapLink.innerText = data.servicesMapLink
  mapLink.href = "#client-data"
  document.querySelectorAll(".services__subtitle")[1].append(mapLink)

  
  document.querySelector(".publications__title").innerText = data.publicationsTitle
  document.querySelector("#publications__list-header").innerText = data.publicaionsSubtitle
  document.querySelector("#patents__list-header").innerText = data.patentsSubtitle
  document.querySelector(".map__title").innerText = data.mapTitle
  document.querySelector(".edit-mark__search").placeholder = data.mapPlaceholder
  document.querySelector(".scroll-message").innerText = data.scrollMessage
  document.querySelector(".our-team__title").innerText = data.membersTitle
  document.querySelector(".our-team__subtitle").innerText = data.membersSubtitle
  document.querySelector(".contacts-section__title").innerText = data.footerTitle
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".edit-mark__burger")) {
    document.querySelector(".marks-list").classList.toggle("hidden");
  }

  if (e.target.className == "button--show-publications") {
    document.querySelector(".publications").classList.toggle("hide-items");
  }

  if (e.target.className == "button--show-patents") {
    document.querySelector("#patents").classList.toggle("hide-items");
  }

  if (e.target.className == "portuguese-lang") {
    fetch("/page-elements.json")
      .then((response) => response.json())
      .then((data) => {
        servicesContainer.innerHTML = ""
        publicationsContainer.innerHTML = ""
        patentsContainer.innerHTML = ""
        teamContainer.innerHTML = ""
        
        processTeamMembers(data.members,"pt");
        processArticles(data.services,"pt");
        processPublications(data.publications,"pt");
        processPatents(data.patents,"pt");
      
        animateItems();
        document.querySelector("html").lang = "pt"
      })
      .catch((error) => console.error(error));

    fetch("/static-portuguese.json")
      .then((response) => response.json())
      .then((data) => {
        processStatic(data.static)
      })
      .catch((error) => console.error(error));
  }

  if (e.target.className == "english-lang") {
    location.reload()
  }
});
