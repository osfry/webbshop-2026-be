import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    lightRequirements: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    coordinates: {
      lat: {type: Number, required: true},
      lng: {type: Number, required: true},
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
