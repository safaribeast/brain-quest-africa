import axios from 'axios';
import { PESAPAL_CONFIG } from './config';

export interface PaymentRequest {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  description: string;
}

class PesaPalService {
  private token: string | null = null;

  private async getAuthToken() {
    if (this.token) return this.token;

    try {
      const response = await axios.post(`${PESAPAL_CONFIG.API_URL}/api/Auth/RequestToken`, {
        consumer_key: PESAPAL_CONFIG.CONSUMER_KEY,
        consumer_secret: PESAPAL_CONFIG.CONSUMER_SECRET,
      });

      this.token = response.data.token;
      return this.token;
    } catch (error) {
      console.error('Error getting PesaPal auth token:', error);
      throw new Error('Failed to authenticate with PesaPal');
    }
  }

  async initiatePayment(paymentData: PaymentRequest) {
    try {
      const token = await this.getAuthToken();
      
      const orderData = {
        id: `ORDER-${Date.now()}`,
        currency: 'TZS',
        amount: paymentData.amount,
        description: paymentData.description,
        callback_url: PESAPAL_CONFIG.CALLBACK_URL,
        notification_id: `IPN-${Date.now()}`,
        billing_address: {
          email_address: paymentData.email,
          phone_number: paymentData.phoneNumber,
          first_name: paymentData.firstName,
          last_name: paymentData.lastName,
        }
      };

      const response = await axios.post(
        `${PESAPAL_CONFIG.API_URL}/api/Transactions/SubmitOrderRequest`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  async getPaymentStatus(orderTrackingId: string) {
    try {
      const token = await this.getAuthToken();
      
      const response = await axios.get(
        `${PESAPAL_CONFIG.API_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new Error('Failed to check payment status');
    }
  }
}

export const pesapalService = new PesaPalService();
