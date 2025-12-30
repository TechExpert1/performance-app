import { Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  sport?: Types.ObjectId;
  category?: Types.ObjectId[];
  skill?: Types.ObjectId[];
  sessionType: string; // "Match Type", "Physical Performance", "Skill Practice", etc.
  matchType?: string; // "Competition" or "Roll/Sparring" (BJJ) or "Sparring" (Boxing)
  matchResult?: string; // "Win", "Loss", "Draw"
  tagFriend?: Types.ObjectId;
  opponent?: string;
  clubOrTeam?: string;
  media?: [string];
  coachFeedback?: {
    coach: Types.ObjectId;
    rating: number;
    comment?: string;
  };
  peerFeedback?: {
    friend: Types.ObjectId;
    rating: number;
    comment?: string;
  };
  private?: boolean;
  rating?: number; // Performance Rating (1-10)
  score?: string;
  comment?: string;

  // ========== BJJ-SPECIFIC FIELDS ==========
  // Method of Victory (BJJ Competition)
  methodOfVictory?: string; // "Submission", "Points", "Advantage", "Referee Decision", "Opponent Disqualified"

  // Match Duration (BJJ)
  matchDuration?: string; // "5 min", "6 min", "7 min", "8 min", "10 min", "Other"
  matchDurationCustom?: number; // Custom duration in minutes if "Other" selected

  // Roll Duration (BJJ Roll/Sparring)
  rollDuration?: string; // "3 min", "5 min", "6 min", "8 min", "Other"
  rollDurationCustom?: number; // Custom duration in minutes if "Other" selected

  // Submission Used (if Method of Victory = Submission)
  submissionUsed?: string; // Armbar, Triangle Choke, Rear Naked Choke, etc.
  submissionCustom?: string; // Custom submission if "Other" selected

  // Score (if Method of Victory = Points or Advantage)
  yourScore?: number;
  opponentScore?: number;

  // Gi / No-Gi Toggle
  giNoGi?: string; // "Gi" or "No-Gi"

  // Belt Division (BJJ Competition)
  beltDivision?: string; // "White", "Blue", "Purple", "Brown", "Black"

  // Weight Class (BJJ)
  bjjWeightClass?: string; // Rooster, Light Feather, Feather, etc.

  // ========== BOXING-SPECIFIC FIELDS ==========
  // Event Name (Boxing Competition)
  eventName?: string;

  // Victory Method (Boxing)
  boxingVictoryMethod?: string; // "KO", "TKO", "Points Decision", "Referee Stoppage", "Corner Stoppage", "Opponent Disqualified"

  // Decision Type (if Points Decision)
  decisionType?: string; // "Unanimous", "Split", "Majority", "Other"

  // Rounds Fought (Boxing - 1-12)
  roundsFought?: number;

  // KO/TKO Details
  roundOfStoppage?: number; // 1-12
  timeOfStoppageMinutes?: number; // 0-3
  timeOfStoppageSeconds?: number; // 0-59

  // Weight Class (Boxing)
  boxingWeightClass?: string; // Minimumweight, Flyweight, Welterweight, etc.

  // Time per Round (Boxing Sparring)
  timePerRound?: string; // "1 min", "2 min", "3 min", "4 min", "5 min", "Other"
  timePerRoundCustom?: number; // Custom time in minutes if "Other" selected

  // Rounds Sparred (Boxing Sparring - 1-12)
  roundsSparred?: number;

  // Gym Name (for Boxing Sparring when opponent is tagged)
  gymName?: string;

  // ========== COMMON OPTIONAL FIELDS ==========
  // Request Peer Feedback toggle
  requestPeerFeedback?: boolean;

  // Request Coach Review
  requestCoachReview?: boolean;
  coachToReview?: Types.ObjectId; // Selected coach for review

  // Video Upload (max 30 sec)
  videoUrl?: string;
  videoThumbnail?: string;

  // Notes / Reflection
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
