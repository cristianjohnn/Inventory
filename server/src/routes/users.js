import { Router } from 'express';
import { getProfile, updateProfile, changePassword, updatePreferences } from '../controllers/userController.js';

const router = Router();

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/password', changePassword);
router.put('/me/preferences', updatePreferences);

export default router;
