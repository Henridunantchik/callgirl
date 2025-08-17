import mongoose from "mongoose";
import User from "./models/user.model.js";

// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/callgirls");

console.log("🔍 Checking and updating escort countries...");

// Get all escorts
const escorts = await User.find({ role: "escort" });
console.log(`📊 Found ${escorts.length} escorts`);

// Check current country assignments
const countryStats = {};
escorts.forEach(escort => {
  const country = escort.location?.country || 'No country';
  countryStats[country] = (countryStats[country] || 0) + 1;
});

console.log("📈 Current country distribution:");
Object.entries(countryStats).forEach(([country, count]) => {
  console.log(`- ${country}: ${count} escorts`);
});

// Update escorts without country to Uganda (default)
const escortsWithoutCountry = await User.find({ 
  role: "escort", 
  $or: [
    { "location.country": { $exists: false } },
    { "location.country": null },
    { "location.country": "" }
  ]
});

console.log(`\n🔄 Found ${escortsWithoutCountry.length} escorts without country`);

if (escortsWithoutCountry.length > 0) {
  console.log("📝 Updating escorts without country to Uganda...");
  
  const updateResult = await User.updateMany(
    { 
      role: "escort", 
      $or: [
        { "location.country": { $exists: false } },
        { "location.country": null },
        { "location.country": "" }
      ]
    },
    { 
      $set: { 
        "location.country": "Uganda" 
      } 
    }
  );
  
  console.log(`✅ Updated ${updateResult.modifiedCount} escorts`);
}

// Show final distribution
console.log("\n📈 Final country distribution:");
const finalEscorts = await User.find({ role: "escort" });
const finalCountryStats = {};
finalEscorts.forEach(escort => {
  const country = escort.location?.country || 'No country';
  finalCountryStats[country] = (finalCountryStats[country] || 0) + 1;
});

Object.entries(finalCountryStats).forEach(([country, count]) => {
  console.log(`- ${country}: ${count} escorts`);
});

process.exit(0);
