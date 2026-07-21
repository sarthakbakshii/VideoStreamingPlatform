const videoFetchService = require('../services/vedioFetch.service.js');

async function getAllVideos(req, res) {
    try {
        const videos = await videoFetchService.fetchAllVideos();
        console.log("videos", videos)
        res.json(videos);
    } catch (err) {
        console.error('Error fetching videos list:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getSingleVideo(req, res) {
    try {
        const videoId = req.params.id;
        const video = await videoFetchService.fetchVideoDetails(videoId);
        res.json(video);
    } catch (err) {
        console.error(`Error fetching details for video ${req.params.id}:`, err);
        res.status(404).json({ error: 'Video not found' });
    }
}

module.exports = {
    getAllVideos,
    getSingleVideo
};
