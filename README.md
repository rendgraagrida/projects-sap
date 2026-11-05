# 🎓 SAP S/4HANA & ECC 6.0 Mastery Lab — Kurikulum Komprehensif (MM • PS • FI)

Selamat datang di repositori pembelajaran mendalam dan komprehensif untuk tiga modul paling terintegrasi di dunia ERP korporasi (**The Golden Triad of SAP**):
- 📦 **SAP MM (Materials Management):** Pengadaan (*Procure-to-Pay*), Manajemen Gudang & Inventaris (*Inventory Management*), Verifikasi Faktur (*LIV*), serta Konfigurasi Otomatisasi Akuntansi (`OBYC`).
- 🏗️ **SAP PS (Project System):** Struktur Proyek (*WBS & Network*), Perencanaan Biaya, Kontrol Ketersediaan Anggaran (*Availability Control / AVAC*), serta Kapitalisasi Proyek (*Settlement `CJ88`*).
- 💰 **SAP FI (Financial Accounting):** Buku Besar (*General Ledger & Universal Journal `ACDOCA`*), Hutang Usaha (*AP & `F110`*), Piutang Usaha (*AR*), Akuntansi Aset Tetap (*FI-AA & AuC*), serta Perpajakan.

---

## 🗺️ Daftar Modul Kurikulum (Urutan Belajar yang Direkomendasikan)

| Modul | Judul & Tautan Materi | Topik Inti yang Dibahas |
| :---: | :--- | :--- |
| **Modul 01** | 📘 **[Arsitektur SAP, Enterprise Structure, & Master Data Terpadu](./docs/curriculum/01-enterprise-structure-and-master-data.md)** | • Perbedaan teknis **SAP ECC 6.0 vs SAP S/4HANA** (`ACDOCA`, `MATDOC`, `BP`, Material Ledger)<br>• Desain **Enterprise Structure** (Client, Company Code, Controlling Area, Plant, SLoc, POrg) & T-Code SPRO<br>• Bedah **4 Master Data Inti**: G/L Account (`FS00`), Business Partner (`BP`), Material Master (`MM01` — *Valuation Class & Price Control S/V*), dan WBS (`CJ20N`). |
| **Modul 02** | 💰 **[SAP FI (Financial Accounting) — GL, AP, AR, AA, & Pajak](./docs/curriculum/02-sap-fi-financial-accounting.md)** | • Anatomi Dokumen FI (**Document Types** `OBA7` & **Posting Keys** `OB41`)<br>• Kontrol Periode FI (`OB52`) vs Logistik MM (`MMPV`)<br>• Siklus Hutang, **Uang Muka / Down Payment (`F-47` $\rightarrow$ `F-48` $\rightarrow$ `F-54`)**, & **Automatic Payment Program (`F110` / `FBZP`)**<br>• **Asset Accounting (FI-AA)**: *Asset Class*, *Depreciation Areas*, *Asset Under Construction (AuC)*, & *Depreciation Run (`AFAB`)*<br>• Pajak PPN (`FTXP`) & PPh *Withholding Tax* + Checklist *Month-End Closing*. |
| **Modul 03** | 📦 **[SAP MM (Materials Management) & Skema Otomatisasi `OBYC`](./docs/curriculum/03-sap-mm-materials-management.md)** | • Siklus End-to-End **Procure-to-Pay (P2P)** (`ME51N` $\rightarrow$ `ME41` $\rightarrow$ `ME21N` $\rightarrow$ `MIGO` $\rightarrow$ `MIRO`)<br>• Matriks **Item Category** (`Standard`, `D` Service, `K` Consignment, `L` Subcontracting) & **Account Assignment** (`Blank`, `K`, `A`, `P` Project Direct, `Q` Project Stock)<br>• Pengadaan Jasa Eksternal & **Service Entry Sheet (`ML81N`)**<br>• Master **Movement Types** (`101`, `103/105`, `201`, `221`, `281`, `301`, `311`, `412 Q`, `561`)<br>• **Bedah Tuntas `OBYC`**: Bagaimana `BSX`, `WRX`, `GBB-VBR`, `PRD`, dan `KDM` memicu jurnal FI otomatis. |
| **Modul 04** | 🏗️ **[SAP PS (Project System) — WBS, Budgeting, AVAC, & Settlement](./docs/curriculum/04-sap-ps-project-system.md)** | • 3 Kategori Proyek: **CAPEX Investment**, **OPEX Overhead**, & **Customer Revenue Project**<br>• Struktur **WBS Element** vs **Network Activity** (`CJ20N`) yang otomatis memicu PR & Reservasi di MM<br>• Siklus Status Sistem (`CRTD` $\rightarrow$ `REL` $\rightarrow$ `TECO` $\rightarrow$ `CLSD`) & pembuatan otomatis AuC<br>• Rumus **Availability Control (AVAC)**: $\text{Assigned} = \text{PR Commitment} + \text{PO Commitment} + \text{Actual}$<br>• **Settlement Akhir Bulan (`CJ88`)**: Dari WBS $\rightarrow$ AuC $\rightarrow$ Aset Tetap Final. |
| **Modul 05** | 🔗 **[Integrasi Emas MM-PS-FI & Studi Kasus End-to-End CAPEX \$100,000](./docs/curriculum/05-integration-and-end-to-end-case-study.md)** | • **Simulasi Praktik 10 Langkah Utuh**: Membangun Gardu Induk 150kV senilai \$100,000 dari nol hingga menjadi aset tetap yang disusutkan<br>• Dilengkapi input field, tabel pergerakan sisa budget AVAC di setiap langkah, jurnal akuntansi lengkap (Debet/Kredit, PKey, OBYC Key), dan tabel DB yang terisi. |
| **Modul 06** | 🛠️ **[Kamus T-Code, SPRO, Tabel Database (`SE16N`), Troubleshooting, & Bank Soal](./docs/curriculum/06-tcode-spro-tables-and-exam-prep.md)** | • Daftar lengkap **T-Code Harian & Fiori Apps ID** (MM, PS, FI)<br>• Daftar **T-Code Konfigurasi SPRO** untuk konsultan<br>• Diagram **Entity-Relationship (ERD) Tabel Database SAP** (`EKKO`, `MATDOC`, `PRPS`, `COOI`, `BKPF`, `ACDOCA`, `ANLA`)<br>• Solusi **6 Error Lapangan Paling Umum** (`M7 053`, `F5 201`, `BP 604`, `M8 534`, `KI 235`, `KD 503`)<br>• **5 Studi Kasus Ujian & Wawancara Konsultan** beserta pembahasan. |

---

## 🚀 Cara Mempelajari Modul Ini dengan Efektif

1. **Mulai dari Modul 01:** Pahami dulu struktur organisasi (*Company Code*, *Controlling Area*, *Plant*) dan bagaimana *Valuation Class* di Material Master serta *Account Assignment* di WBS menjadi jembatan penghubung ketiga modul.
2. **Pelajari Modul 02, 03, dan 04 Secara Berurutan:** Fokuskan perhatian pada kotak rumus jurnal (`Dr. / Cr.`) dan diagram alir di setiap bab.
3. **Praktikkan Alur di Modul 05:** Ikuti cerita studi kasus proyek \$100,000 dari Langkah 1 sampai Langkah 10. Jika Anda memahami mengapa angka di Langkah 1 s/d 10 bergerak seperti itu, berarti Anda sudah menguasai 80% pekerjaan konsultan fungsional MM-PS-FI!
4. **Gunakan Modul 06 sebagai Buku Saku Harian:** Saat bekerja atau menghadapi error, buka tabel troubleshooting dan kamus `SE16N` di Modul 06.
