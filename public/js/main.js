/**
 * ShopEasy - Global Application Logic (main.js)
 * Manages Auth State, Navigation, Cart State, and Notifications
 */

const API_BASE = '/api';

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

// ==========================================
// AUTHENTICATION STATE & HELPERS
// ==========================================
function getAuthToken() {
  return localStorage.getItem('token');
}

function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
}

function setAuthSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  updateNavigation();
}

function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showToast('You have been logged out successfully.', 'info');
  updateNavigation();
  // Redirect to home if currently on protected page
  if (
    window.location.pathname.includes('orders.html') ||
    window.location.pathname.includes('cart.html')
  ) {
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  }
}

// ==========================================
// SHOPPING CART LOCAL STORAGE MANAGEMENT
// ==========================================
function getCart() {
  const cartStr = localStorage.getItem('cart');
  try {
    return cartStr ? JSON.parse(cartStr) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

function updateCartBadge() {
  const badgeElements = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badgeElements.forEach((el) => {
    el.textContent = count;
  });
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItemIndex = cart.findIndex((item) => item.product === product._id);

  const availableStock = product.stock !== undefined ? product.stock : 99;

  if (availableStock <= 0) {
    showToast(`Sorry, "${product.name}" is currently out of stock!`, 'error');
    return false;
  }

  if (existingItemIndex > -1) {
    const currentQty = cart[existingItemIndex].quantity;
    if (currentQty + quantity > availableStock) {
      showToast(
        `Cannot add more! Only ${availableStock} units available in stock.`,
        'warning'
      );
      return false;
    }
    cart[existingItemIndex].quantity += quantity;
  } else {
    if (quantity > availableStock) {
      showToast(
        `Requested quantity exceeds available stock (${availableStock}).`,
        'warning'
      );
      return false;
    }
    cart.push({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: availableStock,
      quantity: quantity,
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" to cart!`, 'success');
  return true;
}

function removeFromCart(productId) {
  let cart = getCart();
  const initialLength = cart.length;
  cart = cart.filter((item) => item.product !== productId);
  if (cart.length < initialLength) {
    saveCart(cart);
    showToast('Item removed from cart.', 'info');
  }
}

function updateCartItemQty(productId, newQty) {
  const cart = getCart();
  const item = cart.find((i) => i.product === productId);
  if (!item) return false;

  const qty = parseInt(newQty);
  if (isNaN(qty) || qty < 1) {
    removeFromCart(productId);
    return true;
  }

  if (qty > item.stock) {
    showToast(
      `Max available stock is ${item.stock} for this item.`,
      'warning'
    );
    item.quantity = item.stock;
    saveCart(cart);
    return false;
  }

  item.quantity = qty;
  saveCart(cart);
  return true;
}

function clearCart() {
  localStorage.removeItem('cart');
  updateCartBadge();
}

// ==========================================
// UTILITY HELPERS
// ==========================================
function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

// ==========================================
// NAVIGATION & HEADER SYNC
// ==========================================
function updateNavigation() {
  const user = getCurrentUser();
  const navAuthContainer = document.getElementById('nav-auth-container');

  if (navAuthContainer) {
    if (user && user.name) {
      navAuthContainer.innerHTML = `
        <div class="user-dropdown">
          <span class="user-greeting" title="${user.email}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Hi, ${user.name.split(' ')[0]}
          </span>
        </div>
        <a href="orders.html" class="btn btn-sm btn-secondary" title="View order history">My Orders</a>
        <button id="logout-btn" class="btn btn-sm btn-outline" onclick="logoutUser()">Logout</button>
      `;
    } else {
      navAuthContainer.innerHTML = `
        <a href="login.html" class="btn btn-sm btn-secondary">Login</a>
        <a href="register.html" class="btn btn-sm btn-primary">Register</a>
      `;
    }
  }

  updateCartBadge();
}

// Initialize listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateNavigation();

  // Mobile menu button toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Navbar search form handler
  const navSearchForm = document.getElementById('nav-search-form');
  const navSearchInput = document.getElementById('nav-search-input');
  if (navSearchForm && navSearchInput) {
    navSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = navSearchInput.value.trim();
      if (query) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
      } else {
        window.location.href = `products.html`;
      }
    });
  }
});
