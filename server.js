if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const methodOverride = require("method-override");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "./locales/{{lng}}/translation.json",
    },
  });
const indexRouter = require("./routes/index");
const movieRouter = require("./routes/movies");
const actorRouter = require("./routes/actors");
const tvshowRouter = require("./routes/tvshows");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(express.json());
app.use(middleware.handle(i18next));

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use("/", indexRouter);
app.use("/movies", movieRouter);
app.use("/actors", actorRouter);
app.use("/tvshows", tvshowRouter);

app.listen(process.env.PORT || 3000);
