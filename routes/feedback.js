import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getFeedbackById,
  deleteFeedback,
  respondToFeedback,
  updateFeedback
} from '../controllers/feedback.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', getAllFeedbacks);
router.get('/:id', getFeedbackById);
router.delete('/:id', deleteFeedback);
router.post('/:id/respond', respondToFeedback);
router.put('/:id', updateFeedback);

export default router;
