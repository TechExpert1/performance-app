import mongoose from "mongoose";

const athleteProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  height: { type: Number, required: true },

  weight: { type: Number, required: true },

  sports: {
    type: String,
    required: true,
  },

  skillLevel: {
    type: String,
    required: true,
  },
});

const Athlete_User = mongoose.model("Athlete_User", athleteProfileSchema);
export default Athlete_User;
