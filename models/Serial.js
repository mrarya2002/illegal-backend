const mongoose = require("mongoose");

const serialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image: String,       // path in React public folder
  blogUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Serial", serialSchema);
