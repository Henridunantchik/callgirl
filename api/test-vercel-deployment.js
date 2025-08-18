// Test Vercel deployment
console.log("✅ Testing Vercel deployment...");

// Test that vercel.js can be imported
import("./vercel.js")
  .then(() => {
    console.log("✅ vercel.js loads successfully");
    console.log("✅ Ready for deployment!");
  })
  .catch((error) => {
    console.error("❌ Error loading vercel.js:", error);
  });
