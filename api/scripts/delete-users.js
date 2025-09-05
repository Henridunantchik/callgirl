#!/usr/bin/env node

import mongoose from "mongoose";
import config from "../config/env.js";
import User from "../models/user.model.js";

const argv = process.argv.slice(2);
const hasFlag = (name) => argv.includes(`--${name}`);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const includeAdmins = hasFlag("include-admins");
const reallyYes = hasFlag("yes");
const role = getArg("role", ""); // optional filter by role (client|escort|admin)

async function main() {
  console.log("\n⚠️  DANGER: This will delete users from the database.");
  console.log("   Connection:", config.MONGODB_CONN.substring(0, 24) + "...");
  if (!reallyYes) {
    console.log("\nAdd --yes to proceed.");
    process.exit(1);
  }

  await mongoose.connect(config.MONGODB_CONN);
  console.log("✅ Connected to MongoDB");

  const filter = {};
  if (!includeAdmins) {
    filter.role = { $ne: "admin" };
  }
  if (role) {
    filter.role = role;
  }

  // Safety: don't allow deleting everything if filter is empty and include-admins is passed accidentally
  if (includeAdmins && !role) {
    console.log(
      "❌ Refusing to delete all users including admins without --role filter."
    );
    console.log(
      "   Specify --role=client or --role=escort, or omit --include-admins."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const count = await User.countDocuments(filter);
  console.log(`🧮 Users matching filter: ${count}`);

  if (count === 0) {
    console.log("Nothing to delete.");
    await mongoose.disconnect();
    process.exit(0);
  }

  const res = await User.deleteMany(filter);
  console.log(`🗑️  Deleted ${res.deletedCount} users.`);

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
