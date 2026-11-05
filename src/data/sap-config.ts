import type { ObycKey } from '../types/sap';

export const accounts: Record<ObycKey, string> = {
  BSX: '114010', WRX: '210090', 'GBB-VBR': '510010', 'GBB-VNG': '510090',
  'GBB-INV': '510080', 'GBB-BSA': '399999', PRD: '520010', FR1: '210098', KDM: '710020',
};
export const postingKeys = { glDebit: '40', glCredit: '50', stockDebit: '89', stockCredit: '99', grIrDebit: '86', grIrCredit: '96', vendorInvoice: '31', vendorPayment: '25', vendorClearing: '26', downPayment: '29', downPaymentClearing: '39', assetDebit: '70', assetCredit: '75' } as const;
export const taxCodes = { V0: { rate: 0, deductible: true, kind: 'INPUT' }, V1: { rate: 11, deductible: true, kind: 'INPUT' }, V2: { rate: 11, deductible: false, kind: 'INPUT' }, A1: { rate: 11, deductible: false, kind: 'OUTPUT' } } as const;
export const withholding = { name: 'PPh 23', percent: 2, account: '213023' } as const;
export const masterData = {
  company: '1000', plant: '1100', chart: 'CAID', grouping: '0001',
  materials: [{ id: 'MAT-TRAFO-150', priceControl: 'V', valuationClass: '3000' }, { id: 'MAT-KABEL-01', priceControl: 'S', valuationClass: '3000' }],
  vendors: [{ id: '100024', name: 'PT Elektro Utama' }, { id: '100025', name: 'PT Karya Sipil Nusantara' }],
  wbs: ['P-2026-GI01.01', 'P-2026-GI01.02'],
  assets: [{ id: '8000015-0', class: '8000' }, { id: '8000016-0', class: '8000' }, { id: '2000099-0', class: '2000' }, { id: '3000099-0', class: '3000' }],
} as const;
