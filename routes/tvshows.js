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
    const tvshows = await Tvshow.find(searchOptions).sort({ title: 1 });
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
        if (parseInt(data.totalSeasons) < parseInt(req.body.seasonWatched)) {
          throw new Error(
            `Please select a season equal or lower to the total seasons : ${data.totalSeasons}.`
          );
        }
        tvshows.forEach((tv) => {
          if (tv.imdbID == tvshow.imdbID) {
            throw new Error("Serie has already been added.");
          }
        });
        const newTvshow = tvshow.save();
        res.redirect(`/tvshows/${tvshow.id}`);
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

router.get("/:id/edit", async (req, res) => {
  try {
    const tvshow = await Tvshow.findById(req.params.id);
    res.render("tvshows/edit", { tvshow: tvshow });
  } catch {
    res.render("/tvshows");
  }
});

router.put("/:id", async (req, res) => {
  const tvshow = await Tvshow.find({});
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
      let tvshow;
      try {
        tvshow = await Tvshow.findById(req.params.id);
        tvshow.title = data.Title;
        tvshow.description = data.Plot;
        tvshow.release = data.Released;
        tvshow.runtime = data.Runtime;
        tvshow.coverURL = data.Poster;
        tvshow.rating = req.body.rating;
        tvshow.review = req.body.review;
        tvshow.imdbID = data.imdbID;
        tvshow.genre = data.Genre;
        tvshow.country = data.Country;
        tvshow.imdbRating = data.imdbRating * 10;
        tvshow.rated = data.Rated;
        tvshow.actors = actorsArray;
        tvshow.totalSeasons = data.totalSeasons;
        tvshow.seasonWatched = req.body.seasonWatched;

        if (req.body.imdbID == "" || req.body.rating == "") {
          throw new Error("Please fill the required fields.");
        }
        if (data.Response == "False") {
          throw new Error(data.Error);
        }
        if (data.Type != "series") {
          throw new Error("This IMDb ID is not for a serie.");
        }

        if (parseInt(data.totalSeasons) < parseInt(req.body.seasonWatched)) {
          throw new Error(
            "Please select a season equal or lower to the total seasons."
          );
        }
        await tvshow.save();
        res.redirect(`/tvshows/${tvshow.id}`);
      } catch (error) {
        if (tvshow == null) {
          res.redirect("/");
        } else {
          res.render("tvshows/edit", {
            tvshow: tvshow,
            errorMessage: error.message,
          });
        }
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
});

router.delete("/:id", async (req, res) => {
  let tvshow;
  try {
    tvshow = await Tvshow.findById(req.params.id);
    await Tvshow.deleteOne({ title: tvshow.title }).exec();
    res.redirect("/");
  } catch (error) {
    if (tvshow == null) {
      res.redirect("/");
    } else {
      console.log(error.message);
      res.redirect(`/tvshows/${tvshow.id}`);
    }
  }
});

module.exports = router;

async function listActors() {
  const actors = await Actor.find({}).exec();
  return actors;
}
