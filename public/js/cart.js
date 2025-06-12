// Cart functionality
let cart = [];

// Load cart from localStorage when the script loads
function loadCart() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
  }
}

// Save cart to localStorage whenever it changes
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
  const emptyCart = document.getElementById('emptyCart');
  const cartItems = document.getElementById('cartItems');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartShipping = document.getElementById('cartShipping');
  const cartTotal = document.getElementById('cartTotal');
  const cartCounts = document.querySelectorAll('#cartCount'); // Get all cart count elements

  if (!cartItemsList) return; // Exit if we're not on a page with cart display

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

  // Clear existing items
  cartItemsList.innerHTML = '';

  let subtotal = 0;

  // Add each item to the cart display
  cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;
    
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item mb-3 pb-3 border-bottom';
    itemElement.innerHTML = `
      <div class="d-flex align-items-center">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;" class="me-3">
        <div class="flex-grow-1">
          <h6 class="mb-1">${item.name}</h6>
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
    cartItemsList.appendChild(itemElement);
  });

  // Update totals
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (cartShipping) cartShipping.textContent = `$${shipping.toFixed(2)}`;
  if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateQuantity(index, change) {
  const newQuantity = cart[index].quantity + change;
  
  if (newQuantity < 1) {
    // Remove the item if quantity would become less than 1
    cart.splice(index, 1);
  } else {
    cart[index].quantity = newQuantity;
  }
  
  saveCart();
  updateCartDisplay();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartDisplay();
}

function addToCart(item) {
  if (!item.id) {
    console.error('Product ID is missing');
    return;
  }

  // Load the current cart from localStorage
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

  const existingItem = cart.find(cartItem => cartItem.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push({
      ...item,
      quantity: item.quantity
    });
  }
  
  saveCart();
  updateCartDisplay();
  showToast('Item added to cart!', 'success');
}

// Initialize cart display
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

// Handle checkout
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  
      // Redirect to checkout page
      window.location.href = '/checkout';
    });
  }
}); 