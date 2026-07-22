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
    vehicleNumber: { type: String, default: null },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", default: null },
    seats: { type: Number, required: true },
    seatsAvailable: { type: Number, required: true },

    date: { type: Date, required: true },
    time: { type: String, required: true },

    pricingModel: { type: String, enum: ["per_km"], default: "per_km" },
    price: { type: Number, required: true },
    distanceKm: { type: Number, required: true }, // total route distance
    pricePerKm: { type: Number, required: true }, // ₹ per km, drives fare calc

    status: {
      type: String,
      enum: ["active", "full", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Ride || mongoose.model("Ride", RideSchema);
