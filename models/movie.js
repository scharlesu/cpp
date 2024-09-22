const mongoose = require("mongoose");
const movieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  release: {
    type: String,
    required: true,
  },
  runtime: {
    type: String,
    required: true,
  },
  coverURL: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
  },
  genre: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  imdbRating: {
    type: Number,
  },
  rated: {
    type: String,
  },
  actors: {
    type: String,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
