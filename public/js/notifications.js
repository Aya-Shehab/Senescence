function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `custom-notification notification-${type}`;
    notification.style.display = 'block';

    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out forwards';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.animation = 'slideIn 0.5s ease-out';
        }, 500);
    }, 5000);
} 