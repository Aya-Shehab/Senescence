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
- Free delivery for orders over 300 EGP

POLICIES:
- Custom orders require 48-hour advance notice
- We accept cash, card, and online payments
- Returns accepted within 24 hours for quality issues

COMMON ALLERGENS TO WATCH FOR:
- Gluten (wheat, rye, barley)
- Dairy (milk, butter, cream)
- Eggs
- Nuts (almonds, walnuts, peanuts, pecans, pistachio)
- Soy
- Sesame

Be friendly, helpful, and professional. Keep responses concise but informative. When discussing products, always mention their ingredients, tags, and potential allergens.`;

    if (productContext && productContext.length > 0) {
      basePrompt += `\n\nCURRENT PRODUCTS AVAILABLE:\n`;
      productContext.forEach(product => {
        basePrompt += `- ${product.name}: $${product.price} - ${product.description}\n`;
        if (product.ingredients && product.ingredients.length > 0) {
          basePrompt += `  Ingredients: ${product.ingredients.join(', ')}\n`;
        }
        if (product.tags && product.tags.length > 0) {
          basePrompt += `  Tags: ${product.tags.join(', ')}\n`;
        }
        const commonAllergens = ['gluten', 'dairy', 'egg', 'nut', 'soy', 'sesame'];
        const productIngredients = product.ingredients ? product.ingredients.map(i => i.toLowerCase()) : [];
        const allergens = commonAllergens.filter(allergen => 
          productIngredients.some(ingredient => ingredient.includes(allergen))
        );
        if (allergens.length > 0) {
          basePrompt += `  Contains: ${allergens.join(', ')}\n`;
        }
      });
    }

    return basePrompt;
  }

  getFallbackResponse(userMessage) {
    const fallbackResponses = {
      greeting: "Hello! Welcome to Scenescence Bakery! I'm here to help you with information about our products, hours, and services. What would you like to know?",
      hours: "We're open Monday-Saturday 6:00 AM - 8:00 PM, and Sunday 7:00 AM - 6:00 PM. How can I help you today?",
      products: "We offer fresh cakes, breads, pastries, and more! All our products are made with high-quality ingredients, and we're happy to provide detailed ingredient lists and allergen information for any product. You can browse our full menu on our website or call us at (555) 123-CAKE for details. We also offer gluten-free, vegan, and sugar-free options!",
      orders: "For custom orders, we require 48-hour advance notice. You can place orders online or call us at (555) 123-CAKE. We can accommodate special dietary requirements and will provide detailed ingredient information for all custom orders.",
      allergens: "We take food allergies very seriously. Our products may contain common allergens including gluten, dairy, eggs, nuts, soy, and sesame. Please let us know about any allergies when ordering, and we'll help you find safe options. All ingredients are listed on our product pages.",
      default: "I'm here to help with information about Senescence Bakery! You can ask about our products, hours, orders, or services. If you need immediate assistance, please call us at (555) 123-CAKE."
    };

    const message = userMessage.toLowerCase();
    if (message.includes('hello') || message.includes('hi')) return fallbackResponses.greeting;
    if (message.includes('hours') || message.includes('open')) return fallbackResponses.hours;
    if (message.includes('product') || message.includes('menu')) return fallbackResponses.products;
    if (message.includes('order')) return fallbackResponses.orders;
    if (message.includes('allerg') || message.includes('ingredient')) return fallbackResponses.allergens;
    
    return fallbackResponses.default;
  }
}

export default new GroqService();