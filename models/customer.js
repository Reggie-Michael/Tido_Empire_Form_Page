import { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required!"],
  },
  lastName: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone Number is required!"],
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
  },
  // address: {
  //   type: String,
  // },
  // nationality: {
  //   type: String,
  // },
  // stateOfOrigin: {
  //   type: String,
  // },
  // occupation: {
  //   type: String,
  // },
  shopLocation: {
    type: String,
  },
  referenceNumber: {
    type: String,
    required: [true, "Purchase Reference Number is required"],
  },
  referrer: {
    type: Schema.Types.ObjectId,
    ref: "Agent",
  },
  purchaseDate: {
    type: Date,
    required: [true, "Purchase Date is required."],
    default: Date.now,
  },
});

const Customer = models.Customer || model("Customer", CustomerSchema);

export default Customer;
