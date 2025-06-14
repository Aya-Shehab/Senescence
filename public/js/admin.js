function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active-section');
  });
  document.getElementById(id).classList.add('active-section');
}

// Wait for DOM to be ready before initializing charts
document.addEventListener('DOMContentLoaded', function() {
  // Sales Chart
  const salesCtx = document.getElementById('salesChart').getContext('2d');
  new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales ($)',
        data: [12000, 15000, 14000, 17000, 21000, 23840],
        backgroundColor: 'rgba(78, 115, 223, 0.05)', // Match Total Income (Yearly)
        borderColor: '#4e73df', // Match Total Income (Yearly)
        borderWidth: 2,
        fill: true
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // Total Income (Yearly) Chart
  const incomeCanvas = document.getElementById('incomeChart');
  if (incomeCanvas) {
    const incomeCtx = incomeCanvas.getContext('2d');
    new Chart(incomeCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Total Income',
          data: [3000, 3200, 4800, 4900, 3000, 2900, 1500, 2200, 3500, 3600, 4900, 5000],
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          borderColor: '#4e73df',
          borderWidth: 2,
          fill: true
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  }

  // Optional: Add other chart initializations here (orderChart, etc.)
});

function updateWidget() {
        const amount = document.querySelector('.amount');
        const change = document.querySelector('.change');
        const newAmount = Math.floor(Math.random() * 5000 + 1000);
        const newChange = (Math.random() * 30).toFixed(2);
        amount.textContent = `$${newAmount}`;
        change.textContent = `+${newChange}%`;
    }

    // Update every 5 seconds (optional)
    setInterval(updateWidget, 5000);
    updateWidget(); // Initial call


    const chart = document.getElementById('chart');
    const tooltip = document.getElementById('tooltip');
    const bars = chart.getElementsByClassName('bar');

    chart.addEventListener('mousemove', (e) => {
        const rect = chart.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const barWidth = rect.width / bars.length;
        const index = Math.floor(x / barWidth);
        if (index >= 0 && index < bars.length) {
            tooltip.style.display = 'block';
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 40 + 'px';
            tooltip.textContent = `series-1: ${Math.floor(Math.random() * 100)}`;
        }
    });

    chart.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    // Optional: Add dynamic updates
    function updateValues() {
        const ordersValue = document.querySelector('.card:first-child .value');
        const customerOrdersValue = document.querySelector('.card:last-child .value');
        ordersValue.textContent = `${Math.floor(Math.random() * 100)}% used`;
        customerOrdersValue.textContent = `$${Math.floor(Math.random() * 20000)}`;
    }

    // Update every 5 seconds (optional)
    setInterval(updateValues, 5000);
    updateValues(); // Initial call


document.addEventListener("DOMContentLoaded", function () {
const filter = document.getElementById("statusFilter");

filter.addEventListener("change", function () {
const status = this.value;
const rows = document.querySelectorAll("tbody tr");

rows.forEach((row) => {
  const statusText = row.querySelector(".status").textContent.trim();
  row.style.display = (status === "All" || statusText === status) ? "" : "none";
});
});

// Toggle action menu
document.querySelectorAll(".dots-btn").forEach(button => {
button.addEventListener("click", function (e) {
  e.stopPropagation();
  closeAllMenus();
  const menu = this.nextElementSibling;
  menu.style.display = "block";
});
});

// Close menus when clicking outside
document.addEventListener("click", closeAllMenus);

function closeAllMenus() {
document.querySelectorAll(".action-menu").forEach(menu => {
  menu.style.display = "none";
});
}

// View More action
document.querySelectorAll(".action-item.view").forEach(item => {
item.addEventListener("click", function () {
  const productName = this.closest("tr").querySelector("td").innerText;
  alert("Viewing more details for:\n\n" + productName);
  closeAllMenus();
});
});

// Delete action
document.querySelectorAll(".action-item.delete").forEach(item => {
item.addEventListener("click", function () {
  if (confirm("Are you sure you want to delete this order?")) {
    const row = this.closest("tr");
    row.remove();
  }
});
});
});
document.addEventListener('DOMContentLoaded', function() {
// Profile form
const accountForm = document.getElementById('accountForm');
if (accountForm) {
accountForm.addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Profile updated successfully!');
});
}

// Password form
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
  passwordForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const currentPass = document.getElementById('currentPass').value;
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;

    if (newPass !== confirmPass) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const res = await fetch(`/api/v1/users/${currentUserId}/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      alert('Password updated successfully');
      passwordForm.reset();
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  });
}
});

function terminateSession(button) {
if (confirm('End this session?')) {
button.closest('tr').remove();
alert('Session ended successfully.');
}
}

document.querySelectorAll('.dots-btn').forEach(btn => {
btn.addEventListener('click', function(e) {
e.stopPropagation();
// Close all other menus
document.querySelectorAll('.dots-dropdown').forEach(menu => menu.style.display = 'none');
// Open this menu
this.nextElementSibling.style.display = 'block';
});
});

// Close menu when clicking outside
document.addEventListener('click', () => {
document.querySelectorAll('.dots-dropdown').forEach(menu => menu.style.display = 'none');
});

// Handle Confirm, Complete, Cancel actions
document.querySelectorAll('.action-item.confirm').forEach(btn => {
btn.addEventListener('click', function() {
const status = this.closest('tr').querySelector('.status');
if (status) status.textContent = 'Confirmed';
this.parentElement.style.display = 'none';
});
});
document.querySelectorAll('.action-item.complete').forEach(btn => {
btn.addEventListener('click', function() {
const status = this.closest('tr').querySelector('.status');
if (status) status.textContent = 'Completed';
this.parentElement.style.display = 'none';
});
});
document.querySelectorAll('.action-item.cancel').forEach(btn => {
btn.addEventListener('click', function() {
const status = this.closest('tr').querySelector('.status');
if (status) status.textContent = 'Cancelled';
this.parentElement.style.display = 'none';
});
});

document.addEventListener('DOMContentLoaded', function () {
// Event delegation for dots menu (handles dynamically added rows too)
document.body.addEventListener('click', function (e) {
// Open the menu
if (e.target.classList.contains('dots-btn')) {
  // Close all other menus
  document.querySelectorAll('.dots-dropdown').forEach(menu => menu.style.display = 'none');
  // Open this menu
  const menu = e.target.nextElementSibling;
  if (menu) menu.style.display = 'block';
  e.stopPropagation();
}
// Handle Confirm
if (e.target.classList.contains('action-item') && e.target.classList.contains('confirm')) {
  const status = e.target.closest('tr').querySelector('.status');
  if (status) status.textContent = 'Confirmed';
  e.target.parentElement.style.display = 'none';
  e.stopPropagation();
}
// Handle Complete
if (e.target.classList.contains('action-item') && e.target.classList.contains('complete')) {
  const status = e.target.closest('tr').querySelector('.status');
  if (status) status.textContent = 'Completed';
  e.target.parentElement.style.display = 'none';
  e.stopPropagation();
}
// Handle Cancel
if (e.target.classList.contains('action-item') && e.target.classList.contains('cancel')) {
  const status = e.target.closest('tr').querySelector('.status');
  if (status) status.textContent = 'Cancelled';
  e.target.parentElement.style.display = 'none';
  e.stopPropagation();
}
});

// Close all menus when clicking outside
document.addEventListener('click', function () {
document.querySelectorAll('.dots-dropdown').forEach(menu => menu.style.display = 'none');
});
});

// Fetch feedbacks from backend and display in the table
async function loadFeedbacks() {
const res = await fetch('/feedback');
const feedbacks = await res.json();
const tbody = document.getElementById('feedback-tbody');
tbody.innerHTML = '';
feedbacks.forEach(fb => {
const tr = document.createElement('tr');
tr.innerHTML = `
  <td>${fb.user}</td>
  <td>${fb.email}</td>
  <td>${fb.message}</td>
  <td>${new Date(fb.createdAt).toLocaleString()}</td>
  <td>${fb.response || ''}</td>
  <td>
    <button onclick="respondFeedback('${fb._id}')">Respond</button>
    <button onclick="deleteFeedback('${fb._id}')">Delete</button>
  </td>
`;
tbody.appendChild(tr);
});
}

async function respondFeedback(id) {
const response = prompt('Enter your response:');
if (response) {
await fetch(`/feedback/${id}/respond`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ response })
});
loadFeedbacks();
}
}

async function deleteFeedback(id) {
if (confirm('Delete this feedback?')) {
await fetch(`/feedback/${id}`, { method: 'DELETE' });
loadFeedbacks();
}
}

// Load feedbacks when the feedback section is shown
document.addEventListener('DOMContentLoaded', () => {
const feedbackTab = document.querySelector('[onclick="showSection(\'feedback\')"]');
if (feedbackTab) {
feedbackTab.addEventListener('click', loadFeedbacks);
}
});

// Fetch orders from backend and display in the table
async function loadOrders() {
  try {
    const response = await fetch('/api/v1/orders', {
      credentials: 'include' // This will include cookies in the request
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const orders = await response.json();
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    
    // Update order counts
    document.getElementById('ordersTotal').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = 
      orders.filter(order => order.status === 'Pending').length;

    orders.forEach(order => {
      const shipping = order.shippingInfo || {};
      const address = shipping.address
        ? `${shipping.address.street}, ${shipping.address.city}, ${shipping.address.governorate}`
        : '-';
      const items = order.items && order.items.length
        ? order.items.map(item => `${item.name} (x${item.quantity})`).join('<br>')
        : '-';
      tbody.innerHTML += `
        <tr>
          <td>${order.orderNumber}</td>
          <td>${shipping.firstName || ''} ${shipping.lastName || ''}</td>
          <td>${shipping.email || '-'}</td>
          <td>${shipping.phone || '-'}</td>
          <td>${address}</td>
          <td>${items}</td>
          <td>${order.totalPrice} ${order.currency || 'EGP'}</td>
          <td>
            <select class="form-select form-select-sm" onchange="updateOrderStatus('${order._id}', this.value)">
              <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>${order.paymentMethod} (${order.paymentStatus})</td>
          <td>${order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order._id}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Failed to load orders. Please try again.');
  }
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`/api/v1/orders/status/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies in the request
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    await loadOrders(); // Refresh the orders list
    alert('Order status updated successfully');
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Failed to update order status');
  }
}

// Delete order
async function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/orders/${orderId}`, {
      method: 'DELETE',
      credentials: 'include' // Include cookies in the request
    });

    if (!response.ok) {
      throw new Error('Failed to delete order');
    }

    await loadOrders(); // Refresh the orders list
    alert('Order deleted successfully');
  } catch (error) {
    console.error('Error deleting order:', error);
    alert('Failed to delete order');
  }
}

// Load orders when the orders section is shown
document.addEventListener('DOMContentLoaded', () => {
  const ordersTab = document.querySelector('[onclick="showSection(\'orders\')"]');
  if (ordersTab) {
    ordersTab.addEventListener('click', loadOrders);
  }
});

// Fetch users from backend and display in the table
async function loadUsers() {
const res = await fetch('/api/v1/users');
const users = await res.json();
const tbody = document.getElementById('users-tbody');
tbody.innerHTML = '';
users.forEach(user => {
tbody.innerHTML += `
  <tr>
    <td>${user.name}</td>
    <td>${user.email}</td>
    <td>${user.role}</td>
    <td>
      <button onclick="editUser('${user._id}')">Edit</button>
      <button onclick="deleteUser('${user._id}')">Delete</button>
    </td>
  </tr>
`;
});
}

async function deleteUser(id) {
if (confirm('Delete this user?')) {
await fetch(`/api/v1/users/${id}`, { method: 'DELETE' });
loadUsers();
}
}

function editUser(id) {
// You can fetch user details and fill the form for editing
// Example:
fetch(`/api/v1/users/${id}`)
.then(res => res.json())
.then(user => {
  document.getElementById('username').value = user.name;
  document.getElementById('email').value = user.email;
  document.getElementById('role').value = user.role;
  // Store user id for update
  document.querySelector('.user-form').setAttribute('data-user-id', user._id);
});
}

// Handle add/edit user form submission
document.querySelector('.user-form').addEventListener('submit', async function(e) {
e.preventDefault();
const id = this.getAttribute('data-user-id');
const name = document.getElementById('username').value;
const email = document.getElementById('email').value;
const role = document.getElementById('role').value;
if (id) {
// Update user
await fetch(`/api/v1/users/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, role })
});
this.removeAttribute('data-user-id');
} else {
// Add new user
await fetch('/api/v1/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, role, password: 'default123' }) // Set a default password or prompt for one
});
}
this.reset();
loadUsers();
});

// Load users when the users section is shown
document.addEventListener('DOMContentLoaded', () => {
const usersTab = document.querySelector('[onclick="showSection(\'users\')"]');
if (usersTab) {
usersTab.addEventListener('click', loadUsers);
}
});

// Fetch products from backend and display in the table
async function loadProducts() {
const res = await fetch('/api/v1/products');
const products = await res.json();
const tbody = document.getElementById('products-tbody');
tbody.innerHTML = '';
products.forEach(product => {
tbody.innerHTML += `
  <tr>
    <td>${product.name}</td>
    <td>${product.category}</td>
    <td>${product.pricePackWhole}</td>
    <td>${product.pricePiece ?? '-'}</td>
    <td>${product.inStock ? 'Yes' : 'No'}</td>
    <td>
      <button onclick="deleteProduct('${product._id}')">Delete</button>
    </td>
  </tr>
`;
});
}

async function deleteProduct(id) {
if (confirm('Delete this product?')) {
await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
loadProducts();
}
}

// Load products when the products section is shown
document.addEventListener('DOMContentLoaded', () => {
const productsTab = document.querySelector('[onclick="showSection(\'products\')"]');
if (productsTab) {
productsTab.addEventListener('click', loadProducts);
}
});

// Fetch special requests from backend and display in the table
async function loadRequests() {
  const res = await fetch('/api/v1/custom-orders');
  const requests = await res.json();
  const tbody = document.getElementById('requests-tbody');
  tbody.innerHTML = '';
  requests.forEach(req => {
    tbody.innerHTML += `
      <tr>
        <td>${req.firstName} ${req.lastName}</td>
        <td>${req.email}</td>
        <td>${req.phone}</td>
        <td>${req.address}</td>
        <td>${req.description}</td>
        <td>
          ${req.imageUrl ? `<img src="${req.imageUrl}" alt="Request Photo" style="width:40px;height:40px;object-fit:cover;border-radius:5px;" />` : 'N/A'}
        </td>
        <td>${req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : '-'}</td>
        <td>${req.notes || '-'}</td>
        <td><span class="status ${req.status}">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteRequest('${req._id}')">Delete</button>
        </td>
      </tr>
    `;
  });
}

// Load requests when the requests section is shown
document.addEventListener('DOMContentLoaded', () => {
  const requestsTab = document.querySelector('[onclick="showSection(\'requests\')"]');
  if (requestsTab) {
    requestsTab.addEventListener('click', loadRequests);
  }
});
