// Create notification container if it doesn't exist
if (!document.getElementById('notification')) {
    const notificationDiv = document.createElement('div');
    notificationDiv.id = 'notification';
    notificationDiv.className = 'custom-notification';
    document.body.appendChild(notificationDiv);
}

// Notification function
function showNotification(message, type) {
    const notification = $('#notification');
    
    notification
        .removeClass('notification-success notification-error')
        .addClass(`notification-${type}`)
        .text(message)
        .css('display', 'block');

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.css('animation', 'slideOut 0.5s ease-out');
        setTimeout(() => {
            notification.css('display', 'none');
            notification.css('animation', 'slideIn 0.5s ease-out');
        }, 500);
    }, 3000);
} 