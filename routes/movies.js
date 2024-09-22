const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const mongoose = require("mongoose");
const db = mongoose.connection;

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
    res.render("movies/show", { movie, movie });
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
        actors: data.Actors,
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
