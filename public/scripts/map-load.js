var map;

var isClientView;

function loadMap() {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiaXZhbmlzb3ZpY2giLCJhIjoiY2xvZDQydDAwMDUwazJrbzIxNmRrZTk4eCJ9.SQwaOs9R3Dvn2QFoZ63F6w";
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-112.4924, 31.8902],
    zoom: 4,
    scrollZoom: true,
  });

  map.addControl(new mapboxgl.NavigationControl());
  addMapListeners();
  fetchGeojsonData();
}

function addMapListeners() {
  map.on("load", function () {
    map.addSource("territories", {
      type: "geojson",
      data: "/marks.json",
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
  });

  map.on("click", "territories-fill", onTerritoryClick);

  var scrollMessage = document.querySelector(".scroll-message");

  isClientView = true;

  if (window.location.href.includes("/map-editor")) {
    isClientView = false;
  }

  if (isClientView) {
    map.on("wheel", function (event) {
      if (
        event.originalEvent.ctrlKey ||
        event.originalEvent.metaKey ||
        event.originalEvent.altKey
      ) {
        scrollMessage.classList.add("hidden");
      } else {
        event.preventDefault();
      }
    });
  }

  map.on("zoom", () => {
    if (isClientView) {
      scrollMessage.classList.add("hidden");
    }
  });
}

function fetchGeojsonData() {
  fetch("/marks.json")
    .then((response) => response.json())
    .then((geojsonData) => {
      // Дожидаемся полной загрузки карты перед добавлением маркеров
      if (map.isStyleLoaded()) {
        addMarkers(geojsonData);
      } else {
        map.on("load", () => addMarkers(geojsonData));
        document.querySelector(".lds-ellipsis").classList.add("hidden");
      }
      updateMarksList(geojsonData);
    });
}

function addMarkers(geojsonData) {
  // Удалите существующий слой, если он уже есть
  if (map.getLayer("points-layer")) {
    map.removeLayer("points-layer");
    map.removeSource("points-data");
  }

  // Добавление всех точек (Point и MultiPoint) в один массив координат
  const points = [];
  geojsonData.features.forEach((feature) => {
    if (feature.geometry.type === "Point") {
      points.push(feature.geometry.coordinates);
    } else if (feature.geometry.type === "MultiPoint") {
      points.push(...feature.geometry.coordinates);
      const centroid = calculateCentroidForMultiPoint(
        feature.geometry.coordinates
      );
      addMarkerAtPoint(
        centroid,
        feature.properties,
        feature.geometry.coordinates
      );
    }
    else if (feature.geometry.type === "Polygon") {
      // For Polygons, create a marker at the centroid and add it to the map
      const centroid = calculateCentroid(feature.geometry.coordinates[0]);
      addMarkerAtPoint(centroid, feature.properties, feature.geometry.coordinates[0]);
    }
  });

  // Создание источника данных для точек
  map.addSource("points-data", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: points.map((point) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: point,
        },
      })),
    },
  });

  // Добавление слоя с круглыми точками
  map.addLayer({
    id: "points-layer",
    type: "circle",
    source: "points-data",
    paint: {
      "circle-radius": 5, // Размер точки
      "circle-color": "rgba(0, 171, 85, 1)", // Цвет точки
    },
  });
}

function calculateCentroidForMultiPoint(coordinates) {
  let lngSum = 0,
    latSum = 0,
    count = 0;
  coordinates.forEach((coord) => {
    lngSum += coord[0];
    latSum += coord[1];
    count++;
  });
  return [lngSum / count, latSum / count]; // Возвращаем центроид
}

function addMarkerAtPoint(coordinates, properties, points) {
  const marker = new mapboxgl.Marker({ color: "rgba(0, 171, 85)" }).setLngLat(
    coordinates
  );
  marker.points = points;
  marker.center = coordinates;
  marker.addTo(map);

  const popupHtml = createMarkPopupHtml(properties);
  const popup = new mapboxgl.Popup().setHTML(popupHtml);
  marker.setPopup(popup);

  marker.getElement().addEventListener("click", () => {
    focusCamera(marker.center, polygonArea(marker.points));
  });
}

function addPoint(feature) {
  const coordinates = feature.geometry.coordinates;
  const marker = new mapboxgl.Marker({ color: "rgba(0, 171, 85)" })
    .setLngLat(coordinates)
    .addTo(map);

  const popupHtml = createMarkPopupHtml(feature.properties);
  const popup = new mapboxgl.Popup().setHTML(popupHtml);
  marker.setPopup(popup);
}

function calculateCentroid(coordinates) {
  const { lngSum, latSum } = coordinates.reduce(
    (sums, coord) => {
      sums.lngSum += coord[0];
      sums.latSum += coord[1];
      return sums;
    },
    { lngSum: 0, latSum: 0 } // Исправлено здесь: latSum вместо latzSum
  );
  return [lngSum / coordinates.length, latSum / coordinates.length];
}

function createMarkPopupHtml(properties) {
  return `
    <article class="mark">
      <img src="/public/images/mark.jpg" alt=""/>
      <div class="mark__text">
        <h3>${properties.name ? properties.name : properties.title}</h3>
        <p>${properties.description}</p>
        <a target='_blank' href=${properties.link}>download</a>
      </div>
    </article>`;
}

function updateMarksList(geojsonData) {
  const marksList = document.querySelector(".marks-list");
  marksList.innerHTML = "";
  geojsonData.features.forEach((feature) => {
    const listItem = createListItem(feature.properties);
    marksList.appendChild(listItem);

    listItem.addEventListener("click", () => {
      const coordinates = feature.geometry.coordinates;
      const centroid = calculateCentroid(coordinates);
      focusCamera(centroid, polygonArea(coordinates));
    });
  });
}

function createListItem(properties, isClientView) {
  isClientView = true;

  if (window.location.href.includes("/map-editor")) {
    isClientView = false;
  }
  const listItem = document.createElement("li");
  listItem.className = "list-item";
  listItem.dataset.groupId = properties.id;

  let buttonsHTML = "";
  let ptText = "";
  if (!isClientView) {
    // Добавляем кнопки только если isClientView равно false
    buttonsHTML = `
      <button class="delete-button">delete</button>
      <button class="edit-button">edit</button>`;
    ptText = `
    <strong>${properties.name ? properties.name : properties.titlePt}</strong>
    <p>${properties.descriptionPt}</p>
    `;
  }

  listItem.innerHTML = `
    <strong>${properties.name ? properties.name : properties.title}</strong>
    <p>${properties.description}</p>
    ${ptText}
    <a target='_blank' href=${
      properties.link
    } class="list-item__link">download</a>
    ${buttonsHTML}`; // Добавляем кнопки в HTML, если условие выполнено

  return listItem;
}

function onTerritoryClick(e) {
  const feature = e.features[0];
  const coordinates = feature.geometry.coordinates[0];
  const centroid = calculateCentroid(coordinates);
  focusCamera(centroid, polygonArea(coordinates));
}

function focusCamera(center, area) {
  const zoomLevel = calculateLinearZoom(area);
  map.flyTo({
    center: center,
    zoom: zoomLevel,
    speed: 0.5,
    curve: 1,
    easing: (t) => t,
    essential: true,
    duration: 1000,
  });
}

function calculateLinearZoom(area) {
  const m = (7 - 5) / (2.4 - 54);
  const b = 5 - m * 54;
  return m * area + b;
}

function polygonArea(coords) {
  let area = 0;
  for (let i = 0, n = coords.length; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  return Math.abs(area / 2);
}

document.getElementById("search").addEventListener("input", function () {
  const filter = this.value.toLowerCase();
  document.querySelectorAll(".marks-list .list-item").forEach((item) => {
    item.style.display = item.innerText.toLowerCase().includes(filter)
      ? "block"
      : "none";
  });
});
