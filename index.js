const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors"); // import

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: "*" // allow all origins (React app, blogs, etc)
}));

// Default route for testing
app.get("/", (req, res) => {
  res.json({ success: true, msg: "Backend is running ✅" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/serials", require("./routes/serialRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
