import express from 'express';
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint
} from '../controllers/complaint.controller.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.put('/:id', auth, updateComplaintStatus);
router.delete('/:id', auth, deleteComplaint);

export default router;
 