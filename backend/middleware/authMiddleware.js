import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "voicebox_jwt_fallback_key");

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ error: "User not found with this token." });
      }

      next();
    } catch (error) {
      console.error("Auth middleware verification error:", error.message);
      return res.status(401).json({ error: "Not authorized, token failed or expired." });
    }
  } else {
    return res.status(401).json({ error: "Not authorized, no token provided." });
  }
};
