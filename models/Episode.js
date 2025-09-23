const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  serialId: { type: mongoose.Schema.Types.ObjectId, ref: "Serial", required: true },
  episodeNo: Number,
  title: String,
  description: String,
  image: String,       // path in React public folder
  redirectUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Episode", episodeSchema);
