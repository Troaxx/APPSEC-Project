// Simple frontend auth utility that leverages existing backend authMiddleware
class AuthManager {
    static getToken() {
        return localStorage.getItem('token');
    }
    
    static getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
    
    static setUserData(user, token) {
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
    }
    
    static clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    }
    
    static isLoggedIn() {
        return !!this.getToken();
    }
    
    // Simplified auth verification that checks token and role permissions
    static async verifyAuth(requiredRoles = []) {
        const token = this.getToken();
        const userData = this.getUserData();
        
        // Check if user has token and user data
        if (!token || !userData) {
            return { valid: false, reason: 'no_token' };
        }
        
        // Check if user's role is in the required roles for this page
        if (requiredRoles.length > 0 && !requiredRoles.includes(userData.role)) {
            return { valid: false, reason: 'insufficient_permissions' };
        }
        
        // Verify token is still valid by making a call to a route the user should have access to
        try {
            let testRoute = '/public'; // Default fallback
            
            // Select route based on user's actual role
            switch(userData.role) {
                case 'president':
                    testRoute = '/president-protected';
                    break;
                case 'secretary':
                    testRoute = '/secretary-protected';
                    break;
                case 'treasurer':
                    testRoute = '/treasurer-protected';
                    break;
                case 'member':
                    testRoute = '/member-protected';
                    break;
                default:
                    testRoute = '/member-protected'; // Fallback
            }
            
            const response = await fetch(testRoute, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return { valid: true, reason: 'authorized' };
            } else {
                // Token is invalid or expired
                return { valid: false, reason: 'invalid_token' };
            }
        } catch (error) {
            console.error('Auth verification failed:', error);
            return { valid: false, reason: 'network_error' };
        }
    }
    
    // Check authentication and redirect if needed
    static async checkAuth(requiredRoles = [], redirectTo = '/login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectTo;
            return false;
        }
        
        // Use backend to verify token and role access
        const authResult = await this.verifyAuth(requiredRoles);
        
        if (!authResult.valid) {
            if (authResult.reason === 'insufficient_permissions') {
                // Valid token but insufficient permissions - redirect to login
                alert('Access denied. You do not have permission to view this page.');
                window.location.href = redirectTo;
                return false;
            } else {
                // Invalid token, expired, or network error - log out
                this.clearAuth();
                alert('Your session has expired. Please log in again.');
                window.location.href = redirectTo;
                return false;
            }
        }
        
        return true;
    }
    
    // Initialize auth check when page loads
    static initPageAuth(requiredRoles = []) {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.checkAuth(requiredRoles);
        });
    }

    static getUserRole() {
        const userData = this.getUserData();
        return userData ? userData.role : null;
    }
}

// Make it globally available
window.authManager = AuthManager; 