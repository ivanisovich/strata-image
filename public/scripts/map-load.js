mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbmlzb3ZpY2giLCJhIjoiY2xvZDQydDAwMDUwazJrbzIxNmRrZTk4eCJ9.SQwaOs9R3Dvn2QFoZ63F6w";
let searchInput = document.querySelector(".edit-mark__search");
const marksList = document.querySelector(".marks-list");
const marksItem = document
  .querySelector(".marks-list")
  .getElementsByClassName("list-item");

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

function focusCamera(center, area) {
  function calculateLinearZoom(area) {
    const m = (7 - 5) / (2.4 - 54);
    const b = 5 - m * 54;
    return m * area + b;
  }

  map.flyTo({
    center: center, // Целевые координаты центра
    zoom: calculateLinearZoom(area), // Целевой уровень зума
    speed: 0.5, // Увеличенная скорость перехода
    curve: 1, // Кривая скорости (1 для линейной анимации)
    easing: function (t) {
      return t;
    },
    essential: true, // Это свойство управляет анимацией для пользовательского взаимодействия и доступности
    duration: 1000, // Более короткая продолжительность анимации (1 секунда)
  });
}

function calculateCentroid(coords) {
  let lngSum = 0, latSum = 0;
  coords.forEach(coord => {
    lngSum += coord[0];
    latSum += coord[1];
  });
  let averageLng = lngSum / coords.length;
  let averageLat = latSum / coords.length;
  return [averageLng, averageLat];
}

function polygonArea(coords) {
  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    let j = (i + 1) % n;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }

  return Math.abs(area / 2);
}

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
      '<article class="mark"> <img src="/public/images/mark.png" alt=""/> <div class="mark__text"> <h3>' +
      title +
      "</h3> <p>" +
      description +
      "</p> <a target='_blank' href=" + link +"> download"
      +
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
          let area = polygonArea(coordinates)
          // Чтобы камера двигалась левее, используем panTo с небольшой задержкой после fitBounds
          focusCamera(newCenter, area)
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
      if (data.features.length !== 0 && !isClientView) {
        searchInput.classList.remove("hidden");
        marksList.classList.remove("hidden");
      }
      let uniqueIds = new Set();

      geojsonData.features.forEach((element) => {
        if (!uniqueIds.has(element.properties.id)) {
          uniqueIds.add(element.properties.id);
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
        }
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
    let foundObject = geojsonData.features.find(obj => obj.properties.id === feature.properties.id);
    var coordinates = e.lngLat;
    let area = polygonArea(foundObject.geometry.coordinates[0])
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
    focusCamera(calculateCentroid(foundObject.geometry.coordinates[0]), area)

  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".list-item")) {
      let id = e.target.closest(".list-item").id;
      let marker = markers[id]
      let foundObject = geojsonData.features.find(obj => obj.properties.id === id);
      let area = polygonArea(foundObject.geometry.coordinates[0])
      function hideAllPopups() {
        Object.values(markers).forEach(m => {
          if (m.getPopup()) m.getPopup().remove();
        });
      }

      // Скрываем все всплывающие окна
      hideAllPopups();

      marker.togglePopup()
      let center = [markers[id]._lngLat.lng, markers[id]._lngLat.lat]
      focusCamera(center, area)
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
      li[i].style.display = "block"; // показываем элемент
    } else {
      li[i].style.display = "none"; // скрываем элемент
    }
  }
});


map.on("mouseenter", "territories-fill", function () {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "territories-fill", function () {
  map.getCanvas().style.cursor = "";
});


