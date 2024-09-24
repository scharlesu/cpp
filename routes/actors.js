const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const Actor = require("../models/actor");

router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.title !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const actors = await Actor.find(searchOptions);
    res.render("actors/index", { actors: actors, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const actor = await Actor.findById(req.params.id).exec();
    const movies = await Movie.find({ actors: actor }).exec();
    res.render("actors/show", { movies, actor });
  } catch {
    res.redirect("/");
  }
});

module.exports = router;
