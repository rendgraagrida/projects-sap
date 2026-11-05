# Audit Flow End-to-End dan Data Lab SAP

Tanggal audit: 2026-11-05

## Batas audit

Audit ini memeriksa apakah flow general pada aplikasi mengikuti konsep proses SAP S/4HANA yang terdokumentasi dan apakah data yang tampil dibedakan antara:

- konsep proses yang didukung dokumentasi SAP;
- perilaku yang bergantung pada edisi, release, otorisasi, dan konfigurasi;
- fixture sintetis untuk pembelajaran.

Aplikasi ini **bukan koneksi SAP**, bukan sumber data Telkom, dan tidak memvalidasi konfigurasi sistem pelanggan.

## Flow general yang dipakai

1. Kebutuhan bisnis dan keputusan memakai project/WBS bila diperlukan.
2. Project Definition, WBS, planning, budget, dan availability control bila proyek memerlukannya.
3. Purchase Requisition dan source determination.
4. Purchase Order dan approval.
5. Goods Receipt untuk material atau Service Entry Sheet untuk jasa.
6. Logistics Invoice Verification / supplier invoice.
7. Automatic Payment Run dan clearing open item vendor.
8. Settlement biaya ke AuC/receiver bila investment measure.
9. Full settlement ke aset tetap final dan depreciation posting bila aset sudah siap digunakan.

Procurement material/jasa tidak selalu membutuhkan PS. Sebaliknya, settlement, AuC, dan depreciation bukan langkah wajib untuk setiap proses P2P.

## Hasil audit input

| Area | Status | Keputusan |
| --- | --- | --- |
| `1000`, `1100`, dan `P-2026-TINF01.*` | Fixture edukasi | Dipertahankan sebagai ID sintetis; tidak disebut sebagai default SAP atau data Telkom. |
| `4500010001/2`, vendor `100024/100025`, dan material `MAT-*` | Fixture edukasi | Dipakai untuk trace kasus; implementasi nyata harus memakai master data target. |
| MIGO `101` terhadap PO | Sesuai konsep SAP | Dipakai sebagai contoh goods receipt utama. |
| `221 Q` untuk project stock | Bersyarat konfigurasi | Hanya valid dalam skenario project stock dan konfigurasi yang sesuai; bukan aturan universal. |
| PPN 11%, PPh 23 2%, `V1/V2`, dan nomor G/L | Fixture/konfigurasi | Tidak boleh dianggap tarif, tax code, atau akun standar SAP. |
| `BSX`, `WRX`, `GBB-VBR` | Bersyarat konfigurasi | Kunci account determination adalah konsep SAP; nomor akun ditentukan chart of accounts dan konfigurasi. |
| `ACDOCA` dan `MATDOC` | Bersyarat release/edisi | Ditampilkan sebagai model S/4HANA; compatibility view dan akses tabel lama bergantung release. |
| AuC otomatis saat release, `CJ88`, dan `AFAB` | Bersyarat konfigurasi | Investment profile, settlement profile, depreciation area/key, tanggal kapitalisasi, dan period control harus tersedia. |

## Rujukan resmi

- [SAP Learning — Outlining a General Procurement Process](https://learning.sap.com/courses/business-processes-in-sap-s-4hana-sourcing-and-procurement/outlining-a-general-procurement-process_dfbc33f8-72f1-4d30-a4cd-bd63d48d7a70)
- [SAP Learning — Posting a Goods Receipt with Reference](https://learning.sap.com/courses/inventory-management-and-physical-inventory-in-sap-s-4hana/posting-a-goods-receipt-with-reference)
- [SAP Help — Movement Types (Project Stock)](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/cc8f759e1b0e4f3b8048c3cf808d4068/674ad2784d654e45ae9e4cea9b5dedcc.html)
- [SAP Learning — Executing an Automatic Payment Run](https://learning.sap.com/courses/configuring-additional-settings-in-financial-accounting-in-sap-s-4hana/executing-an-automatic-payment-run)
- [SAP Learning — Executing a Settlement](https://learning.sap.com/courses/project-financials-control-in-sap-s-4hana/executing-a-settlement)
- [SAP Help — Settlement of an Asset under Construction](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/67e323b7117e4c91869c258933f47182/5da0a3519aa05f72e10000000a423f68.html)

Rujukan di atas mendukung konsep proses, bukan validasi terhadap konfigurasi atau data perusahaan tertentu.
