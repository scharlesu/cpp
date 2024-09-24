const mongoose = require("mongoose");
const tvshowSchema = new mongoose.Schema({
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
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: "Actor",
  },
  totalSeasons: {
    type: Number,
    required: true,
  },
  seasonWatched: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Tvshow", tvshowSchema);
