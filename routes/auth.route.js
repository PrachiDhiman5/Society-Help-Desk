import express from 'express';
import { login, setupAdmin, googleLogin, logout, registerResident } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/register', registerResident);
router.post('/logout', auth, logout);
router.post('/setup-admin', setupAdmin);

export default router;
