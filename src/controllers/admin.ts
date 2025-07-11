import User from "../models/User.js";
// import OtpReset from "../models/OtpReset";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/nodeMailer";
import { Request, Response } from "express";
import { RootFilterQuery } from "mongoose";
import { IUser } from "../interfaces/user.interface";
// import { accountMail } from "../utils/sendEmail";
export const LoginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({
      email: email.toLowerCase(),
      role: "superAdmin",
    });
    if (!userExists) {
      res.status(400).json({ message: "No such admin exists" });
      return;
    }
    const comparePassword = await bcrypt.compare(password, userExists.password);
    if (!comparePassword) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }
    const token = jwt.sign(
      {
        _id: userExists._id,
      },
      process.env.JWT_SECRET!
    );
    res.status(201).json({
      token: token,
      adminId: userExists._id,
      admin_username: userExists.name,
      email: userExists.email,
      phone_no: userExists.phoneNumber,
      profile_pic: userExists.profileImage,
    });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const emailExists = await User.findOne({
      email: email.toLowerCase(),
    });
    if (emailExists) {
      res.status(409).json({ message: "User with this email already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      name: username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "superAdmin",
    });
    await newUser.save();
    res.status(201).json({ message: "Admin created successfully!" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
// export const sendOtpAdmin = async (req: Request, res: Response) => {
//   const otp = Math.floor(1000 + Math.random() * 9000);
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({
//       email: email.toLowerCase(),
//       isAdmin: true,
//       type: "ad-min",
//     });
//     if (!user) {
//       res
//         .status(400)
//         .json({ message: "No such admin exists with this email!" });
//       return;
//     }
//     const newOtp = new OtpReset({
//       otp: otp,
//       userId: user._id,
//     });
//     await newOtp.save();
//     accountMail(email, "Confirm Password Reset", otp.toString(), user.name);
//     res.status(200).json({ message: "Otp sent to your email!" });
//   } catch (error) {
//         if(error instanceof Error){
//         res.status(500).json({message:"Error uploading image : " + error?.message});
//     }
//   return;
//   }
// };
// export const verifyOTPAndResetPassAdmin = async (
//   req: Request,
//   res: Response
// ) => {
//   const { email, sentOtp, password, confirm_password } = req.body;
//   try {
//     const user = await User.findOne({
//       email: email.toLowerCase(),
//       isAdmin: true,
//       type: "ad-min",
//     });
//     if (!user) {
//       res
//         .status(400)
//         .json({ message: "No such admin exists with this email!" });
//       return;
//     }
//     const otp = await OtpReset.findOne({
//       userId: user._id,
//       otp: sentOtp,
//     });
//     if (!otp) {
//       res.status(400).json({ message: "Incorrect Otp!" });
//       return;
//     }
//     await otp.deleteOne();
//     if (password !== confirm_password) {
//       res.status(400).json({ message: "Passwords do not match!" });
//       return;
//     }
//     user.password = await bcrypt.hash(password, 12);
//     await user.save();
//     res.status(200).json({
//       message: "Otp verified and new password is updated successfully!",
//     });
//   } catch (error) {
//         if(error instanceof Error){
//         res.status(500).json({message:"Error uploading image : " + error?.message});
//     }
//   return;
//   }
// };
export const searchGeneralUsersByEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, email } = req.query;
    const reg = new RegExp(email ? (email as string) : "", "i");
    const reg2 = new RegExp(username ? (username as string) : "", "i");
    const adminId = req?.admin?._id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists!" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(400).json({ message: "You are not authorized!" });
      return;
    }
    const generalUsers = await User.find({
      role: { $ne: "superAdmin" },
      email: { $regex: reg },
      name: { $regex: reg2 },
    })
      .select("name email profileImage role createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ generalUsers });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const getSingleUserDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = req?.admin?._id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists!" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    let user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(400).json({ message: "No such user exists!" });
      return;
    }
    const userr = user.toObject({ getters: true });
    res.status(200).json({ user: userr });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const deleteAUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = req?.admin?._id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists!" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(400).json({ message: "No such user exists!" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    await user.save();
    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const getAdmins = async (req: Request, res: Response) => {
  try {
    const adminId = req?.admin?._id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    const admins = await User.find({ role: "superAdmin" })
      .select("name email createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ admins });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const getNoOfAllTypesOfUsers = async (req: Request, res: Response) => {
  try {
    const adminId = req?.admin?._id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    const generalUsers = await User.find({
      role: "athlete",
    }).select("createdAt");
    const trainingProviders = await User.find({
      role: "coach",
    }).select("createdAt");
    const hostAgencies = await User.find({
      role: "gymOwner",
    }).select("createdAt");
    const noOfGeneralUsers = generalUsers.length;
    const noOfTrainingProviders = trainingProviders.length;
    const noOfHostAgencies = hostAgencies.length;
    res.status(200).json({
      generalUsers,
      trainingProviders,
      hostAgencies,
      noOfGeneralUsers,
      noOfTrainingProviders,
      noOfHostAgencies,
    });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const getGeneralUsers = async (req: Request, res: Response) => {
  try {
    const adminId = req?.admin?._id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    const generalUsers = await User.find({
      role: { $ne: "superAdmin" },
    })
      .select("name email role profileImage createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ generalUsers });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const uploadImageAdmin = async (req: Request, res: Response) => {
  try {
    if (
      !req.fileUrls ||
      !Array.isArray(req.fileUrls?.profileImage) ||
      req.fileUrls.profileImage.length === 0 ||
      !req.fileUrls.profileImage[0]
    ) {
      res
        .status(400)
        .json({ message: "Required an image to proceed the request" });
    }
    const adminId = req?.admin?._id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    admin.profileImage = req.fileUrls?.profileImage?.[0];
    await admin.save();
    res.status(200).json({ imageUrl: admin.profileImage });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
