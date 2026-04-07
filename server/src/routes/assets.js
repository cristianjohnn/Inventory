import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { createAssetSchema, updateAssetSchema, assignEmployeeSchema } from '../utils/schemas.js';
import {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  assignEmployee,
  unassignEmployee,
  getAssetHistory,
} from '../controllers/assetController.js';

const router = Router();

// Asset CRUD
router.get('/', listAssets);
router.get('/:id', getAsset);
router.post('/', validate(createAssetSchema), createAsset);
router.put('/:id', validate(updateAssetSchema), updateAsset);
router.delete('/:id', deleteAsset);

// Assignment
router.post('/:id/assign', validate(assignEmployeeSchema), assignEmployee);
router.post('/:id/unassign', unassignEmployee);

// Audit history
router.get('/:id/history', getAssetHistory);

export default router;
