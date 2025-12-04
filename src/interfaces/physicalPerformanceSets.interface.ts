// import { Types } from "mongoose";

// export interface IPerformanceSet {
//   performance?: Types.ObjectId; // optional grouping under PhysicalPerformance
//   type: Types.ObjectId;
//   exercise: Types.ObjectId;
//   date: Date;

//   // Optional fields per type
//   sets?: number; // strength, power
//   weight?: number; // strength, power
//   reps?: number; // strength, power
//   rpe?: number; // strength, power

//   duration?: number; // endurance
//   distance?: number; // endurance, speed
//   time?: number; // speed

//   notes?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
import { Types } from "mongoose";

export interface ISetVariation {
  sets?: number;
  weight?: number;
  reps?: number;
  rpe?: number;
  duration?: number;
  distance?: number;
  time?: number;
  notes?: string;
}

export interface IPerformanceSet {
  performance?: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId[];
  exercise: Types.ObjectId[];
  date?: Date;

  variation: ISetVariation[];

  createdAt?: Date;
  updatedAt?: Date;
}
