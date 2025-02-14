import { NextResponse } from 'next/server';

const MPESA_AUTH_URL =
  'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_STK_PUSH_URL =
  'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

const MPESA_USERNAME = 'nS4CEUd64GpPAkkZEBFIxOKH7UjJqnrLvSRBvLkP9Vh1zoaB';
const MPESA_PASSWORD =
  'TDA0dzYl0AH9shALgGVkZoIIDx6q3DwHzldAoQvdaSVa0BVceHcJoJ2Cu9A0cWjT';

async function getAccessToken() {
  // console.log("before access")
  const auth = Buffer.from(`${MPESA_USERNAME}:${MPESA_PASSWORD}`).toString(
    'base64'
  );
  const response = await fetch(MPESA_AUTH_URL, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`
    }
  });
  const data = await response.json();
  //   console.log(data.access_token)
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    // const { amount, phoneNumber } = await request.json()
    const accessToken = await getAccessToken();
    // console.log("after access token", accessToken)
    const bodyy = await request.json();
    console.log(bodyy);
    bodyy.phoneNumber = bodyy.phoneNumber.replace('+', '');
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
    const password = Buffer.from(
      `4156141${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64');

    const stkPushResponse = await fetch(MPESA_STK_PUSH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        BusinessShortCode: '4156141',
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: bodyy.amount,
        PartyA: bodyy.phoneNumber,
        PartyB: '4156141',
        PhoneNumber: bodyy.phoneNumber,
        CallBackURL: 'https://webhook-alqurashi.onrender.com/confirm',
        AccountReference: 'Al Qurashi',
        TransactionDesc: 'Payment for products'
      })
    });

    const stkPushData = await stkPushResponse.json();

    if (stkPushData.ResponseCode === '0') {
      // Payment initiated successfully
      return NextResponse.json({
        success: true,
        checkoutRequestId: stkPushData.CheckoutRequestID
      });
    } else {
      console.log(stkPushData);
      throw new Error(stkPushData.ResponseDescription);
    }
  } catch (error: any) {
    console.error('M-Pesa payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
