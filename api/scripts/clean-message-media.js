#!/usr/bin/env node

import mongoose from "mongoose";
import config from "../config/env.js";
import Message from "../models/message.model.js";

async function main() {
  console.log("\n🧹 Cleaning message attachments (mediaUrl) ...");
  await mongoose.connect(config.MONGODB_CONN);
  console.log("✅ Connected to MongoDB");

  const filter = { mediaUrl: { $exists: true, $ne: null, $ne: "" } };
  const total = await Message.countDocuments(filter);
  console.log(`📊 Messages with mediaUrl: ${total}`);

  if (total === 0) {
    console.log("Nothing to clean.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const res = await Message.updateMany(filter, {
    $set: { mediaUrl: null, type: "text" },
  });

  console.log(`🗑️  Cleared mediaUrl on ${res.modifiedCount} messages.`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
}

main().catch(async (e) => {
  console.error("❌ Failed:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
