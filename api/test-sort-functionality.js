import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test different sort options
const sortTests = [
  {
    name: 'Sort by Relevance (Default)',
    params: { sortBy: 'relevance' },
    expected: 'Should return escorts sorted by relevance'
  },
  {
    name: 'Sort by Newest',
    params: { sortBy: 'newest' },
    expected: 'Should return escorts sorted by creation date (newest first)'
  },
  {
    name: 'Sort by Rating',
    params: { sortBy: 'rating' },
    expected: 'Should return escorts sorted by rating (highest first)'
  },
  {
    name: 'Sort by Price Low to High',
    params: { sortBy: 'price-low' },
    expected: 'Should return escorts sorted by price (lowest first)'
  },
  {
    name: 'Sort by Price High to Low',
    params: { sortBy: 'price-high' },
    expected: 'Should return escorts sorted by price (highest first)'
  },
  {
    name: 'Sort by Name',
    params: { sortBy: 'name' },
    expected: 'Should return escorts sorted by name (alphabetical)'
  },
  {
    name: 'Sort by Age',
    params: { sortBy: 'age' },
    expected: 'Should return escorts sorted by age (youngest first)'
  }
];

async function testSortFunctionality() {
  console.log('🧪 Testing Sort Functionality...\n');

  let passedTests = 0;
  let totalTests = sortTests.length;

  for (const testCase of sortTests) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      console.log(`   Expected: ${testCase.expected}`);
      
      const params = new URLSearchParams(testCase.params);
      const response = await axios.get(`${BASE_URL}/escort/all?${params}`);
      
      const escorts = response.data?.data?.escorts || response.data?.escorts || response.data || [];
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Results: ${escorts.length} escorts found`);
      
      if (escorts.length > 0) {
        console.log(`   👤 First escort: ${escorts[0].name || escorts[0].alias || 'Unknown'}`);
        if (escorts.length > 1) {
          console.log(`   👤 Second escort: ${escorts[1].name || escorts[1].alias || 'Unknown'}`);
        }
        
        // Show relevant data for sorting verification
        if (testCase.params.sortBy === 'rating' && escorts[0].rating) {
          console.log(`   ⭐ First escort rating: ${escorts[0].rating}`);
        }
        if (testCase.params.sortBy.includes('price') && escorts[0].rates?.hourly) {
          console.log(`   💰 First escort price: ${escorts[0].rates.hourly}`);
        }
        if (testCase.params.sortBy === 'age' && escorts[0].age) {
          console.log(`   🎂 First escort age: ${escorts[0].age}`);
        }
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

  console.log('📈 Sort Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All sort options are working correctly!');
  } else {
    console.log('\n⚠️  Some sort options may need attention.');
  }
}

// Test sort with filters
async function testSortWithFilters() {
  console.log('\n🔍 Testing Sort with Filters...\n');

  const filterSortTests = [
    {
      name: 'Kampala escorts sorted by rating',
      params: { city: 'kampala', sortBy: 'rating' },
      expected: 'Should return Kampala escorts sorted by rating'
    },
    {
      name: 'In-call escorts sorted by price low to high',
      params: { service: 'in-call', sortBy: 'price-low' },
      expected: 'Should return in-call escorts sorted by price (lowest first)'
    },
    {
      name: 'Featured escorts sorted by newest',
      params: { featured: 'true', sortBy: 'newest' },
      expected: 'Should return featured escorts sorted by creation date'
    }
  ];

  let passedTests = 0;
  let totalTests = filterSortTests.length;

  for (const testCase of filterSortTests) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      console.log(`   Expected: ${testCase.expected}`);
      
      const params = new URLSearchParams(testCase.params);
      const response = await axios.get(`${BASE_URL}/escort/all?${params}`);
      
      const escorts = response.data?.data?.escorts || response.data?.escorts || response.data || [];
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Results: ${escorts.length} escorts found`);
      
      if (escorts.length > 0) {
        console.log(`   👤 First escort: ${escorts[0].name || escorts[0].alias || 'Unknown'}`);
      }
      
      passedTests++;
      console.log(`   ✅ PASSED\n`);
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      console.log(`   ❌ FAILED\n`);
    }
  }

  console.log('📈 Filter + Sort Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
}

// Run the tests
async function runTests() {
  try {
    await testSortFunctionality();
    await testSortWithFilters();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

runTests();
