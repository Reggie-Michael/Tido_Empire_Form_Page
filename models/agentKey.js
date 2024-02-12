import { Schema, model, models } from "mongoose";

const KeySchema = new Schema({
  key: {
    type: String,
    required: [true, "Key is required!"],
    match: [
      /^[a-zA-Z0-9]{1,20}$/,
      "Key invalid, it should contain 1-20 letters or digits!",
    ],
    unique: true,
  },
  creationDate: {
    type: Date,
    required: [true, "Creation Date is required."],
    default: Date.now,
    unique: true,
  },
  expirationDate: {
    type: Date,
    default: () => Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
  },
  expired: {
    type: Boolean,
    default: false,
  },
});

const SalesAgentKey = models.Key || model("Key", KeySchema);

export default SalesAgentKey;
