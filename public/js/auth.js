/**
 * ShopEasy - User Authentication Logic (auth.js)
 * Manages user login, registration, validation, and redirection
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect away from login/register
  const token = getAuthToken();
  const user = getCurrentUser();
  if (token && user) {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || 'index.html';
    window.location.href = redirect;
    return;
  }

  // Handle Demo Fill Button on Login Page
  const demoBtn = document.getElementById('fill-demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput && passInput) {
        emailInput.value = 'demo@shopeasy.com';
        passInput.value = 'password123';
        showToast('Demo credentials filled!', 'info');
      }
    });
  }

  // Handle Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  // Handle Register Form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }
});

async function handleLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const alertBox = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-submit-btn');

  if (!email || !password) {
    showAlert(alertBox, 'Please provide both email and password.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing In...';
  hideAlert(alertBox);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setAuthSession(data.token, data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');

      // Check for redirect query param
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect') || 'index.html';

      setTimeout(() => {
        window.location.href = redirect;
      }, 700);
    } else {
      showAlert(alertBox, data.message || 'Invalid email or password.', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showAlert(alertBox, 'Network error. Please ensure the backend is running.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  const alertBox = document.getElementById('register-alert');
  const submitBtn = document.getElementById('register-submit-btn');

  // Client validations
  if (!name || !email || !password || !confirmPassword) {
    showAlert(alertBox, 'Please complete all fields.', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert(alertBox, 'Password must be at least 6 characters.', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAlert(alertBox, 'Passwords do not match.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';
  hideAlert(alertBox);

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setAuthSession(data.token, data.user);
      showToast('Registration successful! Welcome to ShopEasy.', 'success');

      setTimeout(() => {
        window.location.href = 'products.html';
      }, 800);
    } else {
      showAlert(alertBox, data.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    console.error('Register error:', err);
    showAlert(alertBox, 'Network error during registration.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register Account';
  }
}

function showAlert(box, message, type = 'error') {
  if (!box) return;
  box.style.display = 'block';
  if (type === 'error') {
    box.style.background = 'var(--danger-light)';
    box.style.color = '#991b1b';
    box.style.border = '1px solid #fecaca';
  } else {
    box.style.background = 'var(--success-light)';
    box.style.color = '#065f46';
    box.style.border = '1px solid #a7f3d0';
  }
  box.textContent = message;
}

function hideAlert(box) {
  if (!box) return;
  box.style.display = 'none';
  box.textContent = '';
}
