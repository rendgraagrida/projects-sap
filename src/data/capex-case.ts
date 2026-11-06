import type { CaseAction } from '../types/sap';

// Fixture edukasi sintetis untuk infrastruktur akses InfraNexia / MetroNexia,
// bukan data internal atau proyek aktual perusahaan.
export const caseActions: readonly CaseAction[] = [
  { step: 1, id: 'project', title: 'Membuat struktur proyek', tcode: 'CJ20N', description: 'Project TINF-2026-01 dengan WBS pekerjaan sipil jaringan dan deployment fiber.' },
  { step: 2, id: 'budget', title: 'Anggaran proyek', tcode: 'CJ30/CJ32', description: 'Release $40,000 untuk site/civil works dan $60,000 untuk material network.' },
  { step: 3, id: 'release', title: 'Release proyek dan AuC', tcode: 'CJ20N', description: 'Status REL dan dua aset dalam penyelesaian kelas 8000.' },
  { step: 4, id: 'po-material', title: 'PO material fiber', tcode: 'ME21N/ME29N', description: 'PO 4500010001, kategori Q, $50,000 untuk kabel fiber dan perangkat pasif.' },
  { step: 4, id: 'po-service', title: 'PO jasa deployment', tcode: 'ME21N/ME29N', description: 'PO 4500010002, kategori P/D, $35,000 untuk instalasi dan commissioning site.' },
  { step: 5, id: 'dp', title: 'Uang muka', tcode: 'F-47/F-48', description: 'DP jasa deployment $7,000, special G/L A.' },
  { step: 6, id: 'gr-q', title: 'Penerimaan material fiber', tcode: 'MIGO 101 Q', description: 'Project stock $50,000, belum menjadi actual cost sampai issue.' },
  { step: 6, id: 'gi-q', title: 'Pemakaian material fiber', tcode: 'MIGO 221 Q', description: 'Konsumsi project stock untuk deployment backbone $50,000.' },
  { step: 6, id: 'gi-cable', title: 'Pemakaian material dari stok umum', tcode: 'MIGO 221', description: 'Material pendukung site dari stok umum $5,000.' },
  { step: 7, id: 'ses', title: 'Serah terima jasa deployment', tcode: 'ML81N', description: 'Terima jasa instalasi, testing, dan commissioning $35,000.' },
  { step: 8, id: 'invoice-material', title: 'Faktur material network', tcode: 'MIRO', description: '$50,000 + pajak sintetis lab 11%.' },
  { step: 8, id: 'invoice-service', title: 'Faktur jasa deployment', tcode: 'MIRO', description: '$35,000 + pajak sintetis 11% - withholding sintetis 2%.' },
  { step: 8, id: 'clear-dp', title: 'Clearing uang muka', tcode: 'F-54', description: 'Kurangi utang jasa deployment $7,000.' },
  { step: 8, id: 'pay', title: 'Pelunasan vendor', tcode: 'F110', description: 'Pembayaran simulasi $86,650, tanpa transaksi bank nyata.' },
  { step: 9, id: 'periodic', title: 'Settlement periodik', tcode: 'CJ88', description: 'WBS ke dua AuC sejumlah $90,000.' },
  { step: 10, id: 'full', title: 'Settlement penuh', tcode: 'CJ88', description: 'AuC ke network civil works $35,000 dan network equipment $55,000.' },
  { step: 10, id: 'depreciate', title: 'Penyusutan', tcode: 'AFAB', description: '$145.83 + $458.33 = $604.16 pada bulan pertama.' },
];
