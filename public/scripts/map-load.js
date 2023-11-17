mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbmlzb3ZpY2giLCJhIjoiY2xvZDQydDAwMDUwazJrbzIxNmRrZTk4eCJ9.SQwaOs9R3Dvn2QFoZ63F6w";
let searchInput = document.querySelector(".edit-mark__search");
const marksList = document.querySelector(".marks-list");
const marksItem = document
  .querySelector(".marks-list")
  .getElementsByTagName("li");
// Инициализация карты
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-112.4924, 31.8902], // Начальные координаты
  zoom: 4, // Уровень масштабирования
});
var markers = {};
let isClientView = true;
if (window.location.href.includes("/map-editor")) {
  isClientView = false;
}

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

  function returnMarkHtml(title, description, link) {
    let markUp =
      '<article class="mark"> <img src="../public/images/service.jpg" alt=""/> <div class="mark__text"> <h3>' +
      title +
      "</h3> <p>" +
      description +
      "</p> <a>" +
      link;
    ("</a>");
    ("</div> </article>");
    return markUp;
  }

  // Хранение созданных маркеров

  var isMarkersAdded = false;
  var geojsonData = null;

  function addMarkers() {
    if (isMarkersAdded || !geojsonData) return;
    var features = map.querySourceFeatures("territories");

    geojsonData.features.forEach(function (feature) {
      var coordinates = feature.geometry.coordinates[0];
      // Проверяем, существует ли маркер для данной области
      if (!markers[feature.properties.id]) {
        // Находим средние значения координат полигона
        var lngSum = 0;
        var latSum = 0;
        for (var i = 0; i < coordinates.length; i++) {
          lngSum += coordinates[i][0];
          latSum += coordinates[i][1];
        }
        var lngAvg = lngSum / coordinates.length;
        var latAvg = latSum / coordinates.length;

        // Создание булавки
        var marker = new mapboxgl.Marker({ color: "rgba(0, 171, 85)" })
          .setLngLat([lngAvg, latAvg])
          .addTo(map);

        marker.getElement().addEventListener("mouseenter", function () {
          marker.getElement().style.cursor = "pointer";
        });

        // Добавление события mouseleave для возвращения курсора к обычному стилю
        marker.getElement().addEventListener("mouseleave", function () {
          marker.getElement().style.cursor = "";
        });

        // Создание попапа
        var popup = new mapboxgl.Popup().setHTML(
          returnMarkHtml(
            feature.properties.title,
            feature.properties.description,
            feature.properties.link
          )
        );

        // Привязка попапа к маркеру
        marker.setPopup(popup);
        // Добавление обработчика события для булавки
        marker.getElement().addEventListener("click", function () {
          // Получаем границы полигона
          var bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

          // Смещаем центр карты чуть левее
          var newCenter = [bounds.getCenter().lng, bounds.getCenter().lat];

          // Устанавливаем камеру с использованием метода fitBounds

          // Чтобы камера двигалась левее, используем panTo с небольшой задержкой после fitBounds
          
          map.flyTo({
            center: newCenter, // Целевые координаты центра
            zoom: 10, // Целевой уровень зума
            speed: 0.5, // Увеличенная скорость перехода
            curve: 1, // Кривая скорости (1 для линейной анимации)
            easing: function (t) {
              return t;
            },
            essential: true, // Это свойство управляет анимацией для пользовательского взаимодействия и доступности
            duration: 1000, // Более короткая продолжительность анимации (1 секунда)
          });
        });

        // Сохраняем маркер в объекте для последующей проверки
        markers[feature.properties.id] = marker;
      }
    });

    isMarkersAdded = true;
  }

  fetch("../../marks.geojson")
    .then((response) => response.json())
    .then((data) => {
      geojsonData = data;
      addMarkers(); // Вызываем addMarkers после загрузки данных

      //добавляем все метки в список
      if (data.features.length !== 0) {
        searchInput.classList.remove("hidden");
        marksList.classList.remove("hidden");
      }
      geojsonData.features.forEach((element) => {
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
        if (!isClientView) {
          listItem.append(title, description, deleteButton, editButton);
        } else if (isClientView) {
          listItem.append(title, description);

        }

        marksList.append(listItem);
      });
      document.querySelector(".lds-ellipsis").classList.add("spinner-hidden")
    });

  map.on("sourcedata", function (e) {
    if (e.sourceId === "territories" && e.isSourceLoaded) {
      // Вызываем addMarkers при каждом обновлении данных, пока маркеры не будут добавлены
      addMarkers();
    }
  });

  map.on("idle", function () {
    // Дополнительная проверка на случай, если sourcedata не сработал
    addMarkers();
  });

  map.on("click", "territories-fill", function (e) {
    var feature = e.features[0];
    var coordinates = e.lngLat;
    console.log(feature,coordinates)
    var popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        returnMarkHtml(
          feature.properties.title,
          feature.properties.description,
          feature.properties.link
        )
      )
      .addTo(map);
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".list-item")) {
      let id = e.target.closest(".list-item").id;
      let marker = markers[id]
      marker.togglePopup()
      map.flyTo({
        center: [markers[id]._lngLat.lng, markers[id]._lngLat.lat], // Целевые координаты центра
        zoom: 10, // Целевой уровень зума
        speed: 0.5, // Увеличенная скорость перехода
        curve: 1, // Кривая скорости (1 для линейной анимации)
        easing: function (t) {
          return t;
        },
        essential: true, // Это свойство управляет анимацией для пользовательского взаимодействия и доступности
        duration: 1000, // Более короткая продолжительность анимации (1 секунда)
      });
    }
  });
});
map.on("mouseenter", "territories-fill", function () {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "territories-fill", function () {
  map.getCanvas().style.cursor = "";
});


