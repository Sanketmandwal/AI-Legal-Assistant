// src/models/User.js
import mongoose from "mongoose";
import { randomBytes, createHmac } from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      sparse: true, // allow multiple nulls
    },

    // We will store hashed password + salt
    password: {
      type: String,
      required: true,
      select: false, // don't return by default
    },
    salt: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["citizen", "lawyer", "police", "admin"],
      default: "citizen",
      required: true,
    },

    // Verification flags
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    aadharVerified: { type: Boolean, default: false },
    roleVerified: { type: Boolean, default: false }, // for lawyer/police

    // Aadhaar storage
    aadharLast4: { type: String }, // last 4 digits
    aadharHash: { type: String },  // hashed/encrypted Aadhaar

    // Status
    isActive: { type: Boolean, default: true },

    // Meta
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1 });

// Hash password before save if modified
userSchema.pre("save", function () {
  const user = this;

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  user.salt = salt;
  user.password = hashedPassword;
});

// Instance method: check password
userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.salt || !this.password) return false;

  const hashedCandidate = createHmac("sha256", this.salt)
    .update(candidatePassword)
    .digest("hex");

  return this.password === hashedCandidate;
};

// Static method: login by email + password
userSchema.statics.loginWithEmail = async function (email, password) {
  const user = await this.findOne({ email }).select("+password +salt");
  if (!user) throw new Error("User not found");

  const isMatch = user.comparePassword(password);
  if (!isMatch) throw new Error("Incorrect password");


  user.password = undefined;
  user.salt = undefined;

  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
