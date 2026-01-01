import mongoose, { Schema, Document } from "mongoose";
import { IReview } from "../interfaces/review.interface";

export type ReviewDocument = IReview & Document;

const reviewSchema = new Schema<ReviewDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: "Sport" },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport_Category",
      },
    ],
    skill: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport_Category_Skill",
      },
    ],
    sessionType: { type: String, required: true },
    matchType: { type: String }, // Competition, Roll/Sparring, Sparring
    matchResult: { type: String }, // Win, Loss, Draw
    tagFriend: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Tagged opponent for BJJ Roll/Sparring
    opponent: { type: String },
    clubOrTeam: { type: String },
    media: [{ type: String }],
    coachFeedback: {
      coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 10 },
      comment: { type: String },
    },
    peerFeedback: {
      friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 10 },
      comment: { type: String },
    },
    private: { type: Boolean },
    score: { type: String },
    rating: { type: Number, min: 1, max: 10 }, // Performance Rating
    comment: { type: String },

    // ========== BJJ-SPECIFIC FIELDS ==========
    // Method of Victory (BJJ Competition)
    methodOfVictory: { type: String }, // Submission, Points, Advantage, Referee Decision, Opponent Disqualified

    // Match Duration (BJJ Competition)
    matchDuration: { type: String }, // 5 min, 6 min, 7 min, 8 min, 10 min, Other
    matchDurationCustom: { type: Number }, // Custom duration in minutes

    // Roll Duration (BJJ Roll/Sparring)
    rollDuration: { type: String }, // 3 min, 5 min, 6 min, 8 min, Other
    rollDurationCustom: { type: Number }, // Custom duration in minutes

    // Submission Used (if Method of Victory = Submission)
    submissionUsed: { type: String }, // Armbar, Triangle Choke, Rear Naked Choke, etc.
    submissionCustom: { type: String }, // Custom submission if "Other" selected

    // Score (if Method of Victory = Points or Advantage)
    yourScore: { type: Number, min: 0, max: 50 },
    opponentScore: { type: Number, min: 0, max: 50 },

    // Gi / No-Gi Toggle
    giNoGi: { type: String }, // Gi, No-Gi

    // Belt Division (BJJ Competition)
    beltDivision: { type: String }, // White, Blue, Purple, Brown, Black

    // Weight Class (BJJ)
    bjjWeightClass: { type: String }, // Rooster, Light Feather, Feather, etc.

    // ========== BOXING-SPECIFIC FIELDS ==========
    // Event Name (Boxing Competition)
    eventName: { type: String },

    // Victory Method (Boxing)
    boxingVictoryMethod: { type: String }, // KO, TKO, Points Decision, Referee Stoppage, Corner Stoppage, Opponent Disqualified

    // Decision Type (if Points Decision)
    decisionType: { type: String }, // Unanimous, Split, Majority, Other

    // Rounds Fought (Boxing Competition - 1-12)
    roundsFought: { type: Number, min: 1, max: 12 },

    // KO/TKO Details
    roundOfStoppage: { type: Number, min: 1, max: 12 },
    timeOfStoppageMinutes: { type: Number },
    timeOfStoppageSeconds: { type: Number },

    // Weight Class (Boxing)
    boxingWeightClass: { type: String }, // Minimumweight, Flyweight, Welterweight, etc.

    // Time per Round (Boxing Sparring)
    timePerRound: { type: String }, // 1 min, 2 min, 3 min, 4 min, 5 min, Other
    timePerRoundCustom: { type: Number }, // Custom time in minutes

    // Rounds Sparred (Boxing Sparring - 1-12)
    roundsSparred: { type: Number, min: 1, max: 12 },

    // Gym Name (for Boxing Sparring when opponent is tagged)
    gymName: { type: String },

    // ========== COMMON OPTIONAL FIELDS ==========
    // Request Peer Feedback toggle
    requestPeerFeedback: { type: Boolean, default: false },

    // Request Coach Review
    requestCoachReview: { type: Boolean, default: false },
    coachToReview: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Video Upload (max 30 sec)
    videoUrl: { type: String },
    videoThumbnail: { type: String },

    // Notes / Reflection
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for efficient querying
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ user: 1, sport: 1 });
reviewSchema.index({ user: 1, sessionType: 1 });
reviewSchema.index({ user: 1, matchType: 1 });
reviewSchema.index({ user: 1, matchResult: 1 });

export default mongoose.model<ReviewDocument>("Review", reviewSchema);

