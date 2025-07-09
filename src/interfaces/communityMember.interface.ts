import { Types } from "mongoose";

export interface ICommunityMember {
  community: Types.ObjectId;
  user: Types.ObjectId;
  status: string;
}
