#!/usr/bin/env node

/**
 * 🧪 TEST CONSOLIDATED API
 * Script para probar que todos los endpoints consolidados funcionan
 */

const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

async function testEndpoint(url, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📄 Data count: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`);
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   💥 Error: ${data.error || 'Unknown error'}`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 TESTING CONSOLIDATED API ENDPOINTS');
  console.log(`   Base URL: ${BASE_URL}`);
  
  const tests = [
    [`${BASE_URL}/api/consolidated?type=health`, 'Health Check'],
    [`${BASE_URL}/api/consolidated?type=barberos`, 'Get All Barberos'],
    [`${BASE_URL}/api/consolidated?type=servicios`, 'Get All Servicios'],
    [`${BASE_URL}/api/consolidated?type=usuarios`, 'Get All Usuarios'],
    [`${BASE_URL}/api/consolidated?type=reservas`, 'Get All Reservas'],
    [`${BASE_URL}/api/consolidated?type=bloqueos`, 'Get All Bloqueos'],
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const [url, description] of tests) {
    const passed = await testEndpoint(url, description);
    if (passed) passedTests++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESULTS: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! API is working correctly.');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED. Check the errors above.');
    process.exit(1);
  }
}

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEndpoint, runTests };
