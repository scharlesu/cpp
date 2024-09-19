const mongoose = require("mongoose");
const movieSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Movie", movieSchema);
