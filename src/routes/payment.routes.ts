import express from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { createPaymentSchema, getPaymentHistoryQuerySchema, getPaymentByIdParamsSchema, confirmPaymentQuerySchema } from '../utils/payment.validation';

const router = express.Router();

// Middleware to validate request body/query
const validate = (schema: any, source: 'body' | 'query' = 'body') => (req: any, res: any, next: any) => {
  try {
    schema.parse(source === 'query' ? req.query : req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || 'Validation error', errorDetails: error });
  }
};

router.post(
  '/create',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(createPaymentSchema),
  paymentController.createPayment,
);

router.post(
  '/confirm',
  validate(confirmPaymentQuerySchema, 'query'),
  paymentController.confirmPayment,
);

router.get(
  '/',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(getPaymentHistoryQuerySchema, 'query'),
  paymentController.getPaymentHistory,
);

router.get(
  '/:paymentId',
  authenticate,
  authorize(UserRole.CUSTOMER),
  validate(getPaymentByIdParamsSchema, 'query'),
  paymentController.getPaymentById,
);

export default router;
