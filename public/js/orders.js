/**
 * ShopEasy - Orders History Logic (orders.js)
 * Manages fetching authenticated user orders and rendering order cards
 */

document.addEventListener('DOMContentLoaded', () => {
  const token = getAuthToken();

  if (!token) {
    renderLoginRequired();
    return;
  }

  fetchUserOrders();
});

function renderLoginRequired() {
  const container = document.getElementById('orders-content-wrapper');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🔒</div>
      <h2>Authentication Required</h2>
      <p>Please log in to your account to view your purchase history and order details.</p>
      <a href="login.html?redirect=orders.html" class="btn btn-primary" style="margin-top: 1rem;">
        Sign In to Continue
      </a>
    </div>
  `;
}

async function fetchUserOrders() {
  const container = document.getElementById('orders-content-wrapper');
  const token = getAuthToken();

  try {
    const response = await fetch('/api/orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        logoutUser();
        renderLoginRequired();
        return;
      }
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to load orders</h3>
          <p>${data.message || 'Error occurred while loading your orders.'}</p>
        </div>
      `;
      return;
    }

    renderOrdersList(data.orders || []);
  } catch (error) {
    console.error('Error fetching orders:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Network Error</h3>
        <p>Could not connect to the server to fetch your orders.</p>
      </div>
    `;
  }
}

function renderOrdersList(orders) {
  const container = document.getElementById('orders-content-wrapper');

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>No Orders Found</h2>
        <p>You haven't placed any orders yet. Discover our latest collections and start shopping today!</p>
        <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">
          Browse Catalog
        </a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="orders-list">
      ${orders.map((order) => {
        const statusClass = `status-${(order.status || 'pending').toLowerCase()}`;
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const address = order.shippingAddress || {};

        return `
          <div class="order-card">
            <!-- Order Card Header -->
            <div class="order-header">
              <div class="order-id-group">
                <span class="order-id">Order ID: ${order.orderId || order._id}</span>
                <span class="order-date">Placed on ${orderDate}</span>
              </div>
              <div>
                <span class="order-status-badge ${statusClass}">
                  ${order.status || 'Processing'}
                </span>
              </div>
            </div>

            <!-- Order Card Body / Items -->
            <div class="order-body">
              <div class="order-items-grid">
                ${(order.items || []).map((item) => `
                  <div class="order-item-row">
                    <div class="order-item-details">
                      <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" class="order-item-thumb">
                      <div>
                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                          ${item.name}
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">
                          Qty: <strong>${item.quantity}</strong> &times; ${formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                    <div style="font-weight: 700; color: var(--primary);">
                      ${formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Shipping Info Snippet -->
              <div style="background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem;">
                <strong style="color: var(--text-main);">Delivery Address:</strong> 
                ${address.fullName}, ${address.address}, ${address.city}, ${address.state} - ${address.pinCode} (Phone: ${address.phone})
              </div>
            </div>

            <!-- Order Card Footer -->
            <div class="order-footer">
              <div style="font-size: 0.85rem; color: var(--text-muted);">
                Payment: <strong style="color: var(--text-main);">${order.paymentMethod || 'Simulated'}</strong>
              </div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">
                Total: <span style="color: var(--primary);">${formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
