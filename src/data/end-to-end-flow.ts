export type FlowAuditStatus = 'Sesuai konsep SAP' | 'Bersyarat konfigurasi' | 'Fixture edukasi';

export interface OfficialSource {
  title: string;
  url: string;
}

export interface EndToEndStage {
  id: string;
  number: number;
  phase: string;
  title: string;
  module: string;
  transaction: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  control: string;
  status: FlowAuditStatus;
  sources: OfficialSource[];
  branch?: string;
}

export interface AuditedInput {
  category: string;
  currentValue: string;
  status: FlowAuditStatus;
  finding: string;
  action: string;
}

export const endToEndStages: readonly EndToEndStage[] = [
  {
    id: 'demand', number: 1, phase: 'Inisiasi', title: 'Tentukan kebutuhan dan tujuan bisnis', module: 'Bisnis · PS (opsional)', transaction: 'Project Builder / Manage Projects',
    purpose: 'Tetapkan scope, deliverable, tanggal, pemilik biaya, dan apakah kebutuhan dikelola sebagai proyek atau pengadaan operasional biasa.',
    inputs: ['Business requirement dan scope pekerjaan', 'Organisasi pemilik, tanggal rencana, dan objek biaya'],
    outputs: ['Kebutuhan terdefinisi', 'Keputusan: memakai WBS atau proses procurement tanpa proyek'],
    control: 'Project System bukan syarat untuk semua pembelian; dipakai bila biaya, jadwal, atau kapitalisasi perlu dikendalikan per proyek.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Creating Project Structures', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/creating-project-structures-1' }],
  },
  {
    id: 'structure-budget', number: 2, phase: 'Inisiasi', title: 'Buat WBS, rencana biaya, dan budget', module: 'SAP PS / CO', transaction: 'CJ20N · CJ30/CJ32 (klasik)',
    purpose: 'Bangun struktur WBS dan tetapkan budget atau availability control sebelum komitmen pembelian dan biaya aktual masuk.',
    inputs: ['Project Definition dan WBS Element', 'Original budget, fiscal year, dan profil availability control'],
    outputs: ['WBS siap menerima account assignment', 'Budget/release dan batas kontrol tersedia'],
    control: 'Nama transaksi, budget process, dan availability control mengikuti edisi serta desain konfigurasi. Budget PS bukan jurnal FI debit/kredit.', status: 'Bersyarat konfigurasi',
    sources: [
      { title: 'SAP Learning — Creating Project Structures', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/creating-project-structures-1' },
      { title: 'SAP Learning — Budgeting Projects', url: 'https://learning.sap.com/learning-journeys/discovering-the-basics-of-sap-s-4hana-project-system/budgeting-projects_b2f719c7-88e4-4fb6-a117-8126ecb30cfb' },
    ],
  },
  {
    id: 'requisition', number: 3, phase: 'Procurement', title: 'Buat kebutuhan pengadaan dan tentukan sumber', module: 'SAP MM', transaction: 'ME51N · MRP / sourcing (sesuai skenario)',
    purpose: 'Ubah kebutuhan yang disetujui menjadi Purchase Requisition atau sumber kebutuhan lain, lalu tentukan vendor atau source of supply.',
    inputs: ['Material atau service description', 'Quantity, delivery date, plant, account assignment K/P/Q/A bila diperlukan'],
    outputs: ['Purchase Requisition', 'Source of supply atau kandidat vendor'],
    control: 'PR manual, MRP, RFQ, contract, dan source determination adalah alternatif proses; tidak semua alur memakai seluruh dokumen.', status: 'Sesuai konsep SAP',
    sources: [{ title: 'SAP Learning — Outlining a General Procurement Process', url: 'https://learning.sap.com/courses/business-processes-in-sap-s-4hana-sourcing-and-procurement/outlining-a-general-procurement-process_dfbc33f8-72f1-4d30-a4cd-bd63d48d7a70' }],
  },
  {
    id: 'purchase-order', number: 4, phase: 'Procurement', title: 'Buat, validasi, dan setujui Purchase Order', module: 'SAP MM-PUR', transaction: 'ME21N · Flexible Workflow / release procedure',
    purpose: 'Bentuk komitmen komersial kepada supplier dengan item, harga, jadwal, pajak, dan account assignment yang benar.',
    inputs: ['Supplier atau Business Partner', 'Material/service, quantity, net price, delivery date', 'Plant, purchasing organization, dan account assignment'],
    outputs: ['Purchase Order yang disetujui', 'Commitment pada WBS/cost object bila digunakan'],
    control: 'Release strategy klasik dan flexible workflow bukan satu-satunya pilihan; approval serta field wajib ditentukan konfigurasi.', status: 'Sesuai konsep SAP',
    sources: [{ title: 'SAP Learning — Outlining a General Procurement Process', url: 'https://learning.sap.com/courses/business-processes-in-sap-s-4hana-sourcing-and-procurement/outlining-a-general-procurement-process_dfbc33f8-72f1-4d30-a4cd-bd63d48d7a70' }],
  },
  {
    id: 'receipt', number: 5, phase: 'Penerimaan', title: 'Terima barang atau konfirmasi jasa', module: 'SAP MM-IM / MM-SRV', transaction: 'MIGO 101 · Service Entry Sheet',
    purpose: 'Catat bahwa material telah diterima atau jasa telah diserahkan dan disetujui sesuai PO.',
    inputs: ['PO reference, quantity, posting date, plant/storage location', 'Untuk jasa: service lines, acceptance, dan account assignment'],
    outputs: ['Material document atau service entry document', 'Stok, PO history, dan/atau biaya aktual sesuai valuasi/configuration'],
    control: 'Movement type 101 adalah pola goods receipt terhadap PO; project stock, valuated/non-valuated receipt, serta posting FI bergantung pada item dan konfigurasi.', status: 'Bersyarat konfigurasi',
    branch: 'Cabang barang: MIGO · Cabang jasa: Service Entry Sheet',
    sources: [
      { title: 'SAP Learning — Posting a Goods Receipt with Reference', url: 'https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/posting-a-goods-receipt-with-reference' },
      { title: 'SAP Help — Movement Types (Project Stock)', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/cc8f759e1b0e4f3b8048c3cf808d4068/674ad2784d654e45ae9e4cea9b5dedcc.html' },
    ],
  },
  {
    id: 'invoice', number: 6, phase: 'Penerimaan', title: 'Verifikasi dan posting invoice supplier', module: 'SAP MM-LIV / FI-AP', transaction: 'MIRO / Supplier Invoice',
    purpose: 'Cocokkan invoice supplier terhadap PO dan penerimaan yang relevan, lalu posting kewajiban usaha serta pajak sesuai konfigurasi.',
    inputs: ['Supplier invoice, PO/GR or SES reference', 'Invoice date, posting date, amount, currency, tax code, dan withholding bila berlaku'],
    outputs: ['Invoice document', 'Clearing GR/IR atau accrual dan open item vendor'],
    control: '2-way/3-way match, GR-based invoice verification, tolerance, tax, dan withholding adalah kebijakan/configuration; tidak boleh dianggap sama pada semua sistem.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Working with Invoice Management', url: 'https://learning.sap.com/learning-journeys/exploring-functions-and-innovation-in-sap-s-4hana-sourcing-and-procurement/working-with-invoice-management_b94460d9-dd35-48cc-9c58-8a13ca751bc8' }],
  },
  {
    id: 'payment', number: 7, phase: 'Penyelesaian', title: 'Bayar open item supplier', module: 'SAP FI-AP', transaction: 'F110 / Automatic Payment Run',
    purpose: 'Pilih invoice jatuh tempo, tinjau proposal, jalankan payment run, dan hasilkan dokumen pembayaran atau media pembayaran.',
    inputs: ['Company code, payment date, payment method, bank selection', 'Open vendor items yang jatuh tempo dan tidak diblokir'],
    outputs: ['Payment document', 'Open item vendor ter-clearing dan payment medium bila dikonfigurasi'],
    control: 'F110 adalah istilah transaksi klasik; proses proposal, approval, bank, dan payment medium tetap memerlukan konfigurasi dan otorisasi.', status: 'Sesuai konsep SAP',
    sources: [{ title: 'SAP Learning — Executing an Automatic Payment Run', url: 'https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/executing-an-automatic-payment-run' }],
  },
  {
    id: 'settlement', number: 8, phase: 'Penyelesaian', title: 'Settlement biaya proyek bila investment project', module: 'SAP PS / FI-AA', transaction: 'CJ88 / settlement app',
    purpose: 'Pindahkan biaya aktual yang memenuhi aturan kapitalisasi dari WBS atau investment measure ke AuC atau receiver lain.',
    inputs: ['Actual cost pada WBS, settlement rule/profile, source/allocation structure', 'Period, company code, receiver, dan hasil validasi closing'],
    outputs: ['Settlement document', 'Saldo WBS berkurang dan AuC/receiver menerima nilai sesuai aturan'],
    control: 'Settlement tidak berlaku untuk semua proyek; receiver, capitalization split, periodic/full processing, dan settlement profile wajib dikonfigurasi.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Executing a Settlement', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/executing-a-settlement' }],
  },
  {
    id: 'capitalize-depreciate', number: 9, phase: 'Penyelesaian', title: 'Kapitalisasi aset dan jalankan penyusutan', module: 'SAP FI-AA', transaction: 'AuC settlement · AFAB / depreciation posting run',
    purpose: 'Saat aset siap digunakan, selesaikan AuC ke aset tetap final lalu jalankan penyusutan pada periode yang diizinkan.',
    inputs: ['Asset class, depreciation area/key, capitalization date, useful life', 'AuC balance, completion/TECO decision, fiscal year and period'],
    outputs: ['Fixed asset final', 'Depreciation document dan nilai buku yang diperbarui'],
    control: 'Pembuatan AuC otomatis, tanggal mulai penyusutan, depreciation key, period control, dan full/partial settlement mengikuti investment profile serta konfigurasi FI-AA.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Help — Settlement of an Asset under Construction', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/67e323b7117e4c91869c258933f47182/5da0a3519aa05f72e10000000a423f68.html' }],
  },
];

export const auditedInputs: readonly AuditedInput[] = [
  {
    category: 'Organisasi dan WBS', currentValue: 'Company Code 1000 · Plant 1100 · WBS P-2026-TINF01.01/.02', status: 'Fixture edukasi',
    finding: 'Format ID dapat dipakai sebagai contoh latihan, tetapi SAP tidak menetapkan angka tersebut sebagai default atau data Telkom.',
    action: 'Dipertahankan sebagai synthetic fixture dan diberi label; pada implementasi nyata validasi terhadap master data target.',
  },
  {
    category: 'PO dan supplier', currentValue: 'PO 4500010001/2 · Vendor 100024/100025 · MAT-FO-48C/MAT-ODF-01', status: 'Fixture edukasi',
    finding: 'Nomor dokumen, vendor, dan material adalah data latihan; dokumentasi SAP memvalidasi struktur proses, bukan nomor internal ini.',
    action: 'Tidak dipromosikan sebagai data resmi; gunakan BP, material, purchasing org, plant, dan PO target saat implementasi.',
  },
  {
    category: 'Goods movement', currentValue: 'MIGO 101 dan project stock 221 Q', status: 'Bersyarat konfigurasi',
    finding: 'Goods receipt 101 terhadap PO adalah pola SAP yang terdokumentasi. Project stock, valuasi, account assignment, dan movement lanjutan bergantung skenario.',
    action: 'Flow general memakai 101 sebagai contoh utama; 221 Q dipertahankan hanya sebagai fixture skenario project stock dengan caveat konfigurasi.',
  },
  {
    category: 'Tax dan withholding', currentValue: 'PPN 11% · PPh 23 2% · V1/V2 · akun 115010/213023', status: 'Fixture edukasi',
    finding: 'Tarif, kode pajak, akun, dan withholding bukan standar universal SAP; harus mengikuti negara, legal requirement, tax procedure, dan konfigurasi perusahaan.',
    action: 'Label sintetis dipertahankan; tidak digunakan sebagai rekomendasi pajak atau konfigurasi produksi.',
  },
  {
    category: 'OBYC dan akun G/L', currentValue: 'BSX 114010/114015 · WRX 210090 · GBB-VBR 510010', status: 'Bersyarat konfigurasi',
    finding: 'Kunci account determination seperti BSX, WRX, dan GBB adalah konsep SAP; nomor G/L ditentukan chart of accounts dan konfigurasi valuation/account determination.',
    action: 'Akun contoh diperlakukan sebagai fixture; implementasi nyata wajib diuji di OBYC dan chart of accounts target.',
  },
  {
    category: 'Tabel S/4HANA', currentValue: 'ACDOCA, MATDOC, BKPF/BSEG, EKKO/EKPO/EKKN', status: 'Bersyarat konfigurasi',
    finding: 'Universal Journal ACDOCA dan model material document MATDOC adalah acuan S/4HANA; compatibility view, release, dan edisi memengaruhi akses tabel lama.',
    action: 'UI menyebut proyeksi edukasi, bukan DDIC lengkap; jangan menggunakan fixture ini sebagai query produksi tanpa verifikasi release.',
  },
  {
    category: 'AuC, settlement, depreciation', currentValue: 'AuC dibuat saat release · CJ88 · AFAB', status: 'Bersyarat konfigurasi',
    finding: 'Investment profile dapat mengatur pembuatan AuC saat release dan settlement periodik/full; kapitalisasi serta awal penyusutan tetap bergantung konfigurasi FI-AA.',
    action: 'Flow menampilkan langkah sebagai conditional gate, bukan urutan wajib untuk semua project atau semua edisi SAP.',
  },
];

export const officialSources: readonly OfficialSource[] = [
  { title: 'SAP Learning — Outlining a General Procurement Process', url: 'https://learning.sap.com/courses/business-processes-in-sap-s-4hana-sourcing-and-procurement/outlining-a-general-procurement-process_dfbc33f8-72f1-4d30-a4cd-bd63d48d7a70' },
  { title: 'SAP Learning — Executing Goods Receipts and Service Entries', url: 'https://learning.sap.com/courses/sap-s-4hana-sourcing-procurement-innovations/executing-goods-receipts-and-service-entries_ad932248-adba-4966-8935-a520ff6cff53' },
  { title: 'SAP Learning — Executing a Settlement', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/executing-a-settlement' },
  { title: 'SAP Learning — Executing an Automatic Payment Run', url: 'https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/executing-an-automatic-payment-run' },
  { title: 'SAP Help — Movement Types (Project Stock)', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/cc8f759e1b0e4f3b8048c3cf808d4068/674ad2784d654e45ae9e4cea9b5dedcc.html' },
  { title: 'SAP Help — Settlement of an Asset under Construction', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/67e323b7117e4c91869c258933f47182/5da0a3519aa05f72e10000000a423f68.html' },
];
