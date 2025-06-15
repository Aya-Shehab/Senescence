
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('orderNumber');
    const amount = urlParams.get('amount');
    const paymentMethod = urlParams.get('paymentMethod');

    document.getElementById('orderNumber').textContent = orderNumber || 'N/A';
    document.getElementById('orderAmount').textContent = amount ? `$${amount}` : 'N/A';
    document.getElementById('paymentMethod').textContent = paymentMethod === 'cash' ? 'Cash on Delivery' : 'Credit Card';
});
