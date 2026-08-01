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

    const frontendUrl = process.env.FRONTEND_URL || 'https://gearup-frontend-nu.vercel.app'

    const response = await paymentService.confirmPayment(
      orderId as string,
      tranId as string,
      status as string,
      payload,
    );

    if (response === 'success') {
      // Redirect to frontend success page with query params
      return res.redirect(
        `${frontendUrl}/payment/success?order_id=${orderId}&tran_id=${tranId}&status=COMPLETED`
      );
    } else if (response === 'cancel') {
      // Redirect to frontend cancel page
      return res.redirect(
        `${frontendUrl}/payment/cancel?order_id=${orderId}&tran_id=${tranId}`
      );
    } else {
      // fail — redirect to cancel page with error indicator
      return res.redirect(
        `${frontendUrl}/payment/cancel?order_id=${orderId}&tran_id=${tranId}&failed=1`
      );
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
