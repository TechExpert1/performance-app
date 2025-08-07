// import admin from "firebase-admin";
// import path, { dirname } from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const serviceAccountPath = path.join(__dirname, "./prymo_firebase.json");
// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }
// export const sendPushNotification = async (
//   deviceToken: string,
//   title: string,
//   body: string,
//   entityId: string,
//   entityType: string
// ) => {
//   const message = {
//     token: deviceToken,
//     notification: {
//       title,
//       body,
//     },
//     data: {
//       entityId,
//       entityType,
//     },
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log("Notification sent:", response);
//   } catch (err) {
//     console.error("Error sending push notification:", err);
//   }
// };

// export default admin;
