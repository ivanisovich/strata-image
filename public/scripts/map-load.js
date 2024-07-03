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
      data: "https://strataimage.netlify.app/marks.json",
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

let markersColors = {
  "MULTICLIENT": "rgba(0, 171, 85, 0.8)",
  "PROPRIETARY": "rgba(8, 61, 119, 0.8)",
  "ENGINEERING GEOPHYSICS": "rgba(134, 147, 171, 0.8)",
  "GOVERNMENT SUPPORT": "rgba(84, 214, 44, 0.8)",
  "UNIVERSITY RESEARCH": "rgba(101, 175, 255, 0.8)",
};

let jsonData = {};

let currentFilter = ["ALL"];

const ALL_FILTER = "ALL";

function fetchGeojsonData() {
  fetch("https://strataimage.netlify.app/marks.json")
    .then((response) => response.json())
    .then((geojsonData) => {
      jsonData = geojsonData
      // Дожидаемся полной загрузки карты перед добавлением маркеров
      if (map.isStyleLoaded()) {
        addMarkers(geojsonData);
      } else {
        map.on("load", () => {
          addMarkers(geojsonData);
        });
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
    const type = feature.properties.type;
    feature.properties.color = markersColors[type] || "#3FB1CE";

    if (feature.geometry.type === "Point") {
      points.push(feature.geometry.coordinates);
    } else if (feature.geometry.type === "MultiPoint") {
      points.push(...feature.geometry.coordinates);
      const centroid = calculateCentroidForMultiPoint(
        feature.geometry.coordinates
      );
      addMarkerAtPoint(feature, feature.geometry.coordinates, centroid);
    } else if (feature.geometry.type === "Polygon") {
      const centroid = calculateCentroid(feature.geometry.coordinates[0]);
      addMarkerAtPoint(feature, feature.geometry.coordinates[0], centroid);
    }
  });

  // Создание источника данных для точек
  map.addSource("points-data", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: geojsonData.features.flatMap((feature) => {
        // Для Point просто возвращаем feature
        if (feature.geometry.type === "Point") {
          return feature;
        }
        // Для MultiPoint возвращаем массив точек
        else if (feature.geometry.type === "MultiPoint") {
          return feature.geometry.coordinates.map((point) => ({
            type: "Feature",
            properties: feature.properties, // сохраняем все свойства, включая color
            geometry: {
              type: "Point",
              coordinates: point,
            },
          }));
        }
        // Для Polygon возвращаем центроид
        else if (feature.geometry.type === "Polygon") {
          const centroid = calculateCentroid(feature.geometry.coordinates[0]);
          return {
            type: "Feature",
            properties: feature.properties, // сохраняем все свойства, включая color
            geometry: {
              type: "Point",
              coordinates: centroid,
            },
          };
        }
      }),
    },
  });

  // Добавление слоя с круглыми точками
  map.addLayer({
    id: "points-layer",
    type: "circle",
    source: "points-data",
    paint: {
      "circle-radius": 5,
      "circle-color": ["get", "color"], // Получаем цвет напрямую из свойств feature
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

let allMarkers = []; 

function addMarkerAtPoint(feature, coordinates, centroid) {
  const marker = new mapboxgl.Marker({
      color: markersColors[feature.properties.type],
  }).setLngLat(centroid);
  marker.points = coordinates;
  marker.center = centroid;
  marker.addTo(map);

  const popupHtml = createMarkPopupHtml(feature.properties);
  const popup = new mapboxgl.Popup().setHTML(popupHtml);
  marker.setPopup(popup);

  marker.getElement().addEventListener("click", () => {
      focusCamera(marker.center, polygonArea(marker.points));
  });

  allMarkers.push(marker); 
}

function calculateCentroid(coordinates) {
  const { lngSum, latSum } = coordinates.reduce(
    (sums, coord) => {
      sums.lngSum += coord[0];
      sums.latSum += coord[1];
      return sums;
    },
    { lngSum: 0, latSum: 0 }
  );
  return [lngSum / coordinates.length, latSum / coordinates.length];
}

function createMarkPopupHtml(properties) {
  return `
    <article class="mark">
      <img src="/public/images/mark.jpg" alt=""/>
      <div class="mark__text">
        <h3>${properties.name ? properties.name : properties.title}</h3>
        ${properties.type ? `<span class="${properties.type}">${properties.type}</span>` : ''}

      </div>
    </article>`;
}

function updateMarksList(geojsonData) {
  const marksList = document.querySelector(".marks-list");
  marksList.innerHTML = "";
  geojsonData.features.forEach((feature) => {
    const listItem = createListItem(feature.properties, feature.geometry.coordinates, feature.geometry.type);
    marksList.appendChild(listItem);
  });
}

function createListItem(properties, coordinates, geometryType) {
  const listItem = document.createElement("li");
  listItem.className = "list-item";
  listItem.dataset.id = properties.id;

  let coordinatesData = JSON.stringify(coordinates);
  let geometryTypeData = geometryType;

  listItem.innerHTML = `
    <strong>${properties.name ? properties.name : properties.title}</strong>
    <div class="coordinates" data-coordinates='${coordinatesData}' data-geometry-type='${geometryTypeData}'></div>`;

    listItem.addEventListener("click", () => {
      let coordinates = JSON.parse(listItem.querySelector(".coordinates").dataset.coordinates);
      let geometryType = listItem.querySelector(".coordinates").dataset.geometryType;
  
      let centroid;
      if (geometryType === "Polygon") {
        centroid = calculateCentroid(coordinates[0]);
      } else if (geometryType === "MultiPoint") {
        centroid = calculateCentroidForMultiPoint(coordinates);
      } else if (geometryType === "Point") {
        centroid = coordinates;
      }
  
      const matchingMarker = allMarkers.find(marker => marker.center[0] === centroid[0] && marker.center[1] === centroid[1]);
      if (matchingMarker) {
        matchingMarker.getPopup().addTo(map);
        focusCamera(centroid, polygonArea(coordinates));
      }
    });
  
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
  
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-button")) {
      const type = e.target.dataset.name;
      updateCurrentFilter(type);
      updateFilterButtons();
      removeAllMarkers();
      const filteredMarkers = filterMarkers(jsonData, type);
      addMarkers(filteredMarkers);
      updateMarksList(filteredMarkers);
    }
  });
  
  function updateCurrentFilter(type) {
    if (!currentFilter.includes(type)) {
      currentFilter.push(type);
    } else {
      currentFilter = currentFilter.filter(item => item !== type);
    }
  
    if (type === ALL_FILTER || currentFilter.length == 0) {
      currentFilter = [ALL_FILTER];
    } else if (currentFilter.includes(ALL_FILTER)) {
      currentFilter = currentFilter.filter(item => item !== ALL_FILTER);
    }
  }
  
  function updateFilterButtons() {
    document.querySelectorAll(".filter-button").forEach(button => {
      button.classList.toggle("active", currentFilter.includes(button.dataset.name));
    });
  }
  
  function filterMarkers(jsonData, type) {
    let filteredData = { ...jsonData };
    filteredData.features = filteredData.features.filter(item => {
      return currentFilter.includes(item.properties.type);
    });
  
    if (!currentFilter.includes(ALL_FILTER)) {
      return filteredData;
    } else {
      return jsonData;
    }
  }
  
  function removeAllMarkers() {
    allMarkers.forEach(marker => marker.remove());
    allMarkers = [];
  }
  