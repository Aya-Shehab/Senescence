
// Section Navigation Function
function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active-section');
  });
  document.getElementById(id).classList.add('active-section');
}


// Dashboard Charts Initialization
document.addEventListener('DOMContentLoaded', function() {
  const salesCtx = document.getElementById('salesChart').getContext('2d');
  new Chart(salesCtx, {
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // Total Income Chart Configuration
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
});


// Dashboard Widget Updates
function updateWidget() {
  const amount = document.querySelector('.amount');
  const change = document.querySelector('.change');
  const newAmount = Math.floor(Math.random() * 5000 + 1000);
  const newChange = (Math.random() * 30).toFixed(2);
  amount.textContent = `$${newAmount}`;
  change.textContent = `+${newChange}%`;
}




chart.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});


// Order Management - Status Filter and Actions
document.addEventListener("DOMContentLoaded", function () {
  // Status Filter Implementation
  const filter = document.getElementById("statusFilter");

  filter.addEventListener("change", function () {
    const status = this.value;
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const statusText = row.querySelector(".status").textContent.trim();
      row.style.display = (status === "All" || statusText === status) ? "" : "none";
    });
  });
});

// Account Management - Profile and Password
document.addEventListener('DOMContentLoaded', function() {
  // Profile Form Handler
  const accountForm = document.getElementById('accountForm');
  if (accountForm) {
    accountForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Profile updated successfully!');
    });
  }

  // Password Form Handler
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

// Session Management
function terminateSession(button) {
  if (confirm('End this session?')) {
    button.closest('tr').remove();
    alert('Session ended successfully.');
  }
}



// Feedback Management

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


// Order Management

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

// User Management
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

// Product Management
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


// Special Requests Management
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

// Custom Orders Management
async function loadCustomOrders() {
  try {
    const response = await fetch('/api/v1/custom-orders');
    if (!response.ok) {
      throw new Error('Failed to fetch custom orders');
    }
    const orders = await response.json();
    const tbody = document.getElementById('requests-tbody');
    tbody.innerHTML = '';

    // Update total requests count
    document.getElementById('totalRequests').textContent = orders.length;

    orders.forEach(order => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <strong>${order.firstName} ${order.lastName}</strong>
        </td>
        <td>
          <div><i class="bi bi-envelope"></i> ${order.email}</div>
          <div><i class="bi bi-telephone"></i> ${order.phone}</div>
          <div><i class="bi bi-geo-alt"></i> ${order.address}</div>
        </td>
        <td>
          <div class="order-details">
            <div class="mb-2"><strong>Description:</strong> ${order.description}</div>
            ${order.imageUrl ? `<div class="mb-2"><img src="${order.imageUrl}" alt="Order Image" style="max-width: 100px; border-radius: 4px;"></div>` : ''}
            ${order.preferredDate ? `<div><strong>Preferred Date:</strong> ${new Date(order.preferredDate).toLocaleDateString()}</div>` : ''}
            ${order.notes ? `<div class="mt-2"><strong>Notes:</strong> ${order.notes}</div>` : ''}
          </div>
        </td>
        <td>
          <select class="form-select form-select-sm" onchange="updateRequestStatus('${order._id}', this.value)">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>${new Date(order.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-primary btn-sm me-1" onclick="editRequest('${order._id}')">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteRequest('${order._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading custom orders:', error);
    alert('Failed to load custom orders. Please try again.');
  }
}

async function updateRequestStatus(requestId, newStatus) {
  try {
    const response = await fetch(`/api/v1/custom-orders/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error('Failed to update request status');
    }

    await loadCustomOrders(); // Refresh the requests list
    alert('Request status updated successfully');
  } catch (error) {
    console.error('Error updating request status:', error);
    alert('Failed to update request status');
  }
}

async function deleteRequest(requestId) {
  if (!confirm('Are you sure you want to delete this request?')) {
    return;
  }

  try {
    const response = await fetch(`/api/v1/custom-orders/${requestId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete request');
    }

    await loadCustomOrders(); // Refresh the requests list
    alert('Request deleted successfully');
  } catch (error) {
    console.error('Error deleting request:', error);
    alert('Failed to delete request');
  }
}

function editRequest(requestId) {
  showAddRequestForm();


  // Fetch and populate the form data
  fetch(`/api/v1/custom-orders/${requestId}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('requestId').value = data._id;
      document.getElementById('firstName').value = data.firstName;
      document.getElementById('lastName').value = data.lastName;
      document.getElementById('email').value = data.email;
      document.getElementById('phone').value = data.phone;
      document.getElementById('address').value = data.address;
      document.getElementById('description').value = data.description;
      document.getElementById('imageUrl').value = data.imageUrl || '';
      document.getElementById('preferredDate').value = data.preferredDate ? new Date(data.preferredDate).toISOString().split('T')[0] : '';
      document.getElementById('notes').value = data.notes || '';
      document.getElementById('status').value = data.status;
      document.getElementById('formTitle').textContent = 'Edit Request';
    })
    .catch(error => {
      console.error('Error fetching request data:', error);
      alert('Failed to load request data');
    });
}


// Role Management
document.querySelectorAll(".user-role-select").forEach(select => {
  select.addEventListener("change", async () => {
    const userId = select.getAttribute("data-id");
    const newRole = select.value;

    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        alert("User role updated successfully");
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Error updating user role");
    }
  });
});

// Debug Function
console.log('Custom Orders script loaded');

// Event Delegation for Action Menu
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

// Load Custom Orders
document.addEventListener('DOMContentLoaded', () => {
  const requestsTab = document.querySelector('[onclick="showSection(\'requests\')"]');
  if (requestsTab) {
    requestsTab.addEventListener('click', loadCustomOrders);
  }
});

// Load Orders
document.addEventListener('DOMContentLoaded', () => {
  const ordersTab = document.querySelector('[onclick="showSection(\'orders\')"]');
  if (ordersTab) {
    ordersTab.addEventListener('click', loadOrders);
  }
});

// Load Users

document.addEventListener('DOMContentLoaded', () => {
  const usersTab = document.querySelector('[onclick="showSection(\'users\')"]');
  if (usersTab) {
    usersTab.addEventListener('click', loadUsers);
  }
});

// Load Products
document.addEventListener('DOMContentLoaded', () => {
  const productsTab = document.querySelector('[onclick="showSection(\'products\')"]');
  if (productsTab) {
    productsTab.addEventListener('click', loadProducts);
  }
});

// Load Requests
document.addEventListener('DOMContentLoaded', () => {
  const requestsTab = document.querySelector('[onclick="showSection(\'requests\')"]');
  if (requestsTab) {
    requestsTab.addEventListener('click', loadRequests);
  }
});

  