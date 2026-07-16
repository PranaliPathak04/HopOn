import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    rideId: { type: Schema.Types.ObjectId, ref: "Ride", required: true },
    riderId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    seatsBooked: { type: Number, required: true, min: 1 },

    pickupInfo: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    dropInfo: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },

    segmentDistanceKm: { type: Number, required: true },
    fare: { type: Number, required: true },

    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
