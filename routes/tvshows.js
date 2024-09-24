const express = require("express");
const router = express.Router();
const Tvshow = require("../models/tvshow");
const Actor = require("../models/actor");

router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.title != null && req.query.title !== "") {
    searchOptions.title = new RegExp(req.query.title, "i");
  }
  try {
    const tvshows = await Tvshow.find(searchOptions);
    res.render("tvshows/index", { tvshows: tvshows, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

router.get("/new", (req, res) => {
  res.render("tvshows/new", { tvshow: new Tvshow() });
});

router.get("/:id", async (req, res) => {
  try {
    const tvshow = await Tvshow.findById(req.params.id).exec();
    const actors = await listActors();
    res.render("tvshows/show", { tvshow, actors });
  } catch {
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  const tvshows = await Tvshow.find({});
  fetch(
    "https://www.omdbapi.com/?apikey=" +
      process.env.OMDB_API_KEY +
      "&i=" +
      req.body.imdbID
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response error");
      }
      return response.json();
    })
    .then(async (data) => {
      let actors = [];
      if (data.Actors != undefined) {
        actors = data.Actors.split(", ");
      }
      let actorsArray = [];
      for (const actor of actors) {
        let existingActor = await Actor.findOne({ name: actor }).exec();
        const act = new Actor({
          name: actor,
        });
        if (existingActor != null) {
          actorsArray.push(existingActor);
        } else {
          actorsArray.push(act);
          const newActor = act.save();
        }
      }
      const tvshow = new Tvshow({
        title: data.Title,
        description: data.Plot,
        release: data.Released,
        runtime: data.Runtime,
        coverURL: data.Poster,
        rating: req.body.rating,
        review: req.body.review,
        imdbID: req.body.imdbID,
        genre: data.Genre,
        country: data.Country,
        imdbRating: data.imdbRating * 10,
        rated: data.Rated,
        actors: actorsArray,
        totalSeasons: data.totalSeasons,
        seasonWatched: req.body.seasonWatched,
      });
      try {
        if (req.body.imdbID == "" || req.body.rating == "") {
          throw new Error("Please fill the required fields.");
        }
        if (data.Response == "False") {
          throw new Error(data.Error);
        }
        if (data.Type != "series") {
          throw new Error("This IMDb ID is not for a series.");
        }
        tvshows.forEach((tv) => {
          if (tv.imdbID == tvshow.imdbID) {
            throw new Error("Serie has already been added.");
          }
        });
        const newTvshow = tvshow.save();
        res.redirect("tvshows");
      } catch (error) {
        res.render("tvshows/new", {
          tvshow: tvshow,
          errorMessage: error.message,
        });
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
});

module.exports = router;

async function listActors() {
  const actors = await Actor.find({}).exec();
  return actors;
}
