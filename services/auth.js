import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { transporter } from "../utils/nodeMailer.js";
import { client } from "../utils/twillioSms.js";
import Athlete_User from "../models/Athlete_User.js";

export const handleSignup = async (req) => {
  try {
    const { role } = req.query;

    if (!role)
      return {
        message: "Role query parameter is required",
      };

    const userData = JSON.parse(req.body.user);
    const athleteDetails = req.body.athlete_details
      ? JSON.parse(req.body.athlete_details)
      : null;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    userData.password = hashedPassword;
    userData.role = role;
    if (req.imageUrl) {
      userData.profileImage = req.imageUrl;
    }

    const newUser = await User.create(userData);

    if (role === "athlete") {
      if (!athleteDetails) {
        return { message: "Athlete details are required for role athlete" };
      }

      await Athlete_User.create({
        userId: newUser._id,
        ...athleteDetails,
      });
    }

    return {
      message: "User registered successfully",
      userId: newUser._id,
    };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const handleLogin = async (req) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return { message: "Invalid credentials" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { message: "Invalid credentials" };

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    user.token = token;
    await user.save();

    return { user };
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const handleForgotPassword = async (req) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return { message: "User not found" };

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOTP = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    if (req.query.verificationMethod == "email") {
      await sendResetOTP(email, otp);
    } else {
      await sendResetOTPSMS(user.phoneNumber, otp);
    }

    return {
      message: `OTP sent to your ${
        req.query.verificationMethod === "email" ? "email" : "phone number"
      }`,
      user,
    };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    throw error;
  }
};

export const handleVerifyOtp = async (req) => {
  try {
    const { otp, user_id } = req.body;

    const user = await User.findById(user_id);
    if (!user) return { message: "User not found" };

    const isOtpInvalid = user.resetOTP !== otp;

    if (isOtpInvalid) {
      throw new Error("Invalid OTP");
    }

    user.resetOTP = null;
    user.otpExpiry = null;
    await user.save();

    return { message: "OTP verified successfully", user_id: user.id };
  } catch (error) {
    console.error("Verify OTP Error:", error);
    throw error;
  }
};

export const handleResetPassword = async (req) => {
  try {
    const { user_id, newPassword } = req.body;

    const user = await User.findById(user_id);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = null;
    await user.save();

    return { message: "Password reset successfully" };
  } catch (error) {
    console.error("Reset Password Error:", error);
    throw error;
  }
};

export const sendResetOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Use this OTP to reset your password: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
};

export const sendResetOTPSMS = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: "+15005550006", // magical numbers for testing
      to: "+5571981265131",
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
