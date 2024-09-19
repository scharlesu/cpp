const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");

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

router.post("/", async (req, res) => {
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
      const movie = new Movie({
        title: data.Title,
        description: data.Plot,
        release: data.Released,
        runtime: data.Runtime,
        coverURL: data.Poster,
        rating: req.body.rating,
        review: req.body.review,
      });
      try {
        const newMovie = movie.save();
        res.redirect("movies");
      } catch {
        res.render("movies/new", {
          movie: movie,
          errorMessage: "Error creating movie",
        });
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
});

module.exports = router;
