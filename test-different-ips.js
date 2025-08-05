const axios = require('axios');

async function testWithDifferentIPs() {
    console.log('Testing rate limiting with different IPs...');
    
    const testData = {
        email: 'test@example.com',
        password: 'wrongpassword',
        recaptchaToken: 'no-recaptcha-token'
    };
    
    // Simulate different IPs by changing headers
    const ips = [
        '192.168.1.100',
        '192.168.1.101', 
        '192.168.1.102',
        '10.0.0.1',
        '172.16.0.1'
    ];
    
    for (let i = 0; i < ips.length; i++) {
        const ip = ips[i];
        console.log(`\n--- Testing with IP: ${ip} ---`);
        
        try {
            const response = await axios.post('http://localhost:3001/login', testData, {
                headers: {
                    'X-Forwarded-For': ip,
                    'X-Real-IP': ip,
                    'User-Agent': `TestClient-${i}`
                }
            });
            console.log('Response:', response.data);
        } catch (error) {
            console.log('Error:', error.response?.data?.error || error.message);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\nDifferent IP test completed!');
}

// Run the test
testWithDifferentIPs().catch(console.error); 