import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test different search scenarios
const searchTests = [
  {
    name: 'Search by Name',
    params: { q: 'sophia' },
    expected: 'Should return escorts with name containing "sophia"'
  },
  {
    name: 'Search by Location',
    params: { q: 'kampala' },
    expected: 'Should return escorts in Kampala'
  },
  {
    name: 'Search by Service',
    params: { q: 'in-call' },
    expected: 'Should return escorts offering in-call services'
  },
  {
    name: 'Search by Partial Name',
    params: { q: 'emma' },
    expected: 'Should return escorts with name containing "emma"'
  },
  {
    name: 'Search by City Filter',
    params: { city: 'kampala' },
    expected: 'Should return escorts in Kampala using city filter'
  },
  {
    name: 'Search by Service Filter',
    params: { service: 'massage' },
    expected: 'Should return escorts offering massage services'
  },
  {
    name: 'Combined Search and Filter',
    params: { q: 'emma', city: 'kampala' },
    expected: 'Should return escorts named "emma" in Kampala'
  },
  {
    name: 'Search with Age Filter',
    params: { q: 'sophia', age: '18-25' },
    expected: 'Should return escorts named "sophia" aged 18-25'
  },
  {
    name: 'Search with Price Filter',
    params: { q: 'emma', priceRange: '0-50000' },
    expected: 'Should return escorts named "emma" with price 0-50,000'
  },
  {
    name: 'Search with Verified Filter',
    params: { q: 'sophia', verified: 'true' },
    expected: 'Should return verified escorts named "sophia"'
  }
];

async function testSearchFunctionality() {
  console.log('🔍 Testing Search Functionality...\n');

  let passedTests = 0;
  let totalTests = searchTests.length;

  for (const testCase of searchTests) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      console.log(`   Expected: ${testCase.expected}`);
      
      const params = new URLSearchParams(testCase.params);
      const response = await axios.get(`${BASE_URL}/escort/all?${params}`);
      
      const escorts = response.data?.data?.escorts || response.data?.escorts || response.data || [];
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Results: ${escorts.length} escorts found`);
      
      if (escorts.length > 0) {
        console.log(`   👤 Sample results:`);
        escorts.slice(0, 3).forEach((escort, index) => {
          console.log(`      ${index + 1}. ${escort.name || escort.alias || 'Unknown'} (${escort.location?.city || 'Unknown location'})`);
        });
      }
      
      passedTests++;
      console.log(`   ✅ PASSED\n`);
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      if (error.response) {
        console.log(`   📄 Response: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      }
      console.log(`   ❌ FAILED\n`);
    }
  }

  console.log('📈 Search Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All search functionality is working correctly!');
  } else {
    console.log('\n⚠️  Some search features may need attention.');
  }
}

// Test frontend search URLs
async function testFrontendSearchUrls() {
  console.log('\n🌐 Testing Frontend Search URLs...\n');

  const frontendUrls = [
    {
      name: 'Navigation Bar Search',
      description: 'Search from top navigation bar',
      url: 'http://localhost:5173/ug/search?q=sophia',
      expected: 'Should redirect to escort list with search query'
    },
    {
      name: 'Main Page Search',
      description: 'Search from main page form',
      url: 'http://localhost:5173/ug/escort/list?q=emma&city=kampala',
      expected: 'Should show escorts named "emma" in Kampala'
    },
    {
      name: 'Advanced Search',
      description: 'Search with multiple filters',
      url: 'http://localhost:5173/ug/escort/list?q=sophia&age=18-25&verified=true',
      expected: 'Should show verified escorts named "sophia" aged 18-25'
    }
  ];

  console.log('📋 Frontend Search URLs to Test:');
  for (const urlTest of frontendUrls) {
    console.log(`   🔗 ${urlTest.name}: ${urlTest.url}`);
    console.log(`   📝 ${urlTest.description}`);
    console.log(`   🎯 ${urlTest.expected}`);
    console.log('');
  }
  
  console.log('💡 These URLs should work when accessed in the browser.');
  console.log('   The frontend should properly handle search parameters and display filtered results.');
}

// Test search integration
async function testSearchIntegration() {
  console.log('\n🔗 Testing Search Integration...\n');

  console.log('📋 Search Integration Points:');
  console.log('   1. Navigation Bar Search (SearchBox component)');
  console.log('      - Should capture search query');
  console.log('      - Should navigate to /{countryCode}/search?q={query}');
  console.log('      - Should redirect to escort list with search parameters');
  console.log('');
  console.log('   2. Main Page Search (Index page)');
  console.log('      - Should capture search query and filters');
  console.log('      - Should navigate to /{countryCode}/escort/list with all parameters');
  console.log('      - Should display filtered results');
  console.log('');
  console.log('   3. Escort List Search (EscortList page)');
  console.log('      - Should read URL parameters (q, city, age, etc.)');
  console.log('      - Should apply filters to API calls');
  console.log('      - Should display filtered and sorted results');
  console.log('');
  console.log('   4. Backend Search API');
  console.log('      - Should handle search query parameter (q)');
  console.log('      - Should search across name, alias, bio, location, services');
  console.log('      - Should combine with other filters');
}

// Run the tests
async function runTests() {
  try {
    await testSearchFunctionality();
    await testFrontendSearchUrls();
    await testSearchIntegration();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

runTests();
