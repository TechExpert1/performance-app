import mongoose, { Schema, Document } from "mongoose";
import { IPhysicalPerformance } from "../interfaces/physicalPerformance.interface";

export type PhysicalPerformanceDocument = IPhysicalPerformance & Document;

const PhysicalPerformanceSchema = new Schema<PhysicalPerformanceDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    title: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<PhysicalPerformanceDocument>(
  "Physical_Performance",
  PhysicalPerformanceSchema
);
