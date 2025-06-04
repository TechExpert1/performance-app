import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    resetOTP: { type: String },
    token: { type: String },
    nationality: { type: String, required: true },

    dob: { type: Date, required: true },

    role: {
      type: String,
      enum: ["superAdmin", "gymOwner", "coach", "athlete"],
      required: true,
    },

    profileImage: { type: String },
    referralSource: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
