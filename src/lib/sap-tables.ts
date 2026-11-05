import type { SapEdition, SapState } from '../types/sap';
import { formatMoney } from './sap-money';

export function projectSapTables(state: SapState, edition: SapEdition): Record<string, Record<string, string>[]> {
  const lines = state.journals.flatMap(j => j.lines.map((l, i) => ({ BELNR: j.id, BUZEI: String(i + 1).padStart(3, '0'), HKONT: l.account, SHKZG: l.side === 'DEBIT' ? 'S' : 'H', DMBTR: formatMoney(l.amount), BSCHL: l.postingKey, WBS: l.wbs ?? '' })));
  const material = state.journals.filter(j => j.tcode.startsWith('MIGO')).map(j => {
    const rawMvt = j.tcode.replace('MIGO ', '').trim();
    const bwart = rawMvt.slice(0, 3);
    const sobkz = rawMvt.includes('Q') ? 'Q' : '';
    return { MBLNR: j.id, BWART: bwart, SOBKZ: sobkz, DMBTR: formatMoney(j.lines[0]?.amount ?? 0n) };
  });
  const tables: Record<string, Record<string, string>[]> = {
    ...state.tables,
    BKPF: state.journals.map(j => ({ BELNR: j.id, BLART: j.type, TCODE: j.tcode })),
    BSEG: lines,
    PRPS: state.budgets.map((b, idx) => ({ PSPNR: `0000010${idx + 1}`, POSID: b.id, OBJNR: `PR0000010${idx + 1}`, STATUS: state.caseStatus })),
    BPGE: state.budgets.map((b, idx) => ({ OBJNR: `PR0000010${idx + 1}`, POSID: b.id, RELEASED: formatMoney(b.released) })),
    COOI: state.budgets.flatMap((b, idx) => [...(b.pr ? [{ OBJNR: `PR0000010${idx + 1}`, POSID: b.id, TYPE: 'PR', VALUE: formatMoney(b.pr) }] : []), ...(b.po ? [{ OBJNR: `PR0000010${idx + 1}`, POSID: b.id, TYPE: 'PO', VALUE: formatMoney(b.po) }] : [])]),
    ANLA: state.assets.map(a => ({ ANLN1: a.id, ANLKL: a.assetClass })),
    ANLC: state.assets.map(a => ({ ANLN1: a.id, APC: formatMoney(a.value), DEPRECIATION: formatMoney(a.depreciation) })),
    MSPR: [{ MATNR: 'MAT-TRAFO-150', VALUE: formatMoney(state.stockQ) }], MARD: [{ MATNR: 'MAT-KABEL-01', VALUE: formatMoney(state.stockGeneral) }],
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
