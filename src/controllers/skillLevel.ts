// import { Request, Response } from "express";
// import { createSkillLevel } from "../services/skillLevel.js";

// export const create = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const result = await createSkillLevel(req);
//     res.status(201).json(result);
//   } catch (err) {
//     if (err instanceof Error) {
//       res.status(422).json({ error: err.message });
//     } else {
//       res.status(422).json({ error: "Unknown error occurred" });
//     }
//   }
// };
