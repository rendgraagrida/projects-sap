import type { FiArState, SapEdition, SapState } from '../types/sap';
import { formatMoney } from './sap-money';

export function projectSapTables(state: SapState, edition: SapEdition): Record<string, Record<string, string>[]> {
  const lines = state.journals.flatMap(j => j.lines.map((l, i) => ({ BELNR: j.id, BUZEI: String(i + 1).padStart(3, '0'), HKONT: l.account, SHKZG: l.side === 'DEBIT' ? 'S' : 'H', DMBTR: formatMoney(l.amount), BSCHL: l.postingKey, WBS: l.wbs ?? '' })));
  const material = state.journals.filter(j => j.tcode.startsWith('MIGO')).map(j => {
    const rawMvt = j.tcode.replace('MIGO ', '').trim();
    const bwart = rawMvt.slice(0, 3);
    const sobkz = rawMvt.includes('Q') ? 'Q' : '';
    return { MBLNR: `LAB-${j.id}`, BWART: bwart, SOBKZ: sobkz, DMBTR: j.lines.length ? formatMoney(j.lines[0].amount) : '' };
  });
  const tables: Record<string, Record<string, string>[]> = {
    ...state.tables,
    BKPF: state.journals.filter(j => j.lines.length > 0).map(j => ({ BELNR: j.id, BLART: j.type, TCODE: j.tcode })),
    BSEG: lines,
    PRPS: state.tables.PRPS ? state.budgets.map((b, idx) => ({ PSPNR: `0000010${idx + 1}`, POSID: b.id, OBJNR: `PR0000010${idx + 1}`, STATUS: state.caseStatus })) : [],
    BPGE: state.budgets.flatMap((b, idx) => b.released ? [{ OBJNR: `PR0000010${idx + 1}`, POSID: b.id, RELEASED: formatMoney(b.released) }] : []),
    COOI: state.budgets.flatMap((b, idx) => [...(b.pr ? [{ OBJNR: `PR0000010${idx + 1}`, POSID: b.id, TYPE: 'PR', VALUE: formatMoney(b.pr) }] : []), ...(b.po ? [{ OBJNR: `PR0000010${idx + 1}`, POSID: b.id, TYPE: 'PO', VALUE: formatMoney(b.po) }] : [])]),
    ANLA: state.assets.map(a => ({ ANLN1: a.id, ANLKL: a.assetClass })),
    ANLC: state.assets.map(a => ({ ANLN1: a.id, APC: formatMoney(a.value), DEPRECIATION: formatMoney(a.depreciation) })),
    MSPR: state.caseAction >= 7 ? [{ MATNR: 'MAT-FO-48C', VALUE: formatMoney(state.stockQ) }] : [], MARD: [{ MATNR: 'MAT-ODF-01', VALUE: formatMoney(state.stockGeneral) }],
    VBAK: [
      { VBELN: '10000001', KUNNR: 'CUST-TELCO-01', AUART: 'OR', VKORG: '1000', VTWEG: '10', SPART: '01', NETWR: '$6,500.00' },
    ],
    VBAP: [
      { VBELN: '10000001', POSNR: '000010', MATNR: 'MAT-MN-MRC', ARKTX: 'MetroNexia MRC 1Gbps', KWMENG: '1', NETWR: '$5,000.00' },
      { VBELN: '10000001', POSNR: '000020', MATNR: 'MAT-MN-OTC', ARKTX: 'MetroNexia OTC Aktivasi', KWMENG: '1', NETWR: '$1,500.00' },
    ],
    VBRK: [
      { VBELN: '90000001', FKART: 'F2', VKORG: '1000', KUNRG: 'CUST-TELCO-01', FKDAT: '20261116', NETWR: '$1,500.00' },
      { VBELN: '90000002', FKART: 'F2', VKORG: '1000', KUNRG: 'CUST-TELCO-01', FKDAT: '20261130', NETWR: '$2,500.00' },
    ],
    VBRP: [
      { VBELN: '90000001', POSNR: '000010', MATNR: 'MAT-MN-OTC', ARKTX: 'Biaya Aktivasi OTC', NETWR: '$1,500.00', VGBEL: '10000001' },
      { VBELN: '90000002', POSNR: '000010', MATNR: 'MAT-MN-MRC', ARKTX: 'Akses Internet MRC Bulan 1', NETWR: '$2,500.00', VGBEL: '10000001' },
    ],
  };
  if (edition === 'S4') {
    tables.ACDOCA = state.journals.flatMap(j => j.lines.map((l, i) => ({ BELNR: j.id, DOCLN: String(i + 1).padStart(6, '0'), RACCT: l.account, HSL: (l.side === 'DEBIT' ? '' : '-') + formatMoney(l.amount), WBS: l.wbs ?? '' })));
    tables.MATDOC = material;
  } else {
    tables.MKPF = material.map(({ MBLNR }) => ({ MBLNR }));
    tables.MSEG = material;
  }
  return tables;
}

export function projectFiArTables(state: FiArState): Record<string, Record<string, string>[]> {
  const itemRow = (item: FiArState['openItems'][number]) => ({
    KUNNR: item.customer,
    BELNR: item.id,
    BLART: item.documentType,
    DMBTR: formatMoney(item.amount),
    REST: formatMoney(item.remaining),
    ZFBDT: item.dueDate,
    STATUS: item.status,
  });
  return {
    BSID: state.openItems.map(itemRow),
    BSAD: state.clearedItems.map(itemRow),
    KNB1: state.invoice ? [{ KUNNR: state.invoice.customer, BUKRS: '1000', AKONT: '113010', ZTERM: 'Z030' }] : [],
    KNKK: state.invoice ? [{ KUNNR: state.invoice.customer, KLIMK: formatMoney(state.creditLimit), KLIME: formatMoney(state.creditExposure), CMPSA: state.creditStatus }] : [],
  };
}
