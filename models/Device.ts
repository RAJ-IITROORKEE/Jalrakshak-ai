/**
 * Device model — one document per IoT device.
 * Updated on every incoming uplink.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDevice extends Document {
  deviceId: string;        // unique identifier from TTN (e.g. "hydro-monitor-01")
  deviceName: string;
  lastSeen: Date;
  lastPh: number | null;
  lastTds: number | null;
  lastTemperature: number | null;
  lastTurbidity: number | null;
  lastConductivity: number | null;
  rssi: number | null;
  snr: number | null;
  spreadingFactor: number | null;
  totalReadings: number;   // running count
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId:          { type: String, required: true, unique: true, index: true },
    deviceName:        { type: String, default: "" },
    lastSeen:          { type: Date, default: Date.now },
    lastPh:            { type: Number, default: null },
    lastTds:           { type: Number, default: null },
    lastTemperature:   { type: Number, default: null },
    lastTurbidity:     { type: Number, default: null },
    lastConductivity:  { type: Number, default: null },
    rssi:              { type: Number, default: null },
    snr:               { type: Number, default: null },
    spreadingFactor:   { type: Number, default: null },
    totalReadings:     { type: Number, default: 0 },
  },
  {
    timestamps: true, // createdAt + updatedAt
    collection: "devices",
  }
);

export const Device: Model<IDevice> =
  mongoose.models.Device ?? mongoose.model<IDevice>("Device", DeviceSchema);
