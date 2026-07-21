const express = require('express');
const { getAllVideos, getSingleVideo } = require('../controllers/vedioFetch.controller.js');

const router = express.Router();

router.get('/', getAllVideos);
router.get('/:id', getSingleVideo);

module.exports = router;
