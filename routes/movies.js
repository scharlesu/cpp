const express = require("express");
const router = express.Router();
const Movie = require("../models/movie");
const Actor = require("../models/actor");

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
    const actors = await getListActors();
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
      const movie = new Movie({
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
      });
      try {
        if (req.body.imdbID == "" || req.body.rating == "") {
          throw new Error("Please fill the required fields.");
        }
        if (data.Response == "False") {
          throw new Error(data.Error);
        }
        if (data.Type != "movie") {
          throw new Error("This IMDb ID is not for a movie.");
        }
        movies.forEach((mov) => {
          if (mov.imdbID == movie.imdbID) {
            throw new Error("Movie has already been added.");
          }
        });
        const newMovie = movie.save();
        res.redirect(`/movies/${movie.id}`);
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
router.get("/:id/edit", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.render("movies/edit", { movie: movie });
  } catch {
    res.render("/movies");
  }
});

router.put("/:id", async (req, res) => {
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
      let movie;
      try {
        movie = await Movie.findById(req.params.id);
        movie.title = data.Title;
        movie.description = data.Plot;
        movie.release = data.Released;
        movie.runtime = data.Runtime;
        movie.coverURL = data.Poster;
        movie.rating = req.body.rating;
        movie.review = req.body.review;
        movie.imdbID = data.imdbID;
        movie.genre = data.Genre;
        movie.country = data.Country;
        movie.imdbRating = data.imdbRating * 10;
        movie.rated = data.Rated;
        movie.actors = actorsArray;

        if (req.body.imdbID == "" || req.body.rating == "") {
          throw new Error("Please fill the required fields.");
        }
        if (data.Response == "False") {
          throw new Error(data.Error);
        }
        if (data.Type != "movie") {
          throw new Error("This IMDb ID is not for a movie.");
        }
        await movie.save();
        res.redirect(`/movies/${movie.id}`);
      } catch (error) {
        if (movie == null) {
          res.redirect("/");
        } else {
          res.render("movies/edit", {
            movie: movie,
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
  let movie;
  try {
    movie = await Movie.findById(req.params.id);
    await Movie.deleteOne({ title: movie.title }).exec();
    res.redirect("/");
  } catch (error) {
    if (movie == null) {
      res.redirect("/");
    } else {
      res.redirect(`/movies/${movie.id}`);
    }
  }
});

module.exports = router;

async function getListActors() {
  const actors = await Actor.find({}).exec();
  return actors;
}
