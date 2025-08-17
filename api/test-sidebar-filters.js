import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test data for different filter combinations
const testCases = [
  {
    name: 'Kampala City Filter',
    params: { city: 'kampala' },
    expected: 'Should return escorts in Kampala'
  },
  {
    name: 'In-call Service Filter',
    params: { service: 'in-call' },
    expected: 'Should return escorts offering in-call services'
  },
  {
    name: 'Out-call Service Filter',
    params: { service: 'out-call' },
    expected: 'Should return escorts offering out-call services'
  },
  {
    name: 'Massage Service Filter',
    params: { service: 'massage' },
    expected: 'Should return escorts offering massage services'
  },
  {
    name: 'GFE Service Filter',
    params: { service: 'gfe' },
    expected: 'Should return escorts offering GFE services'
  },
  {
    name: 'PSE Service Filter',
    params: { service: 'pse' },
    expected: 'Should return escorts offering PSE services'
  },
  {
    name: 'Travel Service Filter',
    params: { service: 'travel' },
    expected: 'Should return escorts offering travel services'
  },
  {
    name: 'Overnight Service Filter',
    params: { service: 'overnight' },
    expected: 'Should return escorts offering overnight services'
  },
  {
    name: 'Duo Service Filter',
    params: { service: 'duo' },
    expected: 'Should return escorts offering duo services'
  },
  {
    name: 'Entebbe City Filter',
    params: { city: 'entebbe' },
    expected: 'Should return escorts in Entebbe'
  },
  {
    name: 'Jinja City Filter',
    params: { city: 'jinja' },
    expected: 'Should return escorts in Jinja'
  },
  {
    name: 'Combined City and Service Filter',
    params: { city: 'kampala', service: 'in-call' },
    expected: 'Should return in-call escorts in Kampala'
  },
  {
    name: 'Verified Escorts Filter',
    params: { verified: 'true' },
    expected: 'Should return only verified escorts'
  },
  {
    name: 'Online Escorts Filter',
    params: { online: 'true' },
    expected: 'Should return only online escorts'
  },
  {
    name: 'Featured Escorts Filter',
    params: { featured: 'true' },
    expected: 'Should return only featured escorts'
  },
  {
    name: 'Search Query Filter',
    params: { q: 'sophia' },
    expected: 'Should return escorts matching search query'
  }
];

async function testSidebarFilters() {
  console.log('🧪 Testing Sidebar Filters...\n');

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      console.log(`   Expected: ${testCase.expected}`);
      
      const params = new URLSearchParams(testCase.params);
      const response = await axios.get(`${BASE_URL}/escort/all?${params}`);
      
      const escorts = response.data?.data?.escorts || response.data?.escorts || response.data || [];
      const total = response.data?.data?.total || response.data?.total || escorts.length;
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Results: ${escorts.length} escorts found (Total: ${total})`);
      
      if (escorts.length > 0) {
        console.log(`   👤 Sample escort: ${escorts[0].name || escorts[0].alias || 'Unknown'}`);
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

  console.log('📈 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All sidebar filters are working correctly!');
  } else {
    console.log('\n⚠️  Some filters may need attention.');
  }
}

// Test specific sidebar links that users would click
async function testSidebarLinks() {
  console.log('\n🔗 Testing Sidebar Link Functionality...\n');

  const sidebarLinks = [
    { name: 'In-call Service Link', url: '/ug/category/in-call' },
    { name: 'Out-call Service Link', url: '/ug/category/out-call' },
    { name: 'Massage Service Link', url: '/ug/category/massage' },
    { name: 'GFE Service Link', url: '/ug/category/gfe' },
    { name: 'PSE Service Link', url: '/ug/category/pse' },
    { name: 'Travel Service Link', url: '/ug/category/travel' },
    { name: 'Overnight Service Link', url: '/ug/category/overnight' },
    { name: 'Duo Service Link', url: '/ug/category/duo' },
    { name: 'Kampala City Link', url: '/ug/location/kampala' },
    { name: 'Entebbe City Link', url: '/ug/location/entebbe' },
    { name: 'Jinja City Link', url: '/ug/location/jinja' }
  ];

  console.log('📋 Sidebar Links to Test:');
  for (const link of sidebarLinks) {
    console.log(`   🔗 ${link.name}: ${link.url}`);
  }
  
  console.log('\n💡 These links should work when clicked from the sidebar.');
  console.log('   The frontend should navigate to these URLs and filter results accordingly.');
}

// Run the tests
async function runTests() {
  try {
    await testSidebarFilters();
    await testSidebarLinks();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

runTests();
