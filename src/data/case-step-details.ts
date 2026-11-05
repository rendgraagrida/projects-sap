export interface StepDbImpact {
  table: string;
  description: string;
}

export interface CaseStepDetail {
  module: string;
  sapStatus: string;
  businessPurpose: string;
  inputData: string[];
  systemChanges: string[];
  dbImpact: StepDbImpact[];
  fiJournalNote: string;
  hasJournal: boolean;
  avacNote: string;
}

export const caseStepDetails: Record<string, CaseStepDetail> = {
  project: {
    module: 'SAP PS (Project System)',
    sapStatus: 'CRTD (Created)',
    businessPurpose: 'Membentuk hierarki Project Definition dan WBS Elements sebagai payung pengumpulan biaya dan anggaran investasi jaringan fiber optic.',
    inputData: [
      'Project Definition: TINF-2026-01 (Regional Fiber Optic Backbone Deployment)',
      'Project Profile: ZCAPEX1 (Investment Project with Auto-AuC)',
      'Company Code: 1000 | Controlling Area: 1000 | Plant: 1100',
      'WBS Level 1: P-2026-TINF01.01 (Site preparation & civil works) — Acct Assgt ✅',
      'WBS Level 1: P-2026-TINF01.02 (Fiber & network material) — Acct Assgt ✅',
    ],
    systemChanges: [
      'Project Definition berstatus CRTD (Created) dan tersimpan di database.',
      'Dua elemen WBS dibentuk dengan indikator Planning Element dan Account Assignment Element aktif.',
      'Sistem belum membuka izin pengeluaran komitmen karena WBS belum direlease.',
    ],
    dbImpact: [
      { table: 'PROJ', description: 'Header proyek baru tersimpan (PSPID: TINF-2026-01, BUKRS: 1000, WERKS: 1100).' },
      { table: 'PRPS', description: '2 record master WBS tersimpan (POSID: P-2026-TINF01.01 & P-2026-TINF01.02, STATUS: CRTD, BELKZ: X).' },
    ],
    fiJournalNote: '⚠️ Tidak ada jurnal akuntansi FI pada langkah ini. Pembuatan Project Definition dan WBS di CJ20N adalah transaksi master data non-valuated murni di modul SAP PS. Karena belum ada mutasi kas, komitmen, persediaan, atau utang, tidak ada dokumen akuntansi yang diposting ke Buku Besar (General Ledger).',
    hasJournal: false,
    avacNote: 'Original Budget = $0.00, Available = $0.00. Plafon anggaran belum dialokasikan ke WBS; budgeting akan dilakukan pada Langkah 2 via CJ30 / CJ32.',
  },
  budget: {
    module: 'SAP PS (Project System)',
    sapStatus: 'BUDG (Budgeted) · AVAC Aktif',
    businessPurpose: 'Memasang pagu anggaran investasi proyek dan mencairkan (release) plafon belanja modal untuk mengaktifkan sistem kontrol ketersediaan dana (Availability Control).',
    inputData: [
      'WBS P-2026-TINF01.01: Original Budget $40,000 | Released $40,000',
      'WBS P-2026-TINF01.02: Original Budget $60,000 | Released $60,000',
      'Total Budget Proyek (TINF-2026-01): $100,000.00',
    ],
    systemChanges: [
      'Sistem mengunci plafon belanja modal maksimum sebesar $100,000.',
      'Sistem Availability Control (AVAC) aktif mengawasi komitmen PR, PO, dan pemakaian aktual terhadap released budget.',
    ],
    dbImpact: [
      { table: 'BPGE', description: 'Menyimpan nilai total plafon seumur hidup proyek ($40k pada .01 dan $60k pada .02).' },
      { table: 'BPJA', description: 'Menyimpan alokasi plafon tahun fiskal berjalan 2026.' },
    ],
    fiJournalNote: '⚠️ Tidak ada jurnal akuntansi FI. Anggaran di SAP PS adalah plafon kontrol operasional internal (CO/PS), bukan transaksi debit/kredit di buku besar keuangan (FI-GL).',
    hasJournal: false,
    avacNote: 'Released Budget menjadi $100,000.00 ($40,000.00 WBS 1 + $60,000.00 WBS 2). Sisa Available Budget = $100,000.00.',
  },
  release: {
    module: 'SAP PS ↔ FI-AA (Asset Accounting)',
    sapStatus: 'REL (Released) · BUDG · AVAC · AUC',
    businessPurpose: 'Mengubah status WBS dari CRTD menjadi REL agar dapat menerima Purchase Requisition dan Purchase Order. Pada proyek investasi modal, sistem otomatis men-generate Asset under Construction (AuC).',
    inputData: [
      'Status Change: CRTD ➔ REL via CJ20N',
      'Auto-AuC Generation: Terbentuk 2 nomor master AuC kelas 8000',
    ],
    systemChanges: [
      'Kedua WBS resmi berstatus REL (Released), membuka otorisasi pembebanan komitmen dan biaya.',
      'Settlement Rule periodik otomatis terpasang mengarahkan WBS .01 ke AuC 8000015-0 dan WBS .02 ke AuC 8000016-0.',
    ],
    dbImpact: [
      { table: 'ANLA', description: '2 master data Asset under Construction (AuC) terbentuk otomatis (ID 8000015-0 & 8000016-0, kelas 8000).' },
      { table: 'ANLB', description: 'Depreciation terms AuC tersimpan dengan depreciation key 0000 (tidak disusutkan selama proses konstruksi).' },
      { table: 'COBRB', description: 'Settlement rules otomatis menghubungkan masing-masing WBS ke akun AuC penerima.' },
    ],
    fiJournalNote: '⚠️ Tidak ada jurnal akuntansi FI. Pembuatan master aset AuC dan pelepasan status WBS adalah peristiwa administratif & konfigurasi aset; saldo nilai aset AuC masih $0.',
    hasJournal: false,
    avacNote: 'Available Budget tetap $100,000.00. Status sistem siap menerima Purchase Requisition dan Purchase Order.',
  },
  'po-material': {
    module: 'SAP MM (Materials Management) ↔ SAP PS',
    sapStatus: 'PO Created & Approved',
    businessPurpose: 'Menerbitkan Purchase Order material kabel fiber optic dan perangkat pasif ke vendor rekanan dengan alokasi khusus ke stok proyek (Project Stock).',
    inputData: [
      'Vendor: 100024 (PT Mitra Fiber Sintetis)',
      'PO Number: 4500010001 | Item: 00010',
      'Material: MAT-FO-48C (Kabel Fiber Optic 48-Core) | Qty: 1 LOT | Net Price: $50,000.00',
      'Account Assignment Category: Q (Project Make-to-Order Stock) | WBS: P-2026-TINF01.02',
    ],
    systemChanges: [
      'Purchase Order terbentuk dan disetujui di ME29N.',
      'Sistem AVAC mencatat nilai komitmen pembelian sebesar $50,000 pada WBS material.',
    ],
    dbImpact: [
      { table: 'EKKO', description: 'Header Purchase Order tersimpan (EBELN: 4500010001, LIFNR: 100024).' },
      { table: 'EKPO', description: 'Item PO tersimpan (MATNR: MAT-FO-48C, NETWR: 50000, KNTTP: Q).' },
      { table: 'EKKN', description: 'Account Assignment item PO membebankan WBS P-2026-TINF01.02.' },
    ],
    fiJournalNote: '⚠️ Tidak ada jurnal akuntansi FI. Penerbitan PO merupakan perikatan komersial awal (komitmen). Karena belum ada serah terima barang atau kewajiban pembayaran, belum terjadi transaksi debit/kredit di buku besar keuangan.',
    hasJournal: false,
    avacNote: 'PO Commitment WBS P-2026-TINF01.02 naik sebesar $50,000.00. Sisa Available Budget pada WBS ini berkurang dari $60,000.00 menjadi $10,000.00.',
  },
  'po-service': {
    module: 'SAP MM-SRV (External Services) ↔ SAP PS',
    sapStatus: 'PO Service Created & Approved',
    businessPurpose: 'Menerbitkan kontrak Purchase Order jasa pekerjaan sipil jaringan, penarikan kabel, testing, dan komisioning site backbone.',
    inputData: [
      'Vendor: 100025 (PT Network Deployment Sintetis)',
      'PO Number: 4500010002 | Item: 00010',
      'Item Category: D (Service) | Account Assignment: P (Project Direct)',
      'Short Text: "Instalasi, testing & commissioning fiber site" | Net: $35,000.00',
      'WBS: P-2026-TINF01.01 (Site preparation & civil works)',
    ],
    systemChanges: [
      'PO Jasa resmi terbentuk dan disetujui.',
      'Sistem AVAC mencatat komitmen jasa kontraktor sebesar $35,000.',
    ],
    dbImpact: [
      { table: 'EKKO', description: 'Header PO jasa tersimpan (EBELN: 4500010002, LIFNR: 100025).' },
      { table: 'EKPO', description: 'Item PO jasa tersimpan (PSTYP: D, KNTTP: P, NETWR: 35000).' },
      { table: 'EKKN', description: 'Account assignment menghubungkan baris PO jasa ke WBS P-2026-TINF01.01.' },
    ],
    fiJournalNote: '⚠️ Tidak ada jurnal akuntansi FI. Penerbitan PO jasa mencatatkan komitmen operasional, belum ada penyerahan hasil jasa nyata (Service Entry Sheet) atau tagihan hutang.',
    hasJournal: false,
    avacNote: 'PO Commitment WBS P-2026-TINF01.01 naik sebesar $35,000.00. Sisa Available Budget WBS 1 menjadi $5,000.00; total Available proyek tersisa $15,000.00.',
  },
  dp: {
    module: 'SAP FI-AP (Accounts Payable)',
    sapStatus: 'Down Payment Cleared to Vendor',
    businessPurpose: 'Membayar uang muka pekerjaan (Down Payment 20% = $7,000) kepada vendor jasa deployment melalui mekanisme akun kontrol Special G/L.',
    inputData: [
      'T-Code: F-47 (Request) dilanjutkan F-48 (Posting Payment)',
      'Vendor: 100025 | Special G/L Indicator: A (Down Payment on Current Assets)',
      'Bank Account: 111020 (Bank Mandiri USD) | Nilai: $7,000.00',
      'PO Reference: 4500010002 Item 00010',
    ],
    systemChanges: [
      'Uang muka dicatat terpisah dari utang usaha reguler agar tidak tercampur dalam invoice verification normal.',
      'Kas keluar dari rekening bank perusahaan.',
    ],
    dbImpact: [
      { table: 'BKPF', description: 'Header dokumen akuntansi nomor 5000000000 tersimpan (Doc. Type: KZ, BUKRS: 1000).' },
      { table: 'BSEG', description: 'Baris debit uang muka vendor (PK 29A, Akun 116010) dan kredit kas bank (PK 50, Akun 111020).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type KZ): Dr. [PK 29A] G/L 116010 Uang Muka Vendor: $7,000.00 | Cr. [PK 50] G/L 111020 Bank Outgoing: $7,000.00.',
    hasJournal: true,
    avacNote: 'Tidak mempengaruhi sisa budget AVAC (Down Payment adalah mutasi neraca aset lancar/uang muka, bukan pembebanan biaya proyek).',
  },
  'gr-q': {
    module: 'SAP MM-IM (Inventory Management) ↔ SAP FI-GL',
    sapStatus: 'Goods Receipt in Project Stock',
    businessPurpose: 'Menerima fisik material kabel fiber dan perangkat pasif dari vendor ke dalam gudang khusus proyek (Project Stock Q).',
    inputData: [
      'Movement Type: 101 Q (Goods receipt for purchase order into project stock)',
      'Reference PO: 4500010001 Item 00010 | Qty: 1 LOT | Nilai: $50,000.00',
      'WBS Element: P-2026-TINF01.02',
    ],
    systemChanges: [
      'Stok khusus proyek bertambah sebesar 1 LOT bernilai $50,000.',
      'PO Commitment terselesaikan; fixture mempertahankan reservasi heldQ $50,000 agar budget tidak terpakai ganda sebelum pemakaian fisik.',
    ],
    dbImpact: [
      { table: 'MSPR', description: 'Record stok proyek bertambah 1 lot dengan nilai valuasi $50,000.' },
      { table: 'EKBE', description: 'Purchase order history bertambah 1 transaksi Goods Receipt (VGABE: 1, BELNR dokumen material).' },
      { table: 'BKPF', description: 'Dokumen akuntansi logistik nomor 5000000001 tersimpan (Doc. Type: WE).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type WE): Dr. [PK 89] G/L 114015 Persediaan Material Proyek (OBYC: BSX): $50,000.00 | Cr. [PK 96] G/L 210090 GR/IR Clearing Account (OBYC: WRX): $50,000.00.',
    hasJournal: true,
    avacNote: 'PO Commitment $50,000 berkurang; sistem mempertahankan reservasi heldQ $50,000. Sisa Available WBS 2 tetap $10,000.00.',
  },
  'gi-q': {
    module: 'SAP MM-IM ↔ SAP PS ↔ SAP FI-GL',
    sapStatus: 'Project Stock Issued to WBS',
    businessPurpose: 'Mengeluarkan material kabel fiber dari gudang proyek untuk dipasang dan digelar pada trase site backbone.',
    inputData: [
      'Movement Type: 221 Q (Goods issue for project from project stock)',
      'WBS Element: P-2026-TINF01.02 | Nilai: $50,000.00',
    ],
    systemChanges: [
      'Stok fisik proyek berkurang menjadi 0.',
      'Nilai material $50,000 resmi dibebankan sebagai biaya aktual (Actual Cost) ke WBS.',
    ],
    dbImpact: [
      { table: 'MSPR', description: 'Saldo kuantitas dan nilai stok proyek kembali menjadi 0.' },
      { table: 'BKPF', description: 'Dokumen pengeluaran barang nomor 5000000002 tersimpan (Doc. Type: WA).' },
      { table: 'BSEG', description: 'Mencatat pengkreditan persediaan dan pendebetan beban material proyek dengan acuan WBS.' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type WA): Dr. [PK 40] G/L 510010 Biaya Material Proyek (OBYC: GBB-VBR): $50,000.00 (Objek Biaya: WBS P-2026-TINF01.02) | Cr. [PK 99] G/L 114015 Persediaan Material Proyek (OBYC: BSX): $50,000.00.',
    hasJournal: true,
    avacNote: 'Actual Cost WBS P-2026-TINF01.02 naik menjadi $50,000.00. Reservasi heldQ kembali 0. Sisa Available Budget tetap $10,000.00.',
  },
  'gi-cable': {
    module: 'SAP MM-IM ↔ SAP PS ↔ SAP FI-GL',
    sapStatus: 'General Stock Issued to WBS',
    businessPurpose: 'Mengambil material pendukung site (patch cord / aksesoris ODF) dari stok gudang umum perusahaan senilai $5,000 ke WBS proyek.',
    inputData: [
      'Movement Type: 221 (Goods issue for project from unrestricted-use stock)',
      'Material: MAT-ODF-01 | WBS: P-2026-TINF01.02 | Nilai: $5,000.00',
    ],
    systemChanges: [
      'Persediaan bahan baku umum perusahaan berkurang sebesar $5,000.',
      'Actual Cost WBS bertambah sebesar $5,000.',
    ],
    dbImpact: [
      { table: 'MARD', description: 'Kuantitas persediaan bahan umum di storage location berkurang.' },
      { table: 'BKPF', description: 'Dokumen pengeluaran barang umum nomor 5000000003 tersimpan (Doc. Type: WA).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type WA): Dr. [PK 40] G/L 510010 Biaya Material Proyek (OBYC: GBB-VBR): $5,000.00 (Objek Biaya: WBS P-2026-TINF01.02) | Cr. [PK 99] G/L 114010 Persediaan Bahan Baku Umum (OBYC: BSX): $5,000.00.',
    hasJournal: true,
    avacNote: 'Actual Cost WBS P-2026-TINF01.02 naik menjadi $55,000.00 (dari total plafon $60,000.00). Sisa Available Budget tinggal $5,000.00.',
  },
  ses: {
    module: 'SAP MM-SRV ↔ SAP PS ↔ SAP FI-GL',
    sapStatus: 'Service Entry Sheet Accepted',
    businessPurpose: 'Menerbitkan Berita Acara Serah Terima (BAST) jasa instalasi, penggelaran fiber, dan komisioning 100% senilai $35,000.',
    inputData: [
      'T-Code: ML81N mengacu ke PO Jasa 4500010002 | Nilai: $35,000.00',
      'Tindakan: Klik Accept (Bendera Hijau) & Save',
    ],
    systemChanges: [
      'Jasa kontraktor disetujui secara teknis.',
      'Sistem otomatis memicu Goods Receipt logistik jasa dan memposting beban aktual ke WBS sipil.',
    ],
    dbImpact: [
      { table: 'ESLH', description: 'Header paket jasa tersimpan dengan status disetujui.' },
      { table: 'ESLL', description: 'Baris rincian jasa BAST tersimpan.' },
      { table: 'EKBE', description: 'PO History mencatat penerimaan jasa sebesar $35,000.' },
      { table: 'BKPF', description: 'Dokumen akrual penerimaan jasa nomor 5000000004 tersimpan (Doc. Type: WE).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type WE): Dr. [PK 40] G/L 510020 Biaya Jasa Deployment: $35,000.00 (Objek Biaya: WBS P-2026-TINF01.01) | Cr. [PK 96] G/L 210095 GR/IR Clearing Jasa (OBYC: WRX): $35,000.00.',
    hasJournal: true,
    avacNote: 'PO Commitment $35,000 berubah menjadi Actual Cost $35,000.00 pada WBS P-2026-TINF01.01. Total Actual Cost proyek mencapai $90,000.00 ($35k + $55k). Sisa budget proyek = $10,000.00.',
  },
  'invoice-material': {
    module: 'SAP MM-LIV (Logistics Invoice Verification) ↔ SAP FI-AP',
    sapStatus: 'Invoice Material Posted',
    businessPurpose: 'Memvalidasi dan memposting faktur tagihan dari vendor material fiber atas PO 4500010001 beserta PPN 11%.',
    inputData: [
      'Reference PO: 4500010001 | Nilai Dasar: $50,000.00',
      'Tax Code: V1 (PPN Masukan 11%): $5,500.00 | Total Tagihan: $55,500.00',
    ],
    systemChanges: [
      'Saldo akun perantara GR/IR barang ter-clearing menjadi nol.',
      'Timbul utang usaha dagang ke Vendor 100024 sebesar $55,500.',
    ],
    dbImpact: [
      { table: 'RBKP', description: 'Header invoice vendor logistik tersimpan.' },
      { table: 'RSEG', description: 'Item rincian invoice mengacu pada PO 4500010001.' },
      { table: 'BKPF', description: 'Dokumen faktur keuangan nomor 5000000005 tersimpan (Doc. Type: RE).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type RE): Dr. [PK 86] G/L 210090 GR/IR Clearing Barang (OBYC: WRX): $50,000.00 | Dr. [PK 40] G/L 115010 PPN Masukan: $5,500.00 | Cr. [PK 31] Vendor 100024 (Recon G/L 210010 Hutang Usaha): $55,500.00.',
    hasJournal: true,
    avacNote: 'Tidak mempengaruhi sisa budget AVAC (beban proyek sudah diakui saat Goods Issue pada Langkah 6).',
  },
  'invoice-service': {
    module: 'SAP MM-LIV ↔ SAP FI-AP',
    sapStatus: 'Invoice Service Posted with Tax & WHT',
    businessPurpose: 'Memvalidasi tagihan jasa kontraktor deployment atas PO 4500010002 dengan perhitungan PPN 11% dan pemotongan PPh 23 (2%).',
    inputData: [
      'Reference PO: 4500010002 | Nilai Jasa: $35,000.00',
      'PPN Masukan (11%): $3,850.00 | Withholding PPh 23 (2%): -$700.00 | Tagihan Bersih: $38,150.00',
    ],
    systemChanges: [
      'Saldo akun perantara GR/IR jasa ter-clearing menjadi nol.',
      'Kewajiban hutang pajak pemotongan PPh 23 tercatat sebesar $700.',
      'Utang bersih ke vendor jasa tercatat sebesar $38,150.',
    ],
    dbImpact: [
      { table: 'RBKP', description: 'Header invoice jasa logistik tersimpan.' },
      { table: 'RSEG', description: 'Item rincian invoice jasa tersimpan.' },
      { table: 'BKPF', description: 'Dokumen akuntansi faktur jasa nomor 5000000006 tersimpan (Doc. Type: RE).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type RE): Dr. [PK 86] G/L 210095 GR/IR Clearing Jasa (OBYC: WRX): $35,000.00 | Dr. [PK 40] G/L 115010 PPN Masukan: $3,850.00 | Cr. [PK 31] Vendor 100025 (Recon G/L 210010 Hutang Usaha): $38,150.00 | Cr. [PK 50] G/L 213023 Hutang Pajak PPh 23: $700.00.',
    hasJournal: true,
    avacNote: 'Tidak merubah sisa budget AVAC (biaya aktual jasa telah dicatat saat SES Langkah 7).',
  },
  'clear-dp': {
    module: 'SAP FI-AP',
    sapStatus: 'Vendor Down Payment Cleared against Invoice',
    businessPurpose: 'Mengkompensasikan (clearing) uang muka $7,000 yang dibayarkan di Langkah 5 terhadap utang faktur vendor jasa.',
    inputData: [
      'T-Code: F-54 | Vendor: 100025 (PT Network Deployment Sintetis)',
      'Alokasi Clearing: $7,000.00 terhadap invoice nomor 5000000006',
    ],
    systemChanges: [
      'Akun piutang uang muka vendor dikreditkan.',
      'Sisa kewajiban utang kas kepada vendor 100025 berkurang dari $38,150 menjadi $31,150.',
    ],
    dbImpact: [
      { table: 'BKPF', description: 'Dokumen clearing uang muka nomor 5000000007 tersimpan (Doc. Type: AB).' },
      { table: 'BSEG', description: 'Clearing item debit hutang vendor dan kredit uang muka vendor (PK 26 & PK 39A).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type AB): Dr. [PK 26] Vendor 100025 (Recon G/L 210010 Hutang Usaha): $7,000.00 | Cr. [PK 39A] Vendor 100025 (Recon G/L 116010 Uang Muka Vendor): $7,000.00.',
    hasJournal: true,
    avacNote: 'Rekonsiliasi neraca internal, tidak mempengaruhi sisa budget AVAC.',
  },
  pay: {
    module: 'SAP FI-AP',
    sapStatus: 'Automatic Payment Run Executed',
    businessPurpose: 'Melunasi sisa seluruh tagihan bersih kedua vendor melalui program pembayaran otomatis (Payment Run).',
    inputData: [
      'T-Code: F110 (Automatic Payment Run)',
      'Vendor 100024 (Material): $55,500.00 | Vendor 100025 (Jasa): $31,150.00 | Total Kas Keluar: $86,650.00',
    ],
    systemChanges: [
      'Kewajiban utang kepada kedua vendor lunas 100% (saldo hutang = $0).',
      'Kas keluar dari rekening operasional bank perusahaan.',
    ],
    dbImpact: [
      { table: 'BKPF', description: 'Dokumen pelunasan kas bank nomor 5000000008 tersimpan (Doc. Type: KZ).' },
      { table: 'BSEG', description: 'Pelunasan akun hutang kedua rekanan dan pengkreditan rekening bank.' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type KZ): Dr. [PK 25] Vendor 100024 (G/L 210010 Hutang Usaha): $55,500.00 | Dr. [PK 25] Vendor 100025 (G/L 210010 Hutang Usaha): $31,150.00 | Cr. [PK 50] G/L 111020 Bank Outgoing Account: $86,650.00.',
    hasJournal: true,
    avacNote: 'Pelunasan utang kas tidak merubah posisi budget proyek (Actual Cost tetap $90,000.00).',
  },
  periodic: {
    module: 'SAP PS ↔ SAP FI-AA',
    sapStatus: 'Monthly Settlement to AuC Completed',
    businessPurpose: 'Mengeksekusi settlement periodik akhir bulan (Processing Type: Automatic/PER) untuk memindahkan saldo biaya proyek dari akun Laba Rugi ke Aset Dalam Penyelesaian (AuC) di Neraca.',
    inputData: [
      'T-Code: CJ88 | Project: TINF-2026-01 | Period: 11/2026 | Processing Type: Automatic (PER)',
      'WBS .01 Alokasi: $35,000.00 ➔ AuC 8000015-0',
      'WBS .02 Alokasi: $55,000.00 ➔ AuC 8000016-0',
    ],
    systemChanges: [
      'Beban pada WBS dikreditkan sebesar $90,000.',
      'Dua nomor aset AuC resmi mencatat perolehan nilai kapitalisasi $90,000 di Neraca.',
    ],
    dbImpact: [
      { table: 'COBRB', description: 'Aturan settlement dibaca sistem.' },
      { table: 'ANLC', description: 'Nilai perolehan kumulatif AuC bertambah total $90,000.00.' },
      { table: 'BKPF', description: 'Dokumen settlement nomor 5000000009 tersimpan (Doc. Type: AA).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type AA): Dr. [PK 70] AuC 8000015-0 (G/L 129010 Aset Dalam Penyelesaian): $35,000.00 | Dr. [PK 70] AuC 8000016-0 (G/L 129010 Aset Dalam Penyelesaian): $55,000.00 | Cr. [PK 50] G/L 599010 Settlement Proyek CAPEX [WBS .01]: $35,000.00 | Cr. [PK 50] G/L 599010 Settlement Proyek CAPEX [WBS .02]: $55,000.00.',
    hasJournal: true,
    avacNote: 'Realisasi proyek $90,000.00 resmi berpindah dari beban operasional ke neraca AuC. Sisa Available Budget tetap $10,000.00.',
  },
  full: {
    module: 'SAP PS ↔ SAP FI-AA',
    sapStatus: 'TECO (Technically Completed) · Full Settlement',
    businessPurpose: 'Menyatakan proyek selesai secara teknis (TECO) dan mengkapitalisasi seluruh saldo AuC menjadi Aset Tetap Final yang siap dioperasikan dan disusutkan.',
    inputData: [
      'Status Proyek: TECO (Technically Completed)',
      'Aset Final 1: 2000099-0 (Network site & civil works, kelas 2000, masa manfaat 20 tahun)',
      'Aset Final 2: 3000099-0 (Fiber & network equipment, kelas 3000, masa manfaat 10 tahun)',
      'T-Code: CJ88 | Processing Type: Full Settlement (FUL)',
    ],
    systemChanges: [
      'Status proyek beralih ke TECO; tidak boleh ada lagi transaksi pembebanan komitmen baru.',
      'Saldo kedua akun AuC bersih menjadi $0.',
      'Dua Aset Tetap Final resmi aktif di buku besar neraca.',
    ],
    dbImpact: [
      { table: 'PROJ', description: 'Status proyek diperbarui menjadi TECO.' },
      { table: 'PRPS', description: 'Status elemen WBS diperbarui menjadi TECO.' },
      { table: 'ANLA', description: 'Status aset tetap final aktif dengan tanggal kapitalisasi aset.' },
      { table: 'BKPF', description: 'Dokumen kapitalisasi aset tetap nomor 5000000010 tersimpan (Doc. Type: AA).' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type AA): Dr. [PK 70] Asset 2000099-0 (G/L 121020 Network Site & Civil Works): $35,000.00 | Dr. [PK 70] Asset 3000099-0 (G/L 121030 Fiber & Network Equipment): $55,000.00 | Cr. [PK 75] AuC 8000015-0 (G/L 129010 Aset Dalam Penyelesaian): $35,000.00 | Cr. [PK 75] AuC 8000016-0 (G/L 129010 Aset Dalam Penyelesaian): $55,000.00.',
    hasJournal: true,
    avacNote: 'Seluruh siklus belanja modal tuntas; aset siap masuk ke proses penyusutan berkala.',
  },
  depreciate: {
    module: 'SAP FI-AA',
    sapStatus: 'Depreciation Posted (Period Closing)',
    businessPurpose: 'Menjalankan program penyusutan aset tetap (Depreciation Posting Run) pada akhir periode pembukuan untuk mengakui beban depresiasi operasional bulan pertama.',
    inputData: [
      'T-Code: AFAB | Fiscal Year: 2026 | Period: 11 | Posting Run: Planned',
      'Network site ($35,000 / 240 bulan) = $145.83',
      'Fiber equipment ($55,000 / 120 bulan) = $458.33',
      'Total Beban Depresiasi Bulan 1 = $604.16',
    ],
    systemChanges: [
      'Beban penyusutan operasional bulan pertama tercatat di Laba Rugi.',
      'Nilai buku bersih (Net Book Value) aset tetap di Neraca berkurang menjadi $89,395.84.',
    ],
    dbImpact: [
      { table: 'ANLC', description: 'Akumulasi penyusutan per aset tercatat di tabel valuasi aset.' },
      { table: 'BKPF', description: 'Dokumen penyusutan berkala nomor 5000000011 tersimpan (Doc. Type: AF).' },
      { table: 'BSEG', description: 'Mencatat pendebetan beban penyusutan dan pengkreditan akumulasi penyusutan.' },
    ],
    fiJournalNote: '💰 Jurnal Akuntansi Terbentuk (Doc. Type AF): Dr. [PK 40] G/L 610010 Beban Penyusutan Aset Tetap: $604.16 | Cr. [PK 75] G/L 122020 Akumulasi Penyusutan Network Site: $145.83 | Cr. [PK 75] G/L 122030 Akumulasi Penyusutan Fiber & Network: $458.33.',
    hasJournal: true,
    avacNote: 'Aset telah resmi masuk siklus operasional normal pemeliharaan dan depresiasi bulanan di FI-AA.',
  },
};
