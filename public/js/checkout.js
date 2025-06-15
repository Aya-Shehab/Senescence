document.addEventListener("DOMContentLoaded", async function () {
    const userId = window.currentUserId;
    if (!userId) {
      window.location.href = '/login?redirect=checkout';
      return;
    }

    const orderItemsList = document.getElementById('orderItemsList');

    // Fetch cart from server
    let serverCart;
    try {
      const res = await fetch(`/api/v1/cart/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch cart');
      serverCart = await res.json();
    } catch (err) {
      console.error(err);
      window.location.href = '/';
      return;
    }

    if (!serverCart.items || serverCart.items.length === 0) {
      window.location.href = '/';
      return;
    }

    let subtotal = 0;

    // Display cart items
    serverCart.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const li = document.createElement('li');
      li.innerHTML = `
        <div class="single-box clearfix">
          <img src="${item.imageUrl}" alt="${item.productName}" />
          <h6>${item.productName} (${item.priceType === 'whole' ? 'Whole' : 'Piece'}) x ${item.quantity}</h6>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
      `;
      orderItemsList.appendChild(li);
    });

    // Add subtotal and shipping
    const shipping = 5.99;
    const total = subtotal + shipping;

    // Add totals to the list
    orderItemsList.innerHTML += `
      <li class="sub-total clearfix">
        <h6>Sub Total</h6>
        <span>$${subtotal.toFixed(2)}</span>
      </li>
      <li class="shipping clearfix">
        <h6>Shipping</h6>
        <span>$${shipping.toFixed(2)}</span>
      </li>
      <li class="order-total clearfix">
        <h6>Order Total</h6>
        <span>$${total.toFixed(2)}</span>
      </li>
    `;

    
    function validateField(field, value) {
      const fieldInput = field.closest('.field-input');
      let isValid = true;
      let errorMessage = '';

      switch(field.name) {
        case 'firstName':
        case 'lastName':
        case 'city':
        case 'street':
          isValid = value.trim() !== '';
          errorMessage = `${field.name.charAt(0).toUpperCase() + field.name.slice(1)} is required`;
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(value);
          errorMessage = 'Please enter a valid email address';
          break;
        case 'phone':
          // Egyptian mobile numbers: 11 digits, start with 010 / 011 / 012 / 015
          const phoneRegex = /^01[0125]\d{8}$/;
          isValid = phoneRegex.test(value);
          errorMessage = 'Phone number must start with 010, 011, 012 or 015 and be 11 digits long';
          break;
        case 'governorate':
          isValid = value !== '';
          errorMessage = 'Please select a governorate';
          break;
        case 'postCode':
          const postCodeRegex = /^\d{6}$/;
          isValid = postCodeRegex.test(value);
          errorMessage = 'Postal code must be 6 digits';
          break;
      }

      if (!isValid) {
        fieldInput.classList.add('error');
        fieldInput.querySelector('.error-message').textContent = errorMessage;
      } else {
        fieldInput.classList.remove('error');
      }

      return isValid;
    }

    function clearErrors() {
      document.querySelectorAll('.field-input').forEach(input => {
        input.classList.remove('error');
      });
      const paymentSec = document.querySelector('.payment-inner');
      if (paymentSec) paymentSec.classList.remove('error');
    }

    function validateForm() {
      let isValid = true;
      const form = document.getElementById('checkout-form');
      const requiredFields = form.querySelectorAll('input[required], select[required]');
      
      let firstInvalid = null;
      
      requiredFields.forEach(field => {
        if (!validateField(field, field.value)) {
          isValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
      const paymentSection = document.querySelector('.payment-inner');
      if (!paymentMethod) {
        // highlight payment section
        paymentSection.classList.add('error');
        isValid = false;
        if (!firstInvalid) firstInvalid = paymentSection;
        // Inform user
        alert('Please select a payment method');
      } else {
        paymentSection.classList.remove('error');
      }

      // Scroll to first invalid element
      if (!isValid && firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // focus if input/select
        if (firstInvalid.focus) firstInvalid.focus();
      }

      return isValid;
    }

    // Form submission handler
    document.getElementById('checkout-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Clear previous error states
      clearErrors();
      
      // Validate form
      if (!validateForm()) {
        return;
      }

      const formData = {
        shippingInfo: {
          firstName: document.querySelector('input[name="firstName"]').value,
          lastName: document.querySelector('input[name="lastName"]').value,
          email: document.querySelector('input[name="email"]').value,
          phone: document.querySelector('input[name="phone"]').value,
          address: {
            street: document.querySelector('input[name="street"]').value,
            city: document.querySelector('input[name="city"]').value,
            postCode: document.querySelector('input[name="postCode"]').value,
            governorate: document.querySelector('select[name="governorate"]').value
          }
        },
        paymentMethod: document.querySelector('input[name="payment_method"]:checked').value
      };

      try {
        const response = await fetch(`/api/v1/orders/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to place order');
        }

        if (formData.paymentMethod === 'card') {
          // Open payment URL in new tab (card payments)
          window.open(data.paymentUrl, '_blank');
        }

        window.location.href = `/order-success?orderNumber=${data.order.orderNumber}&amount=${data.order.amount}&paymentMethod=${data.order.paymentMethod}`;
      } catch (error) {
        alert(error.message || 'An error occurred while placing your order');
      }
    });
  });
