// import mongoose from "mongoose";
import { Schema, model, models } from "mongoose";

const AgentSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
  },
  username: {
    type: String,
    required: [true, "Username is required!"],
    match: [
      /^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
      "Username invalid, it should contain 8-20 alphanumeric letters and be unique!",
    ],
  },
  referral: {
    type: String,
    unique: [true, "Referral already exists!"],
    required: [true, "Referral Number is required!"],
  },
  referredData: [{
    type: Schema.Types.ObjectId,
    ref: 'Customer'
}],
referredLength: {
  type: Number,
  default: 0
}
});

const Agent = models.Agent || model("Agent", AgentSchema);

export default Agent;
