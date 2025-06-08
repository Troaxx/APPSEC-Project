// Display error/success messages from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');
const success = urlParams.get('success');
const messageDiv = document.getElementById('message');

if (error) {
    messageDiv.innerHTML = `<div class="error">${decodeURIComponent(error)}</div>`;
}

if (success) {
    messageDiv.innerHTML = `<div class="success">${decodeURIComponent(success)}</div>`;
}

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const messageDiv = document.getElementById('message');
    
    // Clear previous messages
    messageDiv.innerHTML = '';
    
    // Validate form data
    if (!username || !email || !password || !role) {
        messageDiv.innerHTML = '<div class="error">Please fill in all fields.</div>';
        return;
    }
    
    try {
        // Determine the correct registration endpoint based on role
        let registerEndpoint;
        switch(role) {
            case 'member':
                registerEndpoint = '/register-member';
                break;
            case 'treasurer':
                registerEndpoint = '/register-treasurer';
                break;
            case 'secretary':
                registerEndpoint = '/register-secretary';
                break;
            case 'president':
                registerEndpoint = '/register-president';
                break;
            default:
                messageDiv.innerHTML = '<div class="error">Please select a valid role.</div>';
                return;
        }
        
        // Make registration request using existing backend endpoints
        const response = await fetch(registerEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username: username,
                email: email,
                password: password 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registration successful
            messageDiv.innerHTML = `<div class="success">${data.message} You can now login.</div>`;
            
            // Clear the form
            document.getElementById('registerForm').reset();
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = '/login.html?success=' + encodeURIComponent('Registration successful! Please login.');
            }, 2000);
            
        } else {
            // Registration failed
            messageDiv.innerHTML = `<div class="error">${data.message}</div>`;
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        messageDiv.innerHTML = '<div class="error">Network error. Please try again.</div>';
    }
}); 