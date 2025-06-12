// DOM Elements
let inventoryForm;
let productForm;
let inventoryTbody;
let totalItems;

// Initialize DOM elements
function initializeElements() {
    inventoryForm = document.getElementById('inventoryForm');
    productForm = document.getElementById('productForm');
    inventoryTbody = document.getElementById('inventory-tbody');
    totalItems = document.getElementById('totalItems');

    // Check if all required elements exist
    if (!inventoryForm || !productForm || !inventoryTbody || !totalItems) {
        console.error('Required DOM elements not found:', {
            inventoryForm: !!inventoryForm,
            productForm: !!productForm,
            inventoryTbody: !!inventoryTbody,
            totalItems: !!totalItems
        });
        return false;
    }
    return true;
}

// Load products when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (initializeElements()) {
        loadProducts();
        setupEventListeners();
    } else {
        console.error('Failed to initialize inventory management system');
    }
});

// Setup event listeners
function setupEventListeners() {
    if (inventoryForm) {
        inventoryForm.addEventListener('submit', handleFormSubmit);
    }
}

// Show add product form
function showAddProductForm() {
    if (!productForm) return;
    
    const formTitle = document.getElementById('formTitle');
    if (formTitle) {
        formTitle.textContent = 'Add New Product';
    }
    
    if (inventoryForm) {
        inventoryForm.reset();
    }
    
    const productIdInput = document.getElementById('productId');
    if (productIdInput) {
        productIdInput.value = '';
    }
    
    productForm.style.display = 'block';
}

// Hide product form
function hideProductForm() {
    if (!productForm || !inventoryForm) return;
    
    productForm.style.display = 'none';
    inventoryForm.reset();
}

// Load all products
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await fetch('/api/v1/products');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log('Products loaded:', products);
        
        // Update total items count
        if (totalItems) {
            totalItems.textContent = products.length;
        }
        
        // Clear existing table rows
        if (inventoryTbody) {
            inventoryTbody.innerHTML = '';
            
            // Add each product to the table
            products.forEach(product => {
                const row = createProductRow(product);
                inventoryTbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Error loading products: ' + error.message);
    }
}

// Create a table row for a product
function createProductRow(product) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>
            <img src="${product.imageUrl || '/images/placeholder.jpg'}" 
                 alt="${product.name}"
                 style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
        </td>
        <td>$${product.pricePackWhole.toFixed(2)}</td>
        <td>${product.pricePiece ? '$' + product.pricePiece.toFixed(2) : 'N/A'}</td>
        <td>${product.description || 'N/A'}</td>
        <td>${product.ingredients.join(', ') || 'N/A'}</td>
        <td>${product.inStock ? 'Yes' : 'No'}</td>
        <td>${product.quantity}</td>
        <td>${product.tags.join(', ') || 'N/A'}</td>
        <td>
            <button class="btn btn-sm btn-primary" onclick="editProduct('${product._id}')">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    return row;
}

// Edit product
async function editProduct(productId) {
    try {
        console.log('Editing product:', productId);
        const response = await fetch(`/api/v1/products/${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const product = await response.json();
        console.log('Product data:', product);
        
        // Fill form with product data
        const formFields = {
            'productId': product._id,
            'name': product.name,
            'category': product.category,
            'imageUrl': product.imageUrl || '',
            'pricePackWhole': product.pricePackWhole,
            'pricePiece': product.pricePiece || '',
            'description': product.description || '',
            'ingredients': product.ingredients.join(', '),
            'inStock': product.inStock,
            'quantity': product.quantity,
            'tags': product.tags.join(', ')
        };

        // Update form fields
        Object.entries(formFields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
        
        // Show form
        const formTitle = document.getElementById('formTitle');
        if (formTitle) {
            formTitle.textContent = 'Edit Product';
        }
        
        if (productForm) {
            productForm.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product details: ' + error.message);
    }
}

// Delete product
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            console.log('Deleting product:', productId);
            const response = await fetch(`/api/v1/products/${productId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            loadProducts(); // Reload the table
            alert('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product: ' + error.message);
        }
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId')?.value;
    const formData = {
        name: document.getElementById('name')?.value,
        category: document.getElementById('category')?.value,
        imageUrl: document.getElementById('imageUrl')?.value,
        pricePackWhole: parseFloat(document.getElementById('pricePackWhole')?.value),
        pricePiece: parseFloat(document.getElementById('pricePiece')?.value) || undefined,
        description: document.getElementById('description')?.value,
        ingredients: document.getElementById('ingredients')?.value.split(',').map(i => i.trim()).filter(i => i),
        inStock: document.getElementById('inStock')?.value === 'true',
        quantity: parseInt(document.getElementById('quantity')?.value),
        tags: document.getElementById('tags')?.value.split(',').map(t => t.trim()).filter(t => t)
    };
    
    try {
        console.log('Submitting form data:', formData);
        const url = productId ? 
            `/api/v1/products/${productId}` : 
            '/api/v1/products';
            
        const response = await fetch(url, {
            method: productId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save product');
        }
        
        hideProductForm();
        loadProducts(); // Reload the table
        alert(productId ? 'Product updated successfully' : 'Product added successfully');
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + error.message);
    }
} 