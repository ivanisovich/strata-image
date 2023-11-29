const teamContainer = document.querySelector(".our-team__inner");
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

// Загрузка работников
fetch("http://localhost:3000/landing/get-members")
  .then((response) => response.json())
  .then((members) => {
    processTeamMembers(members);
  })
  .catch((error) => console.error(error));

function processTeamMembers(members) {
  members.forEach((member) => {
    console.log(member);
    const memberArticle = document.createElement("article")
    const image = document.createElement("img")
    const textWrapper = document.createElement("div")
    const name = document.createElement("h3")
    const position = document.createElement("p")
    const bio = document.createElement("p")

    memberArticle.className = "our-team__member"
    memberArticle.id = member.id
    textWrapper.className = "our-team__member-text"
    position.className = "our-team__member-position"
    bio.className = "our-team__member-bio"
  
    image.src = member.photo
    name.innerHTML = member.name
    position.innerHTML = member.position
    bio.innerHTML = member.description

    textWrapper.append(name,position,bio)
    memberArticle.append(image,textWrapper)

    // member.append(editButton, deleteButton);
    teamContainer.appendChild(memberArticle);
  });
}