import GroqService from '../services/groqService.js';
import Product from '../models/product.js'; 


  // send a message to chatbot
  export const sendMessage = async (req, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Message and sessionId are required'
        });
      }

      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Message too long. Maximum 1000 characters.'
        });
      }

      const recentProducts = await Product.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name description price category')
        .lean();

      // generate AI response
      const aiResponse = await GroqService.generateResponse(message, recentProducts);

      // NOTE: History persistence has been removed to simplify the setup.

      res.json({
        success: true,
        response: aiResponse,
        sessionId
      });

    } catch (error) {
      console.error('Chat Controller Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error. Please try again.'
      });
    }
  }

  // Clear chat history for a session
export const clearChatHistory = async (req, res) => {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      // Nothing to clear because we no longer store chat logs.
      res.json({
        success: true,
        message: 'Chat history cleared (no-op)'
      });

    } catch (error) {
      console.error('Clear Chat History Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear chat history'
      });
    }
  }

  