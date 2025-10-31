import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import s3 from "../config/awsConfig.js";
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
      // imageUrls?: string[];
      fileUrls?: { [fieldname: string]: string[] };
      imageUrls?: { [fieldname: string]: string[] };
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
  // Accept all file types
  cb(null, true);
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
// export const uploadMultipleToS3 = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const files = req.files as Express.Multer.File[];

//     if (!files || files.length === 0) {
//       req.fileUrls = [];
//       return next();
//     }

//     const fileUrls: string[] = [];

//     for (const file of files) {
//       const fileContent = fs.readFileSync(file.path);
//       const fileName = `uploads/${Date.now()}-${file.originalname}`;

//       const params = {
//         Bucket: process.env.AWS_BUCKET_NAME!,
//         Key: fileName,
//         Body: fileContent,
//         ContentType: file.mimetype,
//       };

//       await s3.send(new PutObjectCommand(params));

//       const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
//       fileUrls.push(fileUrl);

//       fs.unlinkSync(file.path);
//     }

//     req.fileUrls = fileUrls;
//     next();
//   } catch (err) {
//     console.error("Multiple Upload Error:", err);
//     res.status(500).json({
//       error: err instanceof Error ? err.message : "Upload failed",
//     });
//   }
// };
export const newMulterUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
}).any();
export const uploadMultipleToS3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      req.fileUrls = {};
      return next();
    }

    const fileUrls: { [fieldname: string]: string[] } = {};

    for (const file of files) {
      try {
        const fileContent = fs.readFileSync(file.path);
        const fileName = `uploads/${Date.now()}-${file.originalname}`;

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileName,
          Body: fileContent,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(params));

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        if (!fileUrls[file.fieldname]) {
          fileUrls[file.fieldname] = [];
        }
        fileUrls[file.fieldname].push(fileUrl);

        // Clean up temp file after successful upload
        fs.unlinkSync(file.path);
      } catch (fileErr) {
        // Log individual file error but continue processing other files
        console.error(`Failed to upload file ${file.originalname}:`, fileErr);
        // Try to clean up temp file even if upload failed
        try {
          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkErr) {
          console.error(`Failed to delete temp file ${file.path}:`, unlinkErr);
        }
        // Continue processing next file instead of stopping
      }
    }

    // Always set fileUrls (even if empty) and call next()
    // This ensures the middleware chain continues
    req.fileUrls = fileUrls;
    return next();
  } catch (err) {
    console.error("Dynamic Upload Error (non-recoverable):", err);
    // Don't send response here - pass to global error handler
    // This prevents middleware chain interruption
    return next(err);
  }
};
