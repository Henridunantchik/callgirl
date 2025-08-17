import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Test escort filtering by country
async function testEscortFiltering() {
  const countries = ["ug", "ke", "tz", "rw", "bi", "cd"];

  for (const country of countries) {
    try {
      console.log(
        `\n🔍 Testing escort filtering for ${country.toUpperCase()}...`
      );

      // Test getAllEscorts with countryCode
      const response = await axios.get(`${API_BASE}/escort/all`, {
        params: {
          countryCode: country,
          limit: 5,
        },
      });

      console.log(
        `📊 ${country.toUpperCase()} response status:`,
        response.status
      );

      if (response.data && response.data.data) {
        const escorts = response.data.data.escorts || [];
        const total = response.data.data.total || 0;

        console.log(`📈 ${country.toUpperCase()} ESCORTS:`);
        console.log(`- Total escorts: ${total}`);
        console.log(`- Escorts returned: ${escorts.length}`);

        if (escorts.length > 0) {
          console.log(`👥 Sample escorts:`);
          escorts.slice(0, 3).forEach((escort, index) => {
            console.log(
              `  ${index + 1}. ${escort.name || escort.alias} - ${
                escort.location?.country || "No country"
              } - ${escort.location?.city || "No city"}`
            );
          });
        } else {
          console.log(`👥 No escorts found for ${country.toUpperCase()}`);
        }
      }
    } catch (error) {
      console.error(
        `❌ Error testing ${country.toUpperCase()}:`,
        error.response?.data || error.message
      );
    }
  }
}

testEscortFiltering();
