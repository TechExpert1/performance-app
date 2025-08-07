import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
dotenv.config();

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  const { from, to, subject, text } = mailOptions;

  const emailParams = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: from,
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
  } catch (error) {
    console.error("Error sending text email:", error);
    throw error;
  }
};
export default s3;
