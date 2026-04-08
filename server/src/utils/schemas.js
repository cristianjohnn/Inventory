import { z } from 'zod';

// =============================================
// Zod Schemas for Request Validation
// =============================================

const baseAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.string().min(1, 'Category is required').max(100),
  serialNumber: z.string().min(1, 'Serial number is required').max(100),
  purchaseDate: z.string().refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d.getFullYear() >= 1900 && d.getFullYear() <= 2100;
  }, {
    message: 'Invalid date or year out of range',
  }),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  salvageValue: z.number().min(0, 'Salvage value must be >= 0'),
  usefulLifeYears: z.number().int().min(1, 'Useful life must be at least 1 year'),
  depreciationMethod: z.enum([
    'STRAIGHT_LINE', 'DOUBLE_DECLINING', 'UNITS_OF_PRODUCTION',
  ]),
  totalUnits: z.number().int().positive().optional().nullable(),
  unitsUsed: z.number().int().min(0).optional().nullable(),
  assignedEmployee: z.string().max(200).optional().nullable(),
  department: z.enum([
    'ADMIN_DEPARTMENT', 'CORPORATE_DEPARTMENT', 'CUSTOMER_CARE',
    'I_TECH', 'I_WALLET', 'IT_DEPARTMENT', 'IT_SUPPORT',
    'JOINT_VENTURES', 'MARKETING', 'REAL_ESTATE', 'SECRETARY', 'EXECUTIVE'
  ]).optional().nullable(),
  status: z
    .enum(['IN_USE', 'AVAILABLE', 'UNDER_REPAIR', 'RETIRED'])
    .optional()
    .default('AVAILABLE'),
  location: z.string().max(300).optional().nullable(),
  warrantyExpiry: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid warranty date format',
    })
    .optional()
    .nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const createAssetSchema = baseAssetSchema.refine(
  (data) => data.salvageValue < data.purchasePrice,
  { message: 'Salvage value must be less than purchase price', path: ['salvageValue'] }
).refine(
  (data) => {
    if (data.depreciationMethod === 'UNITS_OF_PRODUCTION') {
      return data.totalUnits != null && data.totalUnits > 0;
    }
    return true;
  },
  { message: 'Total units is required for Units of Production method', path: ['totalUnits'] }
);

export const updateAssetSchema = baseAssetSchema.partial().refine(
  (data) => {
    if (data.salvageValue != null && data.purchasePrice != null) {
      return data.salvageValue < data.purchasePrice;
    }
    return true;
  },
  { message: 'Salvage value must be less than purchase price', path: ['salvageValue'] }
);

export const assignEmployeeSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required').max(200),
});
