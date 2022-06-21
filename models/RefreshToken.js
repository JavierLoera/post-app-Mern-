import { configJwt } from "../config/auth.config.js";
import { v4 } from "uuid";
import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiryDate: Date,
});

RefreshTokenSchema.statics.createToken = async function (user) {
  let expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + configJwt.jwtRefreshExpiration);
  let _token = v4();
  let _object = new this({
    token: _token,
    user: user._id,
    expiryDate: expiredAt.getTime(),
  });
  let refreshToken = await _object.save();
  return refreshToken.token;
};
RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
};

export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
