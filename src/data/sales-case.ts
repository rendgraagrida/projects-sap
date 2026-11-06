import type { JournalLine, Result, SalesCaseAction, SalesState } from '../types/sap';

export const salesCaseActions: readonly SalesCaseAction[] = [
  {
    step: 1,
    id: 'quote',
    title: 'Penerbitan Quotation Penawaran Resmi',
    tcode: 'VA21',
    description: 'Penerbitan quotation resmi paket internet MetroNexia 1 Gbps untuk PT Enterprise Global (CUST-TELCO-01).',
  },
  {
    step: 2,
    id: 'order',
    title: 'Pembuatan Sales Order MetroNexia (MRC & OTC)',
    tcode: 'VA01',
    description: 'Sales Order 10000001: Item 10 Material 2 MRC ($5,000/bln) & Item 20 Material 3 OTC ($1,500 sekali) dengan Billing Plan.',
  },
  {
    step: 3,
    id: 'delivery',
    title: 'Delivery Perangkat CPE & Aktivasi Port Fiber',
    tcode: 'VL01N',
    description: 'Pengiriman modem ONT/CPE router via Outbound Delivery 80000001 (PGI 601) dan aktivasi port link menjadi status LIVE.',
  },
  {
    step: 4,
    id: 'invoice-otc',
    title: 'Billing Dokumen OTC Aktivasi (Milestone)',
    tcode: 'VF01',
    description: 'Faktur 90000001: Biaya aktivasi $1,500 + PPN 11% ($165) = $1,665 diposting ke FI via VKOA (Doc. Type RV).',
  },
  {
    step: 5,
    id: 'invoice-mrc',
    title: 'Billing Dokumen MRC Bulan 1 (Periodic)',
    tcode: 'VF01/VF04',
    description: 'Faktur 90000002: Tagihan bulanan pertama $5,000 + PPN 11% ($550) = $5,550 diposting via VKOA (Doc. Type RV).',
  },
  {
    step: 6,
    id: 'payment',
    title: 'Pelunasan Piutang Pelanggan & Bank Clearing',
    tcode: 'F-28',
    description: 'Pelanggan mentransfer lunas total tagihan $7,215 ke rekening bank, seluruh piutang ter-clearing tuntas (Doc. Type DZ).',
  },
];

export function initialSalesState(): SalesState {
  return {
    salesAction: 0,
    status: 'CRTD',
    contractValue: 0n,
    receivables: 0n,
    revenueMrc: 0n,
    revenueOtc: 0n,
    taxOutput: 0n,
    cashCollected: 0n,
    journals: [],
    tables: {},
    error: null,
  };
}

const line = (
  account: string,
  label: string,
  side: 'DEBIT' | 'CREDIT',
  amount: bigint,
  postingKey: string,
  specialGl?: string
): JournalLine => ({
  account,
  label,
  side,
  amount,
  postingKey,
  specialGl,
});

export function executeSalesCaseAction(previous: SalesState): Result<SalesState> {
  if (previous.salesAction < 0 || previous.salesAction >= salesCaseActions.length) {
    return { ok: false, error: 'Seluruh langkah proses penjualan internet telah selesai atau index tidak valid.' };
  }

  const action = salesCaseActions[previous.salesAction];
  const state: SalesState = {
    ...previous,
    journals: [...previous.journals],
    tables: Object.fromEntries(Object.entries(previous.tables).map(([k, v]) => [k, [...v]])),
    error: null,
  };

  let lines: JournalLine[] = [];
  let docType = 'RV';

  switch (action.id) {
    case 'quote':
      state.status = 'QUOT';
      state.contractValue = 650000n; // $6,500.00
      state.tables.VBAK = [
        { VBELN: '20000001', KUNNR: 'CUST-TELCO-01', AUART: 'QT', VKORG: '1000', VTWEG: '10', SPART: '01', NETWR: '$6,500.00' },
      ];
      break;

    case 'order':
      state.status = 'SO CRTD';
      state.tables.VBAK = [
        { VBELN: '10000001', KUNNR: 'CUST-TELCO-01', AUART: 'OR', VKORG: '1000', VTWEG: '10', SPART: '01', NETWR: '$6,500.00' },
      ];
      state.tables.VBAP = [
        { VBELN: '10000001', POSNR: '000010', MATNR: 'MAT-MN-MRC', ARKTX: 'MetroNexia MRC 1Gbps', KWMENG: '1', NETWR: '$5,000.00' },
        { VBELN: '10000001', POSNR: '000020', MATNR: 'MAT-MN-OTC', ARKTX: 'MetroNexia OTC Aktivasi', KWMENG: '1', NETWR: '$1,500.00' },
      ];
      state.tables.VBKD = [
        { VBELN: '10000001', POSNR: '000000', ZTERM: 'Z030', INCO1: 'FOB', FPLNR: '0000001001' },
      ];
      state.tables.FPLA = [
        { FPLNR: '0000001001', FPTYP: '02', START_DATE: '20261116', HORIZON: '12 Bulan' },
      ];
      state.tables.FPLT = [
        { FPLNR: '0000001001', FPLTR: '0001', AFDAT: '20261116', FAREG: '01', FAAMNT: '$1,500.00', STATUS: 'Milestone OTC' },
        { FPLNR: '0000001001', FPLTR: '0002', AFDAT: '20261130', FAREG: '02', FAAMNT: '$5,000.00', STATUS: 'Periodic MRC Bln 1' },
      ];
      break;

    case 'delivery':
      state.status = 'ACTV';
      state.tables.LIKP = [
        { VBELN: '80000001', VSTEL: '1100', WADAT: '20261116', KUNNR: 'CUST-TELCO-01' },
      ];
      state.tables.LIPS = [
        { VBELN: '80000001', POSNR: '000010', MATNR: 'MAT-ODF-01', LFIMG: '1', VRKME: 'PC' },
      ];
      docType = 'WL';
      lines = [
        line('510010', 'Beban perangkat CPE aktivasi', 'DEBIT', 10000n, '40'),
        line('114010', 'Persediaan modem & CPE (OBYC: BSX)', 'CREDIT', 10000n, '99'),
      ];
      break;

    case 'invoice-otc':
      state.status = 'INV OTC';
      state.receivables += 166500n; // $1,665.00
      state.revenueOtc += 150000n;  // $1,500.00
      state.taxOutput += 16500n;    // $165.00
      state.tables.VBRK = [
        { VBELN: '90000001', FKART: 'F2', VKORG: '1000', KUNRG: 'CUST-TELCO-01', FKDAT: '20261116', NETWR: '$1,500.00' },
      ];
      state.tables.VBRP = [
        { VBELN: '90000001', POSNR: '000010', MATNR: 'MAT-MN-OTC', ARKTX: 'Biaya Aktivasi OTC', NETWR: '$1,500.00', VGBEL: '10000001' },
      ];
      docType = 'RV';
      lines = [
        line('113010', 'Piutang usaha pelanggan CUST-TELCO-01', 'DEBIT', 166500n, '01'),
        line('410020', 'Pendapatan jasa aktivasi OTC (VKOA: ERL)', 'CREDIT', 150000n, '50'),
        line('215010', 'Hutang PPN keluaran 11% (VKOA: MWS)', 'CREDIT', 16500n, '50'),
      ];
      break;

    case 'invoice-mrc':
      state.status = 'INV MRC';
      state.receivables += 555000n; // $5,550.00
      state.revenueMrc += 500000n;  // $5,000.00
      state.taxOutput += 55000n;    // $550.00
      state.tables.VBRK.push(
        { VBELN: '90000002', FKART: 'F2', VKORG: '1000', KUNRG: 'CUST-TELCO-01', FKDAT: '20261130', NETWR: '$5,000.00' }
      );
      state.tables.VBRP.push(
        { VBELN: '90000002', POSNR: '000010', MATNR: 'MAT-MN-MRC', ARKTX: 'Akses Internet MRC Bulan 1', NETWR: '$5,000.00', VGBEL: '10000001' }
      );
      docType = 'RV';
      lines = [
        line('113010', 'Piutang usaha pelanggan CUST-TELCO-01', 'DEBIT', 555000n, '01'),
        line('410010', 'Pendapatan akses internet MRC (VKOA: ERL)', 'CREDIT', 500000n, '50'),
        line('215010', 'Hutang PPN keluaran 11% (VKOA: MWS)', 'CREDIT', 55000n, '50'),
      ];
      break;

    case 'payment':
      state.status = 'PAID CLSD';
      state.cashCollected = state.receivables; // $7,215.00
      state.receivables = 0n; // Cleared!
      docType = 'DZ';
      lines = [
        line('111020', 'Kas bank operasional InfraNexia', 'DEBIT', 721500n, '50'),
        line('113010', 'Piutang usaha pelanggan (Clearing total)', 'CREDIT', 721500n, '15'),
      ];
      break;
  }

  if (lines.length) {
    state.journals.push({
      id: String(6000000000 + state.journals.length),
      tcode: action.tcode,
      type: docType,
      lines,
      description: action.title,
    });
  }

  state.salesAction++;
  return { ok: true, value: state };
}
