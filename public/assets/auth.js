/**
 * Authentication Helper Functions
 * Common JavaScript utilities for authentication pages
 */

// Check if user is logged in
async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

// Redirect to login if not authenticated
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = '/login.html';
    return false;
  }
  return user;
}

// Redirect to dashboard if already authenticated
async function redirectIfAuthenticated() {
  const user = await checkAuth();
  if (user) {
    window.location.href = '/dashboard.html';
    return true;
  }
  return false;
}

// Logout function
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.success) {
      window.location.href = '/login.html';
      return true;
    } else {
      console.error('Logout failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

// Show alert message
function showAlert(containerId, message, type = 'error') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="alert alert-${type}" style="padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem;">
      ${message}
    </div>
  `;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Additional strength checks (optional)
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkAuth,
    requireAuth,
    redirectIfAuthenticated,
    logout,
    showAlert,
    isValidEmail,
    validatePassword,
    formatDate
  };
}

