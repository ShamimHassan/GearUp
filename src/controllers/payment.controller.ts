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
    const { orderId, tranId, status } = req.query;
    const payload = { ...req.body, ...req.query };

    const response = await paymentService.confirmPayment(
      orderId as string,
      tranId as string,
      status as string,
      payload,
    );

    if (response === 'success') {
      // Redirect to your frontend success page
      res.redirect(`${process.env.APP_URL}/payment-success`);
    } else if (response === 'fail') {
      // Redirect to your frontend fail page
      res.redirect(`${process.env.APP_URL}/payment-fail`);
    } else if (response === 'cancel') {
      // Redirect to your frontend cancel page
      res.redirect(`${process.env.APP_URL}/payment-cancel`);
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
