const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const Actor = require("../models/actor");
const actor = require("../models/actor");

router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.title != null && req.query.title !== "") {
    searchOptions.title = new RegExp(req.query.title, "i");
  }
  try {
    const movies = await Movie.find(searchOptions);
    res.render("movies/index", { movies: movies, searchOptions: req.query });
  } catch {
    res.redirect("/");
  }
});

router.get("/new", (req, res) => {
  res.render("movies/new", { movie: new Movie() });
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).exec();
    const actors = await listActors();
    res.render("movies/show", { movie, actors });
  } catch {
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  const movies = await Movie.find({});
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
    .then((data) => {
      let actors = data.Actors.split(", ");
      let actorsArray = [];
      actors.forEach((actor) => {
        const act = new Actor({
          name: actor,
        });
        const newActor = act.save();
        actorsArray.push(act);
      });
      const movie = new Movie({
        title: data.Title,
        description: data.Plot,
        release: data.Released,
        runtime: data.Runtime,
        coverURL: data.Poster,
        rating: req.body.rating,
        review: req.body.review,
        imdbID: data.imdbID,
        genre: data.Genre,
        country: data.Country,
        imdbRating: data.imdbRating * 10,
        rated: data.Rated,
        actors: actorsArray,
      });
      try {
        if (data.Response == "False") {
          throw new Error(data.Error);
        }
        if (data.Type != "movie") {
          throw new Error("This IMDb ID is not for a movie.");
        }
        if (req.body.imdbID == "" || req.body.rating == "") {
          throw new Error("Please fill the required fields.");
        }
        movies.forEach((mov) => {
          if (mov.imdbID == movie.imdbID) {
            throw new Error("Movie has already been added.");
          }
        });
        const newMovie = movie.save();
        res.redirect("movies");
      } catch (error) {
        res.render("movies/new", {
          movie: movie,
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
