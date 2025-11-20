import api from './api';

export interface CreateSubscriptionData {
  tariffId: string;
  paymentMethod: 'card' | 'balance';
  parkingId?: string;
}

export const subscriptionService = {
  createSubscription: async (data: CreateSubscriptionData) => {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },
};
