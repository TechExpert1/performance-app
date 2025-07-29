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

    sportsAndSkillLevels: [
      {
        sport: {
          type: Schema.Types.ObjectId,
          ref: "Sport",
          required: true,
        },
        skillSetLevel: {
          type: Schema.Types.ObjectId,
          ref: "Skill_Set_Level",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Athlete_User: Model<AthleteProfileDocument> =
  mongoose.model<AthleteProfileDocument>("Athlete_User", athleteProfileSchema);

export default Athlete_User;
