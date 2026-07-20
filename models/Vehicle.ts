import mongoose, { Schema } from "mongoose";

const VehicleSchema = new Schema(
  {
    driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // From cars.json dataset
    make: { type: String, required: true }, // e.g. "Honda"
    model: { type: String, required: true }, // e.g. "City"
    type: { type: String, required: true }, // e.g. "sedan"

    // Driver fills these in
    color: { type: String, required: true },
    licensePlate: { type: String, required: true, uppercase: true, trim: true },
    seats: { type: Number, required: true }, // excluding driver, auto-filled from cars.json

    isDefault: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true }, // soft delete
  },
  { timestamps: true },
);

// One driver can't have two active vehicles with the same plate
VehicleSchema.index(
  { driverId: 1, licensePlate: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

export default mongoose.models.Vehicle ||
  mongoose.model("Vehicle", VehicleSchema);
