const { randomUUID } = require("crypto");

const {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { s3 } = require("../config/aws.js");

const Bucket = process.env.S3_BUCKET;

async function initiate(body) {
  const { filename, contentType, size } = body;

  if (size > 5 * 1024 * 1024 * 1024) {
    throw new Error("Max upload size exceeded");
  }

  const key = `raw/${filename}`;

  const command = new CreateMultipartUploadCommand({
    Bucket,
    Key: key,
    ContentType: contentType,
  });

  const response = await s3.send(command);

  return {
    uploadId: response.UploadId,
    key,
  };
}

async function presign(body) {
  const { uploadId, key, partNumber } = body;

  const command = new UploadPartCommand({
    Bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 3600,
  });

  return {
    url,
  };
}

async function complete(body) {
  const { uploadId, key, parts } = body;

  const command = new CompleteMultipartUploadCommand({
    Bucket,
    Key: key,
    UploadId: uploadId,

    MultipartUpload: {
      Parts: parts,
    },
  });

  await s3.send(command);

  return {
    success: true,
    key,
  };
}

module.exports = {
  initiate,
  presign,
  complete,
};
