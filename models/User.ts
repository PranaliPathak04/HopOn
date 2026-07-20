import mongoose, { Schema } from "mongoose";

const AddressSchema = new Schema(
  {
    label: { type: String, required: true }, // "Home", "Office", "College" etc.
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    displayName: { type: String, required: true }, // human-readable address string
  },
  { _id: true },
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // Profile photo — Cloudinary URL (added later)
    photoUrl: { type: String, default: null },

    // Driver fields
    licenseNumber: { type: String, default: null },
    licensePhotoUrl: { type: String, default: null }, // Cloudinary URL (added later)

    // Saved addresses — max 5
    addresses: {
      type: [AddressSchema],
      default: [],
      validate: {
        validator: (v: any[]) => v.length <= 5,
        message: "Maximum 5 saved addresses allowed",
      },
    },

    // Admin-controlled verification
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
