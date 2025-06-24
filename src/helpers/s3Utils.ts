import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import s3 from "../awsConfig.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?:
        | { [fieldname: string]: Express.Multer.File[] }
        | Express.Multer.File[];
      imageUrl?: string;
      fileUrl?: string;
      imageUrls?: string[];
    }
  }
}

const uploadPath = path.resolve("./temp-uploads");
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => cb(null, uploadPath),
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => cb(null, Date.now() + "-" + file.originalname),
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/quicktime",
    "video/mpeg",
    "video/webm",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video files are allowed"));
  }
};

export const multerUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter,
});

export const uploadSingleToS3 = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      req.file = undefined;
      return next();
    }

    const fileContent = fs.readFileSync(req.file.path);
    const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    fs.unlinkSync(req.file.path);

    req.fileUrl = fileUrl;
    next();
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Upload failed",
    });
  }
};
