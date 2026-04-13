import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    requried: false,
  },
  about: {
    type: String,
    required: false,
  },
});

userSchema.pre(
  "save",
  async function (next) {
    if (!this.isModified("password")) {
      return next();
    }
    //TODO: Add salt and hash
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
