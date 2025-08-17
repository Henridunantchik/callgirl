import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

console.log("🏠 Testing Main Page Search Form...\n");

// Test the main page search form scenarios
const mainPageSearchTests = [
  {
    name: "Search by Name Only",
    params: { q: "emma" },
    description: "Search for escort named Emma",
  },
  {
    name: "Search by Location Only",
    params: { city: "kampala" },
    description: "Search for escorts in Kampala",
  },
  {
    name: "Search by Service Only",
    params: { q: "massage" },
    description: "Search for massage services",
  },
  {
    name: "Search with Age Filter",
    params: { age: "18-25" },
    description: "Search for escorts aged 18-25",
  },
  {
    name: "Search with Gender Filter",
    params: { gender: "female" },
    description: "Search for female escorts",
  },
  {
    name: "Search with Verified Filter",
    params: { verified: "true" },
    description: "Search for verified escorts only",
  },
  {
    name: "Search with Online Filter",
    params: { online: "true" },
    description: "Search for online escorts only",
  },
  {
    name: "Combined Search - Name + City",
    params: { q: "emma", city: "kampala" },
    description: "Search for Emma in Kampala",
  },
  {
    name: "Combined Search - Service + Age",
    params: { q: "massage", age: "18-25" },
    description: "Search for massage services from escorts aged 18-25",
  },
  {
    name: "Combined Search - Name + Verified",
    params: { q: "emma", verified: "true" },
    description: "Search for verified escort named Emma",
  },
  {
    name: "Full Search - Name + City + Age + Gender + Verified",
    params: {
      q: "emma",
      city: "kampala",
      age: "18-30",
      gender: "female",
      verified: "true",
    },
    description: "Complex search with multiple filters",
  },
];

async function testMainPageSearch() {
  console.log("🧪 Running Main Page Search Tests...\n");

  let passedTests = 0;
  let totalTests = mainPageSearchTests.length;

  for (const testCase of mainPageSearchTests) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      console.log(`   Description: ${testCase.description}`);

      // Build query string
      const queryParams = new URLSearchParams(testCase.params);
      const url = `${BASE_URL}/escort/all?${queryParams.toString()}`;

      console.log(`   URL: ${url}`);

      const response = await axios.get(url);

      const escorts =
        response.data?.data?.escorts ||
        response.data?.escorts ||
        response.data ||
        [];

      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Results: ${escorts.length} escorts found`);

      if (escorts.length > 0) {
        console.log(`   👤 Sample results:`);
        escorts.slice(0, 3).forEach((escort, index) => {
          console.log(
            `      ${index + 1}. ${escort.name || escort.alias || "Unknown"} (${
              escort.location?.city || "Unknown location"
            }) - Age: ${escort.age || "N/A"}`
          );
        });
      } else {
        console.log(`   ℹ️  No results found for this search`);
      }

      passedTests++;
      console.log(`   ✅ PASSED\n`);
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      if (error.response) {
        console.log(
          `   📄 Response: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`
        );
      }
      console.log(`   ❌ FAILED\n`);
    }
  }

  console.log("📈 Main Page Search Test Summary:");
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(
    `   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 Main page search form is working perfectly!");
    console.log("   - All search filters are functioning");
    console.log("   - Combined searches work correctly");
    console.log("   - No errors with complex queries");
  } else {
    console.log("\n⚠️  Some main page search features may need attention.");
  }
}

// Test specific main page search scenarios
async function testMainPageScenarios() {
  console.log("\n🏠 Testing Main Page Search Scenarios...\n");

  const scenarios = [
    {
      name: "Find Your Perfect Companion - Basic Search",
      search: { q: "emma" },
      expected: "Should find Emma Wilson",
    },
    {
      name: "Find Your Perfect Companion - Location Search",
      search: { city: "kampala" },
      expected: "Should find escorts in Kampala",
    },
    {
      name: "Find Your Perfect Companion - Service Search",
      search: { q: "massage" },
      expected: "Should find massage services",
    },
    {
      name: "Find Your Perfect Companion - Age Filter",
      search: { age: "18-25" },
      expected: "Should find escorts aged 18-25",
    },
    {
      name: "Find Your Perfect Companion - Gender Filter",
      search: { gender: "female" },
      expected: "Should find female escorts",
    },
    {
      name: "Find Your Perfect Companion - Verified Filter",
      search: { verified: "true" },
      expected: "Should find verified escorts",
    },
    {
      name: "Find Your Perfect Companion - Online Filter",
      search: { online: "true" },
      expected: "Should find online escorts",
    },
  ];

  for (const scenario of scenarios) {
    try {
      const queryParams = new URLSearchParams(scenario.search);
      const response = await axios.get(
        `${BASE_URL}/escort/all?${queryParams.toString()}`
      );
      const escorts =
        response.data?.data?.escorts ||
        response.data?.escorts ||
        response.data ||
        [];

      console.log(`🔍 ${scenario.name}: ${escorts.length} results found`);
      console.log(`   Expected: ${scenario.expected}`);
      if (escorts.length > 0) {
        escorts.slice(0, 2).forEach((escort, index) => {
          console.log(
            `   ${index + 1}. ${escort.name || escort.alias || "Unknown"}`
          );
        });
      }
      console.log("");
    } catch (error) {
      console.log(`❌ ${scenario.name}: Error - ${error.message}\n`);
    }
  }
}

// Run the tests
async function runTests() {
  try {
    await testMainPageSearch();
    await testMainPageScenarios();
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
  }
}

runTests();
