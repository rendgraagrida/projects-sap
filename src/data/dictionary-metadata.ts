export interface DictionaryMetaItem {
  explanation: string;
  moduleId: string;
  sources?: readonly { title: string; url: string }[];
}

export const dictionaryMetadata: Record<string, DictionaryMetaItem> = {
  // ==========================================
  // 1. T-CODE & FIORI OPERASIONAL
  // ==========================================
  'MM01 / MM02 / MM03': {
    explanation:
      'MM01 membuat atau memperluas material ke tingkat organisasi yang diperlukan; MM02 mengubah data yang diizinkan; MM03 menampilkan data. Perubahan base unit atau valuation class tunduk pada pemeriksaan stok, dokumen, konfigurasi dan proses yang berlaku, bukan larangan permanen. Saat mengubah, sistem dapat menggunakan SAP enqueue lock pada objek bisnis; ini bukan penguncian seluruh tabel database. Ketersediaan transaksi bergantung pada edisi dan otorisasi.',
    moduleId: '01',
  },
  'BP (ECC: XK01)': {
    explanation:
      'BP mengelola data umum serta peran pemasok dan pelanggan di S/4HANA melalui integrasi Customer/Vendor. FLVN00 mencakup data pemasok untuk company code dan FLVN01 untuk purchasing organization; data umum, alamat dan nomor pajak disimpan di objek terkait, bukan seluruhnya di BUT000. Di ECC transaksi klasik seperti XK01 digunakan sesuai konfigurasi. Nomor akun dan persyaratan peran ditentukan implementasi.',
    moduleId: '01',
  },
  'ME11 / ME12 / ME13': {
    explanation:
      'ME11 membuat, ME12 mengubah, dan ME13 menampilkan purchasing info record untuk hubungan pemasok dan material atau kelompok material. Data umum dan organisasi pembelian dapat mencakup kondisi harga dan waktu pengiriman. Penentuan sumber dan harga PO bergantung pada validitas, organisasi, kondisi, dan konfigurasi; info record tidak selalu menjadi sumber harga.',
    moduleId: '03',
  },
  'ME01': {
    explanation:
      'ME01 memelihara source list material per plant, termasuk periode validitas dan sumber tetap atau diblokir. Bila source-list requirement berlaku, sistem memeriksa sumber yang valid dalam proses pengadaan; dampak pada PR, penetapan sumber dan PO bergantung pada proses dan konfigurasi.',
    moduleId: '03',
  },
  'ME51N / ME52N / ME53N': {
    explanation:
      'ME51N membuat, ME52N mengubah dan ME53N menampilkan purchase requisition. PR dapat berasal dari input manual atau proses perencanaan. Account assignment yang tersedia dapat mencakup cost center, WBS atau project stock; perlakuan stok dan pembebanan mengikuti kategori, item dan konfigurasi. EBAN dan EBKN menyimpan item serta assignment klasik.',
    moduleId: '03',
  },
  'ME54N / ME55': {
    explanation:
      'ME54N melakukan release individual PR dan ME55 release kolektif dalam prosedur release klasik. Cakupan persetujuan, indikator dan konsekuensi terhadap proses lanjutan bergantung pada strategi yang diterapkan. S/4HANA dapat memakai flexible workflow; ketersediaan berbeda menurut edisi.',
    moduleId: '03',
  },
  'ME5A': {
    explanation:
      'List Display of Purchase Requisitions:\n• Laporan analitis untuk memonitor seluruh status dokumen PR terbuka (Open PR), PR yang telah terkonversi menjadi Purchase Order, maupun PR yang dibatalkan.\n• Mendukung filter berdasarkan Plant, Purchasing Group, Nomor Material, atau Tracking Number pengadaan.',
    moduleId: '03',
  },
  'ME21N / ME22N / ME23N': {
    explanation:
      'ME21N membuat, ME22N mengubah, dan ME23N menampilkan PO, termasuk pemasok, item, harga dan jadwal. Data header, item dan account assignment klasik antara lain EKKO, EKPO dan EKKN. Komitmen dan pemeriksaan anggaran WBS hanya timbul sesuai objek, proses dan konfigurasi; GR serta invoice verification dapat merujuk PO.',
    moduleId: '03',
  },
  'ME29N / ME28': {
    explanation:
      'ME29N melakukan release individual dan ME28 release kolektif PO dengan prosedur klasik. Efek release indicator terhadap proses lanjutan bergantung pada konfigurasi; jangan mengasumsikan setiap PO yang belum disetujui selalu menghasilkan pesan atau blokir GR yang sama. Flexible workflow merupakan alternatif pada skenario S/4HANA yang didukung.',
    moduleId: '03',
  },
  'ME2N / ME2L / ME2M': {
    explanation:
      'PO Standard Operational Reports:\n• ME2N (Laporan PO berdasarkan Nomor Dokumen).\n• ME2L (Laporan PO berdasarkan Kode Vendor / Supplier).\n• ME2M (Laporan PO berdasarkan Kode Material).\n• Menampilkan status pemenuhan: kuantitas dipesan (Ordered), kuantitas diterima gudang (Delivered via MIGO), dan kuantitas yang sudah ditagihkan (Invoiced via MIRO).',
    moduleId: '03',
  },
  'ME2J / ME2K': {
    explanation:
      'PO Reporting by Project & Account Assignment:\n• ME2J (Khusus menampilkan seluruh daftar PO yang dibebankan ke objek WBS Proyek SAP PS).\n• ME2K (Laporan PO berdasarkan Account Assignment umum seperti Cost Center atau Proyek).\n• Sangat penting bagi Project Manager untuk melacak realisasi belanja pengadaan material dan jasa proyek.',
    moduleId: '04',
  },
  'ML81N': {
    explanation:
      'ML81N memelihara dan menerima service entry sheet untuk skenario layanan eksternal klasik yang mereferensikan PO. Acceptance dapat menghasilkan penerimaan jasa dan posting akuntansi sesuai account assignment, nilai dan konfigurasi; bukan jaminan jurnal yang identik untuk semua layanan. Public Cloud memakai proses dan aplikasi yang tersedia pada edisinya.',
    moduleId: '03',
  },
  'MIGO': {
    explanation:
      'MIGO memproses goods movement sesuai jenis transaksi dan konfigurasi. Contoh: 101 penerimaan PO; 103 ke GR blocked stock, bukan quality inspection stock; 105 melepas GR blocked stock; 122 retur; 201 ke cost center; 221 ke WBS; 311 antar storage location; 561 saldo awal. Dokumentasi SAP Library 4.6C menjelaskan 411 Q sebagai transfer project stock ke own stock. Untuk 412 Q dan reversal, periksa dokumentasi movement type, release dan konfigurasi sistem. Dokumen material dibuat saat posting; jurnal FI hanya untuk pergerakan bernilai yang relevan, bukan setiap MIGO.',
    moduleId: '03',
    sources: [{ title: 'SAP Learning — goods receipt dan GR blocked stock (S/4HANA)', url: 'https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/posting-a-goods-receipt-with-reference' }, { title: 'SAP Library 4.6C — Project Stock, transfer 411 Q (historis)', url: 'https://help.sap.com/saphelp_46c/helpdata/en/4d/2b92c943ad11d189410000e829fbbd/content.htm' }],
  },
  'MB52': {
    explanation:
      'MB52 melaporkan kuantitas stok material menurut plant dan storage location serta kategori stok yang dipilih. Project stock merupakan special stock dan pelaporannya bergantung pada pilihan laporan dan edisi; jangan menyamakan kuantitas dengan nilai valuasi.',
    moduleId: '03',
  },
  'MMBE': {
    explanation:
      'MMBE menampilkan stock overview menurut tingkat organisasi dan kategori stok yang tersedia, misalnya plant, storage location, batch dan special stock. Tampilan serta rincian bergantung pada pilihan dan otorisasi.',
    moduleId: '03',
  },
  'MB51': {
    explanation:
      'Material Document List (Riwayat Mutasi Persediaan):\n• Audit trail pelacakan seluruh transaksi pergerakan barang historis berdasarkan Movement Type, tanggal posting, kode material, gudang, atau user yang mengeksekusi MIGO.',
    moduleId: '03',
  },
  'MB5B': {
    explanation:
      'Stock for Posting Date (Rekonsiliasi MM vs FI):\n• Menghitung saldo awal stok, total mutasi penerimaan/pengeluaran, dan saldo akhir stok pada rentang tanggal tertentu.\n• Sangat krusial saat periode closing untuk mencocokkan total nilai stok logistik MM dengan saldo Buku Besar Persediaan di FI (FS10N).',
    moduleId: '03',
  },
  'MI01 $\\rightarrow$ MI04 $\\rightarrow$ MI07': {
    explanation:
      'MI01 membuat physical inventory document, MI04 mencatat hasil hitung dan MI07 memposting selisih yang disetujui. Posting block atau pembekuan book inventory merupakan opsi proses, bukan akibat otomatis setiap MI01. Selisih yang bernilai dapat menghasilkan jurnal sesuai valuasi dan account determination.',
    moduleId: '03',
  },
  'MMPV / MMRV': {
    explanation:
      'MMPV memajukan periode MM untuk company code; MMRV memeriksa pengaturan periode dan mengatur izin posting ke periode sebelumnya. Jalankan perubahan periode hanya sesuai prosedur closing dan setelah memeriksa tanggal serta status sistem. Periode FI dikendalikan terpisah, misalnya melalui OB52.',
    moduleId: '03',
  },
  'MIRO / MIR7 / MIR4': {
    explanation:
      'MIRO memposting invoice logistik dengan referensi yang relevan seperti PO; pemeriksaan harga dan kuantitas bergantung pada proses dan toleransi. Pada contoh GR bernilai dan invoice standar, posting dapat mendebit GR/IR dan mengkredit utang vendor, dengan pajak atau selisih sesuai konfigurasi. MIR7 memarkir invoice tanpa posting final; MIR4 menampilkan dokumen. LFB1 adalah master vendor company-code, bukan akun jurnal.',
    moduleId: '03',
  },
  'MRBR': {
    explanation:
      'MRBR memproses pelepasan invoice yang diblokir untuk pembayaran, termasuk blokir akibat deviasi invoice verification. Tinjau alasan, toleransi, otorisasi dan penyelesaian selisih sebelum release; pemblokiran tidak selalu disebabkan harga atau kuantitas.',
    moduleId: '03',
  },
  'MR8M': {
    explanation:
      'MR8M membatalkan invoice logistik yang memenuhi syarat melalui proses Logistics Invoice Verification, dengan dampak terhadap dokumen terkait dan riwayat PO sesuai proses. FB08 digunakan untuk pembalikan dokumen FI yang sesuai; pilih transaksi pembatalan berdasarkan aplikasi asal dan aturan sistem.',
    moduleId: '03',
  },
  'MR11': {
    explanation:
      'MR11 memelihara saldo GR/IR untuk perbedaan kuantitas penerimaan dan invoice yang memang tidak akan diselesaikan lewat transaksi normal. Akun lawan serta dampak nilai stok atau biaya ditentukan oleh keadaan item, valuasi dan konfigurasi.',
    moduleId: '03',
  },
  'CJ20N': {
    explanation:
      'CJ20N Project Builder memelihara struktur proyek klasik seperti project definition, WBS, network dan aktivitas, sesuai otorisasi. Indikator WBS dan investment profile menentukan fungsi yang tersedia; pembuatan AuC dan settlement tetap bergantung pada konfigurasi dan proses.',
    moduleId: '04',
  },
  'CJ01 / CJ02 / CJ03': {
    explanation:
      'CJ01 membuat, CJ02 mengubah, dan CJ03 menampilkan project definition. Project definition merupakan struktur bisnis proyek, bukan badan hukum; profil dan data organisasi menyediakan default serta pengendalian proyek.',
    moduleId: '04',
  },
  'CN21 / CN22 / CN23': {
    explanation:
      'Maintain Network (Tabel AUFK & AFKO):\n• CN21 (Create), CN22 (Change), CN23 (Display).\n• Mengatur logika alur kerja aktivitas proyek (Network Activity), hubungan ketergantungan (Finish-to-Start), estimasi durasi hari kerja, alokasi kapasitas teknisi internal, dan pemesanan material langsung ke site proyek.',
    moduleId: '04',
  },
  'CJ40 / CJ41': {
    explanation:
      'Cost Planning WBS (RAB Proyek):\n• CJ40 (Edit Cost Planning), CJ41 (Display).\n• Memasukkan angka estimasi rencana biaya proyek (Plan Cost) per WBS Element per tahun anggaran sebelum penetapan dan pengesahan anggaran resmi.',
    moduleId: '04',
  },
  'CJ30 / CJ31': {
    explanation:
      'Original Budgeting WBS (Tabel BPGE & BPJA):\n• CJ30 (Change Original Budget), CJ31 (Display).\n• Menetapkan plafon anggaran resmi investasi (CAPEX Budget) pada masing-masing WBS Element yang menjadi batas pagu ketersediaan dana perusahaan.',
    moduleId: '04',
  },
  'CJ32': {
    explanation:
      'CJ32 me-release budget untuk proyek yang menggunakan budget release. Release bukan status sistem WBS yang sama dengan REL, dan tidak otomatis mengaktifkan AVAC. Availability control dapat memeriksa released budget atau current budget menurut budget profile dan pengaturan aktivasi.',
    moduleId: '04',
    sources: [{ title: 'SAP Learning — budget release dan availability control (S/4HANA Project System)', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/performing-budgeting-functions' }],
  },
  'CJ36 / CJ37': {
    explanation:
      'CJ36 dan CJ37 terkait budget supplement dalam proses Project System klasik. Supplement menambah current budget tanpa menimpa original budget; pemeriksaan distribusi dan otorisasi tetap berlaku. Periksa mode transaksi masing-masing pada release sistem.',
    moduleId: '04',
  },
  'CJ34': {
    explanation:
      'CJ34 berkaitan dengan budget update Project System klasik. Budget update dapat mencakup return atau transfer; periksa label transaksi, arah dan otorisasi pada sistem serta release yang digunakan sebelum melakukan perubahan.',
    moduleId: '04',
  },
  'CJ35': {
    explanation:
      'CJ35 berkaitan dengan budget update Project System klasik. Budget update dapat mencakup return atau transfer; periksa label transaksi, arah dan otorisasi pada sistem serta release yang digunakan sebelum melakukan perubahan.',
    moduleId: '04',
    sources: [{ title: 'SAP Learning — budget updates dan transfers (S/4HANA Project System)', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/performing-budgeting-functions' }],
  },
  'CJBV / CJBW': {
    explanation:
      'CJBV mengaktifkan dan CJBW menonaktifkan availability control untuk proyek yang dipilih, sesuai otorisasi dan konfigurasi. Aktivasi juga dapat diatur melalui budget profile; tindakan ini bukan perubahan otomatis untuk seluruh proyek.',
    moduleId: '04',
    sources: [{ title: 'SAP Learning — konfigurasi availability control (S/4HANA Project System)', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/configuring-budgeting-functions' }],
  },
  'CJBN': {
    explanation:
      'CJBN merekonstruksi availability control untuk proyek yang dipilih, misalnya ketika nilai kontrol perlu dibangun ulang menurut prosedur administrasi. Analisis penyebab dan petunjuk SAP yang relevan diperlukan; tidak setiap perubahan toleransi memerlukan rekonstruksi.',
    moduleId: '04',
  },
  'CN25 / CAT2': {
    explanation:
      'CN25 mencatat konfirmasi aktivitas network seperti kemajuan atau pekerjaan aktual. CAT2 mencatat waktu dalam Cross-Application Time Sheet; pencatatan saja tidak menjamin posting biaya CO. Persetujuan dan transfer ke aplikasi penerima, serta tarif dan konfigurasi, menentukan dampak berikutnya.',
    moduleId: '04',
  },
  'CJB2': {
    explanation:
      'CJB2 menghasilkan settlement rule untuk WBS dalam skenario investment project yang dikonfigurasi. Penerima, investment profile, status dan prasyarat menentukan hasil; jangan menganggap semua WBS otomatis memperoleh AuC.',
    moduleId: '04',
  },
  'CJ88 / CJ8G': {
    explanation:
      'CJ88 menjalankan settlement individual proyek dan CJ8G pemrosesan kolektif. Settlement periodik atau penuh mengikuti rule, receiver, periode, status dan profile yang berlaku. Pada skenario investasi biaya dapat diselesaikan ke AuC lalu ke aset akhir melalui proses yang sesuai; kelas aset dan urutannya tidak universal.',
    moduleId: '04',
    sources: [{ title: 'SAP Learning — settlement profile (S/4HANA)', url: 'https://learning.sap.com/courses/detailing-overhead-cost-accounting/controlling-settlement-using-the-settlement-profile_cef6c062-84cf-48bf-ac7e-701fff3fc361' }],
  },
  'S_ALR_87013558': {
    explanation:
      'S_ALR_87013558 membandingkan budget, actual, commitment dan available amount proyek menurut seleksi laporan. Assigned funds dapat meliputi actual, commitments dan nilai objek lain yang relevan; perhitungan bergantung pada konfigurasi availability control.',
    moduleId: '04',
    sources: [{ title: 'SAP Learning — assigned funds dan availability control (S/4HANA Project System)', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/configuring-budgeting-functions' }],
  },
  'CJI3': {
    explanation:
      'Project Actual Cost Line Items:\n• Menampilkan seluruh baris rincian transaksi biaya aktual yang membebani WBS Element beserta nomor dokumen sumbernya (MIGO pemakaian material, MIRO jasa, jurnal akuntansi FI).',
    moduleId: '04',
  },
  'CJI5': {
    explanation:
      'CJI5 menampilkan item komitmen proyek yang tersedia menurut seleksi, misalnya PR atau PO yang membebani WBS. Nilai dan penyimpanan komitmen bergantung pada proses, konfigurasi dan edisi; jangan menyamakan semua stok Q dengan komitmen COOI.',
    moduleId: '04',
  },
  'CN41N': {
    explanation:
      'Project Structure Overview:\n• Menampilkan visualisasi hirarki lengkap proyek (Project Def, WBS, Network, Activity, Material Component, Milestone) dalam bentuk tabel terpadu beserta status sistemnya (CRTD, REL, TECO, CLSD).',
    moduleId: '04',
  },
  'FS00': {
    explanation:
      'Maintain G/L Account Centrally:\n• Membuat dan mengelola master akun Buku Besar (General Ledger). Terbagi 2 segmen: Chart of Accounts segment (SKA1) dan Company Code segment (SKB1).\n• Mengatur mata uang akun, rekonsiliasi vendor/customer/aset, Open Item Management, Field Status Group, dan proteksi Post Automatically Only.',
    moduleId: '02',
  },
  'FB50 / F-02': {
    explanation:
      'Post G/L Document (Jurnal Umum FI):\n• FB50 (Single-screen posting cepat untuk penyesuaian akuntansi non-subledger).\n• F-02 (Classic posting dengan input manual Posting Key: 40 Debet, 50 Kredit).',
    moduleId: '02',
  },
  'FV50 / FBV0': {
    explanation:
      'FV50 memarkir dokumen G/L tanpa posting final; FBV0 memposting dokumen yang telah diparkir setelah pemeriksaan. Pemisahan maker-checker memerlukan otorisasi atau workflow yang dikonfigurasi, bukan otomatis akibat transaksi ini.',
    moduleId: '02',
  },
  'FB03 / FB02 / FB08': {
    explanation:
      'FI Document Management:\n• FB03 (Display Document): Menampilkan jurnal akuntansi BKPF/BSEG.\n• FB02 (Change Document): Mengubah teks keterangan atau field referensi non-finansial.\n• FB08 (Reverse Document): Membatalkan jurnal akuntansi murni FI dengan memposting jurnal pembalik.',
    moduleId: '02',
  },
  'F-03 / F.13': {
    explanation:
      'G/L Account Clearing (Kliring Akun Buku Besar):\n• F-03 (Manual Clearing): Memasangkan baris debit dan kredit pada akun Open Item Management seperti rekening bank kliring.\n• F.13 (Automatic Clearing): Menjalankan kliring masal otomatis (misal kliring akun GR/IR WRX berdasarkan kesamaan nomor PO dan nomor item PO).',
    moduleId: '02',
  },
  'FS10N / FAGLB03': {
    explanation:
      'G/L Account Balance Display:\n• Menampilkan saldo debit, kredit, dan kumulatif per periode pembukuan untuk akun G/L tertentu di Company Code terpilih.',
    moduleId: '02',
  },
  'FBL3N / FAGLL03': {
    explanation:
      'G/L Account Line Item Display:\n• Menampilkan seluruh baris transaksi jurnal buku besar: Open Items (status merah belum dikliring), Cleared Items (status hijau lunas), atau All Items.',
    moduleId: '02',
  },
  'FB60 / FB65': {
    explanation:
      'Accounts Payable Invoice / Credit Memo (Non-PO):\n• FB60: Menginput tagihan hutang vendor langsung tanpa melalui PO pengadaan logistik (contoh: beban sewa kantor, listrik, utilitas).\n• FB65: Menginput nota kredit vendor (Vendor Credit Memo).',
    moduleId: '02',
  },
  'F-47 $\\rightarrow$ F-48 $\\rightarrow$ F-54': {
    explanation:
      'F-47 membuat down payment request sebagai noted item; F-48 memposting pembayaran uang muka dengan special G/L indicator yang dikonfigurasi; F-54 memperhitungkan uang muka terhadap invoice. Akun, indikator dan langkah pembayaran bergantung pada konfigurasi.',
    moduleId: '02',
  },
  'F-53 / F110': {
    explanation:
      'F-53 memposting pembayaran keluar manual dengan pilihan open items; F110 menjalankan automatic payment program berdasarkan parameter dan proposal. Pemilihan bank, media pembayaran dan file transfer memerlukan konfigurasi serta proses persetujuan yang sesuai.',
    moduleId: '02',
  },
  'FK10N / FBL1N': {
    explanation:
      'Vendor Account Reports (Subledger Hutang):\n• FK10N: Menampilkan saldo dan mutasi hutang vendor per periode buku.\n• FBL1N: Menampilkan rincian baris faktur vendor (Open Items belum dibayar vs Cleared Items lunas).',
    moduleId: '02',
  },
  'FB70 / F-28': {
    explanation:
      'Accounts Receivable (Piutang Pelanggan):\n• FB70 (Enter Customer Invoice): Menerbitkan faktur piutang ke pelanggan.\n• F-28 (Post Incoming Payment): Mencatat penerimaan uang kas/bank dari pelunasan tagihan pelanggan.',
    moduleId: '02',
  },
  'FD10N / FBL5N': {
    explanation:
      'FD10N menampilkan saldo pelanggan per periode; FBL5N menampilkan item pelanggan menurut seleksi open, cleared atau all. Analisis umur piutang memerlukan seleksi atau laporan yang sesuai.',
    moduleId: '02',
  },
  'AS01 / AS02 / AS03': {
    explanation:
      'AS01 membuat, AS02 mengubah dan AS03 menampilkan master aset. Asset class, depreciation area, masa manfaat dan cost center ditentukan berdasarkan data dan konfigurasi. ANLA dan ANLB mencakup master serta ketentuan depresiasi; nilai aset bukan data master semata.',
    moduleId: '02',
  },
  'AW01N': {
    explanation:
      'AW01N Asset Explorer menampilkan nilai dan transaksi aset menurut depreciation area, termasuk nilai perolehan, nilai buku dan planned depreciation yang tersedia. Tampilan, fungsi dan akses bergantung pada edisi, konfigurasi serta otorisasi.',
    moduleId: '02',
  },
  'AIAB $\\rightarrow$ AIBU': {
    explanation:
      'AuC Line Item Settlement (Kapitalisasi AuC Manual):\n• AIAB (Distribute AuC Line Items): Menentukan persentase atau nominal pemindahan biaya dari AuC ke beberapa aset tetap final.\n• AIBU (Settle AuC to Final Asset): Mengeksekusi posting transfer kapitalisasi aset tetap.',
    moduleId: '02',
  },
  'AFAB': {
    explanation:
      'AFAB menjalankan depreciation posting untuk company code dan periode yang dipilih. Nilai, frekuensi, depreciation area, akun dan objek CO mengikuti konfigurasi serta data aset; posting biaya dan akumulasi penyusutan adalah contoh umum, bukan jurnal universal.',
    moduleId: '02',
  },
  'OB52 / F.01': {
    explanation:
      'Closing & Financial Statements (Pelaporan Keuangan):\n• OB52 (Maintain Posting Periods): Membuka dan menutup periode posting akuntansi per jenis akun (+ All, A Asset, D Customer, K Vendor, M Material, S G/L).\n• F.01 (Financial Statements): Menghasilkan laporan Neraca (Balance Sheet) dan Laba Rugi (Income Statement).',
    moduleId: '02',
  },

  // ==========================================
  // 2. SPRO IMG (CUSTOMIZING & KONFIGURASI)
  // ==========================================
  'OX02 / OX10 / OX09 / OX08': {
    explanation:
      'OX02 mendefinisikan company code, unit akuntansi terkecil untuk laporan keuangan eksternal; company code dapat mewakili entitas hukum, tetapi tidak selalu satu-satu. OX10 mendefinisikan plant, OX09 storage location dan OX08 purchasing organization. Valuation area ditetapkan dalam konfigurasi: plant pada S/4HANA; pada ECC dapat memakai company code atau plant sesuai sistem.',
    moduleId: '01',
  },
  'OX18 / OX01 / OX17 / OX19': {
    explanation:
      'OX18 menetapkan plant ke company code: satu plant ditetapkan ke satu company code, dan satu company code dapat memiliki banyak plant. OX01 menetapkan purchasing organization ke company code bila menggunakan model tersebut; organisasi pembelian lintas company code dapat tidak ditetapkan ke satu company code. OX17 menetapkan purchasing organization ke plant; OX19 menghubungkan company code dengan controlling area sesuai desain CO.',
    moduleId: '01',
  },
  'OB29 / OBBO / OB52 / OBA7': {
    explanation:
      'Pengaturan Global Finansial (FI Global Settings):\n• OB29: Fiscal Year Variant (contoh: K4 periode kalender 12 normal + 4 khusus penyesuaian audit).\n• OBBO: Posting Period Variant.\n• OB52: Kontrol buka/tutup periode posting buku besar per jenis akun.\n• OBA7: Document Types (SA Jurnal, KR Faktur Vendor, KZ Pembayaran, AA Aset, WE Bukti Penerimaan Barang) dan rentang nomor dokumen.',
    moduleId: '02',
  },
  'OBD4 / OBC4': {
    explanation:
      'Account Groups & Field Status Variants:\n• OBD4: Mengelompokkan rentang nomor akun Buku Besar (Aset, Kewajiban, Modal, Pendapatan, Beban).\n• OBC4: Mengatur atribut field (Required / Optional / Suppressed) saat penulisan jurnal per Field Status Group (misal grup G004 mewajibkan Cost Center/WBS).',
    moduleId: '01',
  },
  'FBZP / FI12_HBANK': {
    explanation:
      'FBZP mengonfigurasi automatic payment program, termasuk company code, metode pembayaran, bank determination dan rekening yang relevan. FI12_HBANK memelihara house bank pada sistem yang mendukungnya; proses rekening bank berbeda menurut edisi dan konfigurasi.',
    moduleId: '02',
  },
  'OBYR / OBXT': {
    explanation:
      'OBYR mengatur account determination special G/L untuk vendor; OBXT untuk customer. Indikator transaksi, akun rekonsiliasi alternatif dan perlakuan uang muka atau request harus diperiksa pada konfigurasi sistem, bukan diasumsikan dari kode contoh.',
    moduleId: '02',
  },
  'FTXP / OB40': {
    explanation:
      'FTXP memelihara tax code dan tarif sesuai negara serta prosedur pajak; OB40 memetakan akun untuk transaction key pajak seperti input dan output tax. Kode dan tarif pada latihan adalah contoh sintetis, bukan default SAP atau nasihat pajak.',
    moduleId: '02',
  },
  'OAOA / AO90': {
    explanation:
      'OAOA mendefinisikan asset class dan parameter terkait; AO90 memetakan account determination FI-AA ke akun G/L. Nomor kelas, kelas AuC dan akun ditentukan implementasi, bukan angka standar universal.',
    moduleId: '02',
  },
  'OMS2 / OMSK': {
    explanation:
      'Konfigurasi Master Data Material (MM):\n• OMS2: Mengatur atribut Material Types (ROH Bahan Baku, ERSA Suku Cadang, FERT Barang Jadi, DIEN Jasa), termasuk kontrol updating kuantitas dan nilai stok.\n• OMSK: Mendefinisikan Account Category Reference dan rentang Valuation Class yang diizinkan untuk setiap tipe material.',
    moduleId: '01',
  },
  'OBYC / OMWD / OMWN': {
    explanation:
      'OBYC memetakan akun otomatis untuk transaksi MM-FI berdasarkan kunci dan parameter relevan seperti valuation grouping code, valuation class dan account modification. BSX mewakili persediaan, WRX GR/IR, GBB offsetting entry, PRD selisih harga; modifier bergantung pada movement dan konfigurasi. OMWD mengelola grouping valuation area; periksa OMWN pada IMG dan release sistem sebelum mengubah pengaturan.',
    moduleId: '03',
  },
  'CT04 / CL02 / OMGS': {
    explanation:
      'MM Release Strategy (Alur Persetujuan PR & PO):\n• CT04: Mendefinisikan karakteristik persetujuan (Nilai Total PO, Plant, Purchasing Group).\n• CL02: Mengelompokkan karakteristik ke dalam Class 032.\n• OMGS: Menyusun matriks Release Groups, Release Codes (jabatan pemegang wewenang approval), dan Release Strategies.',
    moduleId: '03',
  },
  'OMR6': {
    explanation:
      'OMR6 memelihara batas toleransi invoice verification, termasuk pemeriksaan harga atau kuantitas yang relevan. Hasil pemeriksaan dan blokir pembayaran bergantung pada jenis selisih, setting dan proses; tidak semua perbedaan menghasilkan blokir yang sama.',
    moduleId: '03',
  },
  'OPSJ / OPSA / OITA': {
    explanation:
      'OPSJ mengatur WBS coding mask, OPSA project profile, dan OITA investment profile. Profil dapat mendukung pembuatan AuC untuk investment project sesuai konfigurasi dan status yang berlaku; release WBS bukan jaminan universal pembuatan aset.',
    moduleId: '04',
  },
  'OPS9 / OPTK / OKO7': {
    explanation:
      'OPS9 memelihara budget profile, OPTK tolerance limits availability control, dan OKO7 settlement profile termasuk kategori receiver yang diizinkan. Ambang warning/error dan receiver ditentukan konfigurasi, bukan nilai default universal.',
    moduleId: '04',
    sources: [{ title: 'SAP Learning — konfigurasi availability control (S/4HANA Project System)', url: 'https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/configuring-budgeting-functions' }, { title: 'SAP Learning — settlement profile (S/4HANA)', url: 'https://learning.sap.com/courses/detailing-overhead-cost-accounting/controlling-settlement-using-the-settlement-profile_cef6c062-84cf-48bf-ac7e-701fff3fc361' }],
  },

  // ==========================================
  // 3. TABEL DATABASE SAP (SE16N)
  // ==========================================
  'MARA': {
    explanation:
      'Tabel Master Material - General Data (Level Client):\n• Key Field: MATNR (Nomor Material).\n• Menyimpan atribut dasar yang berlaku seragam di seluruh perusahaan: Base Unit of Measure (MEINS), Material Group (MATKL), Material Type (MTART), berat kotor/bersih, dan dimensi fisik.',
    moduleId: '06',
  },
  'MARC': {
    explanation:
      'Tabel Master Material - Plant Data (Level Plant):\n• Key Field: MATNR + WERKS.\n• Menyimpan parameter operasional per pabrik/site: Purchasing Group (EKGRP), MRP Controller, Procurement Type (F External / E In-house), Planned Delivery Time, Safety Stock, dan Reorder Point.',
    moduleId: '06',
  },
  'MARD': {
    explanation:
      'MARD menyimpan data material per client, material, plant dan storage location. Dalam model klasik dapat mencakup kuantitas unrestricted, quality inspection dan blocked stock. Pada S/4HANA cara penyimpanan atau pembacaan stok dapat berbeda; tabel ini bukan uraian penuh seluruh special stock atau warehouse bins.',
    moduleId: '06',
  },
  'MBEW': {
    explanation:
      'MBEW menyimpan data valuasi material seperti valuation class, price control dan nilai/kuantitas valuasi. Identifikasi mencakup material, valuation area dan valuation type (BWTAR) bila split valuation digunakan, selain client. Area valuasi dan akses teknis bergantung pada edisi serta desain sistem.',
    moduleId: '06',
  },
  'MSPR': {
    explanation:
      'MSPR menyimpan kuantitas project stock. Kunci teknis: MANDT + MATNR + WERKS + LGORT + CHARG + SOBKZ + PSPNR (client, material, plant, storage location, batch, special stock indicator dan WBS). Pemakaian atau transfer mengikuti aturan movement serta otorisasi. Nilai valuasi tidak disimpan sebagai nilai stok dalam MSPR; jangan menyamakannya dengan reservasi lokal atau COOI.',
    moduleId: '06',
  },
  'EBAN': {
    explanation:
      'Tabel Purchase Requisition Item (PR Item):\n• Key Field: BANFN (Nomor PR) + BNFPO (Nomor Item).\n• Menyimpan permohonan kuantitas material/jasa, tanggal kebutuhan (Delivery Date), Plant tujuan, estimasi harga beli, dan status konversi menjadi PO.',
    moduleId: '06',
  },
  'EBKN': {
    explanation:
      'Tabel Purchase Requisition Account Assignment:\n• Key Field: BANFN + BNFPO + ZEBKN.\n• Menghubungkan baris item PR dengan objek akuntansi: menyimpan nomor internal WBS Element (PS_PSP_PNR) atau Cost Center (KOSTL).',
    moduleId: '06',
  },
  'EKKO': {
    explanation:
      'Tabel Purchase Order Header:\n• Key Field: EBELN (Nomor PO).\n• Menyimpan informasi header kontrak pembelian: Kode Vendor (LIFNR), Company Code (BUKRS), Purchasing Organization (EKORG), Purchasing Group (EKGRP), Currency, Document Date, dan Terms of Payment.',
    moduleId: '06',
  },
  'EKPO': {
    explanation:
      'Tabel Purchase Order Item:\n• Key Field: EBELN + EBELP (Nomor Item PO).\n• Menyimpan rincian pemesanan: Kode Material (MATNR), kuantitas dipesan (MENGE), harga satuan bersih (NETPR), Item Category, Delivery Completed Indicator (ELIKZ), dan Plant tujuan pengiriman.',
    moduleId: '06',
  },
  'EKKN': {
    explanation:
      'Tabel Purchase Order Account Assignment:\n• Key Field: EBELN + EBELP + ZEKKN.\n• Menyimpan pembebanan objek biaya pada baris PO: menyimpan nomor internal WBS Element (PS_PSP_PNR), Cost Center, atau Aset Tetap.',
    moduleId: '06',
  },
  'EKBE': {
    explanation:
      'EKBE menyimpan riwayat item purchasing document, termasuk peristiwa goods receipt dan invoice receipt sesuai proses. Identifikasi teknis melibatkan item PO, account assignment, jenis peristiwa dan dokumen rujukan; interpretasi field dan kategori mengikuti release sistem.',
    moduleId: '06',
  },
  'MATDOC': {
    explanation:
      'MATDOC adalah penyimpanan dokumen material pada S/4HANA. Nomor dokumen material, tahun dan item mengidentifikasi item secara bisnis; itu bukan pernyataan lengkap tentang primary key fisik MATDOC, yang mencakup dimensi teknis tambahan. Tampilan kompatibilitas dan akses bergantung pada release; ECC menggunakan model dokumen material klasik.',
    moduleId: '06',
  },
  'RBKP': {
    explanation:
      'Tabel Invoice Document Header (Faktur MIRO):\n• Key Field: BELNR (Nomor Dokumen Faktur) + GJAHR (Tahun Fiskal).\n• Menyimpan data header tagihan vendor: Nomor referensi faktur pajak/vendor, tanggal faktur, total nilai tagihan kotor, Company Code, dan status posting.',
    moduleId: '06',
  },
  'RSEG': {
    explanation:
      'Tabel Invoice Document Item (Faktur MIRO Item):\n• Key Field: BELNR + GJAHR + BUZEI.\n• Menyimpan rincian tagihan per baris PO: nomor PO rujukan (EBELN/EBELP), kuantitas yang ditagihkan, nilai bersih tagihan, dan selisih harga (Price Difference).',
    moduleId: '06',
  },
  'PROJ': {
    explanation:
      'Tabel Project Definition (Master Proyek SAP PS):\n• Key Field: PSPNR (Nomor Internal Proyek).\n• Menyimpan kode eksternal proyek (PSPID, contoh: TINF-2026-01), deskripsi proyek, Project Profile, Company Code, Controlling Area, Plant, dan jadwal proyek.',
    moduleId: '06',
  },
  'PRPS': {
    explanation:
      'Tabel WBS Element Master Data:\n• Key Field: PSPNR (Nomor Internal WBS).\n• Menyimpan kode eksternal WBS (POSID, contoh: P-2026-TINF01.01), hirarki level pohon proyek, dan indikator operasional: Account Assignment Element (BELKZ), Planning Element, dan Billing Element.',
    moduleId: '06',
  },
  'BPGE': {
    explanation:
      'Tabel Total Budget Values (SAP PS):\n• Menyimpan nilai total plafon anggaran seumur hidup proyek (Overall Budget) per WBS Element (OBJNR). Digunakan sistem AVAC untuk memeriksa batas pagu anggaran.',
    moduleId: '06',
  },
  'BPJA': {
    explanation:
      'Tabel Annual Budget Values (SAP PS):\n• Menyimpan nilai plafon anggaran WBS per tahun fiskal (Annual Budget - GJAHR). Memungkinkan kontrol anggaran berbasis tahunan.',
    moduleId: '06',
  },
  'RPSCO': {
    explanation:
      'RPSCO menyimpan nilai total proyek dalam model klasik, termasuk kategori plan, actual atau commitment sesuai proses. Ketersediaan dan sumber laporan dapat berbeda menurut release, konfigurasi dan mekanisme kompatibilitas S/4HANA.',
    moduleId: '06',
  },
  'COOI': {
    explanation:
      'COOI menyimpan item komitmen dalam model CO klasik yang relevan, misalnya komitmen pengadaan terhadap objek biaya. Pencatatan dan pelaporan bergantung pada konfigurasi serta edisi; bukan representasi universal setiap PR, PO atau project stock.',
    moduleId: '06',
  },
  'COBRB': {
    explanation:
      'Tabel Settlement Rules (Aturan Settlement Biaya):\n• Menyimpan aturan pembagian biaya WBS ke objek penerima: nomor master Asset under Construction (AuC), nomor Aset Tetap final (Fixed Asset), Cost Center, atau G/L Account beserta persentase alokasinya.',
    moduleId: '06',
  },
  'SKA1': {
    explanation:
      'SKA1 menyimpan master akun G/L tingkat chart of accounts, termasuk account group dan atribut akun; teks pendek dan panjang menurut bahasa berada di SKAT. Identifikasi bisnis mencakup KTOPL dan SAKNR, selain client. Tipe dan field yang tersedia berbeda menurut release.',
    moduleId: '06',
  },
  'SKB1': {
    explanation:
      'Tabel G/L Account Master Data (Level Company Code):\n• Key Field: BUKRS + SAKNR.\n• Menyimpan parameter akun per perusahaan: Mata uang akun (WAERS), Reconciliation Account Type (K Vendor, D Customer, A Asset), Open Item Management (XOPVW), dan Field Status Group (FSTAG).',
    moduleId: '06',
  },
  'BUT000': {
    explanation:
      'BUT000 menyimpan data umum Business Partner, termasuk identitas dan nama sesuai kategori partner. Alamat dan nomor pajak menggunakan data atau tabel terkait; BUT000 bukan penyimpanan lengkap keduanya. Identifikasi mencakup client dan nomor partner.',
    moduleId: '06',
  },
  'LFM1': {
    explanation:
      'Tabel Vendor Purchasing Organization Data (Level POrg):\n• Key Field: LIFNR + EKORG.\n• Menyimpan atribut komersial pengadaan vendor: Order Currency, Terms of Payment, Incoterms, dan tanda centang GR-Based Invoice Verification (WEBRE).',
    moduleId: '06',
  },
  'BKPF': {
    explanation:
      'Tabel Accounting Document Header (Level Company Code):\n• Key Field: BUKRS + BELNR (Nomor Dokumen FI) + GJAHR.\n• Menyimpan data header jurnal akuntansi: Document Type (BLART), Tanggal Posting (BUDAT), Tanggal Dokumen (BLDAT), Mata uang transaksi, dan User ID pembuat jurnal.',
    moduleId: '06',
  },
  'BSEG': {
    explanation: 'BSEG menyimpan item entry view dokumen FI yang relevan. Contoh identifikasi item klasik mencakup client, BUKRS, BELNR, GJAHR dan BUZEI. BSEG tetap relevan pada S/4HANA; jangan menganggap semua baris Universal Journal mempunyai pasangan satu-banding-satu di BSEG. Gunakan otorisasi dan struktur DDIC release target saat membuat join.',
    moduleId: '06',
    sources: [{ title: 'SAP Learning — FI document, BSEG dan ACDOCA pada S/4HANA', url: 'https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/executing-data-archiving-for-specific-fi-objects' }],
  },
  'ACDOCA': {
    explanation: 'ACDOCA adalah item Universal Journal S/4HANA untuk accounting terintegrasi. Identifikasi yang relevan mencakup client, ledger RLDNR, company code RBUKRS, tahun fiskal GJAHR, nomor dokumen BELNR dan item DOCLN. Ini bukan tabel ECC; tidak semua tampilan atau proses dapat diganti dengan join BSEG satu-banding-satu. Public Cloud menggunakan akses aplikasi, CDS/API yang dirilis, bukan asumsi akses SE16N langsung.',
    moduleId: '06',
    sources: [{ title: 'SAP Learning — FI document dan Universal Journal S/4HANA', url: 'https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/executing-data-archiving-for-specific-fi-objects' }],
  },
  'ANLA': {
    explanation:
      'ANLA menyimpan data umum master aset per company code dan nomor aset/subnomor, termasuk deskripsi dan tanggal kapitalisasi. AuC menggunakan asset class sesuai konfigurasi, bukan kelas bernomor tetap.',
    moduleId: '06',
  },
  'ANLB': {
    explanation:
      'Tabel Depreciation Terms per Area (FI-AA):\n• Key Field: BUKRS + ANLN1 + ANLN2 + AFABE (Depreciation Area).\n• Menyimpan parameter penyusutan aset: Metode penyusutan (Depreciation Key, misal LINR Garis Lurus), masa manfaat ekonomis (Useful Life tahun & bulan), dan tanggal mulai penyusutan.',
    moduleId: '06',
  },
  'ANLC': {
    explanation:
      'ANLC merepresentasikan nilai aset menurut aset, tahun dan depreciation area dalam model klasik ECC. Pada S/4HANA Asset Accounting memakai Universal Journal dan akses kompatibilitas dapat berbeda menurut release; jangan mengasumsikan ANLC adalah sumber fisik utama atau tersedia langsung di Public Cloud. Gunakan aplikasi atau API yang dirilis untuk edisi terkait.',
    moduleId: '06',
    sources: [{ title: 'SAP Learning — Universal Journal dan Asset Accounting (S/4HANA)', url: 'https://learning.sap.com/courses/outlining-cost-management-and-profitability-analysis/discussing-the-concept-of-the-universal-journal_f62cf151-5562-44f5-8ff6-df16fb232e94' }],
  },

  // ==========================================
  // 4. TROUBLESHOOTING ERROR KONSULTAN
  // ==========================================
  'M7 053: Posting only possible in periods 2026/10 and 2026/09 in company code 1000': {
    explanation:
      'Pesan contoh M7 053 menunjukkan tanggal posting di luar periode MM yang diperbolehkan. Periksa tanggal, company code, periode saat ini dan pengaturan periode sebelumnya; penyebabnya tidak selalu periode belum dimajukan. MMPV atau MMRV hanya digunakan sesuai prosedur closing dan otorisasi, setelah memastikan konsekuensinya; periode FI diperiksa terpisah.',
    moduleId: '06',
  },
  'F5 201: Posting period 011 2026 is not open': {
    explanation:
      'Pesan contoh F5 201 menunjukkan periode FI yang diperiksa tidak terbuka. Periksa posting date, fiscal year variant, posting period variant dan rentang untuk semua account type yang relevan. Perubahan OB52 hanya dilakukan oleh pihak berwenang sesuai prosedur closing; jangan membuka periode secara otomatis.',
    moduleId: '06',
  },
  'BP 604: In document item 00010 WBS Element P-2026-TINF01.02, budget for WBS was exceeded by 4,000.00 USD': {
    explanation:
      'Pesan contoh BP 604 mengindikasikan budget terlampaui pada objek yang diperiksa. Periksa nilai assigned, budget yang relevan, activation dan toleransi AVAC serta dokumen penyebab. Jika sah dan disetujui, sesuaikan budget atau transaksi; ambang dan tindakan tidak selalu 100% atau sama di setiap sistem.',
    moduleId: '06',
  },
  'Account determination (OBYC)': {
    explanation:
      'Contoh kegagalan account determination: periksa teks dan message class/number aktual pada sistem, lalu telusuri kombinasi chart of accounts, transaction key, valuation grouping, account modification dan valuation class yang relevan di OBYC. M8 534 tidak boleh diasumsikan sebagai kode pesan untuk contoh GBB ini; pesan dapat berbeda menurut proses dan release.',
    moduleId: '06',
  },
  'KI 235: Account 510010 requires an assignment to a CO object': {
    explanation:
      'Pesan contoh KI 235 menunjukkan bahwa posting memerlukan objek CO yang valid. Periksa akun, field status dan proses lalu isi WBS, cost center atau objek lain yang sesuai; default OKB9 hanya jika dirancang dan disetujui untuk skenario tersebut.',
    moduleId: '06',
  },
  'Project settlement rule': {
    explanation:
      'Jika settlement proyek gagal, baca message class dan nomor aktual serta log CJ88. Periksa settlement rule, receiver, settlement profile, periode dan status; kesalahan settlement cost element tidak identik dengan rule yang hilang. Pelihara rule atau cost element hanya sesuai diagnosis dan konfigurasi. KD 503 tidak boleh dipakai sebagai label generik untuk kedua masalah ini.',
    moduleId: '06',
  },
};
