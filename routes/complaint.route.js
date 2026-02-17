import express from 'express';
import {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getDeletedComplaints,
  restoreComplaint,
  permanentlyDeleteComplaint,
  getComplaintsByEmail
} from '../controllers/complaint.controller.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllComplaints);
router.get('/deleted', auth, getDeletedComplaints); // Use auth to protect bin
router.get('/user/:email', getComplaintsByEmail);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.put('/:id', auth, updateComplaintStatus);
router.put('/:id/restore', auth, restoreComplaint);
router.delete('/:id', auth, deleteComplaint);
router.delete('/:id/permanent', auth, permanentlyDeleteComplaint);

export default router;
