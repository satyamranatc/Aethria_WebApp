import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "voicebox_jwt_fallback_key", {
    expiresIn: "30d"
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide name, email, and password." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    if (user) {
      return res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          createdAt: user.createdAt
        },
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ error: "Invalid user data provided." });
    }
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ error: error.message || "Registration failed." });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          createdAt: user.createdAt
        },
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ error: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: error.message || "Login failed." });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch user profile." });
  }
};

// @desc    Update user profile & password
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (req.body.name) {
      user.name = req.body.name.trim();
    }
    if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }

    // Optional password change
    if (req.body.currentPassword && req.body.newPassword) {
      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect." });
      }
      if (req.body.newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters." });
      }
      user.password = req.body.newPassword;
    }

    const updated = await user.save();

    return res.json({
      success: true,
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar || null,
        createdAt: updated.createdAt
      }
    });
  } catch (error) {
    console.error("UpdateProfile Error:", error);
    return res.status(500).json({ error: error.message || "Failed to update profile." });
  }
};
