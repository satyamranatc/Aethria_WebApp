import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";

// @desc    Get all conversations for authenticated user
// @route   GET /api/conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      conversations: conversations.map(c => ({
        id: c._id.toString(),
        title: c.title,
        messages: c.messages,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      }))
    });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch conversations." });
  }
};

// @desc    Get single conversation by ID
// @route   GET /api/conversations/:id
export const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    let conversation = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      conversation = await Conversation.findOne({ _id: id, userId: req.user._id });
    }

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    return res.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error("Get Conversation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch conversation." });
  }
};

// @desc    Create or save a new conversation
// @route   POST /api/conversations
export const createConversation = async (req, res) => {
  try {
    const { title, messages } = req.body;

    const conversation = await Conversation.create({
      userId: req.user._id,
      title: title || "New Conversation",
      messages: Array.isArray(messages) ? messages : []
    });

    return res.status(201).json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create conversation." });
  }
};

// @desc    Update an existing conversation (messages & title)
// @route   PUT /api/conversations/:id
export const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, messages } = req.body;

    let conversation = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      conversation = await Conversation.findOne({ _id: id, userId: req.user._id });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId: req.user._id,
        title: title || "New Conversation",
        messages: Array.isArray(messages) ? messages : []
      });
    } else {
      if (title) conversation.title = title;
      if (Array.isArray(messages)) conversation.messages = messages;
      await conversation.save();
    }

    return res.json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error("Update Conversation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to update conversation." });
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    let conversation = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      conversation = await Conversation.findOneAndDelete({
        _id: id,
        userId: req.user._id
      });
    }

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found or not owned by user." });
    }

    return res.json({ success: true, message: "Conversation deleted successfully." });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete conversation." });
  }
};
