/**
 * ShopEasy - Product Details Logic (product-details.js)
 * Manages fetching single product details, quantity controls, and cart additions
 */

let currentProduct = null;
let selectedQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    renderError('No product selected. Please choose a product from the catalog.');
    return;
  }

  fetchProductDetails(productId);
});

async function fetchProductDetails(id) {
  const container = document.getElementById('product-details-container');

  try {
    const response = await fetch(`/api/products/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success || !data.product) {
      renderError(data.message || 'Product not found or has been removed.');
      return;
    }

    currentProduct = data.product;
    renderDetails(currentProduct);
    fetchRelatedProducts(currentProduct.category, currentProduct._id);
  } catch (error) {
    console.error('Error fetching product:', error);
    renderError('Unable to connect to server. Please try again later.');
  }
}

function renderDetails(product) {
  const container = document.getElementById('product-details-container');
  const breadcrumbSpan = document.getElementById('breadcrumb-current-product');
  if (breadcrumbSpan) breadcrumbSpan.textContent = product.name;

  const isOutOfStock = product.stock <= 0;
  const stockBadgeClass = product.stock > 10 ? 'stock-in' : (product.stock > 0 ? 'stock-low' : 'stock-out');
  const stockStatusLabel = product.stock > 10 ? 'In Stock' : (product.stock > 0 ? `Only ${product.stock} items left` : 'Out of Stock');

  container.innerHTML = `
    <div class="product-detail-grid">
      <!-- Image Gallery -->
      <div class="product-detail-gallery">
        <img src="${product.image}" alt="${product.name}" id="main-product-img">
      </div>

      <!-- Info Column -->
      <div class="product-detail-info">
        <a href="products.html?category=${encodeURIComponent(product.category)}" class="product-detail-category">
          ${product.category}
        </a>

        <h1 class="product-detail-title">${product.name}</h1>

        <div class="product-detail-meta">
          <div class="product-rating">
            ★ <strong>${product.rating.toFixed(1)}</strong>
            <span class="rating-count">(${product.numReviews || 24} customer reviews)</span>
          </div>
          <span class="stock-tag ${stockBadgeClass}" style="position: static;">
            ${stockStatusLabel}
          </span>
        </div>

        <div class="product-detail-price">
          ${formatPrice(product.price)}
        </div>

        <p class="product-detail-desc">
          ${product.description}
        </p>

        <!-- Stock and Quantity selection -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-weight: 700; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-main);">
            Quantity:
          </label>
          <div class="quantity-control">
            <button type="button" id="qty-decrease" ${isOutOfStock ? 'disabled' : ''}>-</button>
            <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" ${isOutOfStock ? 'disabled' : ''}>
            <button type="button" id="qty-increase" ${isOutOfStock ? 'disabled' : ''}>+</button>
          </div>
          <small style="display: block; margin-top: 0.4rem; color: var(--text-muted);">
            ${isOutOfStock ? 'This item is currently sold out.' : `${product.stock} units available in warehouse`}
          </small>
        </div>

        <!-- Actions -->
        <div class="product-detail-actions">
          <button 
            class="btn btn-lg btn-primary" 
            id="detail-add-to-cart-btn"
            ${isOutOfStock ? 'disabled' : ''}
            style="flex: 1;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
          <a href="cart.html" class="btn btn-lg btn-secondary">
            View Cart
          </a>
        </div>
      </div>
    </div>
  `;

  // Attach Quantity Listeners
  if (!isOutOfStock) {
    const qtyInput = document.getElementById('qty-input');
    const btnDecrease = document.getElementById('qty-decrease');
    const btnIncrease = document.getElementById('qty-increase');
    const btnAddToCart = document.getElementById('detail-add-to-cart-btn');

    btnDecrease.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        val -= 1;
        qtyInput.value = val;
        selectedQuantity = val;
      }
    });

    btnIncrease.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < product.stock) {
        val += 1;
        qtyInput.value = val;
        selectedQuantity = val;
      } else {
        showToast(`Maximum available stock is ${product.stock}`, 'warning');
      }
    });

    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > product.stock) {
        val = product.stock;
        showToast(`Stock limit reached: only ${product.stock} available`, 'warning');
      }
      qtyInput.value = val;
      selectedQuantity = val;
    });

    btnAddToCart.addEventListener('click', () => {
      addToCart(product, selectedQuantity);
    });
  }
}

async function fetchRelatedProducts(category, currentId) {
  try {
    const res = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=4`);
    const data = await res.json();

    if (data.success && data.products) {
      const related = data.products.filter((p) => p._id !== currentId).slice(0, 3);
      if (related.length > 0) {
        const relatedSection = document.getElementById('related-section');
        const relatedGrid = document.getElementById('related-products-grid');
        relatedSection.style.display = 'block';

        relatedGrid.innerHTML = related.map((p) => `
          <div class="product-card">
            <div class="product-image-container">
              <span class="product-badge-category">${p.category}</span>
              <a href="product-details.html?id=${p._id}">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
              </a>
            </div>
            <div class="product-info">
              <h3 class="product-title">
                <a href="product-details.html?id=${p._id}">${p.name}</a>
              </h3>
              <div class="product-footer">
                <div class="product-price">${formatPrice(p.price)}</div>
                <a href="product-details.html?id=${p._id}" class="btn btn-sm btn-secondary">Details</a>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (e) {
    console.error('Error loading related products:', e);
  }
}

function renderError(message) {
  const container = document.getElementById('product-details-container');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem;">Product Not Found</h2>
      <p>${message}</p>
      <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">
        &larr; Browse All Products
      </a>
    </div>
  `;
}
