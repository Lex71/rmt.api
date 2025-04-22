import { model, Schema, Types } from "mongoose";

export interface IRefreshToken /* extends Document */ {
  token: string;
  user: Types.ObjectId;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { required: true, type: String },
    user: { ref: "User", type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshToken;
