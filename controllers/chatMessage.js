import ChatMessage from '../models/chatMessage.js';
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

      // Save user message
      const userMessage = new ChatMessage({
        sessionId,
        userId: req.user?.id || null, // null lw not signed in
        message,
        response: '', // empty for user messages
        sender: 'user',
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });

      // save bot response
      const botMessage = new ChatMessage({
        sessionId,
        userId: req.user?.id || null,
        message: '', // empty for bot messages
        response: aiResponse,
        sender: 'bot',
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress
        }
      });

      // Save both messages
      await Promise.all([userMessage.save(), botMessage.save()]);

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

      await ChatMessage.deleteMany({ sessionId });

      res.json({
        success: true,
        message: 'Chat history cleared successfully'
      });

    } catch (error) {
      console.error('Clear Chat History Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear chat history'
      });
    }
  }

  