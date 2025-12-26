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
import { OAuth2Client } from "google-auth-library";
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
    const athleteDetails = req.body.athlete_details
      ? JSON.parse(req.body.athlete_details)
      : null;
    const gymDetails = req.body.gym_details
      ? JSON.parse(req.body.gym_details)
      : null;

    // Hash password & set role
    userData.password = await bcrypt.hash(userData.password, 10);
    userData.role = role;

    // Set profile image safely
    if (
      req.fileUrls &&
      Array.isArray(req.fileUrls.profile) &&
      req.fileUrls.profile.length > 0
    ) {
      userData.profileImage = req.fileUrls.profile[0];
    }

    // Check if user already exists with email provider
    const existingUser = await User.findOne({
      email: userData.email,
      authProvider: "email"
    }).session(session);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Set authProvider to email for normal signup
    userData.authProvider = "email";

    // Create new user
    const [createdUser] = await User.create([userData], { session });
    let gym;

    // Role-specific details
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
      const [createdGym] = await Gym.create(
        [
          {
            owner: createdUser._id,
            ...gymDetails,
            proofOfBusiness: Array.isArray(req.fileUrls?.proofOfBusiness)
              ? req.fileUrls.proofOfBusiness
              : [],
            gymImages: Array.isArray(req.fileUrls?.gymImages)
              ? req.fileUrls.gymImages
              : [],
            personalIdentification: Array.isArray(
              req.fileUrls?.personalIdentification
            )
              ? req.fileUrls.personalIdentification
              : [],
          },
        ],
        { session }
      );

      gym = createdGym;
      createdUser.adminStatus = "pending";
      await createdUser.save({ session });
    }

    // Set createdBy from Bearer token
    const headerToken = req.headers?.authorization;
    if (headerToken?.startsWith("Bearer ")) {
      const decodedUser = jwt.verify(
        headerToken.split(" ")[1],
        process.env.JWT_SECRET as string
      ) as AuthenticatedRequest["user"];

      if (decodedUser?.id) {
        createdUser.createdBy = new Types.ObjectId(decodedUser.id);
        await createdUser.save({ session });
      }
    }

    // Handle Member_Awaiting and Gym_Member inside transaction
    let athleteDetailObject;
    let record;
    if (role === "athlete") {
      record = await Member_Awaiting.findOne({
        email: createdUser.email,
      }).session(session);
      if (record) {
        createdUser.gym = record.gym;
        await createdUser.save({ session });
        console.log("Record :::::", record);
        console.log("User :::::", createdUser._id, "Gym:::::", record.gym);
        await Gym_Member.create(
          [{ user: createdUser._id, gym: record.gym, status: "active" }],
          { session }
        );
        gym = record.gym;
      }

      athleteDetailObject = await Athlete_User.findOne({
        userId: createdUser._id,
      })
        .populate("sportsAndSkillLevels.sport", "name")
        .populate("sportsAndSkillLevels.skillSetLevel", "level")
        .session(session)
        .lean();
    }

    // Commit transaction after all DB operations
    await session.commitTransaction();
    session.endSession();

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

    return {
      message: "User registered successfully",
      user: createdUser,
      gym: gym || null,
      token: signupToken,
      code: record ? record.code : "Not a gym/club member",
      ...(athleteDetailObject && { athlete_details: athleteDetailObject }),
    };
  } catch (error) {
    // Abort only if transaction is active
    try {
      await session.abortTransaction();
    } catch (e) {
      console.warn("Transaction already committed or aborted");
    }
    session.endSession();
    console.error("Signup error:", error);
    throw error;
  }
};

export const handleLogin = async (req: Request) => {
  try {
    const { email, password } = req.body;

    // Only find users who signed up with email provider
    const user = await User.findOne({ email, authProvider: "email" }).populate("gym friends");
    if (!user) throw new Error("Invalid credentials");

    // Check if gym owner is rejected
    if (user.role === "gymOwner" && user.adminStatus === "rejected") {
      throw new Error("Your account has been rejected by the administrator");
    }

    if (!user.password) {
      throw new Error("No password set for this account. Please sign in using your social provider.");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    // Track first time login status for gym owners
    const isFirstTimeLogin = user.role === "gymOwner" && user.firstTimeLogin === true;
    console.log(`Login: role=${user.role}, adminStatus=${user.adminStatus}, firstTimeLogin=${user.firstTimeLogin}, isFirstTimeLogin=${isFirstTimeLogin}`);

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

    // Set firstTimeLogin to false after first login for gym owners
    if (isFirstTimeLogin) {
      user.firstTimeLogin = false;
    }

    await user.save();
    let gym = null;
    let athleteDetails = null;

    if (user.role === "gymOwner") {
      gym = await Gym.findOne({ owner: user._id })
        .populate("sport", "name")
        .lean();
    }

    let isPartOfGym = false;
    if (user.role === "athlete") {
      const gymMember = await Gym_Member.findOne({
        user: user._id,
        status: "active",
      }).lean();
      gym = gymMember ? { _id: gymMember.gym } : null;
      isPartOfGym = !!gymMember;
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
      ...(user.role === "athlete" && { isPartOfGym }),
      ...(user.role === "gymOwner" && user.adminStatus === "approved" && { firstTimeLogin: isFirstTimeLogin }),
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
    const { email, phoneNumber } = req.body;
    const verificationMethod = req.query.verificationMethod as string;

    if (!verificationMethod) {
      throw new Error("Verification method is required (email or phone)");
    }

    let user;

    if (verificationMethod === "email") {
      if (!email) {
        throw new Error("Email is required for email verification.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Email is not valid.");
      }

      // Only target email/password accounts for password reset
      user = await User.findOne({ email, authProvider: "email" });
      if (!user) throw new Error("User not found with this email");
    } else if (verificationMethod === "phone") {
      if (!phoneNumber) {
        throw new Error("Phone number is required for phone verification.");
      }

      // Basic phone number validation
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error("Phone number is not valid. Use international format (e.g., +1234567890)");
      }

      user = await User.findOne({ phoneNumber });
      if (!user) throw new Error("User not found with this phone number");
    } else {
      throw new Error("Invalid verification method. Use 'email' or 'phone'");
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOTP = otp;
    await user.save();

    if (verificationMethod === "email") {
      await sendResetOTP(user.email, otp);
    } else if (verificationMethod === "phone") {
      await sendResetOTPSMS(user.phoneNumber!, otp);
    }

    return {
      message: `OTP sent to your ${verificationMethod === "email" ? "email" : "phone number"}`,
      user,
    };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    throw error;
  }
};

export const handleVerifyOtp = async (req: Request): Promise<GenericResult> => {
  try {
    const { otp, userId } = req.body;

    const user = (await User.findById(userId)) as UserDocument | null;
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
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioPhoneNumber) {
      throw new Error("Twilio phone number is not configured");
    }

    const message = await client.messages.create({
      body: `Your password reset OTP code is: ${otp}. This code will expire in 10 minutes.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log(`SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}`);
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    console.error("Twilio error details:", {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo,
      status: error.status
    });
    throw new Error(`Failed to send SMS: ${error.message || "Please try again."}`);
  }
};

export const handleVerifyCode = async (req: Request) => {
  try {
    const { email, code } = req.body;

    const record = await Member_Awaiting.findOne({ email, code });
    if (!record) throw new Error("You are not a registered member");

    // Only consider email-based account for member verification linking
    const user = await User.findOne({ email, authProvider: "email" }).lean();
    if (!user) throw new Error("User not found for given email");

    const gym = await Gym.findOne({ owner: record.createdBy }).lean();
    if (!gym) throw new Error("Gym not found for given owner");

    await Gym_Member.findOneAndUpdate(
      { user: user._id, gym: gym._id, status: "active" },
      {
        $setOnInsert: {
          user: user._id,
          gym: gym._id,
          status: "active",
          role: "athlete",
        },
      },
      { upsert: true, new: true }
    );

    await Member_Awaiting.deleteOne({ _id: record._id });

    return { message: "Code verified", gym };
  } catch (error) {
    console.error("Verify Code Error:", error);
    throw error;
  }
};

export const handleGoogleLogin = async (req: Request) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new Error("Google ID token is required");
    }

    // Verify the Google ID token
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new Error("Google authentication is not configured");
    }

    const client = new OAuth2Client(googleClientId);

    let email: string;
    let googleId: string;
    let name: string | undefined;
    let profileImage: string | undefined;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new Error("Invalid token payload");
      }

      email = payload.email;
      googleId = payload.sub;
      name = payload.name;
      profileImage = payload.picture;
    } catch (error) {
      console.error("Google token verification failed:", error);
      throw new Error("Invalid Google ID token");
    }

    // Check if user exists with this Google provider
    let user = await User.findOne({ authProviderId: googleId, authProvider: "google", role: "athlete" });

    if (!user) {
      // Check if email is already used by another account (different role or auth provider)
      const existingUserWithEmail = await User.findOne({ email });

      if (existingUserWithEmail) {
        // If the user exists as a gym owner with the same Google ID, inform them
        if (existingUserWithEmail.authProviderId === googleId && existingUserWithEmail.role === "gymOwner") {
          throw new Error("This Google account is already registered as a gym owner. Please use a different account for athlete registration.");
        }
        // If the email exists with a different auth provider or different Google account
        throw new Error("An account with this email already exists. Please use a different email or sign in with your existing account.");
      }

      // Create new user with Google (separate from any email accounts)
      user = await User.create({
        email,
        name: name || email.split("@")[0],
        authProvider: "google",
        authProviderId: googleId,
        role: "athlete",
        profileImage: profileImage || "",
        adminStatus: "approved",
      });

      // Don't create Athlete_User - let it be created via update profile API
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string
    );

    user.token = jwtToken;
    await user.save();

    // Populate user with gym and friends like normal login
    const populatedUser = await User.findById(user._id).populate("gym friends");

    if (!populatedUser) {
      throw new Error("User not found after save");
    }

    let gym = null;
    let athleteDetails = null;

    if (populatedUser.role === "gymOwner") {
      gym = await Gym.findOne({ owner: populatedUser._id }).lean();
    }

    let isPartOfGym = false;
    if (populatedUser.role === "athlete") {
      const gymMember = await Gym_Member.findOne({
        user: populatedUser._id,
        status: "active",
      }).lean();
      gym = gymMember ? { _id: gymMember.gym } : null;
      isPartOfGym = !!gymMember;

      // Always fetch athlete details for athletes
      athleteDetails = await Athlete_User.findOne({ userId: populatedUser._id })
        .populate("sportsAndSkillLevels.sport", "name")
        .populate("sportsAndSkillLevels.skillSetLevel")
        .lean();
    }

    // Build response matching normal login structure
    const response: any = {
      user: populatedUser,
      token: jwtToken,
      gym: gym || null,
    };

    // Always include athlete_details and isPartOfGym if user is athlete
    if (populatedUser.role === "athlete") {
      response.athlete_details = athleteDetails;
      response.isPartOfGym = isPartOfGym;
    }

    return response;
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

export const handleAppleLogin = async (req: Request) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new Error("Apple identity token is required");
    }

    // Decode Apple JWT token (Apple tokens are standard JWTs)
    let email: string;
    let appleId: string;

    try {
      // Decode without verification for now (Apple's public keys need to be fetched for full verification)
      const decoded = jwt.decode(token) as any;

      if (!decoded || !decoded.sub) {
        throw new Error("Invalid token payload");
      }

      appleId = decoded.sub;
      email = decoded.email;

      if (!email) {
        throw new Error("Email not found in Apple token");
      }
    } catch (error) {
      console.error("Apple token verification failed:", error);
      throw new Error("Invalid Apple identity token");
    }

    // Check if user exists with this Apple provider
    let user = await User.findOne({ authProviderId: appleId, authProvider: "apple", role: "athlete" });

    if (!user) {
      // Check if email is already used by another account (different role or auth provider)
      const existingUserWithEmail = await User.findOne({ email });

      if (existingUserWithEmail) {
        // If the user exists as a gym owner with the same Apple ID, inform them
        if (existingUserWithEmail.authProviderId === appleId && existingUserWithEmail.role === "gymOwner") {
          throw new Error("This Apple account is already registered as a gym owner. Please use a different account for athlete registration.");
        }
        // If the email exists with a different auth provider or different Apple account
        throw new Error("An account with this email already exists. Please use a different email or sign in with your existing account.");
      }

      // Create new user with Apple (separate from any email accounts)
      const firstName = email.split("@")[0];

      user = await User.create({
        email,
        name: firstName,
        authProvider: "apple",
        authProviderId: appleId,
        role: "athlete",
        profileImage: "",
        adminStatus: "approved",
      });

      // Don't create Athlete_User - let it be created via update profile API
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string
    );

    user.token = jwtToken;
    await user.save();

    // Populate user with gym and friends like normal login
    const populatedUser = await User.findById(user._id).populate("gym friends");

    if (!populatedUser) {
      throw new Error("User not found after save");
    }

    let gym = null;
    let athleteDetails = null;

    if (populatedUser.role === "gymOwner") {
      gym = await Gym.findOne({ owner: populatedUser._id }).lean();
    }

    let isPartOfGym = false;
    if (populatedUser.role === "athlete") {
      const gymMember = await Gym_Member.findOne({
        user: populatedUser._id,
        status: "active",
      }).lean();
      gym = gymMember ? { _id: gymMember.gym } : null;
      isPartOfGym = !!gymMember;

      // Always fetch athlete details for athletes
      athleteDetails = await Athlete_User.findOne({ userId: populatedUser._id })
        .populate("sportsAndSkillLevels.sport", "name")
        .populate("sportsAndSkillLevels.skillSetLevel")
        .lean();
    }

    // Build response matching normal login structure
    const response: any = {
      user: populatedUser,
      token: jwtToken,
      gym: gym || null,
    };

    // Always include athlete_details and isPartOfGym if user is athlete
    if (populatedUser.role === "athlete") {
      response.athlete_details = athleteDetails;
      response.isPartOfGym = isPartOfGym;
    }

    return response;
  } catch (error) {
    console.error("Apple Login Error:", error);
    throw error;
  }
};

export const handleGoogleLoginGym = async (req: Request) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new Error("Google ID token is required");
    }

    // Verify the Google ID token
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      throw new Error("Google authentication is not configured");
    }

    const client = new OAuth2Client(googleClientId);

    let email: string;
    let googleId: string;
    let name: string | undefined;
    let profileImage: string | undefined;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new Error("Invalid token payload");
      }

      email = payload.email;
      googleId = payload.sub;
      name = payload.name;
      profileImage = payload.picture;
    } catch (error) {
      console.error("Google token verification failed:", error);
      throw new Error("Invalid Google ID token");
    }

    // Check if user exists with this Google provider as gym owner
    let user = await User.findOne({ authProviderId: googleId, authProvider: "google", role: "gymOwner" });

    if (!user) {
      // Check if email is already used by another account (different role or auth provider)
      const existingUserWithEmail = await User.findOne({ email });

      if (existingUserWithEmail) {
        // If the user exists as an athlete with the same Google ID, inform them
        if (existingUserWithEmail.authProviderId === googleId && existingUserWithEmail.role === "athlete") {
          throw new Error("This Google account is already registered as an athlete. Please use a different account for gym owner registration.");
        }
        // If the email exists with a different auth provider or different Google account
        throw new Error("An account with this email already exists. Please use a different email or sign in with your existing account.");
      }

      // Create new user with Google as gym owner (separate from any email accounts)
      user = await User.create({
        email,
        name: name || email.split("@")[0],
        authProvider: "google",
        authProviderId: googleId,
        role: "gymOwner",
        profileImage: profileImage || "",
        adminStatus: "pending",
      });

      // Don't create Gym - let it be created via update profile API
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string
    );

    user.token = jwtToken;
    await user.save();

    // Populate user with gym and friends like normal login
    const populatedUser = await User.findById(user._id).populate("gym friends");

    if (!populatedUser) {
      throw new Error("User not found after save");
    }

    let gym = null;

    if (populatedUser.role === "gymOwner") {
      gym = await Gym.findOne({ owner: populatedUser._id })
        .populate("sport", "name")
        .lean();
    }

    // Build response matching normal login structure
    const response: any = {
      user: populatedUser,
      token: jwtToken,
      gym: gym || null,
      isOnboard: gym !== null,
    };

    return response;
  } catch (error) {
    console.error("Google Login Gym Error:", error);
    throw error;
  }
};

export const handleAppleLoginGym = async (req: Request) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new Error("Apple identity token is required");
    }

    // Decode Apple JWT token (Apple tokens are standard JWTs)
    let email: string;
    let appleId: string;

    try {
      // Decode without verification for now (Apple's public keys need to be fetched for full verification)
      const decoded = jwt.decode(token) as any;

      if (!decoded || !decoded.sub) {
        throw new Error("Invalid token payload");
      }

      appleId = decoded.sub;
      email = decoded.email;

      if (!email) {
        throw new Error("Email not found in Apple token");
      }
    } catch (error) {
      console.error("Apple token verification failed:", error);
      throw new Error("Invalid Apple identity token");
    }

    // Check if user exists with this Apple provider as gym owner
    let user = await User.findOne({ authProviderId: appleId, authProvider: "apple", role: "gymOwner" });

    if (!user) {
      // Check if email is already used by another account (different role or auth provider)
      const existingUserWithEmail = await User.findOne({ email });

      if (existingUserWithEmail) {
        // If the user exists as an athlete with the same Apple ID, inform them
        if (existingUserWithEmail.authProviderId === appleId && existingUserWithEmail.role === "athlete") {
          throw new Error("This Apple account is already registered as an athlete. Please use a different account for gym owner registration.");
        }
        // If the email exists with a different auth provider or different Apple account
        throw new Error("An account with this email already exists. Please use a different email or sign in with your existing account.");
      }

      // Create new user with Apple as gym owner (separate from any email accounts)
      const firstName = email.split("@")[0];

      user = await User.create({
        email,
        name: firstName,
        authProvider: "apple",
        authProviderId: appleId,
        role: "gymOwner",
        profileImage: "",
        adminStatus: "pending",
      });

      // Don't create Gym - let it be created via update profile API
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string
    );

    user.token = jwtToken;
    await user.save();

    // Populate user with gym and friends like normal login
    const populatedUser = await User.findById(user._id).populate("gym friends");

    if (!populatedUser) {
      throw new Error("User not found after save");
    }

    let gym = null;

    if (populatedUser.role === "gymOwner") {
      gym = await Gym.findOne({ owner: populatedUser._id })
        .populate("sport", "name")
        .lean();
    }

    // Build response matching normal login structure
    const response: any = {
      user: populatedUser,
      token: jwtToken,
      gym: gym || null,
      isOnboard: gym !== null,
    };

    return response;
  } catch (error) {
    console.error("Apple Login Gym Error:", error);
    throw error;
  }
};

export const handleDeleteAccount = async (req: AuthenticatedRequest) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      throw new Error("User not authenticated");
    }

    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete related data based on role
    if (user.role === "athlete") {
      // Delete athlete profile
      await Athlete_User.deleteOne({ userId: userId }).session(session);

      // Delete gym memberships
      await Gym_Member.deleteMany({ user: userId }).session(session);

      // Remove from member awaiting lists
      await Member_Awaiting.deleteMany({ email: user.email }).session(session);
    }

    if (user.role === "gymOwner") {
      // Delete owned gyms
      await Gym.deleteMany({ owner: userId }).session(session);

      // Delete gym memberships for this gym
      const gyms = await Gym.find({ owner: userId }).session(session);
      const gymIds = gyms.map(g => g._id);
      await Gym_Member.deleteMany({ gym: { $in: gymIds } }).session(session);
    }

    // Remove user from other users' friends lists
    await User.updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    ).session(session);

    // Delete friend requests where user is sender or receiver
    const FriendRequest = mongoose.model("Friend_Request");
    await FriendRequest.deleteMany({
      $or: [{ sender: userId }, { receiver: userId }]
    }).session(session);

    // Delete the user account
    await User.deleteOne({ _id: userId }).session(session);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      message: "Account deleted successfully",
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Delete Account Error:", error);
    throw error;
  }
};
