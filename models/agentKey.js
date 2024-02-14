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

  type: {
    type: String,
    required: [true, "Key Type is required."],
    default: "default",
  },
  creationDate: {
    type: Date,
    required: [true, "Creation Date is required."],
    default: Date.now,
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

//  // Middleware to check expiration before saving
// SalesKeySchema.pre("save", function (next) {
//   if (this.expirationDate < new Date()) {
//     this.expired = true;
//   }
//   next();
// });

// // Define a cron job to update expired keys
// cron.schedule("0 0 * * *", async () => {
//   try {
//     const expiredKeys = await SalesKey.find({ expirationDate: { $lt: new Date() } });
//     for (const key of expiredKeys) {
//       key.expired = true;
//       await key.save();
//     }
//   } catch (error) {
//     console.error("Error updating expired keys:", error);
//   }
// });

const SalesAgentKey = models.Key || model("Key", KeySchema);

export default SalesAgentKey;
