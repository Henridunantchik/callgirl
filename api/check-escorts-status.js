import mongoose from "mongoose";
import User from "./models/user.model.js";

// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/callgirls");

console.log("🔍 Checking escort status in database...");

// Get all escorts without any filters
const allEscorts = await User.find({ role: "escort" });
console.log(`📊 Total escorts in database: ${allEscorts.length}`);

if (allEscorts.length > 0) {
  console.log("\n📋 Escort details:");
  allEscorts.forEach((escort, index) => {
    console.log(`${index + 1}. ${escort.name || escort.alias || 'No name'}`);
    console.log(`   - ID: ${escort._id}`);
    console.log(`   - Country: ${escort.location?.country || 'NOT SET'}`);
    console.log(`   - City: ${escort.location?.city || 'NOT SET'}`);
    console.log(`   - Active: ${escort.isActive}`);
    console.log(`   - Verified: ${escort.isVerified}`);
    console.log(`   - Featured: ${escort.isFeatured}`);
    console.log(`   - Created: ${escort.createdAt}`);
    console.log("---");
  });
} else {
  console.log("❌ No escorts found in database");
}

// Check escorts by country
const countryStats = {};
allEscorts.forEach(escort => {
  const country = escort.location?.country || 'No country set';
  countryStats[country] = (countryStats[country] || 0) + 1;
});

console.log("\n📈 Country distribution:");
Object.entries(countryStats).forEach(([country, count]) => {
  console.log(`- ${country}: ${count} escorts`);
});

// Check active escorts
const activeEscorts = await User.find({ 
  role: "escort", 
  isActive: true,
  isDeleted: { $ne: true }
});
console.log(`\n✅ Active escorts: ${activeEscorts.length}`);

// Check escorts without country
const escortsWithoutCountry = await User.find({ 
  role: "escort",
  $or: [
    { "location.country": { $exists: false } },
    { "location.country": null },
    { "location.country": "" }
  ]
});
console.log(`❌ Escorts without country: ${escortsWithoutCountry.length}`);

process.exit(0);
