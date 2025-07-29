import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserDocument } from "../models/User.js";
import { transporter } from "../utils/nodeMailer.js";
import { client } from "../utils/twillioSms.js";
import Athlete_User from "../models/Athlete_User.js";
import Gym from "../models/Gym.js";
import { Request } from "express";
import Member_Awaiting from "../models/Member_Awaiting.js";

interface LoginResult {
  user: UserDocument;
}

interface GenericResult {
  message: string;
  user?: UserDocument;
  user_id?: string;
  code?: string;
  verification?: boolean;
}

export const handleSignup = async (req: Request): Promise<GenericResult> => {
  try {
    const { role } = req.query;

    if (!role || typeof role !== "string") {
      return { message: "Role query parameter is required" };
    }
    const userData = JSON.parse(req.body.user);
    const athleteDetails = req.body.athlete_details
      ? JSON.parse(req.body.athlete_details)
      : null;
    const gymDetails = req.body.gym_details
      ? JSON.parse(req.body.gym_details)
      : null;

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    userData.role = role;
    if (
      req.fileUrls &&
      Array.isArray(req.fileUrls.profile) &&
      req.fileUrls.profile.length > 0
    ) {
      userData.profileImage = req.fileUrls.profile[0];
    }
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return { message: "User with this email already exists" };
    }
    const newUser = (await User.create(userData)) as UserDocument;

    if (role === "athlete") {
      if (!athleteDetails) {
        return { message: "Athlete details are required for role athlete" };
      }

      await Athlete_User.create({
        userId: newUser._id,
        ...athleteDetails,
      });
    } else if (role === "gymOwner") {
      if (!gymDetails) {
        return { message: "Gym Owner details are required for role gymOwner" };
      }

      await Gym.create({
        owner: newUser._id,
        ...gymDetails,
        proofOfBusiness: req.fileUrls?.proofOfBusiness || [],
        gymImages: req.fileUrls?.gymImages || [],
        personalIdentification: req.fileUrls?.personalIdentification || [],
      });
    }
    const record = await Member_Awaiting.findOne({
      email: newUser.email,
    });
    return {
      message: "User registered successfully",
      user: newUser,
      code: record ? record.code : "Not a gym/club memebr",
    };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

// Login Handler
export const handleLogin = async (req: Request): Promise<LoginResult> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return Promise.reject(new Error("Invalid credentials"));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return Promise.reject(new Error("Invalid credentials"));

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

    return { user };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// Forgot Password Handler
export const handleForgotPassword = async (
  req: Request
): Promise<GenericResult> => {
  try {
    const { email } = req.body;
    const verificationMethod = req.query.verificationMethod;
    if (verificationMethod == "email") {
      if (!email) {
        return { message: "Email is required." };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { message: "Email is not valid." };
      }
    }
    const user = await User.findOne({ email });
    if (!user) return { message: "User not found" };

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOTP = otp;
    await user.save();

    if (verificationMethod === "email") {
      await sendResetOTP(email, otp);
    } else {
      if (user?.phoneNumber) await sendResetOTPSMS(user.phoneNumber, otp);
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

// Verify OTP Handler
export const handleVerifyOtp = async (req: Request): Promise<GenericResult> => {
  try {
    const { otp, user_id } = req.body;

    const user = (await User.findById(user_id)) as UserDocument | null;
    if (!user) return { message: "User not found" };

    if (user.resetOTP !== otp) {
      throw new Error("Invalid OTP");
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

// Reset Password Handler
export const handleResetPassword = async (
  req: Request
): Promise<GenericResult> => {
  try {
    const { user_id, newPassword } = req.body;
    if (!newPassword || newPassword.trim() === "") {
      return { message: "Password cannot be empty." };
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

// Helper function: Send OTP via Email
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

// Helper function: Send OTP via SMS
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
    return !!record; // returns true if record exists, otherwise false
  } catch (error) {
    console.error("Verify Code Error:", error);
    throw error;
  }
};
