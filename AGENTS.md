# SAP S/4HANA & ECC 6.0 Mastery Lab (MM • PS • FI) — Agent Guidelines

Proyek ini adalah pusat pembelajaran komprehensif dan laboratorium simulasi untuk tiga modul inti SAP: **Materials Management (MM)**, **Project System (PS)**, dan **Financial Accounting (FI)**, beserta integrasi akuntansi, anggaran, dan tabel databasenya.

## 1. Struktur Repositori

- `README.md`: Indeks navigasi utama kurikulum dan panduan belajar.
- `docs/curriculum/`: Modul pembelajaran mendalam berstandar konsultan fungsional & pengguna bisnis:
  - `01-enterprise-structure-and-master-data.md`: Arsitektur SAP ECC vs S/4HANA, Enterprise Structure (FI/MM/PS), dan Master Data (Material, Business Partner, GL, WBS).
  - `02-sap-fi-financial-accounting.md`: Modul mendalam SAP FI (General Ledger, Accounts Payable, Accounts Receivable, Asset Accounting, Bank, Pajak, & Closing).
  - `03-sap-mm-materials-management.md`: Modul mendalam SAP MM (Procure-to-Pay, Inventory Management, Movement Types, LIV MIRO, & Skema Otomatisasi Akuntansi `OBYC`).
  - `04-sap-ps-project-system.md`: Modul mendalam SAP PS (Project Definition, WBS, Network Activities, Cost Planning, Budgeting, AVAC, & Period-End Settlement `CJ88`).
  - `05-integration-and-end-to-end-case-study.md`: Simulation integrasi MM-PS-FI, deployment fiber optic backbone dengan konteks PT Telkom Infrastruktur Indonesia (TIF/InfraNexia); seluruh nilai dan data transaksi sintetis.
  - `06-tcode-spro-tables-and-exam-prep.md`: Kamus lengkap T-Code, Fiori Apps, jalur konfigurasi SPRO/IMG, arsitektur tabel database (`EKKO`, `MSEG`, `BKPF`, `ACDOCA`, `PRPS`), troubleshooting, dan bank soal latihan.

## 2. Standar Kualitas Materi & Konten

1. **Akurasi Fungsional SAP:** Setiap transaksi wajib menyertakan:
   - **T-Code (SAP GUI)** dan padanan **SAP Fiori App** (S/4HANA).
   - **Jalur Konfigurasi SPRO / IMG** untuk perspektif konsultan.
   - **Dampak Jurnal Akuntansi (Debit / Kredit)** beserta *Transaction Key* (`BSX`, `WRX`, `GBB`, `PRD`, `KBS`, `KDM`).
   - **Tabel Database SAP** yang terpengaruh di belakang layar.
2. **Perbandingan ECC 6.0 vs S/4HANA:** Jelaskan perbedaan arsitektur penting seperti *Business Partner (BP)* menggantikan `XK01`/`FD01`, *Material Ledger* wajib, serta *Universal Journal (`ACDOCA`)* menggantikan indeks tabel lama.
3. **Standar Operasi:** Mengikuti SOP lintas proyek di `D:/DEVELOPMENT/general/WORKFLOW_7_LEVELS.md` (pekerjaan dilakukan di lokal, verifikasi tautan/konten sebelum melapor, tidak melakukan operasi remote `push`/`merge`/`deploy` tanpa perintah eksplisit pengguna).
