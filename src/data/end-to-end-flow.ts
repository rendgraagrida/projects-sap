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
  business: 'Penjualan layanan akses internet',
  recurringCharge: 'MRC — Monthly Recurring Charge',
  oneTimeCharge: 'OTC — One-Time Charge',
  note: 'Nama perusahaan, brand, nomor material, tarif, dan customer pada lab adalah fixture edukasi sintetis.',
} as const;

export const endToEndStages: readonly EndToEndStage[] = [
  {
    id: 'product-master', number: 1, phase: 'Product & Master Data', title: 'Definisikan produk MetroNexia dan material SAP', module: 'SAP MM / Subscription Billing', transaction: 'MM01 / Product & Rate Plan Configuration',
    purpose: 'Bangun struktur penawaran internet InfraNexia dengan satu root grouping dan dua material/product billing: MRC bulanan serta OTC satu kali.',
    inputs: ['Material 1: MetroNexia sebagai root/product family', 'Material 2: MetroNexia MRC untuk recurring fee', 'Material 3: MetroNexia OTC untuk activation/installation fee'],
    outputs: ['Product hierarchy/material group', 'Material atau subscription product dengan pricing dan billing rule'],
    control: 'SAP Material Master tidak otomatis membuat hubungan parent-child hanya dari nama. Root harus dimodelkan melalui product hierarchy, material group, bundle, atau konfigurasi subscription product sesuai solusi target.', status: 'Bersyarat konfigurasi',
    sources: [
      { title: 'SAP Help — Material Master Data', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/af9ef57f504840d2b81be8667206d485/3d7eb65334e6b54ce10000000a174cb4.html' },
      { title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' },
    ],
  },
  {
    id: 'customer-contract', number: 2, phase: 'Customer & Contract', title: 'Buat Business Partner dan kontrak pelanggan', module: 'SAP BP / FI-CA atau FI-AR', transaction: 'BP / Contract Account / Subscription Contract',
    purpose: 'Identifikasi pelanggan, payer, alamat layanan, contract account, dan tanggal mulai layanan internet.',
    inputs: ['Business Partner dan partner functions', 'Contract account/payment terms', 'Alamat instalasi, technical resource, service start date'],
    outputs: ['Customer master siap ditagih', 'Contract account dan subscription contract'],
    control: 'FI-CA, FI-AR, contract account, dan technical resource bergantung pada arsitektur billing; jangan menganggap semua instalasi memakai satu backend yang sama.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' }],
  },
  {
    id: 'subscription-order', number: 3, phase: 'Order Capture', title: 'Tangkap subscription order MetroNexia', module: 'SAP Subscription Order Management', transaction: 'Manage Subscription Order / Subscription Order',
    purpose: 'Jual bundle internet yang terdiri dari layanan recurring MRC dan biaya satu kali OTC, lalu validasi konfigurasi teknis pelanggan.',
    inputs: ['Sold-to, bill-to, payer, dan contract account', 'Material 2 MRC + Material 3 OTC', 'Bandwidth/service level, technical resource, start date, dan durasi kontrak'],
    outputs: ['Subscription order', 'Item recurring untuk kontrak dan item one-off untuk billing satu kali'],
    control: 'SAP mendokumentasikan subscription order untuk recurring, usage-based, dan one-time charges. Status contract-relevant harus ditentukan oleh product model.', status: 'Sesuai konsep SAP',
    branch: 'MRC masuk siklus kontrak; OTC menjadi charge satu kali.',
    sources: [{ title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' }],
  },
  {
    id: 'fulfillment', number: 4, phase: 'Fulfillment', title: 'Aktivasi layanan internet dan technical resource', module: 'SAP Service / Subscription Order Management', transaction: 'Order Distribution / Fulfillment',
    purpose: 'Distribusikan order ke proses provisioning InfraNexia, tetapkan resource koneksi, dan ubah status layanan menjadi aktif setelah prasyarat terpenuhi.',
    inputs: ['Subscription order yang disubmit', 'Technical resource seperti service ID, nomor koneksi, atau port', 'Tanggal aktivasi dan hasil provisioning jaringan'],
    outputs: ['Service aktif', 'Event/status yang dapat memicu OTC dan memulai periode MRC'],
    control: 'Provisioning jaringan dan integrasi OSS/BSS bukan otomatis disediakan oleh Material Master; interface, event, dan status fulfillment harus dirancang.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' }],
  },
  {
    id: 'otc-billing', number: 5, phase: 'Billing', title: 'Tagihkan OTC satu kali', module: 'SAP Subscription Billing / Convergent Invoicing', transaction: 'Billable Item / Billing Document',
    purpose: 'Buat tagihan satu kali untuk aktivasi, instalasi, perangkat, atau perubahan layanan sesuai aturan produk MetroNexia OTC.',
    inputs: ['Material 3 MetroNexia OTC', 'Activation/installation event, amount, tax, currency, dan payer', 'Billing date dan reference order/contract'],
    outputs: ['One-off billable item atau billing document', 'Piutang pelanggan atas OTC'],
    control: 'OTC bukan berarti satu T-Code universal. Pembentukan billable item, invoice, tax, dan posting FI bergantung pada Subscription Billing, Convergent Invoicing, atau S/4HANA Sales yang dipilih.', status: 'Bersyarat konfigurasi',
    sources: [
      { title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' },
      { title: 'SAP Help — SAP Subscription Billing', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/sap-subscription-billing' },
    ],
  },
  {
    id: 'mrc-billing', number: 6, phase: 'Billing', title: 'Jalankan billing MRC bulanan', module: 'SAP Subscription Billing / Convergent Invoicing', transaction: 'Billing Cycle / Recurring Billing Run',
    purpose: 'Bentuk charge bulanan berulang untuk Material 2 MetroNexia MRC berdasarkan billing cycle, kontrak aktif, dan periode layanan.',
    inputs: ['Subscription contract dan billing plan', 'Material 2 MRC, recurring rate, billing cycle, service period', 'Proration, perubahan paket, suspend/resume, tax, dan credit bila berlaku'],
    outputs: ['Recurring billable item', 'MRC invoice periodik dan histori billing pelanggan'],
    control: 'MRC memerlukan billing cycle dan rate plan. Tanggal mulai, proration, perubahan harga, usage, dan cut-off harus ditentukan konfigurasi bisnis.', status: 'Sesuai konsep SAP',
    sources: [
      { title: 'SAP Help — SAP Subscription Billing', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/sap-subscription-billing' },
      { title: 'SAP Help — Billing Cycle', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/billing-cycle' },
    ],
  },
  {
    id: 'customer-invoice', number: 7, phase: 'Finance', title: 'Posting invoice dan piutang pelanggan', module: 'SAP FI-AR / FI-CA', transaction: 'Billing Document / Incoming Receivable',
    purpose: 'Transfer hasil billing ke akuntansi, membentuk piutang pelanggan, pendapatan, pajak keluaran, dan status invoice.',
    inputs: ['OTC dan/atau MRC billable items', 'Customer/contract account, company code, tax code, revenue account', 'Billing date, posting date, currency, dan reference dokumen'],
    outputs: ['Invoice pelanggan', 'Dokumen FI atau FI-CA dan open receivable item'],
    control: 'Mapping revenue, tax, reconciliation account, FI-AR/FI-CA, dan invoice aggregation wajib diuji pada chart of accounts serta country configuration target.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' }],
  },
  {
    id: 'incoming-payment', number: 8, phase: 'Cash Collection', title: 'Terima pembayaran dan clearing pelanggan', module: 'SAP FI-AR / FI-CA', transaction: 'Incoming Payment / F-28 atau proses payment lot',
    purpose: 'Catat pembayaran pelanggan untuk invoice MRC, OTC, atau gabungannya; lakukan clearing dan tangani selisih pembayaran.',
    inputs: ['Bank statement/payment lot', 'Customer atau contract account', 'Reference invoice, amount, value date, dan aturan residual/partial payment'],
    outputs: ['Cash/bank posting', 'Piutang pelanggan ter-clearing atau menjadi open item tersisa'],
    control: 'Metode incoming payment, electronic bank statement, payment lot, auto-clearing, dan toleransi selisih bergantung FI-AR/FI-CA serta konfigurasi bank.', status: 'Bersyarat konfigurasi',
    sources: [{ title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' }],
  },
  {
    id: 'lifecycle-reporting', number: 9, phase: 'Lifecycle & Reporting', title: 'Kelola perubahan layanan dan revenue reporting', module: 'SAP Subscription / FI / Analytics', transaction: 'Change Order · Suspend/Resume · Credit Memo · Reporting',
    purpose: 'Kelola upgrade/downgrade paket, suspend/resume, terminasi, credit, refund, renewal, dan rekonsiliasi pendapatan MRC/OTC.',
    inputs: ['Change order dan effective date', 'Usage/technical events bila ada', 'Credit memo, dispute, cancellation, dan revenue reporting period'],
    outputs: ['Contract history yang terlacak', 'Adjustment billing dan laporan revenue per produk, customer, serta periode'],
    control: 'Revenue recognition, contract modification, refund, dan usage charging tidak boleh disederhanakan menjadi billing MRC/OTC saja; perlakuannya mengikuti desain solusi dan kebijakan akuntansi.', status: 'Bersyarat konfigurasi',
    sources: [
      { title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' },
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
];

export const officialSources: readonly OfficialSource[] = [
  { title: 'SAP Learning — Performing Subscription Order Creation', url: 'https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation' },
  { title: 'SAP Help — SAP Subscription Billing', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/sap-subscription-billing' },
  { title: 'SAP Help — Billing Cycle', url: 'https://help.sap.com/docs/subscription-billing/feature-overview/billing-cycle' },
  { title: 'SAP Learning — Billing Process and Integration to SAP S/4HANA Finance', url: 'https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba' },
  { title: 'SAP Help — Material Master Data', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/af9ef57f504840d2b81be8667206d485/3d7eb65334e6b54ce10000000a174cb4.html' },
  { title: 'SAP Help — Billing and Revenue Innovation Management', url: 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/a03da85e7c96487aac46d431799bebdf/c918bf4f27f44f71888040e6ae3add31.html' },
];
