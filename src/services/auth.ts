import { AuthenticatedRequest } from "./../middlewares/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserDocument } from "../models/User.js";
import { transporter } from "../utils/nodeMailer.js";
import { client } from "../utils/twillioSms.js";
import { kgToLb, cmToInches } from "../utils/functions.js";
import Athlete_User from "../models/Athlete_User.js";
import Gym_Member from "../models/Gym_Member.js";
import Gym from "../models/Gym.js";
import { Request } from "express";
import Member_Awaiting from "../models/Member_Awaiting.js";
import mongoose, { Types } from "mongoose";
interface LoginResult {
  user: UserDocument;
}

interface GenericResult {
  message: string;
  user?: UserDocument;
  user_id?: string;
  code?: string;
  token?: string;
  verification?: boolean;
}

export const handleSignup = async (req: AuthenticatedRequest) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { role } = req.query;
    if (!role || typeof role !== "string") {
      throw new Error("Role query parameter is required");
    }

    const userData = JSON.parse(req.body.user);
    let athleteDetails = req.body.athlete_details
      ? JSON.parse(req.body.athlete_details)
      : null;
    const gymDetails = req.body.gym_details
      ? JSON.parse(req.body.gym_details)
      : null;

    // Hash password & set role
    userData.password = await bcrypt.hash(userData.password, 10);
    userData.role = role;

    // Set profile image if provided
    if (
      req.fileUrls &&
      Array.isArray(req.fileUrls.profile) &&
      req.fileUrls.profile.length > 0
    ) {
      userData.profileImage = req.fileUrls.profile[0];
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email }).session(
      session
    );
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const [createdUser] = await User.create([userData], { session });
    let gym;
    // Handle role-specific details
    if (role === "athlete") {
      if (!athleteDetails) {
        throw new Error("Athlete details are required for role athlete");
      }
      const formattedAthleteDetails = {
        ...athleteDetails,
        weight: {
          kg: athleteDetails.weight,
          lbs: kgToLb(athleteDetails.weight),
        },
        height: {
          cm: athleteDetails.height,
          inches: cmToInches(athleteDetails.height),
        },
      };

      await Athlete_User.create(
        [{ userId: createdUser._id, ...formattedAthleteDetails }],
        { session }
      );
    } else if (role === "gymOwner" && gymDetails) {
      gym = await Gym.create(
        [
          {
            owner: createdUser._id,
            ...gymDetails,
            proofOfBusiness: req.fileUrls?.proofOfBusiness || [],
            gymImages: req.fileUrls?.gymImages || [],
            personalIdentification: req.fileUrls?.personalIdentification || [],
          },
        ],
        { session }
      );
      gym = gym[0];
      createdUser.adminStatus = "pending";
      await createdUser.save({ session });
    }

    // If a Bearer token is provided, set createdBy
    let headerToken = req.headers?.authorization;
    if (headerToken && headerToken.startsWith("Bearer ")) {
      const extractedToken = headerToken.split(" ")[1];
      const decodedUser = jwt.verify(
        extractedToken,
        process.env.JWT_SECRET as string
      ) as AuthenticatedRequest["user"];

      if (decodedUser?.id) {
        createdUser.createdBy = new Types.ObjectId(decodedUser.id);
        await createdUser.save({ session });
      }
    }

    // Generate token for new user
    const signupToken = jwt.sign(
      {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      process.env.JWT_SECRET as string
    );

    // Check if they are in awaiting members
    const record = await Member_Awaiting.findOne({
      email: createdUser.email,
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    return {
      message: "User registered successfully",
      user: createdUser,
      gym: gym || null,
      token: signupToken,
      code: record ? record.code : "Not a gym/club member",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Signup error:", error);
    throw error;
  }
};

export const handleLogin = async (req: Request) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("gym friends");
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string
    );
    user.token = token;
    await user.save();
    let gym = null;
    let athleteDetails = null;

    if (user.role === "gymOwner") {
      gym = await Gym.findOne({ owner: user._id }).lean();
    }

    if (user.role === "athlete") {
      const gymMember = await Gym_Member.findOne({
        user: user._id,
        status: "active",
      }).lean();
      gym = gymMember ? { _id: gymMember.gym } : null;
      athleteDetails = await Athlete_User.findOne({ userId: user._id })
        .populate("sportsAndSkillLevels.sport", "name")
        .populate("sportsAndSkillLevels.skillSetLevel", "level")
        .lean();
    }

    return {
      user,
      token,
      gym: gym || null,
      ...(athleteDetails && { athlete_details: athleteDetails }),
    };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const handleForgotPassword = async (
  req: Request
): Promise<GenericResult> => {
  try {
    const { email } = req.body;
    const verificationMethod = req.query.verificationMethod;
    if (verificationMethod == "email") {
      if (!email) {
        throw new Error("Email is required.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Email is not valid.");
      }
    }
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOTP = otp;
    await user.save();

    if (verificationMethod === "email") {
      await sendResetOTP(email, otp);
    } else {
      // if (user?.phoneNumber) await sendResetOTPSMS(user.phoneNumber, otp);
      throw new Error("Phone number verification is not enabled yet");
    }

    return {
      message: `OTP sent to your ${
        verificationMethod === "email" ? "email" : "phone number"
      }`,
      user,
    };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    throw error;
  }
};

export const handleVerifyOtp = async (req: Request): Promise<GenericResult> => {
  try {
    const { otp, user_id } = req.body;

    const user = (await User.findById(user_id)) as UserDocument | null;
    if (!user) throw new Error("User not found");

    if (user.resetOTP !== otp) {
      throw new Error("The OTP you entered is incorrect. Please try again.");
    }

    user.resetOTP = " ";
    await user.save();

    return {
      message: "OTP verified successfully",
      user,
    };
  } catch (error) {
    console.error("Verify OTP Error:", error);
    throw error;
  }
};

export const handleResetPassword = async (
  req: Request
): Promise<GenericResult> => {
  try {
    const { user_id, newPassword } = req.body;
    if (!newPassword || newPassword.trim() === "") {
      throw new Error("Password cannot be empty.");
    }
    const user = await User.findById(user_id);
    if (!user) throw new Error("User not found");

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = " ";
    await user.save();

    return { message: "Password reset successfully" };
  } catch (error) {
    console.error("Reset Password Error:", error);
    throw error;
  }
};

export const sendResetOTP = async (
  email: string,
  otp: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Use this OTP to reset your password: ${otp}`,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendResetOTPSMS = async (
  phoneNumber: string,
  otp: string
): Promise<void> => {
  try {
    await client.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: "+15005550006", // Twilio test number
      to: phoneNumber,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

export const handleVerifyCode = async (req: Request): Promise<boolean> => {
  try {
    const { email, code } = req.body;

    const record = await Member_Awaiting.findOne({ email, code });
    return !!record;
  } catch (error) {
    console.error("Verify Code Error:", error);
    throw error;
  }
};
