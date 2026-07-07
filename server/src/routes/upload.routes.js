const express = require("express");

const {
  initiateUpload,
  getPresignedUrl,
  completeUpload,
} = require("../controllers/upload.controller.js");

const router = express.Router();

router.post("/initiate", initiateUpload);

router.post("/presign", getPresignedUrl);

router.post("/complete", completeUpload);

module.exports = router;
