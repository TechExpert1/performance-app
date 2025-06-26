import { Request } from "express";
import { transporter } from "../utils/nodeMailer.js";
import Customer_Support from "../models/Customer_Support.js";
interface SupportEmailInput {
  name: string;
  email: string;
  message: string;
  contact: string;
  subject: string;
}

export const handleCustomerSupportEmail = async ({
  name,
  email,
  message,
  contact,
  subject,
}: SupportEmailInput) => {
  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: `${subject}`,
    html: `
      <h3>Customer Support Contact</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
      <p><strong>Contact:</strong><br/>${contact}</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    await Customer_Support.create({ name, email, message, subject, contact });
    return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const getAllCustomerSupports = async (req: Request) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Customer_Support.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Customer_Support.countDocuments(),
    ]);

    return {
      message: "Customer supports fetched successfully",
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get All Customer Supports Error:", error);
    throw error;
  }
};
