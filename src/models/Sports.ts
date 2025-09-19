import mongoose, { Document, Schema, CallbackError } from "mongoose";
import { ISport } from "../interfaces/sport.interface";
import SportCategory from "../models/Sport_Category.js";
import SportCategorySkill from "../models/Sport_Category_Skill.js";

export type SportDocument = ISport & Document;

const sportSchema = new Schema<SportDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    sportsType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Type",
    },
    skillSet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill_Set",
    },
  },
  { timestamps: true }
);

sportSchema.pre(
  "findOneAndDelete",
  async function (next: (err?: CallbackError) => void) {
    try {
      const sportId = this.getQuery()._id;

      const categories = await SportCategory.find({ sport: sportId }, "_id");
      const categoryIds = categories.map((cat) => cat._id);

      await SportCategorySkill.deleteMany({ category: { $in: categoryIds } });

      await SportCategory.deleteMany({ sport: sportId });

      next();
    } catch (err) {
      next(err as CallbackError);
    }
  }
);

export default mongoose.model<SportDocument>("Sport", sportSchema);
