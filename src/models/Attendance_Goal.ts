import mongoose, { Schema, Document } from "mongoose";
import { IAttendanceGoal } from "../interfaces/attendanceGoal.interface";

export type AttendanceGoalDocument = IAttendanceGoal & Document;

const attendanceGoalSchema = new Schema<AttendanceGoalDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String },
    name: { type: String },
    month: { type: String },
    noOfSessions: { type: Number },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<AttendanceGoalDocument>(
  "Attendance_Goal",
  attendanceGoalSchema
);
