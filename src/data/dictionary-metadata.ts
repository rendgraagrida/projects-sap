export interface DictionaryMetaItem {
  explanation: string;
  moduleId: string;
  sources?: readonly { title: string; url: string }[];
}

export const dictionaryMetadata: Record<string, DictionaryMetaItem> = {
  "MM01 / MM02 / MM03": {
    explanation:
      "Master Data Material (Product Master):\n• Fungsi Transaksi: MM01 membuat atau memperluas material ke tingkat organisasi (Plant/Storage Location/Valuation Area); MM02 mengubah atribut yang diizinkan; MM03 menampilkan data.\n• Aturan Perubahan Data: Perubahan base unit of measure (MEINS) atau valuation class tunduk pada pemeriksaan saldo stok, dokumen terbuka, konfigurasi, dan proses yang berlaku, bukan larangan permanen.\n• Mekanisme Penguncian: Saat pengubahan data, sistem menggunakan SAP enqueue lock pada objek bisnis material; ini bukan penguncian seluruh tabel database fisik.\n• Ketersediaan & Otorisasi: Ketersediaan transaksi GUI klasik atau aplikasi Fiori Manage Product Master bergantung pada edisi sistem (ECC vs S/4HANA) dan otorisasi role pengguna.",
    moduleId: "01",
  },
  "BP (ECC: XK01)": {
    explanation:
      "Master Data Business Partner (Vendor/Supplier):\n• Fungsi Transaksi: BP mengelola data umum serta peran pemasok dan pelanggan di S/4HANA melalui integrasi Customer/Vendor (CVI).\n• Peran Organisasi: FLVN00 mencakup data pemasok untuk Company Code dan FLVN01 untuk Purchasing Organization.\n• Penyimpanan Data: Data umum, alamat, dan nomor pajak disimpan di objek dan tabel terkait (BUT000, BUT020), bukan seluruhnya di satu tabel.\n• Kompatibilitas ECC: Di ECC transaksi klasik seperti XK01/FK01/MK01 digunakan sesuai konfigurasi. Nomor akun dan persyaratan peran ditentukan implementasi.",
    moduleId: "01",
  },
  "ME11 / ME12 / ME13": {
    explanation:
      "Purchasing Info Record (PIR):\n• Fungsi Transaksi: ME11 membuat, ME12 mengubah, dan ME13 menampilkan purchasing info record untuk hubungan pemasok dan material atau kelompok material.\n• Cakupan Data: Menyimpan data umum dan data Purchasing Organization, termasuk kondisi harga, planned delivery time, dan toleransi pengiriman.\n• Penentuan Harga PO: Penentuan sumber dan harga PO bergantung pada masa validitas, organisasi pembelian, kondisi harga, dan konfigurasi; info record tidak selalu menjadi sumber harga tunggal.",
    moduleId: "03",
  },
  "ME01": {
    explanation:
      "Maintain Source List:\n• Fungsi Transaksi: ME01 memelihara daftar sumber pasokan material per plant, termasuk periode validitas serta penandaan sumber tetap atau diblokir.\n• Kontrol Pengadaan: Bila source-list requirement berlaku pada material/plant, sistem memeriksa ketersediaan sumber valid dalam proses pengadaan logistik.\n• Batas Penerapan: Dampak otomatisasi terhadap PR, penetapan sumber pasokan, dan Purchase Order bergantung pada proses operasional dan konfigurasi.",
    moduleId: "03",
  },
  "ME51N / ME52N / ME53N": {
    explanation:
      "Purchase Requisition (Permintaan Pembelian):\n• Fungsi Transaksi: ME51N membuat, ME52N mengubah, dan ME53N menampilkan purchase requisition (PR).\n• Sumber Dokumen: PR dapat berasal dari input manual operasional atau hasil proses perencanaan kebutuhan material (MRP).\n• Account Assignment: Pilihan mencakup Cost Center (K), WBS Element (P), atau Project Stock (Q); perlakuan stok dan pembebanan biaya mengikuti kategori item.\n• Tabel Database: Tabel EBAN menyimpan baris item PR dan EBKN menyimpan pembebanan objek biaya akuntansi.",
    moduleId: "03",
  },
  "ME54N / ME55": {
    explanation:
      "Release Purchase Requisition (Persetujuan PR):\n• Fungsi Transaksi: ME54N melakukan release individual dan ME55 release kolektif dalam prosedur persetujuan klasik.\n• Parameter Persetujuan: Cakupan persetujuan, indikator release, dan konsekuensi terhadap proses lanjutan bergantung pada strategi yang diterapkan.\n• Fleksibilitas S/4HANA: S/4HANA dapat memanfaatkan flexible workflow; ketersediaan fitur mengikuti edisi dan release sistem.",
    moduleId: "03",
  },
  "ME5A": {
    explanation:
      "List Display of Purchase Requisitions:\n• Fungsi Laporan: Laporan analitis untuk memonitor seluruh status dokumen PR terbuka (Open PR), PR yang telah terkonversi menjadi Purchase Order, maupun PR yang dibatalkan.\n• Kriteria Filter: Mendukung filter berdasarkan Plant, Purchasing Group, Nomor Material, atau Tracking Number pengadaan.",
    moduleId: "03",
  },
  "ME21N / ME22N / ME23N": {
    explanation:
      "Purchase Order (Pesanan Pembelian):\n• Fungsi Transaksi: ME21N membuat, ME22N mengubah, dan ME23N menampilkan Purchase Order (PO), termasuk vendor rekanan, item material, harga, dan jadwal pengiriman.\n• Struktur Tabel: Data header disimpan di tabel EKKO, item di EKPO, dan account assignment di EKKN.\n• Integrasi Komitmen: Komitmen dan pemeriksaan anggaran WBS timbul sesuai objek biaya dan konfigurasi availability control.\n• Proses Lanjutan: Goods Receipt (MIGO) dan Invoice Verification (MIRO) merujuk langsung ke nomor dokumen PO.",
    moduleId: "03",
  },
  "ME29N / ME28": {
    explanation:
      "Release Purchase Order (Persetujuan PO):\n• Fungsi Transaksi: ME29N melakukan release individual dan ME28 release kolektif PO dengan prosedur klasik.\n• Dampak Proses: Efek release indicator terhadap pemblokiran Goods Receipt bergantung pada konfigurasi sistem.\n• Fleksibilitas S/4HANA: Flexible workflow merupakan alternatif pada skenario S/4HANA yang didukung.",
    moduleId: "03",
  },
  "ME2N / ME2L / ME2M": {
    explanation:
      "PO Standard Operational Reports:\n• Laporan ME2N: Menampilkan daftar PO berdasarkan Nomor Dokumen Pembelian.\n• Laporan ME2L: Menampilkan daftar PO berdasarkan Kode Vendor / Rekanan.\n• Laporan ME2M: Menampilkan daftar PO berdasarkan Kode Material.\n• Status Pemenuhan: Menampilkan status kuantitas dipesan (Ordered), kuantitas diterima gudang (Delivered via MIGO), dan kuantitas yang sudah ditagihkan (Invoiced via MIRO).",
    moduleId: "03",
  },
  "ME2J / ME2K": {
    explanation:
      "PO Reporting by Project & Account Assignment:\n• Laporan ME2J: Khusus menampilkan seluruh daftar PO yang dibebankan ke objek WBS Proyek SAP PS.\n• Laporan ME2K: Menampilkan laporan PO berdasarkan Account Assignment umum seperti Cost Center atau Proyek.\n• Manfaat Manajerial: Sangat penting bagi Project Manager untuk melacak realisasi belanja pengadaan material dan jasa proyek.",
    moduleId: "04",
  },
  "ML81N": {
    explanation:
      "Service Entry Sheet (BAST Jasa Klasik):\n• Fungsi Transaksi: ML81N memelihara dan menerima (accept) service entry sheet untuk skenario layanan eksternal klasik yang mereferensikan PO jasa.\n• Dampak Akuntansi: Acceptance menghasilkan pencatatan jasa dan jurnal akuntansi akrual sesuai account assignment, nilai transaksi, dan konfigurasi OBYC.\n• Batas Penerapan: Lean service entry sheet adalah proses berbeda; Public Cloud memakai proses dan aplikasi yang dirilis untuk edisinya.",
    moduleId: "03",
  },
  "MIGO": {
    explanation:
      "Goods Movement (Pergerakan Barang):\n• Fungsi Transaksi: MIGO memproses penerimaan, pengeluaran, transfer, dan penyesuaian fisik persediaan di gudang.\n• Jenis Movement Umum: 101 penerimaan PO; 103 ke GR blocked stock (bukan QA); 105 pelepasan ke gudang; 122 retur vendor; 201 ke cost center; 221 ke WBS; 311 antar-gudang; 561 saldo awal.\n• Aturan Project Stock: 411 Q memindahkan project stock ke own stock (rujukan SAP Library 4.6C); pembalikan dan 412 Q mengikuti dokumentasi release dan konfigurasi sistem.\n• Dampak Dokumen: Dokumen material dibuat saat posting; jurnal FI hanya terbentuk untuk pergerakan persediaan yang bernilai, bukan setiap MIGO.",
    moduleId: "03",
    sources: [{"title":"SAP Learning — goods receipt dan GR blocked stock (S/4HANA)","url":"https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/posting-a-goods-receipt-with-reference"},{"title":"SAP Library 4.6C — Project Stock, transfer 411 Q (historis)","url":"https://help.sap.com/saphelp_46c/helpdata/en/4d/2b92c943ad11d189410000e829fbbd/content.htm"}],
  },
  "MB52": {
    explanation:
      "Warehouse Stocks (Laporan Stok Gudang):\n• Fungsi Laporan: Melaporkan kuantitas fisik stok material menurut Plant, Storage Location, dan kategori status stok yang dipilih.\n• Kategori Status: Menampilkan rincian unrestricted-use stock, quality inspection, dan blocked stock.\n• Batas Valuasi: Project stock merupakan special stock dan pelaporannya bergantung pada pilihan laporan dan edisi; jangan menyamakan kuantitas fisik dengan nilai valuasi finansial.",
    moduleId: "03",
  },
  "MMBE": {
    explanation:
      "Stock Overview (Ringkasan Multi-Level Stok):\n• Fungsi Tampilan: Menyajikan ringkasan stok material dari level Client, Company Code, Plant, Storage Location, hingga Batch dan Special Stock.\n• Hirarki Logistik: Memudahkan penelusuran lokasi persediaan di seluruh unit organisasi perusahaan.\n• Otorisasi: Tampilan serta rincian kuantitas bergantung pada pilihan parameter dan otorisasi pengguna.",
    moduleId: "03",
  },
  "MB51": {
    explanation:
      "Material Document List (Riwayat Mutasi Persediaan):\n• Fungsi Audit Trail: Pelacakan seluruh transaksi pergerakan barang historis berdasarkan Movement Type, tanggal posting, kode material, gudang, atau user eksekutor MIGO.\n• Penelusuran Dokumen: Menghubungkan nomor dokumen material logistik dengan dokumen akuntansi FI terkait.",
    moduleId: "03",
  },
  "MB5B": {
    explanation:
      "Stock for Posting Date (Rekonsiliasi MM vs FI):\n• Fungsi Perhitungan: Menghitung saldo awal stok, total mutasi penerimaan/pengeluaran, dan saldo akhir stok pada rentang tanggal tertentu.\n• Rekonsiliasi Closing: Sangat krusial saat periode closing untuk mencocokkan total nilai stok logistik MM dengan saldo Buku Besar Persediaan di FI (FS10N).",
    moduleId: "03",
  },
  "MI01 $\\rightarrow$ MI04 $\\rightarrow$ MI07": {
    explanation:
      "Physical Inventory (Stock Opname):\n• Tahap 1 (MI01): Membuat dokumen physical inventory; pemblokiran posting atau pembekuan book inventory merupakan opsi proses.\n• Tahap 2 (MI04): Mencatat hasil perhitungan fisik riil di gudang.\n• Tahap 3 (MI07): Memposting selisih stok yang disetujui; selisih yang bernilai menghasilkan jurnal sesuai valuasi dan account determination OBYC (GBB-INV).",
    moduleId: "03",
  },
  "MMPV / MMRV": {
    explanation:
      "Material Period Management (Manajemen Periode MM):\n• Fungsi MMPV: Memajukan periode posting MM untuk Company Code tertentu sesuai jadwal closing bulanan.\n• Fungsi MMRV: Memeriksa pengaturan periode aktif dan mengatur izin posting ke periode sebelumnya.\n• Batas Prosedur: Pembukaan periode MM terpisah dari periode akuntansi FI (OB52); perubahan hanya dilakukan sesuai jadwal closing dan otorisasi.",
    moduleId: "03",
  },
  "MIRO / MIR7 / MIR4": {
    explanation:
      "Logistics Invoice Verification (Verifikasi Faktur):\n• Fungsi Transaksi: MIRO memposting faktur tagihan logistik dengan referensi Purchase Order.\n• Fungsi MIR7 & MIR4: MIR7 memarkir draf faktur tanpa posting final; MIR4 menampilkan dokumen faktur.\n• Dampak Akuntansi: Mendebit akun perantara GR/IR (WRX) dan mengkredit utang usaha vendor (LFB1) beserta pajak dan selisih.\n• Pemeriksaan Selisih: Pemeriksaan harga dan kuantitas bergantung pada proses operasional, toleransi, dan status persediaan.",
    moduleId: "03",
  },
  "MRBR": {
    explanation:
      "Release Blocked Invoices (Pelepasan Faktur Diblokir):\n• Fungsi Transaksi: Memproses pelepasan faktur yang terkena payment block otomatis akibat deviasi invoice verification.\n• Verifikasi Selisih: Meninjau alasan pemblokiran, batas toleransi, otorisasi, dan penyelesaian selisih sebelum melakukan release.\n• Kategori Blokir: Pemblokiran tidak selalu disebabkan selisih harga atau kuantitas, tetapi dapat mencakup faktor tanggal dan mutu.",
    moduleId: "03",
  },
  "MR8M": {
    explanation:
      "Cancel Invoice Document (Pembatalan Faktur MIRO):\n• Fungsi Transaksi: Membatalkan faktur logistik yang memenuhi syarat melalui proses Logistics Invoice Verification.\n• Dampak Integrasi: Membalikkan jurnal akuntansi FI dan memulihkan kuantitas/nilai tagihan pada history Purchase Order (EKBE).\n• Perbandingan FB08: FB08 digunakan untuk pembalikan dokumen FI murni non-logistik; gunakan MR8M untuk dokumen faktur pengadaan.",
    moduleId: "03",
  },
  "MR11": {
    explanation:
      "GR/IR Clearing Account Maintenance:\n• Fungsi Transaksi: Menutup dan meng-clearing saldo akun perantara GR/IR untuk perbedaan kuantitas penerimaan dan faktur yang tidak akan diselesaikan lewat transaksi normal.\n• Alokasi Akun: Akun lawan serta dampak terhadap nilai stok atau biaya ditentukan oleh keadaan item, model valuasi, dan konfigurasi OBYC.",
    moduleId: "03",
  },
  "CJ20N": {
    explanation:
      "Project Builder (Manajemen Struktur Proyek):\n• Fungsi Transaksi: Titik pusat pengelolaan struktur proyek SAP PS (Project Definition, WBS Element, Network, Activity, dan Milestone).\n• Indikator Operatif: Mengatur status Planning Element, Account Assignment Element, dan Billing Element pada WBS.\n• Integrasi Aset: Menghubungkan WBS dengan profil investasi (Investment Profile) untuk pembuatan AuC dan aturan settlement.",
    moduleId: "04",
  },
  "CJ01 / CJ02 / CJ03": {
    explanation:
      "Project Definition Maintenance:\n• Fungsi Transaksi: CJ01 membuat, CJ02 mengubah, dan CJ03 menampilkan header master data Project Definition.\n• Pengendalian Organisasi: Menentukan Company Code, Plant, Controlling Area, dan Project Profile pengontrol proyek.\n• Batas Konseptual: Project Definition adalah payung bisnis proyek, bukan badan hukum mandiri.",
    moduleId: "04",
  },
  "CN21 / CN22 / CN23": {
    explanation:
      "Maintain Network (Aktivitas Proyek):\n• Fungsi Transaksi: CN21 membuat, CN22 mengubah, dan CN23 menampilkan Network Activity (Tabel AUFK & AFKO).\n• Logika Alur Kerja: Mengatur logika dependensi aktivitas (Finish-to-Start), estimasi durasi hari kerja, dan alokasi kapasitas teknisi.\n• Integrasi Logistik: Memfasilitasi reservasi material langsung ke site proyek dan pemicu otomatis Purchase Requisition.",
    moduleId: "04",
  },
  "CJ40 / CJ41": {
    explanation:
      "Cost Planning WBS (Rencana Biaya Proyek):\n• Fungsi Transaksi: CJ40 mengedit dan CJ41 menampilkan estimasi rencana biaya proyek (Plan Cost) per WBS Element per tahun anggaran.\n• Tahap Penyusunan: Digunakan dalam tahap perencanaan (RAB) sebelum penetapan dan pengesahan plafon anggaran resmi.",
    moduleId: "04",
  },
  "CJ30 / CJ31": {
    explanation:
      "Original Budgeting WBS (Pagu Anggaran Resmi):\n• Fungsi Transaksi: CJ30 menetapkan dan mengubah anggaran asli (Original Budget); CJ31 menampilkan data anggaran.\n• Batas Ketersediaan Dana: Menetapkan plafon anggaran resmi investasi (CAPEX Budget) pada masing-masing WBS Element (Tabel BPGE & BPJA).\n• Pagu Perusahaan: Menjadi batas atas ketersediaan dana belanja modal proyek.",
    moduleId: "04",
  },
  "CJ32": {
    explanation:
      "Release Project Budget (Pencairan Plafon Anggaran):\n• Fungsi Transaksi: Me-release pagu anggaran untuk proyek yang menggunakan mekanisme budget release.\n• Perbedaan Status: Release budget bukan status sistem WBS yang sama dengan REL, dan tidak otomatis mengaktifkan AVAC.\n• Konfigurasi AVAC: Availability control dapat memeriksa terhadap released budget atau current budget menurut budget profile dan pengaturan aktivasi.",
    moduleId: "04",
    sources: [{"title":"SAP Learning — budget release dan availability control (S/4HANA Project System)","url":"https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/performing-budgeting-functions"}],
  },
  "CJ36 / CJ37": {
    explanation:
      "Budget Supplement (Penambahan Anggaran Proyek):\n• Fungsi Transaksi: CJ36 menambah dan CJ37 menampilkan penambahan anggaran (Budget Supplement) dalam Project System klasik.\n• Integritas Anggaran: Menambah current budget tanpa menimpa nilai original budget pada dokumen anggaran.\n• Otorisasi & Distribusi: Memerlukan pemeriksaan distribusi hirarki WBS dan otorisasi manajemen biaya.",
    moduleId: "04",
  },
  "CJ34": {
    explanation:
      "Budget Update / Transfer & Return:\n• Fungsi Transaksi: Menjalankan pembaruan anggaran (budget update) Project System klasik, termasuk pengembalian (Return) atau pemindahan pagu (Transfer).\n• Arah Transaksi: Mengatur alokasi dana antar-elemen WBS sender dan receiver sesuai rilis sistem.\n• Validasi Saldo: Memeriksa ketersediaan sisa pagu sebelum transfer dieksekusi.",
    moduleId: "04",
  },
  "CJ35": {
    explanation:
      "Budget Update / Transfer & Return:\n• Fungsi Transaksi: Memproses transaksi budget update klasik untuk alokasi dana proyek.\n• Penyesuaian Anggaran: Memungkinkan penataan ulang distribusi anggaran antar-elemen WBS atau tahun fiskal.\n• Kontrol Otorisasi: Periksa label transaksi, arah sender/receiver, dan otorisasi pada rilis sistem yang digunakan.",
    moduleId: "04",
    sources: [{"title":"SAP Learning — budget updates dan transfers (S/4HANA Project System)","url":"https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/performing-budgeting-functions"}],
  },
  "CJBV / CJBW": {
    explanation:
      "Availability Control Activation (AVAC):\n• Fungsi Transaksi: CJBV mengaktifkan dan CJBW menonaktifkan availability control untuk proyek yang dipilih.\n• Fleksibilitas Aktivasi: Aktivasi juga dapat diatur melalui budget profile; bukan perubahan otomatis untuk seluruh proyek.\n• Pengawasan Dana: Membandingkan total dana terpakai (PR + PO + Actual) terhadap batas toleransi profil anggaran.",
    moduleId: "04",
    sources: [{"title":"SAP Learning — konfigurasi availability control (S/4HANA Project System)","url":"https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/configuring-budgeting-functions"}],
  },
  "CJBN": {
    explanation:
      "Reconstruct Availability Control:\n• Fungsi Transaksi: Merekonstruksi dan menghitung ulang data ketersediaan dana availability control untuk proyek terpilih.\n• Penanganan Masalah: Dijalankan jika nilai kontrol perlu dibangun ulang menurut prosedur administrasi atau analisis SAP note terkait.\n• Batas Kebutuhan: Tidak setiap perubahan batas toleransi anggaran memerlukan rekonstruksi.",
    moduleId: "04",
  },
  "CN25 / CAT2": {
    explanation:
      "Confirmation & Timesheet (Konfirmasi Jam Kerja):\n• Fungsi CN25: Mencatat konfirmasi aktivitas network seperti persentase kemajuan fisik atau jam kerja aktual.\n• Fungsi CAT2: Mencatat waktu kerja dalam Cross-Application Time Sheet lintas modul.\n• Integrasi Biaya: Pencatatan waktu memerlukan persetujuan dan transfer ke aplikasi penerima agar memicu pembebanan biaya aktual di CO.",
    moduleId: "04",
  },
  "CJB2": {
    explanation:
      "Generate Settlement Rules Automatically:\n• Fungsi Transaksi: Menghasilkan settlement rule otomatis untuk WBS dalam skenario investment project yang dikonfigurasi.\n• Pemetaan Receiver: Menghubungkan elemen WBS ke nomor master Asset under Construction (AuC) berdasarkan Investment Profile.\n• Prasyarat Sistem: Hasil generasi aturan bergantung pada status WBS, profil investasi, dan konfigurasi prasyarat.",
    moduleId: "04",
  },
  "CJ88 / CJ8G": {
    explanation:
      "Actual Settlement Project / WBS:\n• Fungsi Transaksi: CJ88 menjalankan settlement individual dan CJ8G pemrosesan kolektif akhir periode.\n• Alur Investasi: Biaya aktual WBS diselesaikan periodik ke AuC di Neraca, lalu dikapitalisasi penuh ke Aset Tetap Final saat berstatus TECO.\n• Receiver Fleksibel: Biaya juga dapat di-settle ke Cost Center atau akun beban sesuai settlement profile yang berlaku.",
    moduleId: "04",
    sources: [{"title":"SAP Learning — settlement profile (S/4HANA)","url":"https://learning.sap.com/courses/detailing-overhead-cost-accounting/controlling-settlement-using-the-settlement-profile_cef6c062-84cf-48bf-ac7e-701fff3fc361"}],
  },
  "S_ALR_87013558": {
    explanation:
      "Project Budget & Cost Hierarchy Report:\n• Fungsi Laporan: Membandingkan Original Budget, Released Budget, PO Commitment, Actual Cost, dan Available Amount proyek.\n• Assigned Funds: Assigned funds mencakup actual cost, komitmen pengadaan, dan nilai objek terkait lainnya sesuai konfigurasi AVAC.",
    moduleId: "04",
    sources: [{"title":"SAP Learning — assigned funds dan availability control (S/4HANA Project System)","url":"https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/configuring-budgeting-functions"}],
  },
  "CJI3": {
    explanation:
      "Project Actual Cost Line Items:\n• Fungsi Laporan: Menampilkan seluruh baris rincian transaksi biaya aktual yang membebani WBS Element.\n• Audit Trail: Menyertakan referensi dokumen sumber asli (MIGO pemakaian material, MIRO jasa, atau jurnal umum FI).",
    moduleId: "04",
  },
  "CJI5": {
    explanation:
      "Project Commitment Line Items:\n• Fungsi Laporan: Menampilkan item komitmen pengadaan proyek yang membebani WBS (PR terbuka dan PO belum tuntas).\n• Pengawasan Dana: Membantu Project Manager melihat nilai dana yang sedang terikat sebelum serah terima barang/jasa.\n• Model Valuasi: Nilai dan penyimpanan komitmen bergantung pada konfigurasi CO/PS dan model valuasi special stock.",
    moduleId: "04",
  },
  "CN41N": {
    explanation:
      "Project Structure Overview:\n• Fungsi Laporan: Menampilkan visualisasi hirarki lengkap proyek (Project Def, WBS, Network, Activity, Material, Milestone) dalam bentuk tabel terpadu.\n• Pemantauan Status: Menyajikan status sistem objek (CRTD, REL, TECO, CLSD) secara real-time.",
    moduleId: "04",
  },
  "FS00": {
    explanation:
      "Maintain G/L Account Centrally:\n• Fungsi Transaksi: Membuat dan mengelola master akun Buku Besar (General Ledger).\n• Struktur 2 Segmen: Segmen Chart of Accounts (SKA1) dan segmen Company Code (SKB1).\n• Parameter Kontrol: Mengatur mata uang akun, tipe rekonsiliasi (Vendor/Customer/Asset), Open Item Management, Field Status Group, dan proteksi Post Automatically Only.",
    moduleId: "02",
  },
  "FB50 / F-02": {
    explanation:
      "Post G/L Document (Jurnal Umum FI):\n• Fungsi FB50: Single-screen posting cepat untuk jurnal umum penyesuaian non-subledger.\n• Fungsi F-02: Classic posting dengan input manual Posting Key (40 Debit, 50 Kredit).",
    moduleId: "02",
  },
  "FV50 / FBV0": {
    explanation:
      "Park & Post G/L Document (Prinsip Maker-Checker):\n• Fungsi FV50: Memarkir dokumen jurnal akuntansi tanpa memposting nilai finansial ke Buku Besar.\n• Fungsi FBV0: Memeriksa dan memposting dokumen yang telah diparkir menjadi jurnal akuntansi resmi.\n• Kontrol Internal: Pemisahan tugas maker-checker memerlukan otorisasi atau workflow yang dikonfigurasi.",
    moduleId: "02",
  },
  "FB03 / FB02 / FB08": {
    explanation:
      "FI Document Management:\n• Fungsi FB03: Menampilkan jurnal akuntansi BKPF/BSEG.\n• Fungsi FB02: Mengubah teks keterangan atau field referensi non-finansial pada dokumen.\n• Fungsi FB08: Membatalkan jurnal akuntansi murni FI dengan memposting jurnal pembalik resmi.",
    moduleId: "02",
  },
  "F-03 / F.13": {
    explanation:
      "G/L Account Clearing (Kliring Akun Buku Besar):\n• Fungsi F-03: Kliring manual untuk memasangkan baris debit dan kredit pada akun Open Item Management.\n• Fungsi F.13: Kliring otomatis massal berdasarkan kriteria referensi (contoh: kliring akun GR/IR WRX berdasarkan kesamaan nomor dan item PO).",
    moduleId: "02",
  },
  "FS10N / FAGLB03": {
    explanation:
      "G/L Account Balance Display:\n• Fungsi Laporan: Menampilkan saldo debit, kredit, dan saldo kumulatif per periode pembukuan untuk akun G/L terpilih di Company Code.\n• Analisis Periode: Memudahkan pengecekan mutasi saldo bulanan akun buku besar.",
    moduleId: "02",
  },
  "FBL3N / FAGLL03": {
    explanation:
      "G/L Account Line Item Display:\n• Fungsi Laporan: Menampilkan rincian seluruh baris transaksi jurnal buku besar.\n• Filter Status: Mendukung penyaringan Open Items (belum dikliring), Cleared Items (lunas), atau All Items.",
    moduleId: "02",
  },
  "FB60 / FB65": {
    explanation:
      "Accounts Payable Invoice / Credit Memo (Non-PO):\n• Fungsi FB60: Menginput tagihan hutang vendor langsung tanpa melalui PO logistik (contoh: beban sewa kantor, listrik, utilitas).\n• Fungsi FB65: Menginput nota kredit vendor (Vendor Credit Memo).",
    moduleId: "02",
  },
  "F-47 $\\rightarrow$ F-48 $\\rightarrow$ F-54": {
    explanation:
      "Vendor Down Payment Cycle (Siklus Uang Muka):\n• Tahap 1 (F-47): Membuat Down Payment Request sebagai *noted item* tanpa jurnal neraca.\n• Tahap 2 (F-48): Memposting pembayaran uang muka ke akun Special G/L Indicator A yang dikonfigurasi.\n• Tahap 3 (F-54): Mengkompensasikan uang muka terhadap faktur tagihan vendor saat jatuh tempo.",
    moduleId: "02",
  },
  "F-53 / F110": {
    explanation:
      "Vendor Payment (Manual & Automatic):\n• Fungsi F-53: Memposting pelunasan hutang vendor secara manual dengan memilih open items yang akan dibayar.\n• Fungsi F110: Menjalankan program pembayaran otomatis massal berdasarkan proposal jatuh tempo dan jalur perbankan.\n• Persyaratan Sistem: Memerlukan konfigurasi house bank, metode pembayaran, dan proses persetujuan yang sesuai.",
    moduleId: "02",
  },
  "FK10N / FBL1N": {
    explanation:
      "Vendor Account Reports (Subledger Hutang):\n• Fungsi FK10N: Menampilkan saldo debit/kredit dan mutasi kumulatif hutang vendor per periode buku.\n• Fungsi FBL1N: Menampilkan rincian baris faktur vendor (Open Items belum dibayar vs Cleared Items lunas).",
    moduleId: "02",
  },
  "FB70 / F-28": {
    explanation:
      "Accounts Receivable (Piutang Pelanggan):\n• Fungsi FB70: Menerbitkan faktur tagihan piutang langsung ke pelanggan.\n• Fungsi F-28: Mencatat penerimaan uang kas/bank dari pelunasan tagihan pelanggan.",
    moduleId: "02",
  },
  "FD10N / FBL5N": {
    explanation:
      "Customer Account Reports (Subledger Piutang):\n• Fungsi FD10N: Menampilkan saldo pelanggan per periode pembukuan.\n• Fungsi FBL5N: Menampilkan item transaksi pelanggan menurut seleksi open, cleared, atau all items.",
    moduleId: "02",
  },
  "F150": {
    explanation:
      "Dunning Run (Penagihan Piutang Jatuh Tempo):\n• Fungsi: Memilih open item customer yang melewati due date dan menghasilkan dunning proposal/notices berdasarkan dunning procedure.\n• Level: Level 1–4 pada contoh hanya fixture; interval, fee, grace period, dan bentuk surat mengikuti konfigurasi perusahaan.\n• Batas penerapan: F150 adalah transaksi klasik; aplikasi Fiori, job, dan integrasi correspondence bergantung edisi serta release.",
    moduleId: "02",
  },
  "FD32 / UKM_BP": {
    explanation:
      "Customer Credit Management:\n• Fungsi FD32: Memelihara credit master klasik customer pada sistem yang masih menggunakannya.\n• Fungsi UKM_BP: Memelihara data Business Partner untuk SAP Credit Management/FSCM pada skenario S/4HANA yang relevan.\n• Batas penerapan: Credit limit, exposure, scoring, check rule, block, workflow, dan aplikasi pengganti mengikuti deployment, release, lisensi, dan konfigurasi; keduanya bukan padanan universal.",
    moduleId: "02",
  },
  "AS01 / AS02 / AS03": {
    explanation:
      "Fixed Asset Master Data (Master Data Aset):\n• Fungsi Transaksi: AS01 membuat, AS02 mengubah, dan AS03 menampilkan data master aset tetap.\n• Atribut Kritis: Asset class, depreciation area, masa manfaat ekonomis, dan cost center ditentukan berdasarkan data dan konfigurasi.\n• Tabel Database: ANLA menyimpan data umum aset dan ANLB mencakup ketentuan depresiasi.",
    moduleId: "02",
  },
  "AW01N": {
    explanation:
      "Asset Explorer (Penelusuran Nilai Aset):\n• Fungsi Tampilan: Titik visualisasi terpadu untuk menganalisis nilai perolehan (APC), nilai buku bersih, dan planned depreciation aset.\n• Multi-Area: Menampilkan nilai menurut masing-masing Depreciation Area yang aktif.\n• Otorisasi: Tampilan, fungsi, dan akses bergantung pada edisi sistem, konfigurasi, serta otorisasi pengguna.",
    moduleId: "02",
  },
  "AIAB $\\rightarrow$ AIBU": {
    explanation:
      "AuC Line Item Settlement (Kapitalisasi AuC Manual):\n• Fungsi AIAB: Menentukan persentase atau nominal pemindahan biaya dari AuC ke beberapa aset tetap final.\n• Fungsi AIBU: Mengeksekusi posting transfer kapitalisasi aset tetap secara manual.",
    moduleId: "02",
  },
  "AFAB": {
    explanation:
      "Depreciation Posting Run (Eksekusi Penyusutan):\n• Fungsi Transaksi: Menjalankan program batch closing bulanan untuk memposting beban depresiasi aset tetap ke Buku Besar.\n• Dampak Akuntansi: Mendebit akun beban penyusutan di Laba Rugi (dengan objek biaya Cost Center) dan mengkredit akumulasi penyusutan di Neraca.\n• Batas Konfigurasi: Nilai, frekuensi, depreciation area, dan akun mengikuti konfigurasi serta data master aset.",
    moduleId: "02",
  },
  "OB52 / F.01": {
    explanation:
      "Closing & Financial Statements (Pelaporan Keuangan):\n• Fungsi OB52: Mengontrol buka/tutup periode posting akuntansi per jenis akun (+ All, A Asset, D Customer, K Vendor, M Material, S G/L).\n• Fungsi F.01: Menghasilkan laporan Neraca (Balance Sheet) dan Laba Rugi (Income Statement) resmi perusahaan.",
    moduleId: "02",
  },
  "OX02 / OX10 / OX09 / OX08": {
    explanation:
      "Enterprise Structure Definition:\n• Fungsi OX02: Mendefinisikan Company Code, unit akuntansi terkecil untuk laporan keuangan eksternal.\n• Fungsi OX10: Mendefinisikan Plant sebagai unit operasional logistik dan manufaktur.\n• Fungsi OX09: Mendefinisikan Storage Location (gudang penyimpanan fisik material).\n• Fungsi OX08: Mendefinisikan Purchasing Organization (unit negosiasi dan kontrak pengadaan).\n• Penetapan Valuasi: Valuation Area ditetapkan per Plant pada S/4HANA; pada ECC dapat memilih Company Code atau Plant.",
    moduleId: "01",
  },
  "OX18 / OX01 / OX17 / OX19": {
    explanation:
      "Enterprise Structure Assignment:\n• Fungsi OX18: Menetapkan Plant ke Company Code (relasi 1 Plant ke 1 Company Code; 1 Company Code dapat memiliki banyak Plant).\n• Fungsi OX01: Menetapkan Purchasing Organization ke Company Code (opsional untuk model pengadaan terpusat/lintas perusahaan).\n• Fungsi OX17: Menetapkan Purchasing Organization ke Plant operasional.\n• Fungsi OX19: Menghubungkan Company Code ke Controlling Area sesuai desain manajemen biaya CO.",
    moduleId: "01",
  },
  "OB29 / OBBO / OB52 / OBA7": {
    explanation:
      "Financial Accounting Global Settings:\n• Fungsi OB29: Menentukan Fiscal Year Variant (contoh: K4 periode kalender 12 normal + 4 khusus audit).\n• Fungsi OBBO: Menentukan Posting Period Variant untuk Company Code.\n• Fungsi OB52: Mengontrol izin buka/tutup periode posting akuntansi per jenis akun.\n• Fungsi OBA7: Mengonfigurasi Document Types (SA, KR, KZ, AA, WE, RE) dan rentang nomor dokumen akuntansi.",
    moduleId: "02",
  },
  "OBD4 / OBC4": {
    explanation:
      "Account Groups & Field Status:\n• Fungsi OBD4: Mengelompokkan rentang nomor akun Buku Besar (Aset, Kewajiban, Modal, Pendapatan, Beban).\n• Fungsi OBC4: Mengatur atribut field status (Required, Optional, Suppressed) saat penulisan jurnal per Field Status Group.",
    moduleId: "01",
  },
  "FBZP / FI12_HBANK": {
    explanation:
      "Payment Program & House Bank:\n• Fungsi FBZP: Mengonfigurasi parameter automatic payment program (Company Code pembayar, metode pembayaran, bank determination, dan ranking order).\n• Fungsi FI12_HBANK: Memelihara master data House Bank dan nomor rekening bank operasional pada sistem yang mendukungnya.",
    moduleId: "02",
  },
  "OBYR / OBXT": {
    explanation:
      "Special G/L Account Determination:\n• Fungsi OBYR: Mengatur penentuan akun Buku Besar rekonsiliasi alternatif Special G/L untuk vendor (misal Uang Muka Indicator A).\n• Fungsi OBXT: Mengatur penentuan akun rekonsiliasi alternatif Special G/L untuk customer.",
    moduleId: "02",
  },
  "FTXP / OB40": {
    explanation:
      "Tax Codes & Account Determination:\n• Fungsi FTXP: Memelihara Tax Code dan persentase tarif pajak sesuai yurisdiksi perpajakan negara.\n• Fungsi OB40: Memetakan akun Buku Besar otomatis untuk transaction key pajak (misal input tax VST dan output tax MWS).",
    moduleId: "02",
  },
  "OAOA / AO90": {
    explanation:
      "Asset Accounting Customizing:\n• Fungsi OAOA: Mendefinisikan Asset Class dan parameter kontrol aset tetap (misal Bangunan, Mesin, AuC).\n• Fungsi AO90: Memetakan account determination FI-AA ke akun Buku Besar (perolehan aset, akumulasi penyusutan, dan beban depresiasi).",
    moduleId: "02",
  },
  "OMS2 / OMSK": {
    explanation:
      "Material Master Customizing:\n• Fungsi OMS2: Mengatur atribut Material Types (ROH, ERSA, FERT, DIEN), termasuk kontrol updating kuantitas dan nilai stok.\n• Fungsi OMSK: Mendefinisikan Account Category Reference dan rentang Valuation Class yang diizinkan untuk setiap tipe material.",
    moduleId: "01",
  },
  "OBYC / OMWD / OMWN": {
    explanation:
      "Automatic Account Determination (MM-FI):\n• Fungsi OBYC: Memetakan akun otomatis untuk transaksi MM-FI berdasarkan Transaction Key (BSX Persediaan, WRX GR/IR, GBB Biaya/Konsumsi, PRD Selisih Harga).\n• Fungsi OMWD: Mengelompokkan Valuation Area ke dalam Valuation Grouping Code.\n• Fungsi OMWN: Mengatur modifier pergerakan akun; periksa release dan IMG sebelum melakukan modifikasi.",
    moduleId: "03",
  },
  "CT04 / CL02 / OMGS": {
    explanation:
      "MM Release Strategy Customizing:\n• Fungsi CT04: Mendefinisikan karakteristik persetujuan (Nilai Total PO, Plant, Purchasing Group).\n• Fungsi CL02: Mengelompokkan karakteristik ke dalam Class 032 release strategy.\n• Fungsi OMGS: Menyusun matriks Release Groups, Release Codes (jabatan approver), dan Release Strategies.",
    moduleId: "03",
  },
  "OMR6": {
    explanation:
      "Invoice Verification Tolerance Limits:\n• Fungsi Konfigurasi: Memelihara batas toleransi verifikasi faktur (Logistics Invoice Verification).\n• Kategori Toleransi: Mengatur ambang batas selisih harga, deviasi kuantitas, dan selisih tanggal jatuh tempo.\n• Dampak Proses: Hasil pemeriksaan menentukan apakah faktur langsung diposting atau dikenakan payment block otomatis.",
    moduleId: "03",
  },
  "OPSJ / OPSA / OITA": {
    explanation:
      "Project System Basic Customizing:\n• Fungsi OPSJ: Mengatur WBS Coding Mask untuk standarisasi format penomoran ID proyek dan WBS.\n• Fungsi OPSA: Mengonfigurasi Project Profile (menentukan tipe proyek, kontrol biaya, dan status default).\n• Fungsi OITA: Memelihara Investment Profile untuk integrasi otomatis pembuatan master Asset under Construction (AuC).",
    moduleId: "04",
  },
  "OPS9 / OPTK / OKO7": {
    explanation:
      "PS Budgeting & Settlement Customizing:\n• Fungsi OPS9: Memelihara Budget Profile (menentukan ketersediaan anggaran tahunan/keseluruhan dan desimal).\n• Fungsi OPTK: Menentukan Tolerance Limits Availability Control (AVAC) untuk memicu action Warning (80%) atau Error (100%).\n• Fungsi OKO7: Mengonfigurasi Settlement Profile termasuk jenis receiver yang diizinkan (AuC, Fixed Asset, Cost Center, G/L).",
    moduleId: "04",
    sources: [{"title":"SAP Learning — konfigurasi availability control (S/4HANA Project System)","url":"https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/configuring-budgeting-functions"},{"title":"SAP Learning — settlement profile (S/4HANA)","url":"https://learning.sap.com/courses/detailing-overhead-cost-accounting/controlling-settlement-using-the-settlement-profile_cef6c062-84cf-48bf-ac7e-701fff3fc361"}],
  },
  "MARA": {
    explanation:
      "Master Material - General Data (Level Client):\n• Key Field: MATNR (Nomor Material).\n• Cakupan Data: Menyimpan atribut dasar yang berlaku seragam di seluruh perusahaan: Base Unit of Measure (MEINS), Material Group (MATKL), Material Type (MTART), berat kotor/bersih, dan dimensi fisik.",
    moduleId: "06",
  },
  "MARC": {
    explanation:
      "Master Material - Plant Data (Level Plant):\n• Key Field: MATNR + WERKS.\n• Cakupan Data: Menyimpan parameter operasional per pabrik/site: Purchasing Group (EKGRP), MRP Controller, Procurement Type, Planned Delivery Time, Safety Stock, dan Reorder Point.",
    moduleId: "06",
  },
  "MARD": {
    explanation:
      "Master Material - Storage Location Data:\n• Key Field: MATNR + WERKS + LGORT.\n• Cakupan Data: Menyimpan kuantitas stok per gudang fisik (unrestricted-use, quality inspection, dan blocked stock) dalam model klasik.\n• Batas Penerapan: Pada S/4HANA pembacaan data stok dapat menggunakan mekanisme agregasi yang berbeda; bukan uraian lengkap warehouse bins.",
    moduleId: "06",
  },
  "MBEW": {
    explanation:
      "Material Valuation Data (Level Valuation Area):\n• Key Field: MATNR + BWKEY (+ BWTAR bila split valuation).\n• Cakupan Data: Menyimpan parameter valuasi: Valuation Class, Price Control (V Moving Average / S Standard), Total Stock, Total Value, dan Moving Average Price.",
    moduleId: "06",
  },
  "MSPR": {
    explanation:
      "Project Stock Data (Stok Khusus Proyek Q):\n• Key Field: MANDT + MATNR + WERKS + LGORT + CHARG + SOBKZ + PSPNR.\n• Cakupan Data: Menyimpan kuantitas fisik persediaan khusus yang terikat ke elemen WBS proyek.\n• Batas Valuasi: Nilai valuasi tidak disimpan sebagai saldo stok dalam MSPR; pemakaian fisik dicatat saat transaksi barang.",
    moduleId: "06",
  },
  "EBAN": {
    explanation:
      "Purchase Requisition Item (Baris Item PR):\n• Key Field: BANFN (Nomor PR) + BNFPO (Nomor Item).\n• Cakupan Data: Menyimpan permohonan kuantitas material/jasa, Delivery Date, Plant tujuan, estimasi harga satuan, dan status konversi menjadi PO.",
    moduleId: "06",
  },
  "EBKN": {
    explanation:
      "Purchase Requisition Account Assignment:\n• Key Field: BANFN + BNFPO + ZEBKN.\n• Cakupan Data: Menghubungkan baris item PR dengan objek akuntansi biaya: nomor internal WBS Element (PS_PSP_PNR) atau Cost Center (KOSTL).",
    moduleId: "06",
  },
  "EKKO": {
    explanation:
      "Purchase Order Header (Header Dokumen PO):\n• Key Field: EBELN (Nomor PO).\n• Cakupan Data: Menyimpan data umum kontrak pembelian: Kode Vendor (LIFNR), Company Code (BUKRS), Purchasing Organization (EKORG), Purchasing Group (EKGRP), Currency, Document Date, dan Terms of Payment.",
    moduleId: "06",
  },
  "EKPO": {
    explanation:
      "Purchase Order Item (Baris Item PO):\n• Key Field: EBELN + EBELP (Nomor Item PO).\n• Cakupan Data: Menyimpan rincian pemesanan: Kode Material (MATNR), kuantitas dipesan (MENGE), harga satuan bersih (NETPR), Item Category, Delivery Completed Indicator (ELIKZ), dan Plant tujuan.",
    moduleId: "06",
  },
  "EKKN": {
    explanation:
      "Purchase Order Account Assignment:\n• Key Field: EBELN + EBELP + ZEKKN.\n• Cakupan Data: Menyimpan pembebanan objek biaya pada baris PO: nomor internal WBS Element (PS_PSP_PNR), Cost Center, atau nomor master Aset Tetap.",
    moduleId: "06",
  },
  "EKBE": {
    explanation:
      "Purchasing Document History:\n• Key Field: EBELN + EBELP + ZEKKN + VGABE + GJAHR + BELNR + BUZEI.\n• Cakupan Data: Menyimpan riwayat transaksi pembelian: bukti Goods Receipt (MIGO), Invoice Receipt (MIRO), dan Down Payment sesuai proses.",
    moduleId: "06",
  },
  "MATDOC": {
    explanation:
      "Universal Material Document (S/4HANA):\n• Key Field: MBLNR (Nomor Dokumen Material) + MJAHR (Tahun) + ZEILE (Item).\n• Inovasi S/4HANA: Tabel tunggal penyimpan dokumen material terintegrasi yang menggantikan peran ganda tabel klasik MKPF (header) dan MSEG (item).\n• Kompatibilitas: Menyediakan compatibility views untuk akses transaksi klasik.",
    moduleId: "06",
  },
  "RBKP": {
    explanation:
      "Invoice Document Header (Header Faktur MIRO):\n• Key Field: BELNR (Nomor Dokumen Faktur) + GJAHR (Tahun Fiskal).\n• Cakupan Data: Menyimpan data header tagihan vendor: nomor referensi faktur pajak/vendor, tanggal faktur, total tagihan kotor, Company Code, dan status posting.",
    moduleId: "06",
  },
  "RSEG": {
    explanation:
      "Invoice Document Item (Item Rincian Faktur MIRO):\n• Key Field: BELNR + GJAHR + BUZEI.\n• Cakupan Data: Menyimpan rincian tagihan per baris PO: nomor PO rujukan (EBELN/EBELP), kuantitas ditagihkan, nilai bersih tagihan, dan selisih harga (Price Difference).",
    moduleId: "06",
  },
  "PROJ": {
    explanation:
      "Project Definition Master Data:\n• Key Field: PSPNR (Nomor Internal Proyek).\n• Cakupan Data: Menyimpan kode eksternal proyek (PSPID, contoh: TINF-2026-01), deskripsi proyek, Project Profile, Company Code, Controlling Area, Plant, dan jadwal proyek.",
    moduleId: "06",
  },
  "PRPS": {
    explanation:
      "WBS Element Master Data:\n• Key Field: PSPNR (Nomor Internal WBS).\n• Cakupan Data: Menyimpan kode eksternal WBS (POSID, contoh: P-2026-TINF01.01), hirarki pohon proyek, dan indikator operasional: Account Assignment Element (BELKZ), Planning Element, dan Billing Element.",
    moduleId: "06",
  },
  "BPGE": {
    explanation:
      "Total Budget Values (SAP PS):\n• Key Field: OBJNR (Nomor Objek WBS) + LEDNR (Ledger Anggaran).\n• Cakupan Data: Menyimpan nilai total plafon anggaran seumur hidup proyek (Overall Budget) per WBS Element. Digunakan sistem AVAC untuk memeriksa batas ketersediaan dana.",
    moduleId: "06",
  },
  "BPJA": {
    explanation:
      "Annual Budget Values (SAP PS):\n• Key Field: OBJNR + GJAHR (Tahun Fiskal) + LEDNR.\n• Cakupan Data: Menyimpan nilai plafon anggaran WBS per tahun fiskal (Annual Budget). Memungkinkan kontrol anggaran berbasis tahunan.",
    moduleId: "06",
  },
  "RPSCO": {
    explanation:
      "Project Costs Totals Record (Model Klasik):\n• Key Field: OBJNR + GJAHR + WRTTP (Value Type).\n• Cakupan Data: Menyimpan total biaya proyek dalam model klasik, termasuk kategori Plan, Actual, dan Commitment.\n• Batas Penerapan: Ketersediaan dan sumber pelaporan berbeda menurut release dan mekanisme kompatibilitas S/4HANA.",
    moduleId: "06",
  },
  "COOI": {
    explanation:
      "Commitment Management Line Items:\n• Key Field: OBJNR + GJAHR + BELNR + BUZEI.\n• Cakupan Data: Menyimpan baris komitmen pengadaan (PR dan PO) yang sedang mengikat anggaran objek biaya di Controlling.\n• Batas Integrasi: Pencatatan komitmen bergantung pada konfigurasi availability control dan edisi sistem.",
    moduleId: "06",
  },
  "COBRB": {
    explanation:
      "Settlement Rules (Aturan Settlement Biaya):\n• Key Field: OBJNR (Nomor Objek WBS) + LFDNR (Nomor Urut Aturan).\n• Cakupan Data: Menyimpan aturan pembagian biaya WBS ke objek penerima: nomor master Asset under Construction (AuC), nomor Aset Tetap final, Cost Center, atau akun G/L beserta persentase alokasinya.",
    moduleId: "06",
  },
  "SKA1": {
    explanation:
      "G/L Account Master Data (Chart of Accounts Segment):\n• Key Field: KTOPL (Chart of Accounts) + SAKNR (Nomor Akun G/L).\n• Cakupan Data: Menyimpan atribut dasar akun buku besar tingkat korporasi: Account Group, Balance Sheet / P&L Indicator, dan teks akun pendek/panjang (SKAT).",
    moduleId: "06",
  },
  "SKB1": {
    explanation:
      "G/L Account Master Data (Company Code Segment):\n• Key Field: BUKRS (Company Code) + SAKNR (Nomor Akun G/L).\n• Cakupan Data: Menyimpan parameter akun per perusahaan: Account Currency, Reconciliation Account Type (Vendor, Customer, Asset), Open Item Management, dan Field Status Group.",
    moduleId: "06",
  },
  "BUT000": {
    explanation:
      "Business Partner General Data (Level Client):\n• Key Field: PARTNER (Nomor Business Partner).\n• Cakupan Data: Menyimpan data identitas umum mitra bisnis di S/4HANA: nama resmi, kategori BP (Person / Organization), dan bahasa komunikasi.\n• Batas Data: Alamat lengkap dan nomor pajak disimpan di tabel terkait (BUT020, DFKKBPTAXNUM).",
    moduleId: "06",
  },
  "LFM1": {
    explanation:
      "Vendor Purchasing Organization Data:\n• Key Field: LIFNR (Kode Vendor) + EKORG (Purchasing Organization).\n• Cakupan Data: Menyimpan atribut komersial pengadaan vendor: Order Currency, Terms of Payment, Incoterms, dan indikator GR-Based Invoice Verification (WEBRE).",
    moduleId: "06",
  },
  "BKPF": {
    explanation:
      "Accounting Document Header (Header Jurnal FI):\n• Key Field: BUKRS (Company Code) + BELNR (Nomor Dokumen FI) + GJAHR (Tahun Fiskal).\n• Cakupan Data: Menyimpan data header jurnal: Document Type (BLART), Tanggal Posting (BUDAT), Tanggal Dokumen (BLDAT), Mata uang transaksi, dan User ID pembuat jurnal.",
    moduleId: "06",
  },
  "BSEG": {
    explanation:
      "Accounting Document Line Items (Entry View FI):\n• Key Field: BUKRS + BELNR + GJAHR + BUZEI (Nomor Baris Item).\n• Cakupan Data: Menyimpan baris entri jurnal akuntansi: Nomor Akun (HKONT), Posting Key (BSCHL), Debit/Kredit (SHKZG), Nilai Transaksi (DMBTR), dan objek biaya (WBS/Cost Center).\n• Hubungan S/4HANA: Tetap aktif di S/4HANA untuk entry view; tidak semua baris Universal Journal ACDOCA mempunyai pasangan 1:1 di BSEG.",
    moduleId: "06",
    sources: [{"title":"SAP Learning — FI document, BSEG dan ACDOCA pada S/4HANA","url":"https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/executing-data-archiving-for-specific-fi-objects"}],
  },
  "ACDOCA": {
    explanation:
      "Universal Journal Entry (S/4HANA Core):\n• Key Field: RCLNT + RLDNR (Ledger) + RBUKRS (Company Code) + GJAHR + BELNR + DOCLN (Nomor Baris 6 Digit).\n• Inovasi S/4HANA: Menyatukan General Ledger (FI-GL), Asset Accounting (FI-AA), Cost Center (CO-OM), Profitability (CO-PA), dan Material Ledger ke dalam satu tabel tunggal.\n• Akses Data: Public Cloud menggunakan CDS views atau API resmi, bukan akses langsung SE16N.",
    moduleId: "06",
    sources: [{"title":"SAP Learning — FI document dan Universal Journal S/4HANA","url":"https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/executing-data-archiving-for-specific-fi-objects"}],
  },
  "ANLA": {
    explanation:
      "Fixed Asset Master Data (Data Umum Aset Tetap):\n• Key Field: BUKRS + ANLN1 (Nomor Aset Utama) + ANLN2 (Sub-nomor Aset).\n• Cakupan Data: Menyimpan deskripsi aset, Asset Class, tanggal perolehan pertama, tanggal kapitalisasi, dan status operasional aset tetap atau AuC.",
    moduleId: "06",
  },
  "ANLB": {
    explanation:
      "Depreciation Terms per Area (Ketentuan Penyusutan FI-AA):\n• Key Field: BUKRS + ANLN1 + ANLN2 + AFABE (Depreciation Area).\n• Cakupan Data: Menyimpan parameter penyusutan per area valuasi: Depreciation Key (metode susut), Useful Life (masa manfaat tahun & bulan), dan tanggal mulai penyusutan.",
    moduleId: "06",
  },
  "ANLC": {
    explanation:
      "Asset Value Fields (Nilai Akumulasi Aset Klasik):\n• Key Field: BUKRS + ANLN1 + ANLN2 + GJAHR + AFABE.\n• Cakupan Data: Menyimpan saldo perolehan kumulatif (APC) dan akumulasi penyusutan per tahun fiskal dalam model klasik ECC.\n• Batas S/4HANA: Pada S/4HANA nilai aset terintegrasi di Universal Journal (ACDOCA); ANLC diakses melalui compatibility views jika tersedia.",
    moduleId: "06",
    sources: [{"title":"SAP Learning — Universal Journal dan Asset Accounting (S/4HANA)","url":"https://learning.sap.com/courses/outlining-cost-management-and-profitability-analysis/discussing-the-concept-of-the-universal-journal_f62cf151-5562-44f5-8ff6-df16fb232e94"}],
  },
  "M7 053: Posting only possible in periods 2026/10 and 2026/09 in company code 1000": {
    explanation:
      "Penyebab & Solusi Error M7 053 (Periode MM Tertutup):\n• Pesan Error: Tanggal posting transaksi logistik berada di luar periode MM yang diizinkan untuk Company Code terkait.\n• Pemeriksaan Awal: Periksa tanggal posting dokumen, Company Code, periode aktif saat ini via MMRV, dan izin posting ke periode sebelumnya.\n• Solusi Sesuai Prosedur: Penyebabnya tidak selalu periode belum dimajukan; MMPV hanya dijalankan oleh pihak berwenang sesuai jadwal closing resmi. Periode akuntansi FI dikendalikan terpisah via OB52.",
    moduleId: "06",
  },
  "F5 201: Posting period 011 2026 is not open": {
    explanation:
      "Penyebab & Solusi Error F5 201 (Periode FI Belum Dibuka):\n• Pesan Error: Periode akuntansi keuangan yang dimasukkan belum terbuka untuk posting transaksi FI.\n• Pemeriksaan Konfigurasi: Periksa tanggal posting dokumen, Fiscal Year Variant (OB29), Posting Period Variant (OBBO), dan rentang periode akun terkait di OB52.\n• Solusi Sesuai Prosedur: Perubahan OB52 hanya dilakukan oleh tim akuntansi berwenang sesuai SOP closing; jangan membuka periode secara sembarangan tanpa otorisasi.",
    moduleId: "06",
  },
  "BP 604: In document item 00010 WBS Element P-2026-TINF01.02, budget for WBS was exceeded by 4,000.00 USD": {
    explanation:
      "Penyebab & Solusi Error BP 604 (Pagu Anggaran AVAC Terlampaui):\n• Pesan Error: Nilai transaksi pengadaan (PR, PO, atau Goods Issue) melampaui plafon anggaran yang dialokasikan pada WBS Element.\n• Analisis Sisa Anggaran: Periksa nilai dana terpakai (Assigned Funds), nilai anggaran aktif via S_ALR_87013558, dan ambang batas toleransi AVAC (OPTK).\n• Solusi Bisnis: Jika pengeluaran telah disetujui, lakukan Budget Supplement (CJ36) atau Budget Transfer (CJ34) dan release tambahan (CJ32). Alternatifnya, negosiasikan ulang kuantitas atau harga dokumen pengadaan.",
    moduleId: "06",
  },
  "Account determination (OBYC)": {
    explanation:
      "Penyebab & Solusi Kegagalan Account Determination OBYC:\n• Pesan Error: Sistem logistik MM tidak menemukan akun Buku Besar otomatis saat memposting transaksi pergerakan barang atau faktur.\n• Penelusuran Parameter: Periksa detail nomor pesan pada log sistem, lalu telusuri kombinasi Chart of Accounts, Transaction Key (BSX, WRX, GBB, PRD), Valuation Grouping Code (OMWD), Account Modification, dan Valuation Class (OMSK).\n• Solusi Konfigurasi: Pelihara pemetaan akun di T-Code OBYC melalui jalur kontrol perubahan yang disetujui; jangan berasumsi satu kode pesan berlaku untuk seluruh skenario.",
    moduleId: "06",
  },
  "KI 235: Account 510010 requires an assignment to a CO object": {
    explanation:
      "Penyebab & Solusi Error KI 235 (Objek Biaya CO Wajib Diisi):\n• Pesan Error: Akun Buku Besar beban/biaya yang diposting berstatus Primary Cost Element sehingga mewajibkan objek akuntansi biaya (CO Object).\n• Analisis Penyebab: Periksa atribut akun di FS00, status field di OBC4, dan alur proses bisnis transaksi yang sedang dijalankan.\n• Solusi Operasional: Isi objek biaya yang valid pada transaksi (WBS Element, Cost Center, atau Internal Order). Penetapan default via OKB9 hanya digunakan jika memang dirancang dan disetujui untuk skenario tersebut.",
    moduleId: "06",
  },
  "Project settlement rule": {
    explanation:
      "Penyebab & Solusi Error Settlement Proyek (CJ88):\n• Pesan Error: Transaksi settlement periodik atau kapitalisasi penuh gagal memproses alokasi biaya WBS ke objek penerima.\n• Analisis Log: Baca message class dan nomor pesan spesifik pada log eksekusi CJ88. Periksa aturan alokasi (Settlement Rule di CJ20N), objek receiver, Settlement Profile (OKO7), periode pembukuan, dan status sistem WBS.\n• Solusi Diagnosis: Kesalahan settlement cost element tidak identik dengan aturan alokasi yang hilang; pelihara settlement rule atau cost element hanya sesuai diagnosis konfigurasi yang tepat.",
    moduleId: "06",
  },
  "VA01 / VA02 / VA03": {
    explanation:
      "Sales Order Management (SAP SD):\n• Fungsi Transaksi: VA01 membuat, VA02 mengubah, dan VA03 menampilkan Sales Order (pesanan penjualan pelanggan).\n• Struktur Dokumen: Header (VBAK), Item (VBAP), dan Business Data (VBKD).\n• Penerapan Telco: Digunakan InfraNexia untuk mencatat kontrak pesanan internet MetroNexia dengan baris item Material 2 MRC (tagihan bulanan berulang) dan Material 3 OTC (biaya aktivasi/instalasi).\n• Integrasi: Terhubung ke fungsi ketersediaan stok, kredit pelanggan, pricing condition, dan billing plan.",
    moduleId: "07",
    sources: [{ title: "SAP Learning — Executing Sales Order Management", url: "https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-sales-order-management_cad9dfbe-bafc-4ed9-ac2e-6fd8422430e4" }],
  },
  "VA21 / VA22 / VA23": {
    explanation:
      "Sales Quotation (Penawaran Harga Resmi Pelanggan):\n• Fungsi Transaksi: VA21 membuat, VA22 mengubah, dan VA23 menampilkan Quotation resmi kepada calon pelanggan enterprise.\n• Masa Berlaku: Menyimpan validitas penawaran tarif harga internet (Valid From / Valid To) dan syarat komersial.\n• Konversi Dokumen: Quotation yang disetujui pelanggan dapat dikonversi menjadi Sales Order (VA01) dengan referensi dokumen lengkap.",
    moduleId: "07",
  },
  "VL01N / VL02N / VL03N": {
    explanation:
      "Outbound Delivery (Pengiriman Logistik Penjualan):\n• Fungsi Transaksi: VL01N membuat dengan referensi Sales Order, VL02N mengubah/posting goods issue, VL03N menampilkan dokumen delivery.\n• Peran Telco: Digunakan saat ada pengiriman perangkat fisik (ONT / CPE router / drop cable) ke site pelanggan; Post Goods Issue (PGI Movement 601) memotong stok gudang MM.\n• Batas Layanan Jasa: Untuk layanan murni jasa/bandwidth tanpa perangkat fisik, delivery dapat dilewati sesuai konfigurasi item category.",
    moduleId: "07",
  },
  "VF01 / VF02 / VF03": {
    explanation:
      "Billing Document (Faktur Penjualan SD):\n• Fungsi Transaksi: VF01 membuat faktur tagihan pelanggan mengacu pada Sales Order atau Delivery; VF02 mengubah/rilis ke FI; VF03 menampilkan faktur.\n• Otomatisasi Akuntansi: Menyimpan data header di VBRK dan item di VBRP; saat disimpan, sistem otomatis memicu pembuatan dokumen akuntansi piutang (Document Type RV di FI-AR).\n• Penentuan Akun: Akun pendapatan dan pajak ditentukan secara otomatis oleh konfigurasi VKOA.",
    moduleId: "07",
    sources: [{ title: "SAP Learning — Billing Process and Integration to SAP S/4HANA Finance", url: "https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba" }],
  },
  "VF04 / VF06": {
    explanation:
      "Maintain Billing Due List (Collective Billing Run):\n• Fungsi Transaksi: Memproses penagihan massal secara otomatis untuk seluruh order dan delivery yang sudah jatuh tempo penagihan.\n• Penerapan Telco MRC: Sangat penting bagi tim operasional InfraNexia untuk menjalankan eksekusi penagihan berkala bulanan (Periodic Billing Run) atas seluruh kontrak MetroNexia aktif.",
    moduleId: "07",
  },
  "VK11 / VK12 / VK13": {
    explanation:
      "Condition Record Maintenance (Master Harga SD):\n• Fungsi Transaksi: VK11 membuat, VK12 mengubah, dan VK13 menampilkan data kondisi harga, tarif, diskon, dan pajak.\n• Contoh Condition Type: PR00 (Base Price tarif internet bulanan MRC dan biaya aktivasi OTC), MWST (Pajak PPN 11%), K007 (Customer Discount).\n• Tabel Database: Kondisi disimpan di tabel KONH (header) dan KONP (item rincian).",
    moduleId: "07",
  },
  "VD51 / VD52 / VD53": {
    explanation:
      "Customer-Material Information Record:\n• Fungsi Transaksi: Memelihara hubungan khusus antara pelanggan tertentu dengan kode material internal.\n• Kegunaan: Memetakan nomor material versi pelanggan (Customer Material Number), deskripsi khusus, toleransi pengiriman, dan delivering plant default.",
    moduleId: "07",
  },
  "V.01 / V.02": {
    explanation:
      "Incomplete Sales Documents (Log Dokumen Tidak Lengkap):\n• Fungsi Laporan: Menampilkan daftar pesanan penjualan (Sales Order) yang belum lengkap datanya (Incompletion Log), misal data pricing, delivery data, atau billing plan yang belum terisi.\n• Kontrol Kualitas: Memastikan order tidak dapat diproses lebih lanjut ke pengiriman atau penagihan sebelum data wajib dilengkapi.",
    moduleId: "07",
  },
  "OX05 / OVXI / OVXB / OVXG": {
    explanation:
      "Definisi Struktur Organisasi SD (Enterprise Structure SPRO):\n• Fungsi OX05: Mendefinisikan Sales Organization (unit legal tertinggi penjualan).\n• Fungsi OVXI: Mendefinisikan Distribution Channel (saluran penjualan, misal B2B atau Wholesale).\n• Fungsi OVXB: Mendefinisikan Division (lini produk, misal Internet Data Service).\n• Fungsi OVXG: Menggabungkan ketiganya menjadi Sales Area.",
    moduleId: "07",
  },
  "OVX3 / OVX6": {
    explanation:
      "Penetapan Organisasi SD (Assignment SPRO):\n• Fungsi OVX3: Menghubungkan Sales Organization ke Company Code akuntansi pembukuan.\n• Fungsi OVX6: Menghubungkan Sales Area ke Delivering Plant untuk pengeluaran barang/perangkat CPE.",
    moduleId: "07",
  },
  "VKOA": {
    explanation:
      "Revenue Account Determination (Otomatisasi Akun SD-FI):\n• Fungsi Konfigurasi: T-Code sentral konsultan SD untuk memetakan penentuan akun Buku Besar pendapatan secara otomatis saat faktur VF01 dibuat.\n• Kunci Parameter: Menggunakan kombinasi Application V, Chart of Accounts, Sales Org, Customer Account Assignment Group (KTGRD), Material Account Assignment Group (KTGRM), dan Account Key (ERL untuk pendapatan kotor, MWS untuk pajak, ERS untuk potongan).\n• Padanan MM: VKOA pada modul SD memiliki peran analog seperti OBYC pada modul logistik MM.",
    moduleId: "07",
    sources: [{ title: "SAP Learning — Billing Process and Integration to SAP S/4HANA Finance", url: "https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba" }],
  },
  "V/06 / V/08 / OVKK": {
    explanation:
      "Pricing Procedure Configuration (Skema Harga SPRO):\n• Fungsi V/06: Mendefinisikan Condition Types (PR00, MWST, K007).\n• Fungsi V/08: Menyusun urutan langkah kalkulasi harga dalam Pricing Procedure.\n• Fungsi OVKK: Menentukan skema harga berdasarkan Sales Area, Customer Pricing Procedure, dan Document Pricing Procedure.",
    moduleId: "07",
  },
  "VBAK": {
    explanation:
      "Sales Order Header Data:\n• Key Field: VBELN (Nomor Dokumen Penjualan).\n• Cakupan Data: Menyimpan nomor customer Sold-to Party (KUNNR), tipe pesanan (AUART), tanggal dokumen, Sales Area, dan nilai total bersih order (NETWR).",
    moduleId: "07",
  },
  "VBAP": {
    explanation:
      "Sales Order Item Data:\n• Key Field: VBELN + POSNR (Nomor Baris Item).\n• Cakupan Data: Menyimpan kode material produk (MATNR), deskripsi, kuantitas pesanan, delivering plant (WERKS), item category, dan nilai per baris.",
    moduleId: "07",
  },
  "VBKD": {
    explanation:
      "Sales Document Business Data:\n• Key Field: VBELN + POSNR.\n• Cakupan Data: Menyimpan syarat pembayaran (Terms of Payment Z030), IncoTerms, dan nomor referensi Billing Plan (FPLNR) untuk jadwal penagihan berkala MRC.",
    moduleId: "07",
  },
  "FPLA": {
    explanation:
      "Billing Plan Header Data:\n• Key Field: FPLNR (Nomor Billing Plan).\n• Cakupan Data: Menyimpan tipe billing plan (Periodic Billing 02 untuk MRC atau Milestone 01 untuk OTC), tanggal mulai kontrak, dan frekuensi penagihan bulanan.",
    moduleId: "07",
  },
  "FPLT": {
    explanation:
      "Billing Plan Dates / Item Schedule:\n• Key Field: FPLNR + FPLTR.\n• Cakupan Data: Menyimpan seluruh jadwal tanggal penagihan faktur berkala (Billing Dates), nilai tagihan per periode, dan status apakah faktur sudah terbentuk via VF01.",
    moduleId: "07",
  },
  "LIKP": {
    explanation:
      "Outbound Delivery Header Data:\n• Key Field: VBELN (Nomor Delivery).\n• Cakupan Data: Menyimpan nomor pengiriman logistik, Shipping Point, tanggal pengiriman, dan status pergerakan barang (PGI).",
    moduleId: "07",
  },
  "LIPS": {
    explanation:
      "Outbound Delivery Item Data:\n• Key Field: VBELN + POSNR.\n• Cakupan Data: Menyimpan rincian kode material perangkat fisik (CPE/ONT router), kuantitas fisik yang dikirim, dan gudang asal.",
    moduleId: "07",
  },
  "VBRK": {
    explanation:
      "Billing Document Header Data:\n• Key Field: VBELN (Nomor Faktur / Invoice Penjualan).\n• Cakupan Data: Menyimpan nomor tagihan pelanggan, nomor Payer (KUNRG), tanggal billing (FKDAT), tipe faktur (FKART, misal F2), dan nomor dokumen kondisi harga (KNUMV).",
    moduleId: "07",
  },
  "VBRP": {
    explanation:
      "Billing Document Item Data:\n• Key Field: VBELN + POSNR.\n• Cakupan Data: Rincian baris material layanan yang ditagihkan (Material 2 MRC atau Material 3 OTC), kuantitas, nilai bersih penjualan, dan nomor Sales Order acuan.",
    moduleId: "07",
  },
  "PRCD_ELEMENTS": {
    explanation:
      "Pricing Conditions Elements (S/4HANA):\n• Key Field: KNUMV + KPOSN + STUNR.\n• Cakupan Data: Tabel penyimpanan modern di S/4HANA yang menggantikan tabel ECC KONV; mencatat rincian nilai moneter untuk setiap condition type (PR00, MWST, potongan harga) pada order dan invoice.",
    moduleId: "07",
  },
  "VKOA: Account determination": {
    explanation:
      "Penyebab & Solusi Error VKOA (Account Determination SD-FI Gagal):\n• Pesan Error: Sistem gagal merilis Billing Document VF01 ke akuntansi keuangan FI karena akun pendapatan (G/L Account) belum ditentukan.\n• Analisis Penyebab: Periksa Chart of Accounts, Sales Organization, Customer Account Assignment Group (KTGRD di master BP role FLCU01), dan Material Account Assignment Group (KTGRM di master material sales view).\n• Solusi Konfigurasi: Lengkapi pemetaan akun Buku Besar pendapatan di T-Code VKOA untuk Account Key terkait (ERL untuk pendapatan kotor, MWS untuk pajak PPN).",
    moduleId: "07",
    sources: [{ title: "SAP Learning — Billing Process and Integration to SAP S/4HANA Finance", url: "https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba" }],
  },
};
