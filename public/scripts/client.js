mapboxgl.accessToken =
  "pk.eyJ1IjoiaXZhbmlzb3ZpY2giLCJhIjoiY2xvZDQydDAwMDUwazJrbzIxNmRrZTk4eCJ9.SQwaOs9R3Dvn2QFoZ63F6w";

// Инициализация карты
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [12.4924, 41.8902], // Начальные координаты
  zoom: 5, // Уровень масштабирования
});

// Добавление интерактивности
map.on("load", function () {
  // Добавление возможности выбора территории (полигонов)
  map.addSource("territories", {
    type: "geojson",
    data: "../../marks.geojson",
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

  function returnMarkHtml(title, description) {
    let markUp =
      '<article class="mark"> <img src="./images/service.jpg" alt=""/> <div class="mark__text"> <h3>' +
      title +
      "</h3> <p>" +
      description +
      "</p> </div> </article>";
    return markUp;
  }

  map.on("click", "territories-fill", function (e) {
    var feature = e.features[0];
    console.log(feature);
    var coordinates = e.lngLat;
    var popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        returnMarkHtml(feature.properties.title, feature.properties.description)
      )
      .addTo(map);
  });
});

document
  .querySelector(".button--show-publications")
  .addEventListener("click", () => {
    document
      .querySelector(".publications__list")
      .classList.toggle("hide-items");
  });
<<<<<<< HEAD

map.on("mouseenter", "territories-fill", function () {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "territories-fill", function () {
  map.getCanvas().style.cursor = "";
});
=======
>>>>>>> b891c964cb15e21742087c96d50c9f31a04884d1
