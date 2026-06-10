import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // 1. Return the cached connection if it exists.
  if(cached.conn) {
    return cached.conn;
  }
  // 2. Otherwise, create a new connection promise using mongoose.connect() and store it in `cached.promise`.
  if(!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });


  }
  // 3. Await the promise and store the connection in `cached.conn`.
    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  // 4. Return the connection.

  return cached.conn;
}
