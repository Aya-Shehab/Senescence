// Cart functionality (server-side powered)
let cart = [];


function mapServerCartItems(items = []) {
  return items.map((it) => ({
    id: (it.productId && it.productId._id) || it.productId,
    name: it.productName || (it.productId && it.productId.name) || '',
    image: it.imageUrl || (it.productId && it.productId.imageUrl) || '',
    price: it.price,
    priceType: it.priceType,
    quantity: it.quantity,
  }));
}

async function loadCart() {
  if (!window.currentUserId) {
    cart = [];
    updateCartDisplay();
    return;
  }
  try {
    const res = await fetch(`/api/v1/cart/${currentUserId}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch cart');
    const data = await res.json();
    cart = mapServerCartItems(data.items);
    updateCartDisplay();
  } catch (err) {
    console.error('Error loading cart', err);
  }
}

function updateCartDisplay() {
  const emptyCart = document.getElementById('emptyCart');
  const cartItems = document.getElementById('cartItems');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const cartCounts = document.querySelectorAll('#cartCount'); // Get all cart count elements

  // Even if cartItemsList is missing (e.g., on listing pages), we still update the badge counts.

  if (cart.length === 0) {
    if (emptyCart) emptyCart.classList.remove('d-none');
    if (cartItems) cartItems.classList.add('d-none');
    // Update all cart count elements
    cartCounts.forEach(count => {
      if (count) count.textContent = '0';
    });
    return;
  }

  if (emptyCart) emptyCart.classList.add('d-none');
  if (cartItems) cartItems.classList.remove('d-none');

  // Update all cart count elements
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCounts.forEach(count => {
    if (count) count.textContent = totalItems;
  });

  if (cartItemsList) {
    // Clear existing items
    cartItemsList.innerHTML = '';
  }

  let subtotal = 0;

  // Add each item to the cart display
  cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;
    
    if (cartItemsList) {
      const elem = document.createElement('div');
      elem.className = 'cart-item mb-3 pb-3 border-bottom';
      elem.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;" class="me-3">
          <div class="flex-grow-1">
            <h6 class="mb-1">${item.name} (${item.priceType === 'whole' ? 'Whole Cake' : 'Single Piece'})</h6>
            <p class="mb-1 text-muted">$${item.price.toFixed(2)}</p>
            <div class="d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary me-2" onclick="updateQuantity(${index}, -1)">-</button>
              <span class="mx-2">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary ms-2" onclick="updateQuantity(${index}, 1)">+</button>
              <button class="btn btn-sm btn-danger ms-auto" onclick="removeItem(${index})">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
      cartItemsList.appendChild(elem);
    }
  });

  // Update totals
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (cartShipping) cartShipping.textContent = `$${shipping.toFixed(2)}`;
  if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

async function updateQuantity(index, change) {
  const item = cart[index];
  if (!item) return;

  const newQuantity = item.quantity + change;

  if (newQuantity < 1) {
    await removeItem(index);
    return;
  }

  try {
    const res = await fetch(`/api/v1/cart/${currentUserId}/item/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity: newQuantity, priceType: item.priceType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update item');
    cart = mapServerCartItems(data.cart.items);
    updateCartDisplay();
  } catch (err) {
    console.error('Update quantity error', err);
    showToast('Failed to update quantity', 'error');
  }
}

async function removeItem(index) {
  const item = cart[index];
  if (!item) return;
  try {
    const res = await fetch(`/api/v1/cart/${currentUserId}/item/${item.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ priceType: item.priceType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to remove');
    cart = mapServerCartItems(data.cart.items);
    updateCartDisplay();
  } catch (err) {
    console.error('Remove item error', err);
    showToast('Failed to remove item', 'error');
  }
}

async function addToCart(item) {
  if (!item.id) {
    console.error('Product ID is missing');
    return;
  }

  if (!window.currentUserId) {
    showToast('Please login first', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/v1/cart/${currentUserId}/add/${item.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity: item.quantity, priceType: item.priceType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add to cart');
    cart = mapServerCartItems(data.cart.items);
    updateCartDisplay();
    showToast('Item added to cart!', 'success');
  } catch (err) {
    console.error('Add to cart error', err);
    showToast('Failed to add to cart', 'error');
  }
}

// Initialize cart display on DOM ready
document.addEventListener('DOMContentLoaded', loadCart);

// Handle checkout button (off-canvas)
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Your cart is empty!', 'error');
      return;
    }
    window.location.href = '/checkout';
  });
}); 