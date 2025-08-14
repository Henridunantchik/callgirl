const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";

async function checkUsers() {
  try {
    console.log("🔍 Checking existing users...\n");

    // Test the debug endpoint to see all escorts
    const response = await axios.get(`${API_BASE_URL}/escort/debug/all`);

    console.log("✅ Users found:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

checkUsers();
