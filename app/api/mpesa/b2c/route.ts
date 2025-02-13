import { NextResponse } from 'next/server';

const MPESA_AUTH_URL =
  'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_B2C = 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest';

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

    const b2cResponse = await fetch(MPESA_B2C, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Initiator: process.env.MPESA_INITIATOR,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIALS,
        CommandID: 'BusinessPayment',
        PartyA: process.env.MPESA_SHORT_CODE,
        PartyB: '254702066774',
        Amount: '1',
        Remarks: 'ok',
        QueueTimeOutURL: 'https://webhook-alqurashi.onrender.com/validate',
        ResultURL: 'https://webhook-alqurashi.onrender.com/balance'
      })
    });

    const b2cdata = await b2cResponse.json();
    console.log('b2c data', b2cdata);

    if (b2cdata.ResponseCode === '0') {
      // Payment initiated successfully
      console.log('trueeeee waaaye');
      return NextResponse.json({
        success: true,
        conversationID: b2cdata.ConversationID
      });
    } else {
      throw new Error(b2cdata.errorMessage);
    }
  } catch (error: any) {
    console.error('M-Pesa b2c error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
