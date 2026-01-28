import Command from "../models/commandModel.js";

// Frontend creates a new command
export const createCommand = async (req, res) => {
  try {
    const { email, type, payload } = req.body;

    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required" });
    }

    const newCommand = new Command({ email, type, payload });
    await newCommand.save();

    return res.status(201).json({
      message: "Command created successfully",
      commandId: newCommand._id
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating command", error: error.message });
  }
};

// Extension polls for pending commands
export const getPendingCommands = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // Find first pending command and mark as processing
    const command = await Command.findOneAndUpdate(
      { email, status: "PENDING" },
      { status: "PROCESSING" },
      { new: true }
    );

    if (!command) {
      return res.status(200).json({ message: "No pending commands", command: null });
    }

    return res.status(200).json({
      message: "Fetched pending command",
      command: {
        id: command._id,
        type: command.type,
        payload: command.payload
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching commands", error: error.message });
  }
};

// Extension updates command result
export const updateCommandResult = async (req, res) => {
  try {
    const { commandId, status, result } = req.body;

    if (!commandId || !status) {
      return res.status(400).json({ message: "commandId and status are required" });
    }

    const updatedCommand = await Command.findByIdAndUpdate(
      commandId,
      { status, result },
      { new: true }
    );

    if (!updatedCommand) {
      return res.status(404).json({ message: "Command not found" });
    }

    return res.status(200).json({
      message: "Command updated successfully",
      command: updatedCommand
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating command", error: error.message });
  }
};

// Frontend polls for command resolution
export const getCommandStatus = async (req, res) => {
  try {
    const { commandId } = req.query;

    if (!commandId) {
      return res.status(400).json({ message: "commandId required" });
    }

    const command = await Command.findById(commandId);

    if (!command) {
      return res.status(404).json({ message: "Command not found" });
    }

    return res.status(200).json({
      status: command.status,
      result: command.result
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching status", error: error.message });
  }
};
