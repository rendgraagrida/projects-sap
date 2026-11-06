export type FlowAuditStatus = 'Sesuai konsep SAP' | 'Bersyarat konfigurasi' | 'Fixture edukasi';

export interface OfficialSource {
  title: string;
  url: string;
}

export interface TelcoMaterial {
  level: number;
  materialId: string;
  name: string;
  billingType: 'Grouping' | 'MRC' | 'OTC';
  role: string;
  sapRepresentation: string;
  status: FlowAuditStatus;
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

export const telcoProductMaterials: readonly TelcoMaterial[] = [
  {
    level: 1,
    materialId: 'MATERIAL 1',
    name: 'MetroNexia',
    billingType: 'Grouping',
    role: 'Root product family untuk seluruh penawaran internet MetroNexia.',
    sapRepresentation: 'Product Hierarchy / Material Group; bukan otomatis item tagihan.',
    status: 'Bersyarat konfigurasi',
  },
  {
    level: 2,
    materialId: 'MATERIAL 2',
    name: 'MetroNexia MRC',
    billingType: 'MRC',
    role: 'Akses internet berulang dengan tagihan bulanan (Monthly Recurring Charge).',
    sapRepresentation: 'Material master atau subscription product yang contract-relevant dan recurring.',
    status: 'Sesuai konsep SAP',
  },
  {
    level: 2,
    materialId: 'MATERIAL 3',
    name: 'MetroNexia OTC',
    billingType: 'OTC',
    role: 'Biaya satu kali, misalnya aktivasi, instalasi, atau biaya perubahan layanan.',
    sapRepresentation: 'Material master atau subscription product one-off charge; biasanya tidak menjadi recurring contract item.',
    status: 'Sesuai konsep SAP',
  },
];

export const telcoContext = {
  company: 'InfraNexia',
  brand: 'MetroNexia',
  business: 'Penjualan layanan akses internet (Order-to-Cash via SAP SD)',
  salesArea: 'Sales Org 1000 · Dist. Channel 10 (B2B) · Division 01 (Internet)',
  recurringCharge: 'MRC — Monthly Recurring Charge (Periodic Billing Plan 02)',
  oneTimeCharge: 'OTC — One-Time Charge (Milestone Billing Plan 01)',
  note: 'Nama perusahaan, brand, nomor material, tarif, dan customer pada lab adalah fixture edukasi sintetis.',
} as const;
export const endToEndStages: readonly EndToEndStage[] = [
  {
    id: 'product-master', number: 1, phase: 'Product & Pricing Master', title: 'Definisikan produk MetroNexia dan skema harga SD', module: 'SAP SD / MM / Pricing', transaction: 'MM01 · VK11 (PR00 / MWST)',
    purpose: 'Bangun master material penawaran internet InfraNexia dengan Sales Area data, Material Account Assignment Group (KTGRM), serta Condition Records untuk tarif dasar PR00 dan PPN keluaran MWST.',
    inputs: ['Material 1: MetroNexia (Root product hierarchy)', 'Material 2: MetroNexia MRC (KTGRM: 01, tarif PR00 bulanan)', 'Material 3: MetroNexia OTC (KTGRM: 02, tarif PR00 aktivasi/instalasi)'],
    outputs: ['Master material dengan view Sales: Sales Org 1 & 2', 'Condition Record VK11 aktif di tabel KONH/KONP'],
    control: 'SAP Material Master tidak otomatis membuat hubungan parent-child hanya dari nama. Root dimodelkan melalui Product Hierarchy (T179), Material Group, atau Sales BOM; harga dipelihara via Condition Technique.', status: 'Bersyarat konfigurasi',
    sources: [
      { title: 'SAP Help — Material Master Data', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/af9ef57f504840d2b81be8667206d485/3d7eb65334e6b54ce10000000a174cb4.html' },
      { title: 'SAP Learning — Executing Sales Order Management', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-sales-order-management_cad9dfbe-bafc-4ed9-ac2e-6fd8422430e4' },
    ],
  },
  {
    id: 'customer-contract', number: 2, phase: 'Customer & Sales Area', title: 'Buat Business Partner Customer dan Sales Area', module: 'SAP SD / BP', transaction: 'BP (Role FLCU00 & FLCU01)',
    purpose: 'Identifikasi pelanggan enterprise InfraNexia, tentukan Sales Area (1000/10/01), Partner Functions (SP, BP, PY, SH), akun rekonsiliasi piutang (113010), dan Customer Account Assignment Group (KTGRD).',
    inputs: ['Partner Functions: Sold-to (SP), Bill-to (BP), Payer (PY), Ship-to (SH)', 'Reconciliation Account G/L 113010 dan Terms of Payment Z030', 'Customer Account Assignment Group KTGRD (penentu VKOA)'],
    outputs: ['Master pelanggan aktif di tabel BUT000, KNA1, dan KNVV', 'Customer siap menerima transaksi penjualan Sales Order'],
    control: 'Integrasi Customer-Vendor Integration (CVI) di S/4HANA menyelaraskan BP ke KNA1/KNB1/KNVV; penentuan KTGRD dan rekonsiliasi akun wajib disesuaikan dengan chart of accounts.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Executing Sales Order Management', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-sales-order-management_cad9dfbe-bafc-4ed9-ac2e-6fd8422430e4' }],
  },
  {
    id: 'subscription-order', number: 3, phase: 'Order Capture', title: 'Buat Sales Order MetroNexia dengan Billing Plan SD', module: 'SAP SD (Sales Order)', transaction: 'VA01 (Order Type OR / ZOR)',
    purpose: 'Menerbitkan pesanan penjualan resmi untuk paket internet MetroNexia yang memisahkan baris item MRC (Periodic Billing Type 02) dan OTC (Milestone Billing Type 01).',
    inputs: ['Order Type: OR / ZOR | Sales Area: 1000 / 10 / 01 | Customer: Sold-to & Payer', 'Item 10: Material 2 MetroNexia MRC (Item Cat: TAD/ZMRC, Billing Plan Type 02 bulanan)', 'Item 20: Material 3 MetroNexia OTC (Item Cat: TAD/ZOTC, Billing Plan Type 01 aktivasi)'],
    outputs: ['Sales Order nomor 10000001 tersimpan di tabel VBAK & VBAP', 'Jadwal Billing Plan terdaftar di tabel VBKD, FPLA, dan FPLT'],
    control: 'Sales Order SD mendukung pemodelan multi-item dengan billing plan berbeda: periodic billing untuk sewa berulang bulanan dan milestone billing untuk aktivasi satu kali.', status: 'Sesuai konsep SAP',
    branch: 'Item MRC masuk jadwal penagihan bulanan FPLT; Item OTC menunggu konfirmasi aktivasi.',
    sources: [
      { title: 'SAP Learning — Executing Sales Order Management', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-sales-order-management_cad9dfbe-bafc-4ed9-ac2e-6fd8422430e4' },
      { title: 'SAP Help — SAP Subscription Billing', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/sap-subscription-billing' },
    ],
  },
  {
    id: 'fulfillment', number: 4, phase: 'Fulfillment & Provisioning', title: 'Delivery perangkat CPE dan aktivasi layanan internet', module: 'SAP SD (Delivery) / Service', transaction: 'VL01N · Aktivasi Port & BAST',
    purpose: 'Eksekusi pengiriman perangkat keras (modem ONT / router CPE) ke site pelanggan via Outbound Delivery dan provisioning bandwidth pada jaringan fiber InfraNexia.',
    inputs: ['Sales Order referensi item fisik atau layanan jasa', 'Shipping Point 1100, Delivering Plant 1100, tanggal pengiriman', 'Berita Acara Serah Terima (BAST) dan konfirmasi aktivasi link up'],
    outputs: ['Outbound Delivery di tabel LIKP/LIPS; PGI memotong stok perangkat bila ada', 'Status aktivasi link menjadi LIVE, membuka izin penagihan OTC & MRC'],
    control: 'Pengiriman perangkat keras memicu Post Goods Issue (Movement Type 601); untuk layanan murni jasa/bandwidth tanpa perangkat fisik, delivery note dapat di-bypass.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Executing Sales Order Management', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-sales-order-management_cad9dfbe-bafc-4ed9-ac2e-6fd8422430e4' }],
  },
  {
    id: 'otc-billing', number: 5, phase: 'Billing OTC', title: 'Tagihkan OTC satu kali via Billing Document SD', module: 'SAP SD (Billing)', transaction: 'VF01 (Billing Type F2) · Milestone OTC',
    purpose: 'Menerbitkan faktur penagihan satu kali untuk biaya aktivasi/instalasi Material 3 MetroNexia OTC setelah berita acara commissioning link disetujui.',
    inputs: ['Sales Order referensi item OTC (Milestone Billing)', 'Billing Date, Payer, Tax Code MWST PPN 11%', 'Nilai dasar aktivasi (Condition PR00)'],
    outputs: ['Billing Document SD tersimpan di tabel VBRK & VBRP', 'Status milestone penagihan aktivasi di FPLT ter-update selesai'],
    control: 'Penagihan OTC menggunakan billing type standar F2 dengan referensi order; blok penagihan (billing block) pada milestone dilepas saat aktivasi selesai.', status: 'Sesuai konsep SAP',
    sources: [{ title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' }],
  },
  {
    id: 'mrc-billing', number: 6, phase: 'Billing MRC', title: 'Jalankan billing MRC bulanan via Billing Plan SD', module: 'SAP SD (Billing)', transaction: 'VF01 / VF04 (Periodic Billing Run)',
    purpose: 'Memproses jadwal tagihan bulanan berulang untuk Material 2 MetroNexia MRC secara otomatis menggunakan Billing Due List untuk seluruh kontrak aktif.',
    inputs: ['Jadwal tanggal penagihan berkala di tabel FPLT', 'Material 2 MRC, tarif PR00 bulanan, periode pemakaian layanan', 'Aturan proration (proporsional hari) jika link aktif di pertengahan bulan'],
    outputs: ['Billing Document MRC periodik per bulan', 'Histori penagihan kontrak pelanggan ter-update di document flow'],
    control: 'Periodic billing SD dijalankan rutin per siklus tanggal; proration, tanggal mulai, dan penanganan suspend/resume dikendalikan oleh aturan billing plan.', status: 'Sesuai konsep SAP',
    sources: [
      { title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' },
      { title: 'SAP Help — Billing Cycle', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/billing-cycle' },
    ],
  },
  {
    id: 'customer-invoice', number: 7, phase: 'Finance & VKOA', title: 'Posting otomatis invoice ke FI via VKOA', module: 'SAP SD ↔ SAP FI-AR', transaction: 'VKOA · Faktur RV (Doc. Type RV)',
    purpose: 'Mentransfer hasil penagihan SD VF01 ke Buku Besar FI secara otomatis melalui penentuan akun VKOA, mencatat piutang pelanggan, pendapatan layanan, dan hutang PPN.',
    inputs: ['Billing Document SD dari VF01 (VBRK/VBRP)', 'Konfigurasi VKOA: Chart CAID, Sales Org 1000, KTGRD Pelanggan, KTGRM Material', 'Account Keys: ERL (Pendapatan), MWS (PPN Keluaran)'],
    outputs: ['Dokumen akuntansi keuangan resmi (Doc. Type RV) tersimpan di BKPF/BSEG/ACDOCA', 'Jurnal: Dr. [PK 01] Piutang Pelanggan | Cr. [PK 50] Pendapatan Internet (ERL) | Cr. [PK 50] Hutang PPN (MWS)'],
    control: 'VKOA menentukan akun Buku Besar secara otomatis berdasarkan kombinasi Sales Org, KTGRD, KTGRM, dan Account Key; kegagalan konfigurasi memicu error penentuan akun saat rilis faktur.', status: 'Sesuai konsep SAP',
    sources: [{ title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' }],
  },
  {
    id: 'incoming-payment', number: 8, phase: 'Cash Collection', title: 'Terima pembayaran dan clearing piutang pelanggan', module: 'SAP FI-AR', transaction: 'F-28 / Auto Bank Clearing',
    purpose: 'Mencatat penerimaan pembayaran dari pelanggan via transfer rekening bank operasional InfraNexia dan melakukan kompensasi (clearing) atas faktur terbuka.',
    inputs: ['Pemberitahuan pembayaran bank / rekening koran elektronik', 'Nomor pelanggan, referensi faktur tagihan RV, jumlah uang masuk', 'Toleransi selisih bayar dan potongan diskon bila berlaku'],
    outputs: ['Dokumen pembayaran kas/bank (Doc. Type DZ)', 'Jurnal: Dr. [PK 50] Bank Masuk (111020) | Cr. [PK 15] Piutang Usaha Pelanggan (113010) ter-clearing menjadi nol'],
    control: 'Pembayaran pelanggan mencatat debit pada akun bank dan mengkredit akun piutang pelanggan (open items clearing); selisih bayar ditangani lewat partial payment atau residual item.', status: 'Sesuai konsep SAP',
    sources: [{ title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' }],
  },
  {
    id: 'lifecycle-reporting', number: 9, phase: 'Lifecycle & Analytics', title: 'Kelola lifecycle kontrak, penyesuaian, dan analitik', module: 'SAP SD / FI / CO-PA', transaction: 'Credit Memo (VA01/VF01) · CO-PA Margin Analysis',
    purpose: 'Mengelola perubahan paket (upgrade/downgrade bandwidth), restitusi SLA akibat link down via Credit Memo, serta pelaporan margin profitabilitas layanan internet per pelanggan.',
    inputs: ['Request perubahan kontrak pelanggan atau klaim restitusi SLA', 'Credit Memo Request (CR) dan Credit Memo Document', 'Data segmen pasar: Customer, Material Group MetroNexia, Sales Area'],
    outputs: ['Penyesuaian nilai tagihan pada periode berikutnya', 'Laporan profitabilitas real-time di CO-PA / Embedded Analytics'],
    control: 'Restitusi SLA atau koreksi penagihan menggunakan alur Credit Memo dengan persetujuan; Margin Analysis S/4HANA membaca data pendapatan dan biaya langsung dari Universal Journal ACDOCA.', status: 'Bersyarat konfigurasi',
    sources: [
      { title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' },
      { title: 'SAP Help — Billing and Revenue Innovation Management', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/a03da85e7c96487aac46d431799bebdf/c918bf4f27f44f71888040e6ae3add31.html' },
    ],
  },
];

export const auditedInputs: readonly AuditedInput[] = [
  {
    category: 'Perusahaan dan bisnis', currentValue: 'InfraNexia menjual layanan akses internet dengan brand MetroNexia', status: 'Fixture edukasi',
    finding: 'Nama perusahaan, brand, customer, tarif, dan nomor dokumen bukan data publik SAP atau data internal perusahaan.',
    action: 'Dipakai sebagai konteks bisnis sintetis; master customer, company code, sales area, dan contract account nyata harus divalidasi pada sistem target.',
  },
  {
    category: 'Struktur material', currentValue: 'Material 1 MetroNexia → Material 2 MetroNexia MRC + Material 3 MetroNexia OTC', status: 'Bersyarat konfigurasi',
    finding: 'Tiga material dapat dibuat sebagai master data terpisah. Hubungan root-child tidak otomatis terbentuk hanya dari penamaan; gunakan product hierarchy, material group, bundle, atau subscription product model.',
    action: 'Root ditampilkan sebagai grouping/non-billable; MRC dan OTC ditampilkan sebagai item billable dengan aturan berbeda.',
  },
  {
    category: 'MRC', currentValue: 'MetroNexia MRC · tagihan bulanan berulang', status: 'Sesuai konsep SAP',
    finding: 'SAP Subscription Billing dan Subscription Order Management mendukung recurring fee serta billing cycle untuk subscription.',
    action: 'MRC dimodelkan contract-relevant dengan recurring rate dan billing cycle; tanggal, proration, dan perubahan paket tetap configurable.',
  },
  {
    category: 'OTC', currentValue: 'MetroNexia OTC · aktivasi/instalasi/biaya satu kali', status: 'Sesuai konsep SAP',
    finding: 'SAP mendokumentasikan one-off charge seperti activation fee sebagai charge yang dibayar sekali dan dapat masuk ke billing.',
    action: 'OTC dimodelkan sebagai one-off item; tidak diperlakukan sebagai recurring contract item secara default.',
  },
  {
    category: 'Order dan fulfillment', currentValue: 'Subscription order + technical resource + aktivasi layanan', status: 'Bersyarat konfigurasi',
    finding: 'Subscription order dapat membawa product bundle, technical data, contract start date, recurring fee, dan one-time charge; provisioning jaringan membutuhkan integrasi tambahan.',
    action: 'Flow memisahkan capture order dari fulfillment/provisioning dan menandai interface OSS/BSS sebagai boundary.',
  },
  {
    category: 'Billing dan Finance', currentValue: 'OTC/MRC → invoice → FI-AR/FI-CA → incoming payment', status: 'Bersyarat konfigurasi',
    finding: 'Billing dapat mentransfer data ke Finance dan incoming payment membentuk posting kas serta clearing piutang. Pemilihan FI-AR/FI-CA dan mapping akun bergantung desain solusi.',
    action: 'Flow menampilkan prinsipnya tanpa mengunci satu T-Code, tax code, revenue account, atau payment interface sebagai standar universal.',
  },
  {
    category: 'SAP SD Order-to-Cash & VKOA', currentValue: 'Sales Order VA01 → Billing VF01 → VKOA → Doc. Type RV', status: 'Sesuai konsep SAP',
    finding: 'Siklus O2C standar SAP SD menghubungkan pesanan penjualan ke penagihan dan otomatisasi jurnal akuntansi pendapatan via VKOA (Account Keys ERL dan MWS).',
    action: 'Diterapkan sebagai logika inti alur penjualan internet InfraNexia; konfigurasi akun dan skema harga diuji pada sistem target.',
  },
];

export const officialSources: readonly OfficialSource[] = [
  { title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' },
  { title: 'SAP Help — SAP Subscription Billing', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/sap-subscription-billing' },
  { title: 'SAP Help — Billing Cycle', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/billing-cycle' },
  { title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' },
  { title: 'SAP Help — Material Master Data', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/af9ef57f504840d2b81be8667206d485/3d7eb65334e6b54ce10000000a174cb4.html' },
  { title: 'SAP Help — Billing and Revenue Innovation Management', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/a03da85e7c96487aac46d431799bebdf/c918bf4f27f44f71888040e6ae3add31.html' },
];
