class Chatbot {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.isOpen = false;
        this.isLoading = false;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.chatToggle = document.getElementById('chatToggle');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearChat = document.getElementById('clearChat');
        this.typingIndicator = document.getElementById('typingIndicator');
    }

    attachEventListeners() {
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

       
        this.clearChat.addEventListener('click', () => this.clearChatHistory());
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatWindow.classList.toggle('active', this.isOpen);
        this.chatToggle.classList.toggle('active', this.isOpen);

        if (this.isOpen) {
            this.messageInput.focus();
            this.scrollToBottom();
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.setLoading(true);

        try {
            const response = await fetch('/api/v1/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.addMessage(data.response, 'bot');
            } else {
                this.showError(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.showError('Connection error. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(content, sender) {
        // Remove welcome message if it exists
        const welcomeMsg = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = content;
        
        messageDiv.appendChild(bubbleDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.chatMessages.appendChild(errorDiv);
        this.scrollToBottom();
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        this.messageInput.disabled = loading;
        this.typingIndicator.classList.toggle('active', loading);
        
        if (loading) {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    async clearChatHistory() {
        if (!confirm('Are you sure you want to clear the chat history?')) {
            return;
        }

        try {
            const response = await fetch(`/api/v1/chat/clear/${this.sessionId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="icon">👨‍🍳</div>
                        <h4>Welcome!</h4>
                        <p>How can I help you today? Ask me about our cakes, products, or place a custom order!</p>
                    </div>
                `;
                
                this.sessionId = this.generateSessionId();
            } else {
                this.showError('Failed to clear chat history');
            }
        } catch (error) {
            console.error('Failed to clear chat history:', error);
            this.showError('Failed to clear chat history');
        }
    }
}

// chatbot shows when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});