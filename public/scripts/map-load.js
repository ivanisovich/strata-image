mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbmlzb3ZpY2giLCJhIjoiY2xvZDQydDAwMDUwazJrbzIxNmRrZTk4eCJ9.SQwaOs9R3Dvn2QFoZ63F6w";

// Инициализация карты
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [12.4924, 41.8902], // Начальные координаты
  zoom: 5, // Уровень масштабирования
});

var draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
});
map.addControl(draw);

<<<<<<< HEAD

// Загруза меток
let marks = fetch("/getMarks") // Здесь указывается URL маршрута на сервере
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    return response.json();
  })
  .then((data) => {
    if (data.features.length !== 0) {
      searchInput.classList.remove("hidden");
    }
    data.features.forEach((element) => {
      let listItem = document.createElement("li");
      let title = document.createElement("strong");
      let description = document.createElement("p");
      let deleteButton = document.createElement("button");
      let editButton = document.createElement("button");

      listItem.className = "list-item";
      title.innerHTML = element.properties.title;
      description.innerHTML = element.properties.description;
      deleteButton.innerHTML = "Удалить";
      deleteButton.className = "delete-button";
      editButton.innerHTML = "Изменить";
      editButton.className = "edit-button";
      listItem.id = element.properties.id;
      listItem.append(title, description, deleteButton, editButton);
      marksList.append(listItem);
    });
  })
  .catch((error) => {
    console.error("Произошла ошибка:", error);
});


=======
function createGeojson([...coords], title, description) {
  let geojson = {
    type: "Feature",
    properties: {
      title: title,
      description: description,
    },
    geometry: {
      type: "Polygon",
      coordinates: [...coords],
    },
  };

  return geojson;
}

map.on("draw.create", function (event) {
  document.querySelector("#add-mark").classList.remove("hidden")
  var data = draw.getAll();
  let title = document.querySelector("#title");
  let description = document.querySelector("#description");
  document.querySelector("#add-mark__btn").addEventListener("click", (e) => {
    e.preventDefault()
    console.log(data.features.length)

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
          createGeojson(coords, title.value, description.value)
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

>>>>>>> b891c964cb15e21742087c96d50c9f31a04884d1
// Добавление интерактивности
map.on("load", function () {
  // Добавление возможности выбора территории (полигонов)
  map.addSource("territories", {
    type: "geojson",
    data: "../../marks.geojson", // Замените на свои геоданные
  });

  map.addLayer({
    id: "territories-fill",
    type: "fill",
    source: "territories",
    layout: {},
    paint: {
      "fill-color": "rgba(0, 171, 85, 0.3)",
    },
  });

<<<<<<< HEAD
  function returnMarkHtml(title, description,link) {
=======
  function returnMarkHtml(title, description) {
>>>>>>> b891c964cb15e21742087c96d50c9f31a04884d1
    let markUp =
      '<article class="mark"> <img src="./public/images/service.jpg" alt=""/> <div class="mark__text"> <h3>' +
      title +
      "</h3> <p>" +
      description +
<<<<<<< HEAD
      "</p> <a>" +
      link
      "</a>"
      "</div> </article>";
=======
      "</p> </div> </article>";
>>>>>>> b891c964cb15e21742087c96d50c9f31a04884d1
    return markUp;
  }

  map.on("click", "territories-fill", function (e) {
    var feature = e.features[0];
    console.log(feature);
    var coordinates = e.lngLat;
    var popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
<<<<<<< HEAD
        returnMarkHtml(feature.properties.title, feature.properties.description,feature.properties.link)
=======
        returnMarkHtml(feature.properties.title, feature.properties.description)
>>>>>>> b891c964cb15e21742087c96d50c9f31a04884d1
      )
      .addTo(map);
  });
});

map.on("mouseenter", "territories-fill", function () {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "territories-fill", function () {
  map.getCanvas().style.cursor = "";
});
<<<<<<< HEAD

=======
>>>>>>> b891c964cb15e21742087c96d50c9f31a04884d1
