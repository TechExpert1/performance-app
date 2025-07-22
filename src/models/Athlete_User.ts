import mongoose, { Document, Model, Schema } from "mongoose";
import { IAthleteProfile } from "../interfaces/athleteProfile.interface";

type AthleteProfileDocument = IAthleteProfile & Document;

const athleteProfileSchema: Schema<AthleteProfileDocument> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    sports: { type: Schema.Types.ObjectId, ref: "Sport" },
    skillLevel: { type: Schema.Types.ObjectId, ref: "Skill_Level_Set" },
  },
  { timestamps: true }
);

const Athlete_User: Model<AthleteProfileDocument> =
  mongoose.model<AthleteProfileDocument>("Athlete_User", athleteProfileSchema);

export default Athlete_User;
