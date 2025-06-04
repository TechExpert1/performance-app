import multer from "multer";
import fs from "fs";
import s3 from "../awsConfig.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
const uploadPath = "./temp-uploads";
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

export const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
  },
});

export const uploadSingleToS3 = async (req, res, next) => {
  try {
    if (!req.file) {
      req.imageUrl = null;
      return next();
    }
    const fileContent = fs.readFileSync(req.file.path);
    const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    fs.unlinkSync(req.file.path);
    req.imageUrl = imageUrl;
    next();
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const uploadMultipleToS3 = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      req.imageUrls = [];
      return next();
    }

    const imageUrls = [];

    for (const file of req.files) {
      const fileContent = fs.readFileSync(file.path);
      const fileName = `uploads/${Date.now()}-${file.originalname}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(params));

      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      imageUrls.push(imageUrl);

      fs.unlinkSync(file.path);
    }

    req.imageUrls = imageUrls;
    next();
  } catch (err) {
    console.error("Multiple Upload Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};
