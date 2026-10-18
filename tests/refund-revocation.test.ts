import { NextRequest } from 'next/server';

const constructEvent = jest.fn();
const sessionsList = jest.fn();
const sessionsRetrieve = jest.fn();
const chargesList = jest.fn();
const inFn = jest.fn();
const del = jest.fn(() => ({ in: inFn }));
const client = { from: jest.fn(() => ({ delete: del })) };

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    webhooks: { constructEvent },
    checkout: { sessions: { list: sessionsList, retrieve: sessionsRetrieve } },
    charges: { list: chargesList },
  })),
}));
jest.mock('../lib/supabase', () => ({ createClient: () => client, createServiceClient: () => client }));
jest.mock('../lib/email', () => ({ sendProReportEmail: jest.fn() }));

process.env.STRIPE_SECRET_KEY = 'sk_test_local';

import { POST } from '../app/api/webhooks/stripe/route';
import { isPaidSessionFor } from '../lib/proVerification';

const calcId = '11111111-1111-4111-8111-111111111111';
function webhook() {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'stub' },
    body: '{}',
  });
}
function refundEvt(charge: any) {
  return { type: 'charge.refunded', data: { object: charge } };
}
function paidSession(charge: any) {
  return {
    id: 'cs_test_mock',
    mode: 'payment',
    payment_status: 'paid',
    metadata: { calculationId: calcId },
    payment_intent: { id: 'pi_1', latest_charge: charge },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  inFn.mockResolvedValue({ error: null });
  sessionsList.mockResolvedValue({ data: [{ id: 'cs_a' }, { id: 'cs_b' }] });
});

describe('webhook charge.refunded', () => {
  it('deletes pro_purchases rows for the refunded payment', async () => {
    constructEvent.mockReturnValue(
      refundEvt({ id: 'ch_1', refunded: true, amount: 399, amount_refunded: 399, payment_intent: 'pi_1' })
    );
    const res = await POST(webhook());
    expect(res.status).toBe(200);
    expect(sessionsList).toHaveBeenCalledWith({ payment_intent: 'pi_1', limit: 10 });
    expect(inFn).toHaveBeenCalledWith('stripe_session_id', ['cs_a', 'cs_b']);
  });

  it('ignores partial refunds', async () => {
    constructEvent.mockReturnValue(
      refundEvt({ id: 'ch_1', refunded: false, amount: 399, amount_refunded: 100, payment_intent: 'pi_1' })
    );
    const res = await POST(webhook());
    expect(res.status).toBe(200);
    expect(sessionsList).not.toHaveBeenCalled();
    expect(inFn).not.toHaveBeenCalled();
  });

  it('returns a retry status when the delete fails', async () => {
    constructEvent.mockReturnValue(
      refundEvt({ id: 'ch_1', refunded: true, amount: 399, amount_refunded: 399, payment_intent: 'pi_1' })
    );
    inFn.mockResolvedValue({ error: { code: 'XX000' } });
    expect((await POST(webhook())).status).toBe(503);
  });
});

describe('isPaidSessionFor refund handling', () => {
  it('accepts a paid, non-refunded session for the calculation', async () => {
    sessionsRetrieve.mockResolvedValue(
      paidSession({ id: 'ch_1', refunded: false, disputed: false, amount: 399, amount_refunded: 0 })
    );
    expect(await isPaidSessionFor('cs_test_mock', calcId)).toBe(true);
  });

  it('rejects a fully refunded session', async () => {
    sessionsRetrieve.mockResolvedValue(
      paidSession({ id: 'ch_1', refunded: true, disputed: false, amount: 399, amount_refunded: 399 })
    );
    expect(await isPaidSessionFor('cs_test_mock', calcId)).toBe(false);
  });

  it('rejects a disputed session', async () => {
    sessionsRetrieve.mockResolvedValue(
      paidSession({ id: 'ch_1', refunded: false, disputed: true, amount: 399, amount_refunded: 0 })
    );
    expect(await isPaidSessionFor('cs_test_mock', calcId)).toBe(false);
  });

  it('still rejects a paid session for a different calculation', async () => {
    sessionsRetrieve.mockResolvedValue(
      paidSession({ id: 'ch_1', refunded: false, disputed: false, amount: 399, amount_refunded: 0 })
    );
    expect(await isPaidSessionFor('cs_test_mock', '22222222-2222-4222-8222-222222222222')).toBe(false);
  });
});
