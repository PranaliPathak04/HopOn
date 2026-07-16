import mongoose, { Schema } from "mongoose";

// Stores each driver's route as individual GeoJSON points so we can
// actually use MongoDB's $near / $geoWithin queries (the old backend
// defined this index but never used it — it looped over every point in JS
// instead). One document per point makes $near usable directly.
const DriverRoutePointSchema = new Schema({
  rideId: { type: Schema.Types.ObjectId, ref: "Ride", required: true },
  driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD', for cheap date filtering
  sequence: { type: Number, required: true }, // order along the route, 0-based
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
});

DriverRoutePointSchema.index({ location: "2dsphere" });
DriverRoutePointSchema.index({ date: 1 });

export default mongoose.models.DriverRoutePoint ||
  mongoose.model("DriverRoutePoint", DriverRoutePointSchema);
