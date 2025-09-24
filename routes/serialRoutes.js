const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const Serial = require("../models/Serial");
const Episode = require("../models/Episode");
const auth = require("../middleware/authMiddleware");

// ---------------------- MULTER CONFIG ----------------------

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/episodes"); // Save to backend folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) return cb(null, true);
  cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter });

// ---------------------- SERIAL ROUTES ----------------------

// Public: get all serials
router.get("/", async (req, res) => {
  try {
    const serials = await Serial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: serials });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Public: get single serial by id
router.get("/:id", async (req, res) => {
  try {
    const serial = await Serial.findById(req.params.id);
    if (!serial) return res.status(404).json({ success: false, msg: "Serial not found" });
    res.json({ success: true, data: serial });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Admin: add serial
router.post("/", auth, async (req, res) => {
  try {
    const serial = new Serial(req.body);
    await serial.save();
    res.json({ success: true, msg: "Serial added successfully", data: serial });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Admin: update serial
router.put("/:id", auth, async (req, res) => {
  try {
    const serial = await Serial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!serial) return res.status(404).json({ success: false, msg: "Serial not found" });
    res.json({ success: true, msg: "Serial updated successfully", data: serial });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Admin: delete serial
router.delete("/:id", auth, async (req, res) => {
  try {
    await Serial.findByIdAndDelete(req.params.id);
    // Also delete episodes belonging to this serial
    await Episode.deleteMany({ serialId: req.params.id });
    res.json({ success: true, msg: "Serial deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// ---------------------- EPISODE ROUTES ----------------------

// Public: get all episodes for serial
router.get("/:id/episodes", async (req, res) => {
  try {
    const episodes = await Episode.find({ serialId: req.params.id }).sort({ episodeNo: 1 });
    res.json({ success: true, data: episodes });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Public: get single episode
router.get("/episodes/:id", async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);
    if (!episode) return res.status(404).json({ success: false, msg: "Episode not found" });
    res.json({ success: true, data: episode });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Admin: add episode with image upload
router.post("/:id/episodes", auth, upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/episodes/${req.file.filename}` : "";
    const episode = new Episode({
      ...req.body,
      serialId: req.params.id,
      image: imageUrl,
    });
    await episode.save();
    res.json({ success: true, msg: "Episode added successfully", data: episode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Admin: update episode (optionally update image)
router.put("/episodes/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/episodes/${req.file.filename}`;
    const episode = await Episode.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!episode) return res.status(404).json({ success: false, msg: "Episode not found" });
    res.json({ success: true, msg: "Episode updated successfully", data: episode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Admin: delete episode
router.delete("/episodes/:id", auth, async (req, res) => {
  try {
    await Episode.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Episode deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;
