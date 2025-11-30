import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let testResults = [];

// Test helper function
function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const result = { name, passed, message, status };
  testResults.push(result);
  console.log(`${status}: ${name}${message ? ' - ' + message : ''}`);
  return passed;
}

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    return logTest('Health Check', response.ok && data.status === 'ok', `Status: ${data.status}`);
  } catch (error) {
    return logTest('Health Check', false, error.message);
  }
}

// Test 2: Login
async function testLogin() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    if (!response.ok) {
      // Try accountant account
      const response2 = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'accountant@example.com',
          password: 'password123'
        })
      });
      
      if (response2.ok) {
        const data = await response2.json();
        authToken = data.token;
        return logTest('Login', true, 'Logged in as accountant');
      }
      return logTest('Login', false, 'Both admin and accountant login failed');
    }
    
    const data = await response.json();
    authToken = data.token;
    return logTest('Login', true, `Logged in as ${data.user.role}`);
  } catch (error) {
    return logTest('Login', false, error.message);
  }
}

// Test 3: Get Vouchers
async function testGetVouchers() {
  try {
    const response = await fetch(`${BASE_URL}/api/vouchers`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    return logTest('Get Vouchers', response.ok && Array.isArray(data), `Found ${data.length} vouchers`);
  } catch (error) {
    return logTest('Get Vouchers', false, error.message);
  }
}

// Test 4: Get Next Voucher Number (Accountant only)
async function testGetNextVoucherNumber() {
  try {
    // Try to login as accountant for this test
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'accountant@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      return logTest('Get Next Voucher Number', false, 'Cannot login as accountant');
    }
    
    const loginData = await loginResponse.json();
    const accountantToken = loginData.token;
    
    const response = await fetch(`${BASE_URL}/api/vouchers/next-number`, {
      headers: { 'Authorization': `Bearer ${accountantToken}` }
    });
    
    if (response.status === 403) {
      return logTest('Get Next Voucher Number', false, 'Access denied (accountant only endpoint)');
    }
    
    const data = await response.json();
    return logTest('Get Next Voucher Number', response.ok && data.voucher_number, `Next number: ${data.voucher_number}`);
  } catch (error) {
    return logTest('Get Next Voucher Number', false, error.message);
  }
}

// Test 5: Create Test Voucher (Accountant only)
async function testCreateVoucher() {
  try {
    // Login as accountant
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'accountant@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      return logTest('Create Voucher', false, 'Cannot login as accountant');
    }
    
    const loginData = await loginResponse.json();
    const accountantToken = loginData.token;
    
    const testVoucherData = {
      date: new Date().toISOString().split('T')[0],
      in_favour_of: 'Test Payee',
      items: [
        {
          route: 'Test Route',
          no_of_trips: '2',
          trip_rate: '50000',
          total: '100000'
        }
      ],
      subtotal: '100000',
      prev_balance: '0',
      advance_paid: '100000',
      total_cost_shortage: '0',
      total_cost_repacking: '0',
      total_due: '100000',
      pay_mode: 'bank',
      bank_details: {
        type: 'CHQ/TRF',
        account_name: 'Test Account',
        account_number: '1234567890'
      },
      date_of_payment: new Date().toISOString().split('T')[0],
      prepared_by: 'Test Accountant',
      approved_by: ''
    };

    const nextNumResponse = await fetch(`${BASE_URL}/api/vouchers/next-number`, {
      headers: { 'Authorization': `Bearer ${accountantToken}` }
    });
    const nextNumData = await nextNumResponse.json();
    const voucherNumber = nextNumData.voucher_number || '999999';

    const response = await fetch(`${BASE_URL}/api/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accountantToken}`
      },
      body: JSON.stringify({
        voucher_number: `TEST${voucherNumber}`,
        voucher_data: testVoucherData
      })
    });

    const data = await response.json();
    if (response.ok && data.id) {
      return logTest('Create Voucher', true, `Created voucher ${data.voucher_number} with ID ${data.id}`);
    } else {
      return logTest('Create Voucher', false, data.error || 'Unknown error');
    }
  } catch (error) {
    return logTest('Create Voucher', false, error.message);
  }
}

// Test 6: Generate PDF
async function testGeneratePDF() {
  try {
    // First get a voucher
    const vouchersResponse = await fetch(`${BASE_URL}/api/vouchers`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const vouchers = await vouchersResponse.json();
    
    if (vouchers.length === 0) {
      return logTest('Generate PDF', false, 'No vouchers found to test PDF generation');
    }

    const voucherId = vouchers[0].id;
    const response = await fetch(`${BASE_URL}/api/vouchers/${voucherId}/pdf`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const isPDF = response.headers.get('content-type') === 'application/pdf';
    return logTest('Generate PDF', response.ok && isPDF, `Generated PDF for voucher ${voucherId}`);
  } catch (error) {
    return logTest('Generate PDF', false, error.message);
  }
}

// Test 7: Get Users (Admin only)
async function testGetUsers() {
  try {
    const response = await fetch(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    // This might fail if not admin, which is expected
    if (response.status === 403) {
      return logTest('Get Users (Admin)', false, 'Access denied (expected for non-admin)');
    }
    
    const data = await response.json();
    return logTest('Get Users (Admin)', response.ok && Array.isArray(data), `Found ${data.length} users`);
  } catch (error) {
    return logTest('Get Users (Admin)', false, error.message);
  }
}

// Test 8: Database Connection
async function testDatabase() {
  try {
    // Import database module
    const dbModule = await import('../database/db.js');
    const db = dbModule.default;
    
    // Try a simple query
    const result = db.prepare('SELECT COUNT(*) as count FROM vouchers').get();
    return logTest('Database Connection', true, `Database connected. Found ${result.count} vouchers`);
  } catch (error) {
    return logTest('Database Connection', false, error.message);
  }
}

// Test 9: Email Configuration
async function testEmailConfig() {
  try {
    const response = await fetch(`${BASE_URL}/api/test-email/status`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.status === 403) {
      return logTest('Email Configuration Check', false, 'Access denied (admin only)');
    }
    
    const data = await response.json();
    return logTest('Email Configuration Check', true, `Email ${data.configured ? 'configured' : 'not configured'}`);
  } catch (error) {
    return logTest('Email Configuration Check', false, error.message);
  }
}

// Test 10: Report Generation (GM/Accountant/Uploader only)
async function testReportGeneration() {
  try {
    // Try with GM account
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'gm@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      return logTest('Report Generation', false, 'Cannot login as GM');
    }
    
    const loginData = await loginResponse.json();
    const gmToken = loginData.token;
    
    const response = await fetch(`${BASE_URL}/api/reports/download/all`, {
      headers: { 'Authorization': `Bearer ${gmToken}` }
    });
    
    if (response.status === 403) {
      return logTest('Report Generation', false, 'Access denied (role restriction)');
    }
    
    if (!response.ok) {
      return logTest('Report Generation', false, `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    const isExcel = contentType && contentType.includes('spreadsheetml');
    return logTest('Report Generation', response.ok && isExcel, `Excel report generated (${contentType})`);
  } catch (error) {
    return logTest('Report Generation', false, error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🧪 Starting System Tests...\n');
  console.log('='.repeat(60));
  
  await testHealthCheck();
  await testDatabase();
  await testLogin();
  
  if (!authToken) {
    console.log('\n⚠️  Cannot continue tests without authentication token\n');
    printSummary();
    return;
  }
  
  await testGetVouchers();
  await testGetNextVoucherNumber();
  await testCreateVoucher();
  await testGeneratePDF();
  await testGetUsers();
  await testEmailConfig();
  await testReportGeneration();
  
  console.log('\n' + '='.repeat(60));
  printSummary();
}

function printSummary() {
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  const total = testResults.length;
  
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  if (failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
    console.log('');
  }
  
  // Save results to file
  const resultsPath = path.join(__dirname, '../test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, successRate: ((passed / total) * 100).toFixed(1) + '%' },
    results: testResults
  }, null, 2));
  
  console.log(`📄 Detailed results saved to: ${resultsPath}\n`);
}

// Run tests
runAllTests().catch(console.error);

