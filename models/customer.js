import { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema({
  referrer: {
    type: Schema.Types.ObjectId,
    ref: "Agent",
  },
  firstName: {
    type: String,
    required: [true, "First Name is required!"],
    match: [
      /^(?=.{2,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z]+(?<![_.])$/,
      "First Name invalid, it should contain 2-20 letters!",
    ],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required!"],
    match: [
      /^(?=.{2,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z]+(?<![_.])$/,
      "Last Name invalid, it should contain 2-20 letters!",
    ],
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone Number is required!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
  },
  referenceNumber: {
    type: String,
    required: [true, "Purchase Reference Number is required"],
    unique: true,
  },
  purchaseDate: {
    type: Date,
    required: [true, "Purchase Date is required."],
    default: Date.now,
  },
});

const Customer = models.Customer || model("Customer", CustomerSchema);

export default Customer;
