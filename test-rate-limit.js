const axios = require('axios');

async function testRateLimit() {
    console.log('Testing rate limiting...');
    
    const testData = {
        email: 'test@example.com',
        password: 'wrongpassword',
        recaptchaToken: 'no-recaptcha-token'
    };
    
    for (let i = 1; i <= 7; i++) {
        try {
            console.log(`\nAttempt ${i}:`);
            const response = await axios.post('http://localhost:3001/login', testData);
            console.log('Response:', response.data);
        } catch (error) {
            console.log('Error:', error.response?.data || error.message);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\nRate limit test completed!');
}

// Run the test
testRateLimit().catch(console.error); 