import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserDocument } from "../models/User.js";
import { transporter } from "../utils/nodeMailer.js";
import { client } from "../utils/twillioSms.js";
import Athlete_User from "../models/Athlete_User.js";
import Gym_Owner_Profile from "../models/Gym_Owner_User.js";
import { Request } from "express";

interface LoginResult {
  user: UserDocument;
}

interface GenericResult {
  message: string;
  user?: UserDocument;
  user_id?: string;
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
    const gymOwnerDetails = req.body.gymOwner_details
      ? JSON.parse(req.body.gymOwner_details)
      : null;

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    userData.role = role;
    if ((req as any).imageUrls?.profile) {
      userData.profileImage = (req as any).imageUrls.profile[0];
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
      if (!gymOwnerDetails) {
        return { message: "Gym Owner details are required for role gymOwner" };
      }

      await Gym_Owner_Profile.create({
        userId: newUser._id,
        ...gymOwnerDetails,
        proofOfBusiness: req.imageUrls?.proofOfBusiness || [],
        gymImages: req.imageUrls?.gymImages || [],
        personalIdentification: req.imageUrls?.personalIdentification || [],
      });
    }

    return {
      message: "User registered successfully",
      user: newUser,
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

    const user = await User.findOne({ email });
    if (!user) return { message: "User not found" };

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOTP = otp;
    await user.save();

    if (verificationMethod === "email") {
      await sendResetOTP(email, otp);
    } else {
      await sendResetOTPSMS(user.phoneNumber, otp);
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
