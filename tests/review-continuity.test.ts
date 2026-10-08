import { recommendFor } from '../lib/equipmentCatalog';
import { isPaidSessionFor } from '../lib/proVerification';
import en from '../lib/i18n/en';
import ar from '../lib/i18n/ar';
import de from '../lib/i18n/de';
const retrieve = jest.fn();
jest.mock('stripe', () => ({ __esModule:true, default:jest.fn().mockImplementation(()=>({checkout:{sessions:{retrieve}}})) }));
describe('isolated payment verification',()=>{
 beforeEach(()=>{process.env.STRIPE_SECRET_KEY='sk_test_local_dummy';retrieve.mockReset();});
 it('rejects missing or malformed session without a network request',async()=>{expect(await isPaidSessionFor(null,'a')).toBe(false);expect(await isPaidSessionFor('bad','a')).toBe(false);expect(retrieve).not.toHaveBeenCalled();});
 it('unlocks only paid matching calculation',async()=>{retrieve.mockResolvedValue({payment_status:'paid',metadata:{calculationId:'a'}});expect(await isPaidSessionFor('cs_test_stub','a')).toBe(true);expect(await isPaidSessionFor('cs_test_stub','b')).toBe(false);});
 it('rejects unpaid and unavailable session',async()=>{retrieve.mockResolvedValue({payment_status:'unpaid',metadata:{calculationId:'a'}});expect(await isPaidSessionFor('cs_test_stub','a')).toBe(false);retrieve.mockRejectedValue(new Error('stubbed failure'));expect(await isPaidSessionFor('cs_test_stub','a')).toBe(false);});
});
describe('catalogue observations, not validity signoff',()=>{
 it('does not pair-match shortlisted inverters and batteries',()=>{const r=recommendFor('ie',12,true,10,'hybrid');expect(r.inverters.some(i=>i.manufacturer==='Sungrow')).toBe(true);expect(r.batteries.some(b=>b.manufacturer==='Huawei')).toBe(true);});
 it('400W model and catalogue panels have different wattages',()=>{const r=recommendFor('ie',12,false,0,'standard');expect(r.panels.every(p=>p.watts!==400)).toBe(true);});
 it('safety labels are localised in Arabic and German',()=>{expect(ar.equipment.panelWattNote).not.toBe(en.equipment.panelWattNote);expect(de.equipment.undersizedInverterNote).not.toBe(en.equipment.undersizedInverterNote);});
});
