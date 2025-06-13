import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error(
        "MONGO_DB_CONNECTION_STRING is not defined in environment variables."
      );
    }

    await mongoose.connect(connectionString);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("Unknown error occurred during MongoDB connection.");
    }
  }
};

export default connectDB;
