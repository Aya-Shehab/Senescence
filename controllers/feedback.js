import Feedback from '../models/feedback.js';

// Create feedback
export const createFeedback = async (req, res) => {
  try {
    const { user, email, message } = req.body;

    if (!user || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newFeedback = new Feedback({
      user,
      email,
      message
    });

    await newFeedback.save();

    return res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Get all feedbacks
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Get a single feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(feedback);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Delete feedback by ID
export const deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const deleted = await Feedback.findByIdAndDelete(feedbackId);

    if (!deleted) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};

// Respond to feedback (admin reply)
export const respondToFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { response } = req.body;

    if (!response || response.trim() === '') {
      return res.status(400).json({ error: "Response message cannot be empty." });
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    feedback.response = response;
    feedback.respondedAt = new Date();
    await feedback.save();

    res.json({ message: "Response sent successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};
