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
    subject: `💬 Support Inquiry from ${name} – ${subject}`,
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); overflow: hidden;">

        <!-- Header -->
        <div style="background-color: #2976BA; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 24px;">💪 Prymo </h1>
          <p style="margin: 5px 0 0; color: #e0f7f4; font-size: 14px;">New Message via Contact Form</p>
        </div>

        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #2c3e50;"><strong>You've received a new customer support inquiry.</strong></p>
          <p style="font-size: 15px; color: #555;">
            Someone just reached out via the Prymo App. Here are the details:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Name:</td>
              <td style="padding: 8px 0; color: #555;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Email:</td>
              <td style="padding: 8px 0; color: #555;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Contact No:</td>
              <td style="padding: 8px 0; color: #555;">${
                contact || "Not provided"
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #2c3e50;">Subject:</td>
              <td style="padding: 8px 0; color: #555;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; vertical-align: top; font-weight: bold; color: #2c3e50;">Message:</td>
              <td style="padding: 8px 0;">
                <div style="padding: 12px; background-color: #ecf0f1; border-left: 4px solid #1abc9c; border-radius: 5px; color: #2c3e50;">
                  ${message}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 13px; color: #888;">
          <p style="margin: 0;">This message was submitted via the <strong>FitZone Gym</strong> contact form.</p>
          <p style="margin: 0;">Train Smart. Live Strong. 🏆</p>
        </div>
      </div>
    </div>
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
