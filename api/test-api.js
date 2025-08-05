import http from 'http';
import https from 'https';

const BASE_URL = 'http://localhost:5000';

// Professional test runner
class APITester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = `${BASE_URL}${path}`;
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({
              status: res.statusCode,
              data: parsed,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: responseData,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testEndpoint(name, path, method = 'GET', data = null) {
    try {
      console.log(`🔍 Testing: ${name}`);
      const result = await this.makeRequest(path, method, data);
      
      const success = result.status >= 200 && result.status < 300;
      const status = success ? '✅ PASS' : '❌ FAIL';
      
      console.log(`   ${status} - ${result.status} ${name}`);
      
      if (success) {
        console.log(`   📄 Response:`, JSON.stringify(result.data, null, 2));
      }
      
      this.results.push({
        name,
        path,
        success,
        status: result.status,
        data: result.data
      });
      
      return success;
    } catch (error) {
      console.log(`   ❌ ERROR - ${name}: ${error.message}`);
      this.results.push({
        name,
        path,
        success: false,
        error: error.message
      });
      return false;
    }
  }

  async runTests() {
    console.log('🚀 Starting API Tests...\n');
    
    // Test 1: Health Check
    await this.testEndpoint('Health Check', '/health');
    
    // Test 2: Subscription Pricing
    await this.testEndpoint('Subscription Pricing (UG)', '/api/subscription/pricing?country=uganda');
    await this.testEndpoint('Subscription Pricing (KE)', '/api/subscription/pricing?country=kenya');
    
    // Test 3: Auth Routes
    await this.testEndpoint('Auth Routes', '/api/auth');
    
    // Test 4: User Routes
    await this.testEndpoint('User Routes', '/api/user');
    
    // Test 5: Category Routes
    await this.testEndpoint('Category Routes', '/api/category/all-category');
    
    this.printSummary();
  }

  printSummary() {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log(`📈 Success Rate: ${((passed/total)*100).toFixed(1)}%`);
    
    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! API is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the details above.');
    }
  }
}

// Run tests
const tester = new APITester();
tester.runTests().catch(console.error); 