 import mongoose from 'mongoose';
const feedbackSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    trim: true,
    default: ''
  },
  respondedAt: {
    type: Date
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Feedback = mongoose.model('feedback', feedbackSchema);
export default Feedback;
