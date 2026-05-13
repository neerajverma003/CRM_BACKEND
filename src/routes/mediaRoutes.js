import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../config/s3.js";

const router = express.Router();

/**
 * Global S3 Proxy/Preview Route
 * Usage: GET /api/media/preview?key=path/to/file.pdf
 */
router.get("/preview", async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({ success: false, message: "Storage key is required" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    const s3Response = await s3.send(command);
    
    // Set headers
    res.setHeader('Content-Type', s3Response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Length', s3Response.ContentLength);
    res.setHeader('Content-Disposition', 'inline');
    
    // Stream body to response
    s3Response.Body.pipe(res);
  } catch (err) {
    console.error("Global Media Preview Error:", err);
    if (err.name === 'NoSuchKey') {
      return res.status(404).json({ success: false, message: "File not found in storage" });
    }
    res.status(500).json({ success: false, message: "Error retrieving file from storage" });
  }
});

export default router;
