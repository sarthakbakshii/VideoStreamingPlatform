const { ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3 } = require('../config/aws.js');

const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET; // e.g., 'video-streaming-hls-output-123456789'
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN; // e.g., 'd1234567890.cloudfront.net'

async function fetchAllVideos() {
    // List all video folders in the output bucket
    const listCommand = new ListObjectsV2Command({
        Bucket: OUTPUT_BUCKET,
        Prefix: 'hls/',
        Delimiter: '/'
    });

    const listResponse = await s3.send(listCommand);
    const videoFolders = listResponse.CommonPrefixes || [];

    const videos = [];

    // Fetch metadata for each video
    for (const folder of videoFolders) {
        const videoId = folder.Prefix.replace('hls/', '').replace('/', '');

        try {
            const metaCommand = new GetObjectCommand({
                Bucket: OUTPUT_BUCKET,
                Key: `hls/${videoId}/metadata.json`
            });

            const metaResponse = await s3.send(metaCommand);
            const metadata = JSON.parse(await metaResponse.Body.transformToString());

            videos.push({
                videoId,
                title: metadata.title || videoId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                thumbnail: metadata.thumbnail ? `https://${CLOUDFRONT_DOMAIN}/hls/${videoId}/${metadata.thumbnail}` : `https://${CLOUDFRONT_DOMAIN}/hls/${videoId}/thumbnail.jpg`,
                manifestUrl: `https://${CLOUDFRONT_DOMAIN}/hls/${videoId}/master.m3u8`,
                duration: parseFloat(metadata.duration_seconds),
                resolution: `${metadata.video.width}x${metadata.video.height}`,
                createdAt: metadata.created_at || new Date().toISOString(),
                sizeBytes: metadata.size_bytes || null,
                videoDetails: metadata.video || null,
                audioDetails: metadata.audio || null
            });
        } catch (err) {
            console.log(`Skipping ${videoId}: ${err.message}`);
        }
    }

    // Sort by creation date (newest first)
    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return videos;
}

async function fetchVideoDetails(videoId) {
    const metaCommand = new GetObjectCommand({
        Bucket: OUTPUT_BUCKET,
        Key: `hls/${videoId}/metadata.json`
    });

    const metaResponse = await s3.send(metaCommand);
    const metadata = JSON.parse(await metaResponse.Body.transformToString());

    return {
        videoId,
        title: metadata.title || videoId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        thumbnail: metadata.thumbnail ? `https://${CLOUDFRONT_DOMAIN}/hls/${videoId}/${metadata.thumbnail}` : `https://${CLOUDFRONT_DOMAIN}/hls/${videoId}/thumbnail.jpg`,
        manifestUrl: `https://${CLOUDFRONT_DOMAIN}/hls/${videoId}/master.m3u8`,
        duration: parseFloat(metadata.duration_seconds),
        resolution: `${metadata.video.width}x${metadata.video.height}`,
        createdAt: metadata.created_at || new Date().toISOString(),
        sizeBytes: metadata.size_bytes || null,
        videoDetails: metadata.video || null,
        audioDetails: metadata.audio || null
    };
}

module.exports = {
    fetchAllVideos,
    fetchVideoDetails
};