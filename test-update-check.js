// Using built-in fetch (Node.js 18+)

async function testUpdateCheck() {
  try {
    console.log('Testing CodePush update check...');
    
    const response = await fetch('http://localhost:3000/api/v1/update_check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deploymentKey: 'production-key-123',
        appVersion: '1.0.0',
        packageHash: null,
        clientUniqueId: 'test-device-123',
        label: null,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Update check successful!');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.updateInfo) {
      console.log('📦 Update available:');
      console.log(`  - Label: ${data.updateInfo.label}`);
      console.log(`  - Version: ${data.updateInfo.appVersion}`);
      console.log(`  - Description: ${data.updateInfo.description}`);
      console.log(`  - Mandatory: ${data.updateInfo.isMandatory}`);
      console.log(`  - Size: ${data.updateInfo.size} bytes`);
      console.log(`  - Package Hash: ${data.updateInfo.packageHash}`);
    } else {
      console.log('✅ No updates available');
    }
    
  } catch (error) {
    console.error('❌ Update check failed:', error.message);
  }
}

testUpdateCheck(); 