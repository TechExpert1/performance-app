import mongoose from "mongoose";

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sportsType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportsType",
      required: true,
    },
    skillLevelSet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillLevelSet",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sport", sportSchema);
