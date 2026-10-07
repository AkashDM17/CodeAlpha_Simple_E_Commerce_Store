/**
 * ShopEasy - Shopping Cart & Order Checkout Logic (cart.js)
 * Manages cart display, quantity updates, shipping checkout, and order placement
 */

document.addEventListener('DOMContentLoaded', () => {
  renderCartView();
  setupCheckoutModalEvents();
});

function renderCartView() {
  const container = document.getElementById('cart-content-wrapper');
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <h2>Your Shopping Cart is Empty</h2>
        <p>Looks like you haven't added any products to your cart yet. Explore our latest arrivals and great deals.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">
          Start Shopping
        </a>
      </div>
    `;
    return;
  }

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  container.innerHTML = `
    <div class="cart-layout">
      <!-- Cart Items Table Card -->
      <div class="cart-table-card">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th style="text-align: center;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map((item) => `
              <tr>
                <td>
                  <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div>
                      <a href="product-details.html?id=${item.product}" class="cart-item-title">
                        ${item.name}
                      </a>
                      <div class="cart-item-cat">${item.category || 'Product'}</div>
                      <small style="color: ${item.stock <= 5 ? 'var(--warning)' : 'var(--text-muted)'};">
                        ${item.stock <= 5 ? `Only ${item.stock} in stock` : 'In Stock'}
                      </small>
                    </div>
                  </div>
                </td>
                <td style="font-weight: 600;">${formatPrice(item.price)}</td>
                <td>
                  <div class="quantity-control">
                    <button type="button" onclick="handleQtyChange('${item.product}', ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" max="${item.stock}" 
                      onchange="handleQtyChange('${item.product}', this.value)">
                    <button type="button" onclick="handleQtyChange('${item.product}', ${item.quantity + 1})">+</button>
                  </div>
                </td>
                <td style="font-weight: 700; color: var(--primary);">
                  ${formatPrice(item.price * item.quantity)}
                </td>
                <td style="text-align: center;">
                  <button class="btn btn-sm btn-secondary" style="color: var(--danger); border-color: #fee2e2;" 
                    onclick="handleRemove('${item.product}')" title="Remove item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="padding: 1.25rem; display: flex; justify-content: space-between; border-top: 1px solid var(--border); background: #fafafa;">
          <a href="products.html" class="btn btn-sm btn-secondary">
            &larr; Continue Shopping
          </a>
          <button class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="handleClearCart()">
            Clear Entire Cart
          </button>
        </div>
      </div>

      <!-- Order Summary Card -->
      <aside class="cart-summary-card">
        <h3 class="summary-title">Order Summary</h3>

        <div class="summary-row">
          <span>Items (${cart.reduce((s, i) => s + i.quantity, 0)})</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Estimated Shipping</span>
          <span style="color: var(--success); font-weight: 700;">FREE</span>
        </div>
        <div class="summary-row">
          <span>Tax</span>
          <span>$0.00</span>
        </div>

        <div class="summary-row total">
          <span>Total</span>
          <span>${formatPrice(total)}</span>
        </div>

        <button class="btn btn-lg btn-primary btn-full" id="proceed-checkout-btn" onclick="openCheckoutModal()">
          Proceed to Checkout
        </button>

        <div style="margin-top: 1.25rem; font-size: 0.8rem; color: var(--text-muted); text-align: center;">
          🔒 Safe & Secure Checkout Guaranteed
        </div>
      </aside>
    </div>
  `;
}

function handleQtyChange(productId, newQty) {
  const parsed = parseInt(newQty);
  if (parsed <= 0) {
    handleRemove(productId);
  } else {
    updateCartItemQty(productId, parsed);
    renderCartView();
  }
}

function handleRemove(productId) {
  removeFromCart(productId);
  renderCartView();
}

function handleClearCart() {
  if (confirm('Are you sure you want to remove all items from your cart?')) {
    clearCart();
    renderCartView();
    showToast('Your cart has been cleared.', 'info');
  }
}

// ==========================================
// CHECKOUT MODAL & ORDER PLACEMENT
// ==========================================
function openCheckoutModal() {
  const token = getAuthToken();
  const user = getCurrentUser();

  if (!token || !user) {
    showToast('Please log in or register before checking out.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=cart.html';
    }, 1200);
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  document.getElementById('checkout-modal-total').textContent = formatPrice(total);
  document.getElementById('checkout-items-summary').textContent = `${cart.length} item(s) selected for delivery`;

  // Pre-fill user name if available
  const nameInput = document.getElementById('ship-name');
  if (nameInput && user.name && !nameInput.value) {
    nameInput.value = user.name;
  }

  const modal = document.getElementById('checkout-modal');
  modal.classList.add('active');
}

function setupCheckoutModalEvents() {
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.getElementById('close-checkout-modal');
  const cancelBtn = document.getElementById('cancel-checkout-btn');
  const checkoutForm = document.getElementById('checkout-form');

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const token = getAuthToken();
      if (!token) {
        showToast('Session expired. Please log in again.', 'error');
        window.location.href = 'login.html?redirect=cart.html';
        return;
      }

      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
      }

      const shippingAddress = {
        fullName: document.getElementById('ship-name').value.trim(),
        phone: document.getElementById('ship-phone').value.trim(),
        address: document.getElementById('ship-address').value.trim(),
        city: document.getElementById('ship-city').value.trim(),
        state: document.getElementById('ship-state').value.trim(),
        pinCode: document.getElementById('ship-pin').value.trim(),
      };

      const paymentMethod = document.getElementById('checkout-payment-method').value;

      const placeOrderBtn = document.getElementById('place-order-btn');
      placeOrderBtn.disabled = true;
      placeOrderBtn.textContent = 'Processing Order...';

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart,
            shippingAddress,
            paymentMethod,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success && data.order) {
          // Success: Clear cart & show confirmation
          clearCart();
          modal.classList.remove('active');

          // Populate confirmation modal
          document.getElementById('confirm-order-id').textContent = data.order.orderId;
          document.getElementById('confirm-order-total').textContent = formatPrice(data.order.totalAmount);
          document.getElementById('confirm-order-status').textContent = data.order.status;

          const confirmModal = document.getElementById('confirmation-modal');
          confirmModal.classList.add('active');

          renderCartView();
        } else {
          showToast(data.message || 'Failed to process order.', 'error');
        }
      } catch (err) {
        console.error('Order processing error:', err);
        showToast('Network error while placing order. Please try again.', 'error');
      } finally {
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Confirm & Place Order';
      }
    });
  }
}
