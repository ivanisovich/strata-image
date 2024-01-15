const addMarkPopup = document.querySelector("#add-mark");
const editMarkPopup = document.querySelector("#edit-mark");
let title = document.querySelector("#title");
let description = document.querySelector("#description");
let titlePt = document.querySelector("#title-pt");
let descriptionPt = document.querySelector("#description-pt");
let newLink = document.querySelector("#new-link");
let newTitle = document.querySelector("#new-title");
let newDescription = document.querySelector("#new-description");
let newTitlePt = document.querySelector("#new-title-pt");
let newDescriptionPt = document.querySelector("#new-description-pt");
let addMarkBtn = document.querySelector("#add-mark__btn");
let editMarkBtn = document.querySelector("#edit-mark__btn");
let kmzTitle = document.querySelector("#kmz-title");
let kmzDescription = document.querySelector("#kmz-description");
let kmzLink = document.querySelector("#kmz-link");

function createGeojson([...coords], title, description, titlePt, descriptionPt, link) {
  let geojson = {
    type: "Feature",
    properties: {
      title: title,
      description: description,
      titlePt:titlePt,
      descriptionPt: descriptionPt,
      link: link,
    },
    geometry: {
      type: "Polygon",
      coordinates: [...coords],
    },
  };

  return geojson;
}

var draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
});

map.addControl(draw);

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
          createGeojson(coords, title.value, description.value,titlePt.value,descriptionPt.value, link.value)
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

map.on("draw.delete", function (e) {
  addMarkPopup.classList.add("hidden");
});

// Редактирование меток
document.addEventListener("click", (e) => {
  if (e.target.className == "delete-button") {
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
    newTitlePt.value = e.target.parentNode.children[2].innerText;
    newDescriptionPt.value = e.target.parentNode.children[3].innerText;
    newLink.value = e.target.parentNode.children[4].href;

    editMarkBtn.addEventListener("click", () => {
      let id = e.target.parentNode.id;
      let title = newTitle.value;
      let description = newDescription.value;
      let titlePt = newTitlePt.value;
      let descriptionPt = newDescriptionPt.value;
      let link = newLink.value;
      fetch("/editMark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, title, description,titlePt,descriptionPt, link }),
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

    if (e.target.parentNode.id == "add-mark") {
      var selectedFeatures = draw.getSelected();

      // Проверяем, что есть выбранные объекты
      if (selectedFeatures.features.length > 0) {
        // Получаем идентификатор выбранного объекта
        var selectedId = selectedFeatures.features[0].id;

        // Удаляем объект с указанным идентификатором
        draw.delete(selectedId);
      } else {
        // Код для обработки ситуации, когда ничего не выбрано
        console.log("Не выбраны области для удаления");
      }
    }
  }
});

document.querySelector(".kml-form").addEventListener("submit", function (e) {
  e.preventDefault();

  var formData = new FormData(this);

  fetch("/uploadKMZ", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("message").innerText = data;
      location.reload();
      // Вы можете здесь обновить другие части вашей страницы при необходимости
    })
    .catch((error) => {
      document.getElementById("message").innerText = "Ошибка: " + error;
    });
});

document.querySelector(".edit-mark__burger").addEventListener("click", () => {
  marksList.classList.toggle("hidden");
});

document.querySelector(".show-kml").addEventListener("click",()=>{
  document.querySelector(".kml-form").classList.toggle("hidden")
})