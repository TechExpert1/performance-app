// import mongoose, { Schema, Document } from "mongoose";
// import { IPerformanceSet } from "../interfaces/physicalPerformanceSets.interface";

// export type PerformanceSetDocument = IPerformanceSet & Document;

// const PerformanceSetSchema = new Schema<PerformanceSetDocument>(
//   {
//     performance: { type: Schema.Types.ObjectId, ref: "Physical_Performance" },

//     type: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Challenge_Category",
//       required: true,
//     },

//     exercise: {
//       type: Schema.Types.ObjectId,
//       ref: "Challenge_Category_Type",
//       required: true,
//     },

//     sets: Number,
//     weight: Number,
//     reps: Number,
//     rpe: Number,

//     duration: Number,
//     distance: Number,
//     time: Number,

//     notes: String,
//   },
//   { timestamps: true }
// );

// export default mongoose.model<PerformanceSetDocument>(
//   "Physical_Performance_Set",
//   PerformanceSetSchema
// );
import mongoose, { Schema, Document } from "mongoose";
import { IPerformanceSet } from "../interfaces/physicalPerformanceSets.interface";

export type PerformanceSetDocument = IPerformanceSet & Document;

const SetVariationSchema = new Schema(
  {
    sets: { type: Number },
    weight: { type: Number },
    reps: { type: Number },
    rpe: { type: Number },
    duration: { type: Number },
    distance: { type: Number },
    time: { type: Number },
    notes: { type: String },
  },
  { _id: false } // to prevent creating _id for each variation
);

const PerformanceSetSchema = new Schema<PerformanceSetDocument>(
  {
    performance: {
      type: Schema.Types.ObjectId,
      ref: "Physical_Performance",
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category",
      required: true,
    },
    exercise: {
      type: Schema.Types.ObjectId,
      ref: "Challenge_Category_Type",
      required: true,
    },
    variation: {
      type: [SetVariationSchema],
      required: true,
      validate: [
        (v: any[]) => Array.isArray(v) && v.length > 0,
        "At least one variation is required",
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model<PerformanceSetDocument>(
  "Physical_Performance_Set",
  PerformanceSetSchema
);
