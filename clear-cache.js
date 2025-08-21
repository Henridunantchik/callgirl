// Clear Cache Script - Run this in browser console to clear cached data
console.log("🧹 Clearing cached data with localhost URLs...");

// Clear localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);

  // Check if the value contains localhost URLs
  if (value && value.includes("localhost:5000")) {
    keysToRemove.push(key);
    console.log(`🗑️ Found localhost URL in localStorage key: ${key}`);
  }
}

// Remove keys with localhost URLs
keysToRemove.forEach((key) => {
  localStorage.removeItem(key);
  console.log(`✅ Removed: ${key}`);
});

// Clear sessionStorage
const sessionKeysToRemove = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  const value = sessionStorage.getItem(key);

  // Check if the value contains localhost URLs
  if (value && value.includes("localhost:5000")) {
    sessionKeysToRemove.push(key);
    console.log(`🗑️ Found localhost URL in sessionStorage key: ${key}`);
  }
}

// Remove keys with localhost URLs
sessionKeysToRemove.forEach((key) => {
  sessionStorage.removeItem(key);
  console.log(`✅ Removed: ${key}`);
});

console.log(
  `🎉 Cache clearing complete! Removed ${keysToRemove.length} localStorage items and ${sessionKeysToRemove.length} sessionStorage items.`
);
console.log("🔄 Please refresh the page to load fresh data with correct URLs.");
