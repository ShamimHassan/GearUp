import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

const createPayment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await paymentService.createPaymentInDB(
      req.user.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // SSLCommerz sends params in query string; manual testing may send in body
    const merged = { ...req.body, ...req.query }
    const { orderId, tranId, status } = merged
    const payload = merged

    const response = await paymentService.confirmPayment(
      orderId as string,
      tranId as string,
      status as string,
      payload,
    );

    if (response === 'success') {
      res.status(200).json({
        success: true,
        message: 'Payment completed successfully. Your rental order is now PAID.',
        data: { orderId, transactionId: tranId, status: 'COMPLETED' }
      });
    } else if (response === 'fail') {
      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        data: { orderId, transactionId: tranId, status: 'FAILED' }
      });
    } else if (response === 'cancel') {
      res.status(400).json({
        success: false,
        message: 'Payment was cancelled.',
        data: { orderId, transactionId: tranId, status: 'FAILED' }
      });
    }
  } catch (error) {
    next(error);
  }
};

const getPaymentHistory = async (req: any, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user.id as string;
    const result = await paymentService.getPaymentHistory(
      customerId,
      req.query,
    );

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: result.payments,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user.id as string;
    const paymentId = req.params.paymentId as string;
    const payment = await paymentService.getPaymentById(paymentId, customerId);

    res.status(200).json({
      success: true,
      message: 'Payment details retrieved successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentController = {
  createPayment,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
};
