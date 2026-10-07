/**
 * ShopEasy - Products Catalog Logic (products.js)
 * Manages fetching, filtering, searching, sorting, and displaying products
 */

let allLoadedProducts = [];
let activeCategory = 'All';
let activeSearchQuery = '';
let activeSort = 'newest';
let filterInStockOnly = false;

document.addEventListener('DOMContentLoaded', () => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  const searchParam = urlParams.get('search');

  if (categoryParam) {
    activeCategory = categoryParam;
    updateActiveCategoryButton(categoryParam);
  }

  if (searchParam) {
    activeSearchQuery = searchParam;
    const searchInput = document.getElementById('catalog-search-input');
    if (searchInput) searchInput.value = searchParam;
  }

  // Setup Event Listeners
  setupEventListeners();

  // Load Products
  fetchAndRenderProducts();
});

function setupEventListeners() {
  // Category buttons
  const categoryButtons = document.querySelectorAll('#category-filter-list .filter-btn');
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category || 'All';
      fetchAndRenderProducts();
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        activeSearchQuery = e.target.value.trim();
        fetchAndRenderProducts();
      }, 350);
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      fetchAndRenderProducts();
    });
  }

  // In-stock checkbox
  const inStockCheckbox = document.getElementById('in-stock-only');
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', (e) => {
      filterInStockOnly = e.target.checked;
      renderProductsGrid();
    });
  }

  // Reset filters button
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'All';
      activeSearchQuery = '';
      activeSort = 'newest';
      filterInStockOnly = false;

      updateActiveCategoryButton('All');
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'newest';
      if (inStockCheckbox) inStockCheckbox.checked = false;

      // Update URL without reloading
      window.history.pushState({}, document.title, window.location.pathname);
      fetchAndRenderProducts();
    });
  }
}

function updateActiveCategoryButton(cat) {
  const categoryButtons = document.querySelectorAll('#category-filter-list .filter-btn');
  categoryButtons.forEach((btn) => {
    if (btn.dataset.category?.toLowerCase() === cat.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function fetchAndRenderProducts() {
  const container = document.getElementById('catalog-products-grid');
  const countDisplay = document.getElementById('product-count-display');

  if (container) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>Loading products from catalog...</p>
      </div>
    `;
  }

  try {
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== 'All') {
      params.append('category', activeCategory);
    }
    if (activeSearchQuery) {
      params.append('search', activeSearchQuery);
    }
    if (activeSort && activeSort !== 'newest') {
      params.append('sort', activeSort);
    }

    const url = `/api/products?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      allLoadedProducts = data.products || [];
      renderProductsGrid();
    } else {
      if (container) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">⚠️</div>
            <h3>Unable to load products</h3>
            <p>${data.message || 'Error occurred while loading data.'}</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">⚠️</div>
          <h3>Failed to connect to server</h3>
          <p>Please ensure the server and MongoDB are running.</p>
        </div>
      `;
    }
  }
}

function renderProductsGrid() {
  const container = document.getElementById('catalog-products-grid');
  const countDisplay = document.getElementById('product-count-display');
  if (!container) return;

  let displayList = allLoadedProducts;

  if (filterInStockOnly) {
    displayList = displayList.filter((p) => p.stock > 0);
  }

  if (countDisplay) {
    countDisplay.textContent = `Showing ${displayList.length} product${displayList.length === 1 ? '' : 's'}`;
  }

  if (displayList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>No products found</h3>
        <p>No products matched your criteria. Try adjusting your search query or filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = displayList
    .map((product) => {
      const stockClass =
        product.stock > 10
          ? 'stock-in'
          : product.stock > 0
          ? 'stock-low'
          : 'stock-out';

      const stockText =
        product.stock > 10
          ? 'In Stock'
          : product.stock > 0
          ? `Only ${product.stock} left`
          : 'Out of Stock';

      return `
      <div class="product-card">
        <div class="product-image-container">
          <span class="product-badge-category">${product.category}</span>
          <span class="stock-tag ${stockClass}">${stockText}</span>
          <a href="product-details.html?id=${product._id}">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </a>
        </div>
        <div class="product-info">
          <div class="product-rating">
            ★ <span>${product.rating.toFixed(1)}</span>
            <span class="rating-count">(${product.numReviews || 18})</span>
          </div>
          <h3 class="product-title">
            <a href="product-details.html?id=${product._id}">${product.name}</a>
          </h3>
          <p class="product-desc">${product.description}</p>
          <div class="product-footer">
            <div class="product-price">${formatPrice(product.price)}</div>
            <div class="product-actions">
              <a href="product-details.html?id=${product._id}" class="btn btn-sm btn-secondary">Details</a>
              <button 
                class="btn btn-sm btn-primary" 
                onclick="onAddClick('${product._id}')" 
                ${product.stock <= 0 ? 'disabled' : ''}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
}

function onAddClick(productId) {
  const product = allLoadedProducts.find((p) => p._id === productId);
  if (product) {
    addToCart(product, 1);
  }
}
