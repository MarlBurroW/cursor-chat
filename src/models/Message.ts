import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  authorColor: { type: String, required: true },
  timestamp: { type: Number, required: true },
});

export const Message = mongoose.model("Message", messageSchema);
