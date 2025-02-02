import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI!;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      //bufferCommands: true
      // Queues operations during the connection delay and executes them once connected.
      // bufferCommands: falsef
      // Throws an error immediately if a command is executed before the connection is ready.
      maxPoolSize: 10,
    };
    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then(() => mongoose.connection);
  }
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
