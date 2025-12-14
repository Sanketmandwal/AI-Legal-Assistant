import mongoose from "mongoose";
import { createHmac, randomBytes } from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    salt: { type: String },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 15,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "police", "lawyer", "admin"],
      default: "user",
    },
    policeInfo: {
      stationName: { type: String },
      stationAddress: { type: String },
      district: { type: String },
      badgeId: { type: String },
    },
    lawyerInfo: {
      barId: { type: String },
      specialization: { type: String },
      experience: { type: Number },
      city: { type: String },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);


userSchema.pre("save", function () {
  const user = this;

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");
  const hashedpassword = createHmac("sha256", salt).update(user.password).digest("hex");

  user.salt = salt;
  user.password = hashedpassword;
});


userSchema.statics.matchPassword = async function (email, password) {
  const user = await this.findOne({ email }).select("+password +salt");
  if (!user) throw new Error("user not found");

  const userSalt = user.salt;
  const hashedpassword = user.password;
  const userprovidedhashedpassword = createHmac("sha256", userSalt).update(password).digest("hex");

  if (hashedpassword !== userprovidedhashedpassword) throw new Error("Incorrect password");
  user.password = undefined;
  user.salt = undefined;
  return user;
};

const user = mongoose.model("user", userSchema);
export default user;
