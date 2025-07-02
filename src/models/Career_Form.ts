import mongoose, { Schema, Document } from "mongoose";
import { ICareerForm } from "../interfaces/careerForm.interface";

export type CareerFormDocument = ICareerForm & Document;

const careerFormSchema = new Schema<CareerFormDocument>(
  {
    type: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    contactNumber: { type: String },
    resume: { type: String },
    aboutYourself: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<CareerFormDocument>(
  "Career_Form",
  careerFormSchema
);
