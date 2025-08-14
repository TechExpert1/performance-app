import User from "../models/User.js";
import OtpReset from "../models/Reset_Otp.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/nodeMailer.js";
import { Request, Response } from "express";
import AthleteProfile from "../models/Athlete_User.js";
import AttendanceGoal from "../models/Attendance_Goal.js";
import Challenge from "../models/Challenge.js";
import Community from "../models/Community.js";
import CommunityMember from "../models/Community_Member.js";
import CommunityPost from "../models/Community_Post.js";
import Gym from "../models/Gym.js";
import PhysicalPerformance from "../models/Physical_Performance.js";
import Review from "../models/Review.js";
import SystemUserChallenge from "../models/System_User_Challenge.js";
import TrainingCalendar from "../models/Training_Calendar.js";
import UserChallenge from "../models/User_Challenge.js";
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
        id: userExists._id,
        role: userExists.role,
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
      role: userExists.role,
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
export const sendOtpAdmin = async (req: Request, res: Response) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const { email } = req.body;
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: { $in: ["superAdmin", "salesRep"] },
    });

    if (!user) {
      res.status(400).json({
        message: "No such admin or sales representator exists with this email!",
      });
      return;
    }
    const newOtp = new OtpReset({
      otp: otp,
      userId: user._id,
    });
    await newOtp.save();
    const roleLabelMap = {
      superAdmin: "Prymo Admin",
      salesRep: "Prymo Sales Representative",
    } as const;

    await transporter.sendMail({
      sender: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `${
        roleLabelMap[user.role as keyof typeof roleLabelMap] || "User"
      }: Your OTP is ${otp}`,
    });
    res.status(200).json({ message: "Otp sent to your email!" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error uploading image : " + error?.message });
    }
    return;
  }
};
export const verifyOTPAndResetPassAdmin = async (
  req: Request,
  res: Response
) => {
  const { email, sentOtp, password, confirm_password } = req.body;
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: { $in: ["superAdmin", "salesRep"] },
    });

    if (!user) {
      res.status(400).json({
        message:
          "No such admin or sales representative exists with this email!",
      });
      return;
    }

    const otp = await OtpReset.findOne({
      userId: user._id,
      otp: sentOtp,
    });

    if (!otp) {
      res.status(400).json({ message: "Incorrect OTP!" });
      return;
    }
    await otp.deleteOne();

    if (password !== confirm_password) {
      res.status(400).json({ message: "Passwords do not match!" });
      return;
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    res.status(200).json({
      message: "OTP verified and new password updated successfully!",
    });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error resetting password: " + error.message });
    }
  }
};
export const searchGeneralUsersByEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { username, email } = req.query;
    const reg = new RegExp(email ? (email as string) : "", "i");
    const reg2 = new RegExp(username ? (username as string) : "", "i");
    const adminId = req?.user?.id;
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
      $or: [{ adminStatus: { $exists: false } }, { adminStatus: "approved" }],
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
    const adminId = req?.user?.id;
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
    let linkedProfileName;
    if (user?.role === "gymOwner") {
      const gymDetails = await Gym.findOne({ owner: userId })
        .populate({
          path: "sport",
          populate: { path: "skillSet" },
        })
        .lean();

      if (gymDetails) linkedProfileName = gymDetails;
    }
    if (!user) {
      res.status(400).json({ message: "No such user exists!" });
      return;
    }
    const userr = user.toObject({ getters: true });
    res.status(200).json({
      user: userr,
      ...(linkedProfileName ? { gymDetails: linkedProfileName } : {}),
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
export const deleteAUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    const { userId } = req.params;
    const adminId = req?.user?.id;

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

    session.startTransaction();

    await Promise.all([
      AthleteProfile.deleteOne({ userId }).session(session),
      AttendanceGoal.deleteMany({ user: userId }).session(session),
      Challenge.deleteMany({ createdBy: userId }).session(session),
      Community.deleteMany({ createdBy: userId }).session(session),
      CommunityMember.deleteMany({ user: userId }).session(session),
      CommunityPost.deleteMany({ createdBy: userId }).session(session),
      Gym.deleteOne({ userId }).session(session),
      PhysicalPerformance.deleteMany({ user: userId }).session(session),
      Review.deleteMany({
        $or: [{ user: userId }, { opponent: userId }],
      }).session(session),
      SystemUserChallenge.deleteMany({ user: userId }).session(session),
      TrainingCalendar.deleteMany({
        $or: [{ user: userId }, { attendees: userId }, { coaches: userId }],
      }).session(session),
      UserChallenge.deleteMany({ user: userId }).session(session),
    ]);

    await User.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: "User and related data deleted successfully!" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Error deleting user and related data",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const adminId = req?.user?.id;
    const admin = await User.findById(adminId);
    if (!admin) {
      res.status(400).json({ message: "No such admin exists" });
      return;
    }
    if (admin.role !== "superAdmin") {
      res.status(401).json({ message: "Unauthorized to access this resource" });
      return;
    }
    const admins = await User.find({ role: req.query.role })
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
    const adminId = req?.user?.id;
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
      adminStatus: "approved",
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
    const adminId = req?.user?.id;
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
      $or: [{ adminStatus: { $exists: false } }, { adminStatus: "approved" }],
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
    const adminId = req?.user?.id;
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
export const createSubAdmin = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      res
        .status(409)
        .json({ message: "Sub Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    userData.role = "salesRep";

    if (
      req.fileUrls &&
      Array.isArray(req.fileUrls.profile) &&
      req.fileUrls.profile.length > 0
    ) {
      userData.profileImage = req.fileUrls.profile[0];
    }

    const newUser = await User.create(userData);
    res
      .status(201)
      .json({ message: "Sub Admin created successfully", data: newUser });
  } catch (error) {
    console.error("Error creating sub admin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getPendingGymOwner = async (req: Request, res: Response) => {
  try {
    const users = await User.find({
      role: "gymOwner",
      adminStatus: "pending",
    }).populate("gym friends");

    const data = await Promise.all(
      users.map(async (user) => {
        const gymDetails = await Gym.findOne({ owner: user._id })
          .populate({
            path: "sport",
            populate: {
              path: "skillSet",
            },
          })
          .lean();

        return {
          user,
          gymDetails,
        };
      })
    );

    res.status(200).json({ data });
    return;
  } catch (error) {
    console.error("Error fetching pending gym owners with gyms:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }
};
