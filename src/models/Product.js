import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    //TODO: Add more fields as needed
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
