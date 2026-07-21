const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/upload.routes.js");
const vedioFetchRoutes = require("./routes/vedioFetch.routes.js");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/uploads", uploadRoutes);
app.use("/api/videos", vedioFetchRoutes);

module.exports = app;