const marksList = document.querySelector(".marks-list");
const marksItem = document
  .querySelector(".marks-list")
  .getElementsByTagName("li");
const addMarkPopup = document.querySelector("#add-mark");
const editMarkPopup = document.querySelector("#edit-mark");
let title = document.querySelector("#title");
let description = document.querySelector("#description");
let newTitle = document.querySelector("#new-title");
let newDescription = document.querySelector("#new-description");
let addMarkBtn = document.querySelector("#add-mark__btn");
let editMarkBtn = document.querySelector("#edit-mark__btn");
let searchInput = document.querySelector(".edit-mark__search");

// Добавление меток
function createGeojson([...coords], title, description, link) {
  let geojson = {
    type: "Feature",
    properties: {
      title: title,
      description: description,
      link: link,
    },
    geometry: {
      type: "Polygon",
      coordinates: [...coords],
    },
  };

  return geojson;
}

map.on("draw.create", function (event) {
  document.querySelector("#add-mark").classList.remove("hidden");
  var data = draw.getAll();
  let title = document.querySelector("#title");
  let description = document.querySelector("#description");
  let link = document.querySelector("#document-link");
  document.querySelector("#add-mark__btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (
      data.features.length > 0 &&
      title.value !== "" &&
      description.value !== ""
    ) {
      var coords = event.features[0].geometry.coordinates;

      fetch("/map-editor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          createGeojson(coords, title.value, description.value, link.value)
        ),
      })
        .then((response) => {
          if (response.ok) {
            // Успешно отправлено
            console.log("Координаты отправлены на сервер");
          } else {
            // Обработка ошибки при отправке
            console.error("Ошибка при отправке координат на сервер");
          }
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
        });
      location.reload();
    }
  });
});

// Поиск меток
document.getElementById("search").addEventListener("input", function () {
  let filter = this.value.toLowerCase(); // берем значение из инпута и приводим его к нижнему регистру
  let li = marksItem; // берем все элементы li из списка ul

  for (let i = 0; i < li.length; i++) {
    if (li[i].innerText.toLowerCase().indexOf(filter) > -1) {
      // если текст элемента li содержит значение из инпута
      li[i].style.display = ""; // показываем элемент
    } else {
      li[i].style.display = "none"; // скрываем элемент
    }
  }
});

// Редактирование меток
document.addEventListener("click", (e) => {
  if (e.target.className == "delete-button") {
    console.log(e.target.parentNode.id);
    let id = e.target.parentNode.id;
    fetch("/deleteMark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => {
        if (response.ok) {
          // Успешно отправлено

          console.log("Координаты отправлены на сервер");
        } else {
          // Обработка ошибки при отправке
          console.error("Ошибка при отправке координат на сервер");
        }
      })
      .catch((error) => {
        console.error("Ошибка при выполнении запроса:", error);
      });
    location.reload();
  }

  if (e.target.className == "edit-button") {
    editMarkPopup.classList.remove("hidden");
    newTitle.value = e.target.parentNode.children[0].innerText;
    newDescription.value = e.target.parentNode.children[1].innerText;
    editMarkBtn.addEventListener("click", () => {
      let id = e.target.parentNode.id;
      let title = newTitle.value;
      let description = newDescription.value;
      fetch("/editMark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, title, description }),
      })
        .then((response) => {
          if (response.ok) {
            // Успешно отправлено

            console.log("Координаты отправлены на сервер");
          } else {
            // Обработка ошибки при отправке
            console.error("Ошибка при отправке координат на сервер");
          }
        })
        .catch((error) => {
          console.error("Ошибка при выполнении запроса:", error);
        });
    });
  }

  if (e.target.className == "close-form") {
    e.target.parentNode.classList.add("hidden");
  }
});
