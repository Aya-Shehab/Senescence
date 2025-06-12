// Order Management Functions
let orders = [];

// Fetch all orders
async function fetchOrders() {
    try {
        const response = await fetch('/api/v1/order');
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        orders = await response.json();
        displayOrders();
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Failed to fetch orders');
    }
}

// Display orders in the table
function displayOrders() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';

    // Update order counts
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = orders.filter(order => order.status === 'Pending').length;

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.shippingInfo.firstName} ${order.shippingInfo.lastName}</td>
            <td>${order.shippingInfo.email}</td>
            <td>${order.shippingInfo.phone}</td>
            <td>${order.shippingInfo.address.street}, ${order.shippingInfo.address.city}, ${order.shippingInfo.address.governorate}</td>
            <td>${order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</td>
            <td>$${order.totalPrice.toFixed(2)}</td>
            <td>
                <select class="status-select" data-order-id="${order._id}" onchange="updateOrderStatus('${order._id}', this.value)">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${order.paymentStatus}</td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetails('${order._id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/v1/order/status/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update order status');
        }

        const result = await response.json();
        if (result.message) {
            await fetchOrders(); // Refresh the orders list
            alert('Order status updated successfully');
        }
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
        const response = await fetch(`/api/v1/order/cancel/${orderId}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            throw new Error('Failed to delete order');
        }

        const result = await response.json();
        if (result.message) {
            await fetchOrders(); // Refresh the orders list
            alert('Order cancelled successfully');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order');
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'orderDetailsModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Order Details - ${order.orderNumber}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Customer Information</h6>
                            <p>Name: ${order.shippingInfo.firstName} ${order.shippingInfo.lastName}</p>
                            <p>Email: ${order.shippingInfo.email}</p>
                            <p>Phone: ${order.shippingInfo.phone}</p>
                            <p>Address: ${order.shippingInfo.address.street}, ${order.shippingInfo.address.city}, ${order.shippingInfo.address.governorate}</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Order Information</h6>
                            <p>Status: ${order.status}</p>
                            <p>Payment Method: ${order.paymentMethod}</p>
                            <p>Payment Status: ${order.paymentStatus}</p>
                            <p>Total Items: ${order.totalItems}</p>
                            <p>Total Price: $${order.totalPrice.toFixed(2)}</p>
                            <p>Order Date: ${new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Order Items</h6>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.items.map(item => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td>${item.quantity}</td>
                                            <td>$${item.price.toFixed(2)}</td>
                                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// Initialize orders when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
}); 