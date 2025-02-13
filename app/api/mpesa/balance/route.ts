import { NextResponse } from 'next/server';

const MPESA_AUTH_URL =
  'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_BALANCE_QUERY =
  'https://api.safaricom.co.ke/mpesa/accountbalance/v1/query';

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

    const balanceQueryResponse = await fetch(MPESA_BALANCE_QUERY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Initiator: process.env.MPESA_INITIATOR,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIALS,
        CommandID: 'AccountBalance',
        PartyA: process.env.MPESA_SHORT_CODE,
        IdentifierType: '4',
        Remarks: 'ok',
        QueueTimeOutURL: 'https://webhook-alqurashi.onrender.com/validate',
        ResultURL: 'https://webhook-alqurashi.onrender.com/balance'
      })
    });

    const balanceData = await balanceQueryResponse.json();
    console.log('balance data', balanceData);

    if (balanceData.ResponseCode === '0') {
      // Payment initiated successfully
      // console.log("trueeeee waaaye")
      return NextResponse.json({
        success: true,
        conversationID: balanceData.ConversationID
      });
    } else {
      throw new Error(balanceData.errorMessage);
    }
  } catch (error: any) {
    console.error('M-Pesa balance error:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
