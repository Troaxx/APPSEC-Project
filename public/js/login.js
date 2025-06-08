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

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store authentication data using authManager
            if (window.authManager) {
                authManager.setUserData(data.user, data.token);
            } else {
                // Fallback if authManager not loaded
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
            }
            
            // Redirect based on role
            switch(data.user.role) {
                case 'president':
                    window.location.href = '/president.html';
                    break;
                case 'secretary':
                    window.location.href = '/secretary.html';
                    break;
                case 'treasurer':
                    window.location.href = '/treasurer.html';
                    break;
                case 'member':
                    window.location.href = '/member.html';
                    break;
                default:
                    window.location.href = '/home.html';
            }
        } else {
            messageDiv.innerHTML = `<div class="error">${data.message}</div>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="error">Network error. Please try again.</div>`;
    }
});