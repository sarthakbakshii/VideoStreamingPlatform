const {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} = require("@aws-sdk/client-sqs");

const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
const INPUT_BUCKET = process.env.INPUT_BUCKET;
const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;
const AWS_REGION = process.env.AWS_REGION || "ap-south-1";

if (!SQS_QUEUE_URL || !INPUT_BUCKET || !OUTPUT_BUCKET) {
  console.error(
    "❌ Missing required environment variables: SQS_QUEUE_URL, INPUT_BUCKET, OUTPUT_BUCKET"
  );
  process.exit(1);
}

const sqsClient = new SQSClient({ region: AWS_REGION });
const s3Client = new S3Client({ region: AWS_REGION });

const QUALITIES = [
  { name: "1080p", height: 1080, vbitrate: "5000k", abitrate: "192k" },
  { name: "720p", height: 720, vbitrate: "2800k", abitrate: "128k" },
  { name: "480p", height: 480, vbitrate: "1400k", abitrate: "96k" },
  { name: "360p", height: 360, vbitrate: "800k", abitrate: "64k" },
];

const WORK_DIR = "/opt/worker/transcode";

async function receiveMessage() {
  const command = new ReceiveMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 20,
    VisibilityTimeout: 1800,
  });

  return await sqsClient.send(command);
}

async function deleteMessage(receiptHandle) {
  await sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: SQS_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    })
  );
}

async function downloadFromS3(bucket, key, localPath) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  const readStream = response.Body;
  const writeStream = fs.createWriteStream(localPath);

  await new Promise((resolve, reject) => {
    readStream.pipe(writeStream);
    readStream.on("error", reject);
    writeStream.on("error", reject);
    writeStream.on("finish", resolve);
  });
}

async function uploadToS3(bucket, key, localPath, contentType) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fs.createReadStream(localPath),
      ContentType: contentType,
    })
  );
}

function getVideoHeight(inputPath) {
  try {
    const result = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=height",
        "-of",
        "csv=p=0",
        inputPath,
      ],
      { encoding: "utf-8" }
    ).trim();

    return parseInt(result, 10) || 0;
  } catch (err) {
    console.warn("⚠️ Could not probe video height:", err.message);
    return 0;
  }
}

function getVideoWidth(inputPath) {
  try {
    const result = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width",
        "-of",
        "csv=p=0",
        inputPath,
      ],
      { encoding: "utf-8" }
    ).trim();

    return parseInt(result, 10) || 0;
  } catch (err) {
    console.warn("⚠️ Could not probe video width:", err.message);
    return 0;
  }
}

function transcode(inputPath, outputDir, qualities) {
  const sourceHeight = getVideoHeight(inputPath);
  const sourceWidth = getVideoWidth(inputPath);

  console.log(`📐 Source resolution: ${sourceWidth}x${sourceHeight}`);

  let activeQualities = qualities.filter((q) => q.height <= sourceHeight);
  if (activeQualities.length === 0) {
    activeQualities = [qualities[qualities.length - 1]];
  }

  console.log(`🎬 Transcoding to: ${activeQualities.map((q) => q.name).join(", ")}`);

  // Process each quality ONE BY ONE to save RAM and disk I/O
  for (const q of activeQualities) {
    const qDir = path.join(outputDir, q.name);
    fs.mkdirSync(qDir, { recursive: true });

    console.log(`⚙️ Running FFmpeg for ${q.name}...`);

    const args = [
      "-y",
      "-i", inputPath,
      "-vf", `scale=-2:${q.height}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`,
      "-c:v", "libx264",
      "-preset", "fast",
      "-b:v", q.vbitrate,
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", q.abitrate,
      "-f", "hls",
      "-hls_time", "6",
      "-hls_playlist_type", "vod",
      "-hls_list_size", "0",
      "-hls_segment_filename", path.join(qDir, "segment_%03d.ts"),
      path.join(qDir, "playlist.m3u8"),
    ];

    try {
      execFileSync("ffmpeg", args, { stdio: "inherit" });
    } catch (err) {
      console.error(`❌ FFmpeg failed for ${q.name}`);
      throw err;
    }
  }

  console.log("✅ Transcoding complete");
  return { activeQualities, sourceWidth, sourceHeight };
}

function generateMasterPlaylist(qualities, outputDir, sourceWidth, sourceHeight) {
  let playlist = "#EXTM3U\n#EXT-X-VERSION:3\n";

  for (const q of qualities) {
    const videoBandwidth = parseInt(q.vbitrate.replace("k", ""), 10) * 1000;
    const audioBandwidth = parseInt(q.abitrate.replace("k", ""), 10) * 1000;
    const bandwidth = videoBandwidth + audioBandwidth;

    let resolution = "";

    if (sourceWidth && sourceHeight) {
      const sourceRatio = sourceWidth / sourceHeight;
      const width = Math.round((q.height * sourceRatio) / 2) * 2;
      resolution = `,RESOLUTION=${width}x${q.height}`;
    }

    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth}${resolution},NAME="${q.name}"\n`;
    playlist += `${q.name}/playlist.m3u8\n`;
  }

  const masterPath = path.join(outputDir, "master.m3u8");
  fs.writeFileSync(masterPath, playlist);

  console.log("📝 Master playlist generated");
}

function generateThumbnail(inputPath, outputDir) {
  const thumbPath = path.join(outputDir, "thumbnail.jpg");

  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-ss",
        "00:00:05",
        "-i",
        inputPath,
        "-vframes",
        "1",
        "-q:v",
        "2",
        thumbPath,
      ],
      { stdio: "pipe" }
    );

    console.log("🖼️ Thumbnail generated");
  } catch (err) {
    console.warn("⚠️ Thumbnail generation failed:", err.message);
  }

  return thumbPath;
}

function getVideoMetadata(inputPath) {
  try {
    const result = execFileSync(
      "ffprobe",
      [
        "-v", "error",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        inputPath,
      ],
      { encoding: "utf-8" }
    ).trim();

    const info = JSON.parse(result);
    const videoStream = info.streams?.find((s) => s.codec_type === "video") || {};
    const audioStream = info.streams?.find((s) => s.codec_type === "audio") || {};

    let fps = 0;
    if (videoStream.r_frame_rate) {
      const parts = videoStream.r_frame_rate.split("/");
      if (parts.length === 2 && parseFloat(parts[1]) !== 0) {
        fps = Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100) / 100;
      } else {
        fps = parseFloat(videoStream.r_frame_rate) || 0;
      }
    }

    return {
      duration_seconds: parseFloat(info.format?.duration) || 0,
      size_bytes: parseInt(info.format?.size, 10) || 0,
      bit_rate: parseInt(info.format?.bit_rate, 10) || 0,
      video: {
        width: parseInt(videoStream.width, 10) || 0,
        height: parseInt(videoStream.height, 10) || 0,
        codec: videoStream.codec_name || "",
        fps: fps,
        aspect_ratio: videoStream.display_aspect_ratio || "",
        pix_fmt: videoStream.pix_fmt || "",
      },
      audio: {
        codec: audioStream.codec_name || "",
        sample_rate: parseInt(audioStream.sample_rate, 10) || 0,
        channels: parseInt(audioStream.channels, 10) || 0,
        bit_rate: parseInt(audioStream.bit_rate, 10) || 0,
      },
    };
  } catch (err) {
    console.warn("⚠️ Could not probe video metadata with ffprobe:", err.message);
    return null;
  }
}

function generateMetadata(inputPath, outputDir, sourceWidth, sourceHeight, videoId) {
  const meta = getVideoMetadata(inputPath);
  const metadata = {
    videoId: videoId,
    title: videoId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    thumbnail: "thumbnail.jpg",
    duration_seconds: meta ? meta.duration_seconds : 0,
    size_bytes: meta ? meta.size_bytes : 0,
    bit_rate: meta ? meta.bit_rate : 0,
    video: {
      width: sourceWidth || (meta ? meta.video.width : 0),
      height: sourceHeight || (meta ? meta.video.height : 0),
      codec: meta ? meta.video.codec : "",
      fps: meta ? meta.video.fps : 0,
      aspect_ratio: meta ? meta.video.aspect_ratio : "",
      pix_fmt: meta ? meta.video.pix_fmt : "",
    },
    audio: {
      codec: meta ? meta.audio.codec : "",
      sample_rate: meta ? meta.audio.sample_rate : 0,
      channels: meta ? meta.audio.channels : 0,
      bit_rate: meta ? meta.audio.bit_rate : 0,
    },
    created_at: new Date().toISOString(),
  };

  const metaPath = path.join(outputDir, "metadata.json");
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

  console.log("📝 metadata.json generated");
  return metaPath;
}

async function uploadAllFiles(outputDir, s3Prefix, activeQualities) {
  const files = [];

  files.push({
    local: path.join(outputDir, "master.m3u8"),
    key: `${s3Prefix}/master.m3u8`,
    type: "application/vnd.apple.mpegurl",
  });

  const thumbPath = path.join(outputDir, "thumbnail.jpg");

  if (fs.existsSync(thumbPath)) {
    files.push({
      local: thumbPath,
      key: `${s3Prefix}/thumbnail.jpg`,
      type: "image/jpeg",
    });
  }

  const metadataPath = path.join(outputDir, "metadata.json");

  if (fs.existsSync(metadataPath)) {
    files.push({
      local: metadataPath,
      key: `${s3Prefix}/metadata.json`,
      type: "application/json",
    });
  }

  for (const q of activeQualities) {
    const qDir = path.join(outputDir, q.name);
    const dirFiles = fs.readdirSync(qDir);

    for (const file of dirFiles) {
      const ext = path.extname(file).toLowerCase();

      let contentType = "video/mp2t";

      if (ext === ".m3u8") {
        contentType = "application/vnd.apple.mpegurl";
      } else if (ext === ".ts") {
        contentType = "video/mp2t";
      }

      files.push({
        local: path.join(qDir, file),
        key: `${s3Prefix}/${q.name}/${file}`,
        type: contentType,
      });
    }
  }

  console.log(`📤 Uploading ${files.length} files to S3...`);

  for (const f of files) {
    await uploadToS3(OUTPUT_BUCKET, f.key, f.local, f.type);
  }

  console.log("✅ All files uploaded successfully");
}

function extractS3Key(message) {
  const body = JSON.parse(message.Body);

  let key =
    body.Records?.[0]?.s3?.object?.key ||
    body.key ||
    body.objectKey ||
    body.object_key;

  if (!key) {
    return null;
  }

  try {
    key = decodeURIComponent(key);
  } catch {
    // If decoding fails, use original key
  }

  return key;
}

async function processVideo(message) {
  const s3Key = extractS3Key(message);

  if (!s3Key) {
    console.warn("⚠️ Invalid message format, skipping");
    return;
  }

  const videoId = path.basename(s3Key, path.extname(s3Key));

  console.log(`\n🎬 Processing video: ${videoId}`);
  console.log(`📥 Source: s3://${INPUT_BUCKET}/${s3Key}`);

  const workDir = path.join(WORK_DIR, videoId);
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });

  const inputPath = path.join(workDir, "input.mp4");
  const outputDir = path.join(workDir, "output");
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    console.log("⬇️ Downloading from S3...");
    await downloadFromS3(INPUT_BUCKET, s3Key, inputPath);

    const { activeQualities, sourceWidth, sourceHeight } = transcode(
      inputPath,
      outputDir,
      QUALITIES
    );

    generateMasterPlaylist(
      activeQualities,
      outputDir,
      sourceWidth,
      sourceHeight
    );

    generateThumbnail(inputPath, outputDir);

    generateMetadata(inputPath, outputDir, sourceWidth, sourceHeight, videoId);

    const s3Prefix = `hls/${videoId}`;
    await uploadAllFiles(outputDir, s3Prefix, activeQualities);

    console.log(`✅ Video ${videoId} processed successfully\n`);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

async function main() {
  console.log("🚀 Worker started (Multi-Quality Mode)");
  console.log(`📋 Queue: ${SQS_QUEUE_URL}`);
  console.log(`📥 Input: ${INPUT_BUCKET}`);
  console.log(`📤 Output: ${OUTPUT_BUCKET}`);
  console.log(`🎞️ Qualities: ${QUALITIES.map((q) => q.name).join(", ")}`);
  console.log("⏳ Polling for messages...\n");

  while (true) {
    try {
      const response = await receiveMessage();

      if (response.Messages && response.Messages.length > 0) {
        const message = response.Messages[0];

        try {
          await processVideo(message);

          if (message.ReceiptHandle) {
            await deleteMessage(message.ReceiptHandle);
            console.log("🗑️ Message deleted from queue");
          }
        } catch (err) {
          console.error("❌ Error processing video:", err.message);

          // Do not delete message.
          // SQS will retry after visibility timeout.
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    } catch (err) {
      console.error("❌ SQS polling error:", err.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

main().catch((err) => {
  console.error("💀 Fatal error:", err);
  process.exit(1);
});
