const express = require("express");
const multer = require("multer");
const ejs = require("ejs");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const toGeoJSON = require("togeojson");
const jsdom = require("jsdom").JSDOM;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { DOMParser } = require("xmldom");
const JSZip = require("jszip");

// Настройка EJS шаблонизатора
app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cors());

// Маршрут для админ-панели
app.get("/admin-panel", (req, res) => {
  res.render("admin-panel");
});

app.get("/map-editor", (req, res) => {
  res.render("map-editor");
});

// Маршрут для обработки отправки формы
app.post("/admin-panel", async (req, res) => {
  const newTitle = req.body.newTitle;

  try {
    // Чтение и изменение заголовка в HTML файле
    let html = await fs.readFile("public/index.html", "utf-8");
    html = html.replace(/<title>(.*?)<\/title>/, `<title>${newTitle}</title>`);
    await fs.writeFile("public/index.html", html);

    res.redirect("/admin-panel");
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка при изменении заголовка.");
  }
});

// Добавление меток
app.post("/map-editor", async (req, res) => {
  const geojsonFilePath = "marks.geojson";
  console.log(req.body);
  async function addDataToGeoJSONFile(req) {
    try {
      // Попытка чтения GeoJSON файла
      let geojsonData;
      try {
        const fileContent = await fs.readFile(geojsonFilePath, "utf8");
        geojsonData = JSON.parse(fileContent);
      } catch (error) {
        // Если файл не существует или не содержит данных JSON, создайте новый GeoJSON
        geojsonData = {
          type: "FeatureCollection",
          features: [],
        };
      }
      let newMark = req.body;
      newMark.properties.id = uuidv4();
      // Добавление новой фичи в массив фич
      geojsonData.features.push(newMark);

      // Преобразование обновленных данных в JSON формат
      const updatedData = JSON.stringify(geojsonData, null, 2);

      // Запись обновленных данных обратно в файл
      await fs.writeFile(geojsonFilePath, updatedData, "utf8");
      console.log("Объект успешно добавлен в GeoJSON файл.");
    } catch (error) {
      console.error("Ошибка при добавлении в GeoJSON файл:", error);
    }
  }
  addDataToGeoJSONFile(req);
});

// Удаление меток
app.post("/deleteMark", async (req, res) => {
  const { id } = req.body;
  try {
    // Асинхронное чтение geojson данных из файла
    let data = JSON.parse(await fs.readFile("marks.geojson", "utf8"));

    // Поиск индекса объекта с заданным id
    const index = data.features.findIndex(
      (feature) => feature.properties.id === id
    );

    if (index !== -1) {
      // Удаление объекта из массива
      data.features.splice(index, 1);

      // Асинхронное сохранение обновленных данных обратно в файл
      await fs.writeFile("marks.geojson", JSON.stringify(data, null, 4));

      res.status(200).send({ message: "Object deleted successfully." });
    } else {
      res.status(404).send({ message: "Object not found." });
    }
  } catch (error) {
    // Отправка ошибки, если что-то пошло не так
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// Редактирование меток
app.post("/editMark", async (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  try {
    // Чтение содержимого GeoJSON файла
    const geojsonContent = await fs.readFile("marks.geojson", "utf8");
    const geojsonData = JSON.parse(geojsonContent);

    // Поиск объекта по ID
    const objectToEdit = geojsonData.features.find(
      (feature) => feature.properties.id === id
    );

    if (objectToEdit) {
      // Обновление title и description объекта
      objectToEdit.properties.title = title;
      objectToEdit.properties.description = description;

      // Сохранение обновленного содержимого обратно в файл
      await fs.writeFile("marks.geojson", JSON.stringify(geojsonData, null, 4));

      res.status(200).send({ message: "GeoJSON object updated successfully." });
    } else {
      res
        .status(404)
        .send({ message: "GeoJSON object with given ID not found." });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Получение меток
app.get("/getMarks", (req, res) => {
  const geojsonFilePath = "marks.geojson";
  async function addDataToGeoJSONFile(req) {
    try {
      // Попытка чтения GeoJSON файла
      let geojsonData;
      try {
        const fileContent = await fs.readFile(geojsonFilePath, "utf8");
        geojsonData = JSON.parse(fileContent);
      } catch (error) {}

      // Добавление новой фичи в массив фич
      res.json(geojsonData);
    } catch (error) {
      console.error("Ошибка при добавлении в GeoJSON файл:", error);
    }
  }
  addDataToGeoJSONFile(req);
});

// Загрузка KML файла
app.post("/uploadKMZ", upload.single("kmlFile"), async (req, res) => {
  const zip = new JSZip();
  const zipContents = await zip.loadAsync(req.file.buffer);
  const kmlFile = zipContents.file(/\.kml$/i)[0];
  const kmlText = await kmlFile.async("string");

  // Создание DOM из KML текста
  const dom = new DOMParser().parseFromString(kmlText);
  const kml = dom.documentElement;

  // Преобразование KML в GeoJSON
  const geoJSON = toGeoJSON.kml(kml);

  // Добавление уникального ID к каждому feature
  geoJSON.features.forEach((feature) => {
    feature.properties.id = uuidv4();
    feature.properties.title = "title"
    feature.properties.description = "description"
    feature.properties.link = "link"
  });

  try {
    // Попытка чтения файла mark.geojson
    let existingData;
    try {
      const existingGeoJSON = await fs.readFile("marks.geojson", "utf8");
      existingData = JSON.parse(existingGeoJSON);
    } catch (error) {
      // Если файл не существует или пустой, создаем новый объект GeoJSON
      existingData = { type: "FeatureCollection", features: [] };
    }

    // Добавление новых меток, избегая дубликатов
    const newFeatures = geoJSON.features.filter(
      (newFeature) =>
        !existingData.features.some(
          (existingFeature) =>
            JSON.stringify(existingFeature.geometry.coordinates) ===
            JSON.stringify(newFeature.geometry.coordinates)
        )
    );

    existingData.features = existingData.features.concat(newFeatures);

    // Сохранение обновленного GeoJSON обратно в mark.geojson
    await fs.writeFile("marks.geojson", JSON.stringify(existingData, null, 2));

    res.send("Метки из KML файла успешно добавлены");
  } catch (error) {
    res.status(500).send("Ошибка при обработке файла: " + error.message);
  }
});
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
