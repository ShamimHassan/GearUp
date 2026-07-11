import axios from 'axios';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { RentalStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

interface ICreatePaymentPayload {
  rentalOrderId: string;
}

interface IGetPaymentHistoryQuery {
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'paidAt';
  sortOrder?: 'asc' | 'desc';
}

const createPaymentInDB = async (
  customerId: string,
  payload: ICreatePaymentPayload,
) => {
  const { rentalOrderId } = payload;

  // Fetch the rental order with customer info
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { customer: true },
  });

  if (!rentalOrder) {
    throw new AppError('Rental order not found', 404);
  }

  // Ensure the order belongs to the authenticated customer
  if (rentalOrder.customerId !== customerId) {
    throw new AppError(
      'You are not authorized to make a payment for this order',
      403,
    );
  }

  // only CONFIRMED status order can be paid
  if (rentalOrder.status !== RentalStatus.CONFIRMED) {
    throw new AppError(
      `Cannot pay for an order with status '${rentalOrder.status}'`,
      400,
    );
  }

  // Check if a successful payment already exists
  const existingPayment = await prisma.payment.findFirst({
    where: {
      rentalOrderId,
      status: PaymentStatus.COMPLETED,
    },
  });

  if (existingPayment) {
    throw new AppError('Payment has already been made for this order', 400);
  }

  const transactionId = `TRNX_ID_${Date.now()}`;

  const customer = rentalOrder.customer;

  const sslPayload = {
    store_id: process.env.SSLCOMMERZ_STORE_ID as string,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD as string,
    total_amount: Number(rentalOrder.totalAmount),
    currency: 'BDT',
    tran_id: transactionId,
    success_url: `${process.env.APP_URL}/api/payments/confirm?orderId=${rentalOrder.id}&tranId=${transactionId}&status=success`,
    fail_url: `${process.env.APP_URL}/api/payments/confirm?orderId=${rentalOrder.id}&tranId=${transactionId}&status=fail`,
    cancel_url: `${process.env.APP_URL}/api/payments/confirm?orderId=${rentalOrder.id}&tranId=${transactionId}&status=cancel`,
    cus_name: customer.name ?? 'Customer',
    cus_email: customer.email,
    cus_add1: 'N/A',
    cus_add2: 'N/A',
    cus_city: 'N/A',
    cus_state: 'N/A',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: customer.phone ?? '01700000000',
    cus_fax: '01700000000',
  };

  const response = await axios.post(
    'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
    new URLSearchParams(sslPayload),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );

  const data = response.data;

  if (!data.GatewayPageURL) {
    throw new AppError(
      'Failed to initiate payment gateway. Please try again.',
      500,
    );
  }

  await prisma.payment.create({
    data: {
      transactionId,
      rentalOrderId: rentalOrder.id,
      amount: rentalOrder.totalAmount,
      method: PaymentMethod.SSLCOMMERZ,
    },
  });

  return {
    gatewayPageURL: data.GatewayPageURL,
    transactionId,
  };
};

const confirmPayment = async (
  orderId: string,
  tranId: string,
  status: string,
  payload: Record<string, unknown>,
) => {
  // Find the payment record by transactionId
  const payment = await prisma.payment.findUnique({
    where: { transactionId: tranId },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new AppError('Payment record not found for this transaction', 404);
  }

  // If already completed, return early
  if (payment.status === PaymentStatus.COMPLETED) {
    return 'success';
  }

  // If the redirect status is cancel, mark as failed and return
  if (status === 'cancel') {
    await prisma.payment.update({
      where: { transactionId: tranId },
      data: {
        status: PaymentStatus.FAILED,
        gatewayResponse: payload as any,
      },
    });
    return status;
  }

  const validationUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${(payload as any).val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;

  const validationResponse = await axios.get(validationUrl);
  const validationData = validationResponse.data;

  // Process based on SSLCommerz validation status
  if (validationData.status === 'VALID') {
    await prisma.$transaction([
      prisma.payment.update({
        where: { transactionId: tranId },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          gatewayResponse: payload as any,
        },
      }),
      prisma.rentalOrder.update({
        where: { id: payment.rentalOrderId },
        data: {
          status: RentalStatus.PAID,
        },
      }),
    ]);

    return status;
  }

  // FAILED or INVALID_TRANSACTION
  await prisma.payment.update({
    where: { transactionId: tranId },
    data: {
      status: PaymentStatus.FAILED,
      gatewayResponse: payload as any,
    },
  });

  return status;
};

const getPaymentHistory = async (
  customerId: string,
  query: IGetPaymentHistoryQuery,
) => {
  const {
    status,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const where: any = {
    rentalOrder: {
      customerId,
    },
  };

  if (status) {
    where.status = status as PaymentStatus;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        rentalOrder: {
          select: {
            id: true,
            totalAmount: true,
            startDate: true,
            endDate: true,
            status: true,
            gear: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: Number(limit),
    }),
    prisma.payment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  return {
    payments,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  };
};

const getPaymentById = async (paymentId: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      rentalOrder: {
        include: {
          customer: {
            select: {
            id: true,
            name: true,
            email: true,
          },
        },
        gear: true,
      },
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Ensure the payment belongs to the authenticated customer
  if (payment.rentalOrder.customerId !== customerId) {
    throw new AppError('You are not authorized to view this payment', 403);
  }

  return payment;
};

export const paymentService = {
  createPaymentInDB,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
};
