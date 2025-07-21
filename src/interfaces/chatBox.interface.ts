// interfaces/index.ts

import { Types } from "mongoose";

export interface IChatBox {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  latest_message?: string;
}
