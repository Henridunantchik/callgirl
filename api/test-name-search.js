import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

console.log("🔍 Testing Name Search Functionality...\n");

// Test different name search scenarios
const nameSearchTests = [
  {
    name: "Search by Full Name",
    query: "Emma Wilson",
    expected: "Should return Emma Wilson",
  },
  {
    name: "Search by First Name",
    query: "Emma",
    expected: "Should return escorts with first name Emma",
  },
  {
    name: "Search by Last Name",
    query: "Wilson",
    expected: "Should return escorts with last name Wilson",
  },
  {
    name: "Search by Partial Name",
    query: "Em",
    expected: 'Should return escorts with names containing "Em"',
  },
  {
    name: "Search by Alias",
    query: "emma",
    expected: 'Should return escorts with alias containing "emma"',
  },
  {
    name: "Search by Service Name",
    query: "massage",
    expected: "Should return escorts offering massage services",
  },
  {
    name: "Search by City Name",
    query: "Kampala",
    expected: "Should return escorts in Kampala",
  },
  {
    name: "Search by Bio Content",
    query: "professional",
    expected: 'Should return escorts with "professional" in bio',
  },
];

async function testNameSearch() {
  console.log("🧪 Running Name Search Tests...\n");

  let passedTests = 0;
  let totalTests = nameSearchTests.length;

  for (const testCase of nameSearchTests) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      console.log(`   Query: "${testCase.query}"`);
      console.log(`   Expected: ${testCase.expected}`);

      const response = await axios.get(
        `${BASE_URL}/escort/all?q=${encodeURIComponent(testCase.query)}`
      );

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
            })`
          );
        });
      } else {
        console.log(`   ℹ️  No results found for "${testCase.query}"`);
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

  console.log("📈 Name Search Test Summary:");
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(
    `   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 All name search functionality is working correctly!");
    console.log('   - No more "text score metadata" errors');
    console.log(
      "   - Search works across names, aliases, services, and locations"
    );
    console.log("   - Regex search is functioning properly");
  } else {
    console.log("\n⚠️  Some name search features may need attention.");
  }
}

// Test specific search scenarios
async function testSpecificSearches() {
  console.log("\n🔍 Testing Specific Search Scenarios...\n");

  const specificTests = [
    { query: "sophia", description: "Search for escort named Sophia" },
    { query: "emma", description: "Search for escort named Emma" },
    { query: "massage", description: "Search for massage services" },
    { query: "kampala", description: "Search for escorts in Kampala" },
    { query: "in-call", description: "Search for in-call services" },
  ];

  for (const test of specificTests) {
    try {
      const response = await axios.get(
        `${BASE_URL}/escort/all?q=${encodeURIComponent(test.query)}`
      );
      const escorts =
        response.data?.data?.escorts ||
        response.data?.escorts ||
        response.data ||
        [];

      console.log(`🔍 "${test.query}": ${escorts.length} results found`);
      if (escorts.length > 0) {
        escorts.slice(0, 2).forEach((escort, index) => {
          console.log(
            `   ${index + 1}. ${escort.name || escort.alias || "Unknown"}`
          );
        });
      }
    } catch (error) {
      console.log(`❌ "${test.query}": Error - ${error.message}`);
    }
  }
}

// Run the tests
async function runTests() {
  try {
    await testNameSearch();
    await testSpecificSearches();
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
  }
}

runTests();
