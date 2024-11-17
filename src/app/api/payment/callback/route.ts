import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderTrackingId = url.searchParams.get('OrderTrackingId');
    const orderMerchantReference = url.searchParams.get('OrderMerchantReference');
    const orderNotificationId = url.searchParams.get('OrderNotificationId');

    // Store payment status in your database here
    console.log('Payment callback received:', {
      orderTrackingId,
      orderMerchantReference,
      orderNotificationId
    });

    // Redirect to success or failure page based on payment status
    return NextResponse.redirect(new URL('/payment/success', request.url));
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(new URL('/payment/error', request.url));
  }
}
