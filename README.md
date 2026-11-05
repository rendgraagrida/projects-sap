# 🎓 SAP S/4HANA & ECC 6.0 Mastery Lab — Kurikulum Komprehensif (MM • PS • FI)

Selamat datang di repositori pembelajaran mendalam dan komprehensif untuk tiga modul paling terintegrasi di dunia ERP korporasi (**The Golden Triad of SAP**):
- 📦 **SAP MM (Materials Management):** Pengadaan (*Procure-to-Pay*), Manajemen Gudang & Inventaris (*Inventory Management*), Verifikasi Faktur (*LIV*), serta Konfigurasi Otomatisasi Akuntansi (`OBYC`).
- 🏗️ **SAP PS (Project System):** Struktur Proyek (*WBS & Network*), Perencanaan Biaya, Kontrol Ketersediaan Anggaran (*Availability Control / AVAC*), serta Kapitalisasi Proyek (*Settlement `CJ88`*).
- 💰 **SAP FI (Financial Accounting):** Buku Besar (*General Ledger & Universal Journal `ACDOCA`*), Hutang Usaha (*AP & `F110`*), Piutang Usaha (*AR*), Akuntansi Aset Tetap (*FI-AA & AuC*), serta Perpajakan.

---
## Aplikasi lokal

Lab menggunakan Bun, Vite, React, dan TypeScript. Di root proyek jalankan `bun install` sekali, lalu `bun run dev` dan buka alamat yang ditampilkan Vite. `bun run typecheck`, `bun test`, dan `bun run build` tersedia untuk pemeriksaan integrasi.

Seluruh transaksi dan tabel di aplikasi adalah simulasi pendidikan berbasis data sintetis, bukan koneksi ke SAP maupun pembayaran riil. Tarif pajak, akun, kelas aset, dan konfigurasi OBYC adalah fixture pembelajaran, bukan nasihat pajak atau konfigurasi universal. Pada kasus Modul 05, budget $100.000 menghasilkan actual dan kapitalisasi $90.000, dengan sisa $10.000. Alokasi stok Q yang ditahan di monitor AVAC adalah kebijakan lab, bukan klaim bahwa baris procurement COOI tetap terbuka.

Tab **Kamus** menggantikan materi di panel tengah dengan keterangan entri terpilih; card kamus tidak memiliki accordion kedua. Tab **Materi** mengembalikan reader. Laboratorium MIGO, MIRO, AVAC, dan CJ88/AFAB adalah preview terbatas: tidak mencocokkan dokumen PO/GR/invoice secara stateful dan tidak mengubah kasus CAPEX kecuali tombol kasusnya dipakai.
Tab **Flow E2E** menampilkan alur general dari kebutuhan, WBS/budget opsional, procurement, penerimaan, invoice, pembayaran, settlement, sampai kapitalisasi/depresiasi. Tab tersebut juga memuat audit input dan rujukan resmi SAP; status `Fixture edukasi` berarti ID, akun, tarif, atau nilai hanya contoh sintetis.
Audit rinci tersedia di [`docs/audit/end-to-end-sap-data-audit.md`](./docs/audit/end-to-end-sap-data-audit.md).

Dokumentasi SAP membedakan ECC, S/4HANA on-premise/private edition, dan Public Cloud. Nama aplikasi Fiori di modul adalah petunjuk fungsional, bukan padanan satu-banding-satu. Verifikasi produk, release, role, otorisasi, dan konfigurasi target pada [SAP Help Portal](https://help.sap.com/) serta [SAP Fiori Apps Reference Library](https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/) sebelum implementasi.


## 🗺️ Daftar Modul Kurikulum (Urutan Belajar yang Direkomendasikan)

| Modul | Judul & Tautan Materi | Topik Inti yang Dibahas |
| :---: | :--- | :--- |
| **Modul 01** | 📘 **[Arsitektur SAP, Enterprise Structure, & Master Data Terpadu](./docs/curriculum/01-enterprise-structure-and-master-data.md)** | • Perbedaan teknis **SAP ECC 6.0 vs SAP S/4HANA** (`ACDOCA`, `MATDOC`, `BP`, Material Ledger)<br>• Desain **Enterprise Structure** (Client, Company Code, Controlling Area, Plant, SLoc, POrg) & T-Code SPRO<br>• Bedah **4 Master Data Inti**: G/L Account (`FS00`), Business Partner (`BP`), Material Master (`MM01` — *Valuation Class & Price Control S/V*), dan WBS (`CJ20N`). |
| **Modul 02** | 💰 **[SAP FI (Financial Accounting) — GL, AP, AR, AA, & Pajak](./docs/curriculum/02-sap-fi-financial-accounting.md)** | • Anatomi Dokumen FI (**Document Types** `OBA7` & **Posting Keys** `OB41`)<br>• Kontrol Periode FI (`OB52`) vs Logistik MM (`MMPV`)<br>• Siklus Hutang, **Uang Muka / Down Payment (`F-47` $\rightarrow$ `F-48` $\rightarrow$ `F-54`)**, & **Automatic Payment Program (`F110` / `FBZP`)**<br>• **Asset Accounting (FI-AA)**: *Asset Class*, *Depreciation Areas*, *Asset Under Construction (AuC)*, & *Depreciation Run (`AFAB`)*<br>• Pajak PPN (`FTXP`) & PPh *Withholding Tax* + Checklist *Month-End Closing*. |
| **Modul 03** | 📦 **[SAP MM (Materials Management) & Skema Otomatisasi `OBYC`](./docs/curriculum/03-sap-mm-materials-management.md)** | • Siklus End-to-End **Procure-to-Pay (P2P)** (`ME51N` $\rightarrow$ `ME41` $\rightarrow$ `ME21N` $\rightarrow$ `MIGO` $\rightarrow$ `MIRO`)<br>• Matriks **Item Category** (`Standard`, `D` Service, `K` Consignment, `L` Subcontracting) & **Account Assignment** (`Blank`, `K`, `A`, `P` Project Direct, `Q` Project Stock)<br>• Pengadaan Jasa Eksternal & **Service Entry Sheet (`ML81N`)**<br>• Master **Movement Types** (`101`, `103/105`, `201`, `221`, `281`, `301`, `311`, `411 Q`, `561`)<br>• **Bedah Tuntas `OBYC`**: Bagaimana `BSX`, `WRX`, `GBB-VBR`, `PRD`, dan `KDM` memicu jurnal FI otomatis. |
| **Modul 04** | 🏗️ **[SAP PS (Project System) — WBS, Budgeting, AVAC, & Settlement](./docs/curriculum/04-sap-ps-project-system.md)** | • 3 Kategori Proyek: **CAPEX Investment**, **OPEX Overhead**, & **Customer Revenue Project**<br>• Struktur **WBS Element** vs **Network Activity** (`CJ20N`) yang otomatis memicu PR & Reservasi di MM<br>• Siklus Status Sistem (`CRTD` $\rightarrow$ `REL` $\rightarrow$ `TECO` $\rightarrow$ `CLSD`) & pembuatan otomatis AuC<br>• Rumus **Availability Control (AVAC)**: $\text{Assigned} = \text{PR Commitment} + \text{PO Commitment} + \text{Actual}$<br>• **Settlement Akhir Bulan (`CJ88`)**: Dari WBS $\rightarrow$ AuC $\rightarrow$ Aset Tetap Final. |
| **Modul 05** | 🔗 **[Integrasi MM-PS-FI & Simulation Infrastruktur Telekomunikasi](./docs/curriculum/05-integration-and-end-to-end-case-study.md)** | • Tab **Simulation** menggantikan label aplikasi “CAPEX $100k”, bukan nama resmi SAP<br>• Deployment segmen fiber optic backbone regional, terinspirasi bisnis PT Telkom Infrastruktur Indonesia (TIF/InfraNexia); bukan Telkominfra atau proyek aktual<br>• Budget \$100,000, vendor, akun, pajak dan umur manfaat merupakan asumsi edukasi; mencakup 10 langkah, jurnal, AVAC dan tabel sintetis. |
| **Modul 06** | 🛠️ **[Kamus T-Code, SPRO, Tabel Database (`SE16N`), Troubleshooting, & Bank Soal](./docs/curriculum/06-tcode-spro-tables-and-exam-prep.md)** | • Daftar lengkap **T-Code Harian & petunjuk Fiori** (MM, PS, FI)<br>• Daftar **T-Code Konfigurasi SPRO** untuk konsultan<br>• Diagram **relasi konseptual** tabel database SAP (`EKKO`, `MATDOC`, `PRPS`, `COOI`, `BKPF`, `ACDOCA`, `ANLA`)<br>• Solusi **6 pola error edukasional** (`M7 053`, `F5 201`, `BP 604`, `Account determination (OBYC)`, `KI 235`, `Project settlement rule`)<br>• **5 Studi Kasus Latihan** beserta pembahasan; bukan ujian sertifikasi resmi. |

---

## 🚀 Cara Mempelajari Modul Ini dengan Efektif

1. **Mulai dari Modul 01:** Pahami dulu struktur organisasi (*Company Code*, *Controlling Area*, *Plant*) dan bagaimana *Valuation Class* di Material Master serta *Account Assignment* di WBS menjadi jembatan penghubung ketiga modul.
2. **Pelajari Modul 02, 03, dan 04 Secara Berurutan:** Fokuskan perhatian pada kotak rumus jurnal (`Dr. / Cr.`) dan diagram alir di setiap bab.
3. **Praktikkan Alur di Modul 05:** Ikuti cerita studi kasus proyek \$100,000 dari Langkah 1 sampai Langkah 10. Gunakan angka dan jurnal sebagai fixture pembelajaran, lalu bandingkan dengan settlement rule, account determination, pajak, dan kebijakan akuntansi pada sistem target.
4. **Gunakan Modul 06 sebagai Buku Saku Harian:** Saat bekerja atau menghadapi error, buka tabel troubleshooting dan kamus `SE16N` di Modul 06. Materi ini membantu belajar; penguasaan implementasi nyata tetap memerlukan proses, konfigurasi, otorisasi, dan verifikasi pada release SAP target.
