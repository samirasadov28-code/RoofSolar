import { NextRequest } from 'next/server';
const constructEvent = jest.fn();
const insert = jest.fn();
const single = jest.fn();
const getUser = jest.fn();
const paid = jest.fn();
const send = jest.fn();
const query: any = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single, maybeSingle: single, insert };
const client = { from: jest.fn(()=>query), auth: {getUser} };
jest.mock('stripe',()=>({__esModule:true, default:jest.fn().mockImplementation(()=>({webhooks:{constructEvent}}))}));
jest.mock('../lib/supabase',()=>({createClient:()=>client,createServiceClient:()=>client}));
jest.mock('../lib/proVerification',()=>({isPaidSessionFor:(...a:any[])=>paid(...a)}));
jest.mock('../lib/email',()=>({sendProReportEmail:(...a:any[])=>send(...a)}));
process.env.STRIPE_SECRET_KEY='sk_test_local';
import { POST } from '../app/api/webhooks/stripe/route';
import { GET } from '../app/api/calculation/route';
const id='11111111-1111-4111-8111-111111111111';
function webhook(){return new NextRequest('http://localhost/api/webhooks/stripe',{method:'POST',headers:{'stripe-signature':'stub'},body:'{}'});}
function evt(status='paid'){return {type:'checkout.session.completed',data:{object:{id:'cs_test_mock',payment_status:status,metadata:{calculationId:id},customer_details:{email:'test@example.invalid'}}}};}
beforeEach(()=>{jest.clearAllMocks();insert.mockResolvedValue({error:null});single.mockResolvedValue({data:{address:'synthetic',inputs:{panelCount:12},results:{annualProductionKwh:4000}}});send.mockResolvedValue(undefined);constructEvent.mockReturnValue(evt());paid.mockResolvedValue(true);getUser.mockResolvedValue({data:{user:null}});});
it('ignores unpaid sessions',async()=>{constructEvent.mockReturnValue(evt('unpaid'));expect((await POST(webhook())).status).toBe(200);expect(insert).not.toHaveBeenCalled();expect(send).not.toHaveBeenCalled();});
it('returns retry status when recording fails',async()=>{insert.mockResolvedValue({error:{code:'XX000'}});expect((await POST(webhook())).status).toBe(503);expect(send).not.toHaveBeenCalled();});
it('awaits email and propagates failure for retry',async()=>{send.mockRejectedValue(new Error('stub'));expect((await POST(webhook())).status).toBe(503);});
it('handles a duplicate purchase row without creating another row',async()=>{insert.mockResolvedValue({error:{code:'23505'}});expect((await POST(webhook())).status).toBe(200);expect(send).toHaveBeenCalledTimes(1);});
it('loads a purchased calculation without browser storage',async()=>{const res=await GET(new NextRequest(`http://localhost/api/calculation?id=${id}&session_id=cs_test_mock`));expect(res.status).toBe(200);expect((await res.json()).inputs.panelCount).toBe(12);});
it('denies anonymous unverified access',async()=>{paid.mockResolvedValue(false);expect((await GET(new NextRequest(`http://localhost/api/calculation?id=${id}`))).status).toBe(401);expect(client.from).not.toHaveBeenCalled();});
it('does not accept malformed calculation ids',async()=>{expect((await GET(new NextRequest('http://localhost/api/calculation?id=bad'))).status).toBe(400);expect(paid).not.toHaveBeenCalled();});
