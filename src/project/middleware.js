import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token missing", []);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "Invalid authorization token", []);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired authorization token", []);
  }
};

export { requireAuth };
