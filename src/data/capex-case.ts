import type { CaseAction } from '../types/sap';

export const caseActions: readonly CaseAction[] = [
  { step: 1, id: 'project', title: 'Membuat struktur proyek', tcode: 'CJ20N', description: 'Project P-2026-GI01 dan dua WBS sipil dan trafo.' },
  { step: 2, id: 'budget', title: 'Anggaran proyek', tcode: 'CJ30/CJ32', description: 'Release $40.000 untuk sipil dan $60.000 untuk trafo.' },
  { step: 3, id: 'release', title: 'Release proyek dan AuC', tcode: 'CJ20N', description: 'Status REL dan dua aset dalam penyelesaian kelas 8000.' },
  { step: 4, id: 'po-trafo', title: 'PO trafo', tcode: 'ME21N/ME29N', description: 'PO 4500010001, kategori Q, $50.000.' },
  { step: 4, id: 'po-service', title: 'PO jasa', tcode: 'ME21N/ME29N', description: 'PO 4500010002, kategori P/D, $35.000.' },
  { step: 5, id: 'dp', title: 'Uang muka', tcode: 'F-47/F-48', description: 'DP jasa $7.000, special G/L A.' },
  { step: 6, id: 'gr-q', title: '6A Penerimaan trafo', tcode: 'MIGO 101 Q', description: 'Stok proyek $50.000, belum actual cost.' },
  { step: 6, id: 'gi-q', title: '6B Pemakaian trafo', tcode: 'MIGO 221 Q', description: 'Konsumsi stok proyek $50.000.' },
  { step: 6, id: 'gi-cable', title: '6C Pemakaian kabel', tcode: 'MIGO 221', description: 'Kabel dari stok umum $5.000.' },
  { step: 7, id: 'ses', title: 'Serah terima jasa', tcode: 'ML81N', description: 'Terima jasa $35.000.' },
  { step: 8, id: 'invoice-trafo', title: '8A Faktur trafo', tcode: 'MIRO', description: '$50.000 + PPN 11%.' },
  { step: 8, id: 'invoice-service', title: '8B Faktur jasa', tcode: 'MIRO', description: '$35.000 + PPN 11% - PPh 23 2%.' },
  { step: 8, id: 'clear-dp', title: '8C Clearing uang muka', tcode: 'F-54', description: 'Kurangi utang jasa $7.000.' },
  { step: 8, id: 'pay', title: '8D Pelunasan', tcode: 'F110', description: 'Pembayaran simulasi $86.650, tanpa transaksi bank nyata.' },
  { step: 9, id: 'periodic', title: 'Settlement periodik', tcode: 'CJ88', description: 'WBS ke dua AuC sejumlah $90.000.' },
  { step: 10, id: 'full', title: 'Settlement penuh', tcode: 'CJ88', description: 'AuC ke bangunan $35.000 dan trafo $55.000.' },
  { step: 10, id: 'depreciate', title: 'Penyusutan', tcode: 'AFAB', description: '$145,83 + $458,33 = $604,16 per bulan.' },
];
