// Fetch all products from the database
async function fetchProducts() {
    console.log('Fetching products...');
    try {
        const response = await fetch('/api/v1/products');
        console.log('Response status:', response.status);
        const products = await response.json();
        console.log('Products received:', products);
        displayProducts(products);
        document.getElementById('totalItems').textContent = products.length;
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Error loading products');
    }
}

// Display products in the table
function displayProducts(products) {
    console.log('Displaying products...');
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) {
        console.error('Could not find inventory-tbody element');
        return;
    }
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td><img src="${product.imageUrl || '/images/placeholder.jpg'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
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
        tbody.appendChild(row);
    });
}

// Show add product form
function showAddProductForm() {
    console.log('Showing add product form...');
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('productForm').style.display = 'block';
    document.getElementById('inventoryForm').reset();
    document.getElementById('productId').value = '';
}

// Hide product form
function hideProductForm() {
    console.log('Hiding product form...');
    document.getElementById('productForm').style.display = 'none';
}

// Edit product
async function editProduct(productId) {
    console.log('Editing product:', productId);
    try {
        const response = await fetch(`/api/v1/products/${productId}`);
        console.log('Edit response status:', response.status);
        const product = await response.json();
        console.log('Product to edit:', product);
        
        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('productForm').style.display = 'block';
        document.getElementById('productId').value = product._id;
        document.getElementById('name').value = product.name;
        document.getElementById('category').value = product.category;
        document.getElementById('imageUrl').value = product.imageUrl;
        document.getElementById('pricePackWhole').value = product.pricePackWhole;
        document.getElementById('pricePiece').value = product.pricePiece;
        document.getElementById('description').value = product.description;
        document.getElementById('ingredients').value = product.ingredients.join(', ');
        document.getElementById('inStock').value = product.inStock;
        document.getElementById('quantity').value = product.quantity;
        document.getElementById('tags').value = product.tags.join(', ');
    } catch (error) {
        console.error('Error fetching product:', error);
        alert('Error loading product details');
    }
}

// Delete product
async function deleteProduct(productId) {
    console.log('Deleting product:', productId);
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/api/v1/products/${productId}`, {
                method: 'DELETE'
            });
            console.log('Delete response status:', response.status);

            if (response.ok) {
                fetchProducts();
                alert('Product deleted successfully');
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    }
}

// Handle form submission
document.getElementById('inventoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    const productId = document.getElementById('productId').value;
    const formData = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        imageUrl: document.getElementById('imageUrl').value,
        pricePackWhole: parseFloat(document.getElementById('pricePackWhole').value),
        pricePiece: parseFloat(document.getElementById('pricePiece').value) || undefined,
        description: document.getElementById('description').value,
        ingredients: document.getElementById('ingredients').value.split(',').map(i => i.trim()).filter(i => i),
        inStock: document.getElementById('inStock').value === 'true',
        quantity: parseInt(document.getElementById('quantity').value) || 0,
        tags: document.getElementById('tags').value.split(',').map(t => t.trim()).filter(t => t)
    };

    console.log('Form data being sent:', formData);

    try {
        const url = productId ? `/api/v1/products/${productId}` : '/api/v1/products';
        const method = productId ? 'PUT' : 'POST';
        console.log('Sending request to:', url, 'with method:', method);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error('Server returned non-JSON response');
        }

        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (response.ok) {
            fetchProducts();
            hideProductForm();
            alert(productId ? 'Product updated successfully' : 'Product added successfully');
        } else {
            console.error('Error response:', responseData);
            alert('Failed to save product: ' + (responseData.message || responseData.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + (error.message || 'Unknown error occurred'));
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing inventory page');
    fetchProducts();
}); 