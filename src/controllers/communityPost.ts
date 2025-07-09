import { Request, Response } from "express";
import { createCommunityPost } from "../services/communityPost.js";

export const communityPostController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createCommunityPost(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  //   update: async (req: Request, res: Response) => {
  //     try {
  //       const result = await updateCommunity(req);
  //       res.status(200).json(result);
  //     } catch (err) {
  //       res
  //         .status(422)
  //         .json({ error: err instanceof Error ? err.message : "Unknown error" });
  //     }
  //   },

  //   remove: async (req: Request, res: Response) => {
  //     try {
  //       const result = await removeCommunity(req);
  //       res.status(200).json(result);
  //     } catch (err) {
  //       res
  //         .status(422)
  //         .json({ error: err instanceof Error ? err.message : "Unknown error" });
  //     }
  //   },

  //   getById: async (req: Request, res: Response) => {
  //     try {
  //       const result = await getCommunityById(req);
  //       res.status(200).json(result);
  //     } catch (err) {
  //       res
  //         .status(422)
  //         .json({ error: err instanceof Error ? err.message : "Unknown error" });
  //     }
  //   },

  //   getAll: async (req: Request, res: Response) => {
  //     try {
  //       const result = await getAllCommunities(req);
  //       res.status(200).json(result);
  //     } catch (err) {
  //       res
  //         .status(422)
  //         .json({ error: err instanceof Error ? err.message : "Unknown error" });
  //     }
  //   },
};
