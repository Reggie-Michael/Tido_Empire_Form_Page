import { Schema, model, models } from "mongoose";

const AgentSchema = new Schema({
  mainName: {
    type: String,
    required: [true, "Main Name is required!"],
  },
  otherName: {
    type: String,
    required: function () {
      return this.agency === "individual";
    },
  },
  agency: {
    type: String,
    required: [true, "Agency is required!"],
    validate: {
      validator: function (v) {
        return v === "individual" || v === "company";
      },
      message: "Agency must be 'individual' or 'company'",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone Number is required!"],
    unique: true,
  },
  address: String,
  cacNo: {
    type: String,
    required: function () {
      return this.agency === "company";
    },
    unique: function () {
      return this.agency === "company";
    },
  },
  image: String,
  referral: {
    type: String,
    default: "admin1234",
    unique: true,
  },
  referredData: [{
    type: Schema.Types.ObjectId,
    ref: "Customer",
  }],
  referredLength: {
    type: Number,
    default: 0,
  },
  creationDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Agent = models.Agent || model("Agent", AgentSchema);

export default Agent;
