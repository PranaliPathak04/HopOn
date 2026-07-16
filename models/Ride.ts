import mongoose, { Schema } from "mongoose";

const CoordsSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false },
);

const RideSchema = new Schema(
  {
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },

    pickupInfo: { type: CoordsSchema, required: true },
    destInfo: { type: CoordsSchema, required: true },
    encodedPolyline: { type: String, default: null },

    vehicle: { type: String, required: true },
    seats: { type: Number, required: true },
    seatsAvailable: { type: Number, required: true },

    date: { type: Date, required: true },
    time: { type: String, required: true },

    pricingModel: { type: String, enum: ["per_km"], default: "per_km" },
    price: { type: Number, required: true },

    status: {
      type: String,
      enum: ["active", "full", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Ride || mongoose.model("Ride", RideSchema);
