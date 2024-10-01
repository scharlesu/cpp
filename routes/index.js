const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const Tvshow = require("../models/tvshow");

router.get("/", async (req, res) => {
  req.t;
  try {
    const movies = await Movie.find();
    const tvshows = await Tvshow.find();
    res.render("index", {
      message: req.t("home"),
      movies: movies,
      tvshows: tvshows,
    });
  } catch (error) {
    console.log(error);
    res.render("index", { message: error.message });
  }
});

module.exports = router;
