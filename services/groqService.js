import axios from 'axios';

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama3-8b-8192';
  }

  async generateResponse(userMessage, productContext = null) {
    try {
      const systemPrompt = this.buildSystemPrompt(productContext);
      
      const response = await axios.post(this.apiUrl, {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 300,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000 
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('GroqCloud API Error:', error.response?.data || error.message);
      return this.getFallbackResponse(userMessage);
    }
  }

  buildSystemPrompt(productContext) {
    let basePrompt = `You are a helpful AI assistant for "Scenescense Bakery". 

BAKERY INFORMATION:
- Name: Senescense Bakery
- Hours: Monday-Saturday 6:00 AM - 8:00 PM, Sunday 7:00 AM - 6:00 PM
- Location: Teseen Street, New Cairo, Cairo
- Phone: +201025533920
- Email: senescense@bakery.com

SERVICES:
- Custom cake orders (48-hour notice required)
- Event catering services  
- Daily fresh baking
- Special dietary options (gluten-free, vegan, sugar-free)
- Online ordering available
- Free delivery for orders over $50

POLICIES:
- Custom orders require 48-hour advance notice
- We accept cash, card, and online payments
- Returns accepted within 24 hours for quality issues

Be friendly, helpful, and professional. Keep responses concise but informative.`;

    if (productContext && productContext.length > 0) {
      basePrompt += `\n\nCURRENT PRODUCTS AVAILABLE:\n`;
      productContext.forEach(product => {
        basePrompt += `- ${product.name}: $${product.price} - ${product.description}\n`;
      });
    }

    return basePrompt;
  }

  getFallbackResponse(userMessage) {
    const fallbackResponses = {
      greeting: "Hello! Welcome to Scenescence Bakery! I'm here to help you with information about our products, hours, and services. What would you like to know?",
      hours: "We're open Monday-Saturday 6:00 AM - 8:00 PM, and Sunday 7:00 AM - 6:00 PM. How can I help you today?",
      products: "We offer fresh cakes, breads, pastries, and more! You can browse our full menu on our website or call us at (555) 123-CAKE for details.",
      orders: "For custom orders, we require 48-hour advance notice. You can place orders online or call us at (555) 123-CAKE.",
      default: "I'm here to help with information about Senescence Bakery! You can ask about our products, hours, orders, or services. If you need immediate assistance, please call us at (555) 123-CAKE."
    };

    const message = userMessage.toLowerCase();
    if (message.includes('hello') || message.includes('hi')) return fallbackResponses.greeting;
    if (message.includes('hours') || message.includes('open')) return fallbackResponses.hours;
    if (message.includes('product') || message.includes('menu')) return fallbackResponses.products;
    if (message.includes('order')) return fallbackResponses.orders;
    
    return fallbackResponses.default;
  }
}

export default new GroqService();