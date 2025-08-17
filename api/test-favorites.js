import mongoose from "mongoose";
import Favorite from "./models/favorite.model.js";
import User from "./models/user.model.js";

// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/callgirls");

console.log("🔍 Checking favorites in database...");

// Get all favorites
const favorites = await Favorite.find({}).populate("client escort");
console.log("📊 Total favorites found:", favorites.length);

if (favorites.length > 0) {
  console.log("📋 Favorites details:");
  favorites.forEach((fav, index) => {
    console.log(`${index + 1}. Client: ${fav.client?.name || fav.client?.alias || fav.client?._id}`);
    console.log(`   Escort: ${fav.escort?.name || fav.escort?.alias || fav.escort?._id}`);
    console.log(`   Created: ${fav.createdAt}`);
    console.log("---");
  });
} else {
  console.log("❌ No favorites found in database");
}

// Get escort ID for Lola Lala
const escort = await User.findOne({ alias: "Lola Lala", role: "escort" });
if (escort) {
  console.log(`\n🎯 Checking favorites for escort: ${escort.alias} (ID: ${escort._id})`);
  
  const escortFavorites = await Favorite.countDocuments({ escort: escort._id });
  console.log(`💖 Favorites count for ${escort.alias}: ${escortFavorites}`);
  
  const escortFavoritesDetails = await Favorite.find({ escort: escort._id }).populate("client");
  console.log("👥 Clients who favorited this escort:");
  escortFavoritesDetails.forEach((fav, index) => {
    console.log(`${index + 1}. ${fav.client?.name || fav.client?.alias || fav.client?._id}`);
  });
} else {
  console.log("❌ Escort 'Lola Lala' not found");
}

// Get all users
const users = await User.find({});
console.log(`\n👤 Total users: ${users.length}`);
users.forEach(user => {
  console.log(`- ${user.name || user.alias} (${user.role}) - ID: ${user._id}`);
});

process.exit(0);
