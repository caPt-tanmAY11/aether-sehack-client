import { apiClient } from './client';

export const paymentsApi = {
  // Get student's unpaid dues
  getDues: async () => {
    const res = await apiClient.get('/payments/dues');
    return res.data.data;
  },

  // Get full payment history (paid + waived + unpaid)
  getDueHistory: async () => {
    const res = await apiClient.get('/payments/dues/history');
    return res.data.data;
  },

  // Get total outstanding balance
  getOutstanding: async () => {
    const res = await apiClient.get('/payments/outstanding');
    return res.data.data; // { totalRupees, count }
  },

  // Create a Razorpay order for a specific due
  createOrder: async (dueId) => {
    const res = await apiClient.post(`/payments/dues/${dueId}/order`);
    return res.data.data; // { orderId, amount, currency, keyId }
  },

  // Verify Razorpay payment and settle the due
  verifyPayment: async (dueId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    const res = await apiClient.post(`/payments/dues/${dueId}/verify`, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return res.data.data;
  },

  // Search students to issue dues
  searchStudents: async (query) => {
    const res = await apiClient.get('/payments/students/search', { params: { q: query } });
    return res.data.data;
  },

  // Raise a new due
  raiseDue: async (data) => {
    const res = await apiClient.post('/payments/dues', data);
    return res.data.data;
  },
};
