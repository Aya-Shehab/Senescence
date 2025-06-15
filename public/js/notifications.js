/*
 * Global toast/notification helper.
 * ---------------------------------
 * 1. Provides a consistent toast UI across the application (based on Toastify when available).
 * 2. Falls back to a simple custom notification banner when Toastify is not loaded.
 * 3. Overrides the native `window.alert` so existing calls automatically show a toast instead of a blocking dialog.
 */

(function () {
  // ----------------------------------------------------
  
  // ----------------------------------------------------
  const STYLE_ID = 'custom-notification-style';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .custom-notification{position:fixed;top:20px;right:20px;padding:15px 25px;color:#fff;font-size:16px;z-index:9999;display:none;border-radius:4px;animation:slideIn 0.5s ease-out;box-shadow:0 4px 12px rgba(0,0,0,0.15);}
      .notification-success{background-color:#28a745;}
      .notification-error{background-color:#dc3545;}
      .notification-info{background-color:#17a2b8;}
      @keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
      @keyframes slideOut{from{transform:translateX(0);opacity:1;}to{transform:translateX(100%);opacity:0;}}
    `;
    document.head.appendChild(style);
  }

  // ----------------------------------------------------
  
  // ----------------------------------------------------
  function ensureContainer() {
    let container = document.getElementById('notification');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification';
      container.className = 'custom-notification';
      document.body.appendChild(container);
    }
    return container;
  }

  // ----------------------------------------------------
  // Main showNotification function (fallback method)
  // ----------------------------------------------------
  function showFallbackNotification(message, type = 'info') {
    const notification = ensureContainer();
    notification.textContent = message;
    notification.className = `custom-notification notification-${type}`;
    notification.style.display = 'block';

    // Hide after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out forwards';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.animation = 'slideIn 0.5s ease-out';
        }, 500);
    }, 4000);
  }

  // ----------------------------------------------------
  // Public showNotification API (Toastify preferred)
  // ----------------------------------------------------
  function showNotification(message, type = 'info') {
    // If Toastify is available, use it for better UX
    if (window.Toastify) {
      const bgColors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
      };

      window.Toastify({
        text: message,
        duration: 3500,
        close: true,
        gravity: 'top',
        position: 'right',
        style: { background: bgColors[type] || bgColors.info },
      }).showToast();
    } else {
      // Fallback to simple banner
      showFallbackNotification(message, type);
    }
  }

  // Expose globally
  window.showNotification = showNotification;

  // ----------------------------------------------------
  // Override window.alert to use toast instead of blocking dialog
  // ----------------------------------------------------
  window.alert = function (msg) {
    if (typeof msg !== 'string') msg = String(msg);

    const lower = msg.toLowerCase();
    let type = 'info';
    if (lower.includes('success')) type = 'success';
    else if (lower.includes('error') || lower.includes('fail')) type = 'error';

    showNotification(msg, type);
  };

})(); 