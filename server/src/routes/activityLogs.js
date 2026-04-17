import { Router } from 'express';
import { listActivityLogs, getActivityStats } from '../controllers/activityLogController.js';

const router = Router();

router.get('/', listActivityLogs);
router.get('/stats', getActivityStats);

export default router;
