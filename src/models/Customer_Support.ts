import mongoose, { Document, Schema } from "mongoose";
import { ICustomerSupport } from "../interfaces/customerSupport.interface";

type CustomerSupportDocument = ICustomerSupport & Document;

const customerSupportSchema = new Schema<CustomerSupportDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Customer_Support = mongoose.model<CustomerSupportDocument>(
  "Customer_Support",
  customerSupportSchema
);

export default Customer_Support;
