// Account Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    initAccountPage();
});

function initAccountPage() {
    // Add click handlers
    setupNavigationHandlers();
    setupButtonHandlers();
    setupAnimations();
    
    // Load user data (simulated)
    loadUserData();
}

// Navigation handlers
function setupNavigationHandlers() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.parentElement.classList.add('active');
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Button handlers
function setupButtonHandlers() {
    // Redeem button
    const redeemBtn = document.querySelector('.redeem-btn');
    if (redeemBtn) {
        redeemBtn.addEventListener('click', function() {
            showNotification('Rewards page coming soon! 🎁', 'info');
            animateButton(this);
        });
    }
    
    // Action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            
            switch(text) {
                case 'Start New Order':
                    showNotification('Redirecting to shop... 🛒', 'success');
                    break;
                case 'Reorder Favorites':
                    showNotification('Loading your favorites... ❤️', 'info');
                    break;
                case 'Custom Order':
                    showNotification('Opening custom order form... 📝', 'info');
                    break;
            }
            
            animateButton(this);
        });
    });
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to sign out?')) {
                showNotification('Signing out... See you soon! 👋', 'info');
                // Simulate logout
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            }
        });
    }
}

// Animation setup
function setupAnimations() {
    // Animate cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    document.querySelectorAll('.account-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
    
    // Floating animation for loyalty points
    animateLoyaltyCard();
}

// Load user data (simulated)
function loadUserData() {
    // Simulate loading user preferences
    const userData = {
        name: 'Sarah',
        totalOrders: 24,
        monthlyOrders: 3,
        totalSpent: 342.50,
        savings: 45,
        favoriteCategory: 'Croissants',
        categoryOrders: 8,
        loyaltyPoints: 1250
    };
    
    // Update UI with user data (already set in HTML for demo)
    console.log('User data loaded:', userData);
}

// Utility functions
function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
}

function animateLoyaltyCard() {
    const loyaltyCard = document.querySelector('.loyalty-card');
    if (loyaltyCard) {
        setInterval(() => {
            loyaltyCard.style.transform = 'translateY(-2px)';
            setTimeout(() => {
                loyaltyCard.style.transform = 'translateY(0)';
            }, 1000);
        }, 3000);
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-text">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Update points animation
function updateLoyaltyPoints(newPoints) {
    const pointsElement = document.querySelector('.loyalty-points');
    if (pointsElement) {
        pointsElement.style.transform = 'scale(1.2)';
        pointsElement.style.color = '#e74c3c';
        
        setTimeout(() => {
            pointsElement.textContent = newPoints + ' pts';
            pointsElement.style.transform = 'scale(1)';
            pointsElement.style.color = '';
        }, 300);
    }
}