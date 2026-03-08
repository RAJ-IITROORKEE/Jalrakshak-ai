/**
 * SensorReading model — one document per TTN uplink.
 * Stores real sensor values (temp, ph, tds) and random-uniform
 * values for turbidity + conductivity until hardware is wired.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReading extends Document {
  readingId: string;       // uuid — matches SensorReading.id on the frontend
  deviceId: string;
  deviceName: string;
  timestamp: Date;         // time from TTN received_at
  receivedAt: Date;        // time we stored it
  // Real sensor values
  temperature: number | null;
  ph: number | null;
  tds: number | null;
  // Random-uniform until hardware is fully wired
  turbidity: number | null;
  conductivity: number | null;
  // LoRa metadata
  rssi: number | null;
  snr: number | null;
  spreadingFactor: number | null;
}

const ReadingSchema = new Schema<IReading>(
  {
    readingId:       { type: String, required: true, unique: true, index: true },
    deviceId:        { type: String, required: true, index: true },
    deviceName:      { type: String, default: "" },
    timestamp:       { type: Date, required: true },
    receivedAt:      { type: Date, default: Date.now },
    temperature:     { type: Number, default: null },
    ph:              { type: Number, default: null },
    tds:             { type: Number, default: null },
    turbidity:       { type: Number, default: null },
    conductivity:    { type: Number, default: null },
    rssi:            { type: Number, default: null },
    snr:             { type: Number, default: null },
    spreadingFactor: { type: Number, default: null },
  },
  {
    timestamps: false,
    collection: "readings",
  }
);

// TTL index: auto-delete readings older than 30 days (optional, saves storage)
ReadingSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Reading: Model<IReading> =
  mongoose.models.Reading ?? mongoose.model<IReading>("Reading", ReadingSchema);
