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

import auth, { checkAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllComplaints);
router.get('/deleted', auth, checkAdmin, getDeletedComplaints); // Use auth to protect bin
router.get('/user/:email', getComplaintsByEmail);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.put('/:id', auth, checkAdmin, updateComplaintStatus);
router.put('/:id/restore', auth, checkAdmin, restoreComplaint);
router.delete('/:id', auth, checkAdmin, deleteComplaint);
router.delete('/:id/permanent', auth, checkAdmin, permanentlyDeleteComplaint);

export default router;
