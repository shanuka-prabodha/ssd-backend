const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };
const messageSchema = new Schema(
  {
    senderId: {
      type: String,
    },

    message: {
      type: String,
    },

    iv: {
      type: String,
    },
  },
  { timestamps }
);

const message = mongoose.model("message", messageSchema);
module.exports = message;
