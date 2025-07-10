import { Request } from "express";
import Career_Form from "../models/Career_Form.js";
import Early_Access_List from "../models/Early_Access_List.js";
import { transporter } from "../utils/nodeMailer.js";
export const submitcareerForm = async (req: Request) => {
  try {
    const data = {
      ...req.body,
      ...(req.fileUrl && { resume: req.fileUrl }),
    };

    const htmlContent = `
      <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;">📄 Career Form Submission</h2>
        <div style="margin-top: 20px;">
          ${Object.entries(data)
            .map(([key, value]) => {
              const formattedValue =
                key === "resume"
                  ? `<a href="${value}" style="color: #007bff; text-decoration: none;">Download Resume</a>`
                  : value;
              return `
                <p style="margin: 8px 0;">
                  <strong style="color: #555; text-transform: capitalize;">${key}:</strong>
                  <span style="color: #000;">${formattedValue}</span>
                </p>
              `;
            })
            .join("")}
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.Landing_Page_Mail_Reciever,
      subject: `${req.body.firstName} ${req.body.lastName}  has submitted career form, Checkout!`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    const form = await Career_Form.create(data);

    return { message: "Career form submitted successfully", form };
  } catch (error) {
    throw error;
  }
};

export const getAllCareerForm = async (req: Request) => {
  try {
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      ...filters
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const query: Record<string, any> = {};
    for (const key in filters) {
      if (filters[key]) {
        query[key] = filters[key];
      }
    }

    const forms = await Career_Form.find(query)
      .sort({ [sortBy as string]: sortDirection })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Career_Form.countDocuments(query);

    return {
      data: forms,
      total,
      page: pageNum,
      limit: limitNum,
    };
  } catch (error) {
    throw error;
  }
};

export const submitEarlyAccessForm = async (req: Request) => {
  try {
    const htmlContent = `
      <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;">🚀 Early Access Form Submission</h2>
        <div style="margin-top: 20px;">
          ${Object.entries(req.body)
            .map(
              ([key, value]) => `
                <p style="margin: 8px 0;">
                  <strong style="color: #555; text-transform: capitalize;">${key}:</strong>
                  <span style="color: #000;">${value}</span>
                </p>
              `
            )
            .join("")}
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.Landing_Page_Mail_Reciever,
      subject: `${req.body.name} has submitted early access form, Checkout!`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    const form = await Early_Access_List.create(req.body);

    return { message: "Early access form submitted successfully", form };
  } catch (error) {
    throw error;
  }
};
