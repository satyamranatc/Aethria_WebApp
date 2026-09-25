import VoiceStudioSession from "../models/VoiceStudioSession.js";
import Project from "../models/Project.js";

// @desc    Get all saved voice studio builds for user
// @route   GET /api/voice-studio/sessions
export const getVoiceStudioSessions = async (req, res) => {
  try {
    const sessions = await VoiceStudioSession.find({ userId: req.user._id })
      .populate("projectId", "name framework")
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        title: s.title,
        projectId: s.projectId?._id || null,
        projectName: s.projectId?.name || null,
        projectFramework: s.projectId?.framework || null,
        messageCount: s.chatHistory?.length || 0,
        canvasSnippet: s.canvasHtml ? s.canvasHtml.slice(0, 150) : "",
        selectedVoice: s.selectedVoice,
        viewport: s.viewport,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });
  } catch (error) {
    console.error("Get Voice Studio Sessions Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch voice studio sessions." });
  }
};

// @desc    Get single voice studio build by ID
// @route   GET /api/voice-studio/sessions/:id
export const getVoiceStudioSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await VoiceStudioSession.findOne({ _id: id, userId: req.user._id })
      .populate("projectId", "name framework")
      .lean();

    if (!session) {
      return res.status(404).json({ error: "Voice studio session not found." });
    }

    return res.json({
      success: true,
      session: {
        id: session._id.toString(),
        title: session.title,
        projectId: session.projectId?._id || null,
        projectName: session.projectId?.name || null,
        projectFramework: session.projectId?.framework || null,
        canvasHtml: session.canvasHtml || "",
        chatHistory: session.chatHistory || [],
        selectedVoice: session.selectedVoice || "onwK4e9ZLuTAKqWW03F9",
        viewport: session.viewport || "desktop",
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error("Get Voice Studio Session By ID Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch voice studio session." });
  }
};

// @desc    Save or update voice studio build & conversation history
// @route   POST /api/voice-studio/sessions
export const saveVoiceStudioSession = async (req, res) => {
  try {
    const {
      id,
      title = "Untitled Voice Build",
      projectId = null,
      canvasHtml = "",
      chatHistory = [],
      selectedVoice = "onwK4e9ZLuTAKqWW03F9",
      viewport = "desktop"
    } = req.body;

    let session;
    if (id) {
      session = await VoiceStudioSession.findOne({ _id: id, userId: req.user._id });
    }

    if (session) {
      // Update existing build
      session.title = title.trim() || session.title;
      if (projectId !== undefined) session.projectId = projectId || null;
      session.canvasHtml = canvasHtml;
      session.chatHistory = Array.isArray(chatHistory) ? chatHistory : session.chatHistory;
      session.selectedVoice = selectedVoice || session.selectedVoice;
      session.viewport = viewport || session.viewport;
      await session.save();
    } else {
      // Create new build
      session = new VoiceStudioSession({
        userId: req.user._id,
        projectId: projectId || null,
        title: title.trim() || "Untitled Voice Build",
        canvasHtml,
        chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
        selectedVoice,
        viewport
      });
      await session.save();
    }

    return res.json({
      success: true,
      session: {
        id: session._id.toString(),
        title: session.title,
        projectId: session.projectId,
        canvasHtml: session.canvasHtml,
        chatHistory: session.chatHistory,
        selectedVoice: session.selectedVoice,
        viewport: session.viewport,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error("Save Voice Studio Session Error:", error);
    return res.status(500).json({ error: error.message || "Failed to save voice studio session." });
  }
};

// @desc    Delete a voice studio build
// @route   DELETE /api/voice-studio/sessions/:id
export const deleteVoiceStudioSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await VoiceStudioSession.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!session) {
      return res.status(404).json({ error: "Voice studio session not found." });
    }

    return res.json({
      success: true,
      message: "Voice studio session deleted successfully."
    });
  } catch (error) {
    console.error("Delete Voice Studio Session Error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete voice studio session." });
  }
};
