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
        const response = await fetch('/api/v1/custom-orders');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();
        
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
        }
    } catch (error) {
        console.error('Error loading custom orders:', error);
        showNotification('Error loading custom orders: ' + error.message, 'error');
    }
}

function createOrderRow(order) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${order.firstName} ${order.lastName}</td>
        <td>${order.email}</td>
        <td>${order.phone}</td>
        <td>${order.address}</td>
        <td>${order.description}</td>
        <td>${order.imageUrl ? `<img src="${order.imageUrl}" alt="Order" style="max-width: 50px;">` : 'No image'}</td>
        <td>${order.preferredDate ? new Date(order.preferredDate).toLocaleDateString() : 'Not specified'}</td>
        <td>${order.notes || 'No notes'}</td>
        <td><span class="badge bg-${getStatusColor(order.status)}">${order.status}</span></td>
        <td>
            <div class="btn-group">
                <button class="btn btn-sm btn-primary" onclick="editRequest('${order._id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRequest('${order._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'completed': return 'success';
        case 'cancelled': return 'danger';
        default: return 'secondary';
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

async function deleteRequest(id) {
    if (!confirm('Are you sure you want to delete this request?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/v1/custom-orders/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification('Request deleted successfully', 'success');
        loadCustomOrders();
    } catch (error) {
        console.error('Error deleting request:', error);
        showNotification('Error deleting request: ' + error.message, 'error');
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            showNotification(
                `Request ${currentRequestId ? 'updated' : 'created'} successfully`,
                'success'
            );
            hideRequestForm();
            loadCustomOrders();
        } catch (error) {
            console.error('Error saving request:', error);
            showNotification('Error saving request: ' + error.message, 'error');
        }
    });
}

function showNotification(message, type = 'info') {
    // You can implement your preferred notification system here
    alert(message);
} 