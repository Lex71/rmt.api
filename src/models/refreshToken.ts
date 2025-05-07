import { Model, model, Schema, Types } from "mongoose";

export interface IRefreshToken /* extends Document */ {
  token: string;
  user: Types.ObjectId;
}

type RefreshToken = Model<IRefreshToken, object>;

const refreshTokenSchema = new Schema<IRefreshToken, RefreshToken>(
  {
    token: { required: true, type: String },
    user: { ref: "User", type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

const RefreshToken = model<IRefreshToken, RefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);

export default RefreshToken;
