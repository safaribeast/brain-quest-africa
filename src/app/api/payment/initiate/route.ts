import { NextResponse } from 'next/server';
import axios from 'axios';

const BASE_URL = 'https://cybqa.pesapal.com/pesapalv3';
const CONSUMER_KEY = 'qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW';
const CONSUMER_SECRET = 'osGQ364R49cXKeOYSpaOnT++rHs=';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received payment request:', body);

    // Validate amount
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    console.log('Requesting auth token...');
    const tokenResponse = await axios.post(
      `${BASE_URL}/api/Auth/RequestToken`,
      {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET
      }
    ).catch(error => {
      console.error('Token request failed:', error.response?.data || error.message);
      throw error;
    });

    console.log('Token response:', tokenResponse.data);
    const token = tokenResponse.data.token;

    if (!token) {
      throw new Error('No token received from PesaPal');
    }

    // Generate unique order ID
    const orderId = `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const notifyId = `NOTIFY${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const orderData = {
      id: orderId,
      currency: "TZS",
      amount: parseFloat(body.amount),
      description: body.description || 'Premium Access Payment',
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/callback`,
      notification_id: notifyId,
      billing_address: {
        phone_number: "255700000000",
        email_address: "john.doe@example.com",
        country_code: "TZA",
        first_name: "John",
        middle_name: "",
        last_name: "Doe",
        line_1: "Dar es Salaam",
        line_2: "",
        city: "Dar es Salaam",
        state: "",
        postal_code: "",
        zip_code: ""
      }
    };

    console.log('Submitting order with data:', orderData);

    const orderResponse = await axios.post(
      `${BASE_URL}/api/Transactions/SubmitOrderRequest`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    ).catch(error => {
      console.error('Order submission failed:', error.response?.data || error.message);
      throw error;
    });

    console.log('Order response:', orderResponse.data);

    if (!orderResponse.data?.redirect_url) {
      console.error('Invalid order response:', orderResponse.data);
      throw new Error('No redirect URL in response');
    }

    return NextResponse.json({
      redirect_url: orderResponse.data.redirect_url,
      order_tracking_id: orderResponse.data.order_tracking_id,
      merchant_reference: orderId
    });

  } catch (error: any) {
    console.error('Payment Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: 'Payment initiation failed',
        details: error.response?.data?.error || error.message
      },
      { status: 500 }
    );
  }
}
