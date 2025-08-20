import axios from "axios";

const testFixVideoIds = async () => {
  try {
    console.log("Testing fix video IDs endpoint...");

    // You'll need to get a valid admin token first
    // For now, we'll just test the endpoint structure
    const response = await axios.post(
      "http://localhost:5000/api/admin/fix-video-ids",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
        },
      }
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};

testFixVideoIds();
