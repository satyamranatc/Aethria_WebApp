import express from "express";
import {
  getConversations,
  getConversationById,
  createConversation,
  updateConversation,
  deleteConversation
} from "../controllers/conversationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All conversation routes require JWT authentication
router.use(protect);

router.route("/")
  .get(getConversations)
  .post(createConversation);

router.route("/:id")
  .get(getConversationById)
  .put(updateConversation)
  .delete(deleteConversation);

export default router;
