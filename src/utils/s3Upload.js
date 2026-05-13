import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../config/s3.js";
import fs from "fs";
import path from "path";

/**
 * Uploads a file to AWS S3
 * @param {Buffer|Stream|Object} fileInput - The file data or express-fileupload file object
 * @param {string} fileName - Original filename
 * @param {string} folder - Folder name in S3 bucket
 * @param {string} mimeType - The file's mimetype
 */
export const uploadToS3 = async (fileInput, fileName, folder = "uploads", mimeType) => {
  let body = fileInput;
  
  // Fallback for mimeType if missing
  if (!mimeType && fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const mimeMap = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.mp4': 'video/mp4',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    mimeType = mimeMap[ext] || 'application/octet-stream';
  }
  
  // Handle express-fileupload file object
  if (fileInput && typeof fileInput === 'object' && fileInput.tempFilePath && (!fileInput.data || fileInput.data.length === 0)) {
    body = fs.createReadStream(fileInput.tempFilePath);
  } else if (fileInput && fileInput.data) {
    body = fileInput.data;
  }

  const key = `${folder}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
  
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: mimeType,
    },
  });

  try {
    const result = await parallelUploads3.done();
    const cdnUrl = `https://media.admiresoftech.online/${result.Key}`;
    return {
      url: cdnUrl,
      key: result.Key
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};

/**
 * Deletes an object from AWS S3
 * @param {string} key - The key of the object to delete
 */
export const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    const result = await s3.send(command);
    return result;
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw error;
  }
};
