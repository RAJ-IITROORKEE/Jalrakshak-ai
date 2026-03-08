/**
 * MongoDB connection singleton — reuses the connection across hot-reloads in dev
 * and across serverless invocations in production via globalThis caching.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL as string;

if (!MONGODB_URI) {
  throw new Error("Please define DATABASE_URL in .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongo = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

if (!globalWithMongo._mongooseCache) {
  globalWithMongo._mongooseCache = { conn: null, promise: null };
}

const cache = globalWithMongo._mongooseCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
