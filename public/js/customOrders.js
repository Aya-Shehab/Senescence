// DOM Elements
let requestsTbody;
let totalRequests;
let requestForm;
let customOrderForm;
let formTitle;

// State
let currentRequestId = null;

// Initialize DOM elements
function initializeElements() {
    requestsTbody = document.getElementById('requests-tbody');
    totalRequests = document.getElementById('totalRequests');
    requestForm = document.getElementById('requestForm');
    customOrderForm = document.getElementById('customOrderForm');
    formTitle = document.getElementById('formTitle');

    // Check if all required elements exist
    if (!requestsTbody || !totalRequests || !requestForm || !customOrderForm || !formTitle) {
        console.error('Required DOM elements not found');
        return false;
    }
    return true;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing custom orders');
    if (initializeElements()) {
        loadCustomOrders();
        setupFormListeners();
    } else {
        console.error('Failed to initialize custom orders functionality');
    }
});

// Functions
async function loadCustomOrders() {
    try {
        console.log('Loading custom orders...');
        const response = await fetch('/api/v1/custom-orders');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();
        console.log('Loaded orders:', orders);
        
        // Update total count
        if (totalRequests) {
            totalRequests.textContent = orders.length;
        }
        
        // Clear existing rows
        if (requestsTbody) {
            requestsTbody.innerHTML = '';
            
            // Add new rows
            orders.forEach(order => {
                const row = createOrderRow(order);
                requestsTbody.appendChild(row);
            });
        } else {
            console.error('Requests tbody not found');
        }
    } catch (error) {
        console.error('Error loading custom orders:', error);
        showNotification('Error loading custom orders: ' + error.message, 'error');
    }
}

function createOrderRow(order) {
    console.log('Creating row for order:', order);
    const row = document.createElement('tr');
    
    // Create main row content
    row.innerHTML = `
        <td>${order.firstName} ${order.lastName}</td>
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

    return row;
}

async function updateRequestStatus(requestId, newStatus) {
    try {
        const response = await fetch(`/api/v1/custom-orders/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update request status');
        }

        await loadCustomOrders(); // Refresh the list
        showNotification('Request status updated successfully', 'success');
    } catch (error) {
        console.error('Error updating request status:', error);
        showNotification('Failed to update request status', 'error');
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

        await loadCustomOrders(); // Refresh the list
        showNotification('Request deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting request:', error);
        showNotification('Failed to delete request', 'error');
    }
}

function showAddRequestForm() {
    if (!requestForm || !formTitle || !customOrderForm) {
        console.error('Required form elements not found');
        return;
    }

    currentRequestId = null;
    formTitle.textContent = 'Add New Request';
    customOrderForm.reset();
    requestForm.style.display = 'block';
}

function hideRequestForm() {
    if (!requestForm || !customOrderForm) {
        console.error('Required form elements not found');
        return;
    }

    requestForm.style.display = 'none';
    customOrderForm.reset();
    currentRequestId = null;
}

async function editRequest(id) {
    try {
        const response = await fetch(`/api/v1/custom-orders/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const order = await response.json();
        
        if (!requestForm || !formTitle || !customOrderForm) {
            throw new Error('Required form elements not found');
        }
        
        currentRequestId = id;
        formTitle.textContent = 'Edit Request';
        
        // Fill form with order data
        const elements = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            address: document.getElementById('address'),
            description: document.getElementById('description'),
            imageUrl: document.getElementById('imageUrl'),
            preferredDate: document.getElementById('preferredDate'),
            notes: document.getElementById('notes'),
            status: document.getElementById('status')
        };

        // Check if all form elements exist
        for (const [key, element] of Object.entries(elements)) {
            if (!element) {
                throw new Error(`Form element ${key} not found`);
            }
        }

        // Set form values
        elements.firstName.value = order.firstName;
        elements.lastName.value = order.lastName;
        elements.email.value = order.email;
        elements.phone.value = order.phone;
        elements.address.value = order.address;
        elements.description.value = order.description;
        elements.imageUrl.value = order.imageUrl || '';
        elements.preferredDate.value = order.preferredDate ? order.preferredDate.split('T')[0] : '';
        elements.notes.value = order.notes || '';
        elements.status.value = order.status;
        
        requestForm.style.display = 'block';
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Error loading order details: ' + error.message, 'error');
    }
}

function setupFormListeners() {
    if (!customOrderForm) {
        console.error('Custom order form not found');
        return;
    }

    customOrderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(customOrderForm);
        const orderData = Object.fromEntries(formData.entries());
        
        try {
            const url = currentRequestId 
                ? `/api/v1/custom-orders/${currentRequestId}`
                : '/api/v1/custom-orders';
                
            const method = currentRequestId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            showNotification(result.message || 'Request saved successfully', 'success');
            hideRequestForm();
            await loadCustomOrders();
        } catch (error) {
            console.error('Error saving request:', error);
            showNotification(error.message || 'Error saving request', 'error');
        }
    });
}

function showNotification(message, type = 'info') {
    // You can implement your preferred notification system here
    alert(message);
}

// Add some CSS for the details row
const style = document.createElement('style');
style.textContent = `
    .details-row {
        background-color: #f8f9fa;
    }
    .details-content {
        border-top: 1px solid #dee2e6;
    }
    .img-thumbnail {
        max-height: 200px;
        object-fit: contain;
    }
`;
document.head.appendChild(style); 