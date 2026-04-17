import mongoose from "mongoose";
const tradeSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    mettingPlace: {
      type: String
    },
    meetingTime: {
      type: Date
    }
  },
  { timestamps: true },
);

const Trade = mongoose.model("Trade", tradeSchema);

export default Trade;
