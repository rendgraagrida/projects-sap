# Audit Flow End-to-End Telco InfraNexia / MetroNexia

Tanggal audit: 2026-11-05

## Batas audit

Audit ini memeriksa flow penjualan layanan internet MetroNexia dan membedakan:

- konsep proses SAP yang didukung dokumentasi resmi;
- perilaku yang bergantung pada edisi, release, otorisasi, dan konfigurasi;
- nama, material, tarif, customer, dan ID yang hanya merupakan fixture sintetis.

Aplikasi ini **bukan koneksi SAP**, bukan sumber data internal InfraNexia, dan tidak menjalankan provisioning jaringan atau transaksi keuangan nyata.

## Konteks bisnis telco

InfraNexia menjual layanan akses internet dengan brand MetroNexia. Struktur product/material yang dipakai di lab:

```text
MATERIAL 1 — MetroNexia
├── MATERIAL 2 — MetroNexia MRC (Monthly Recurring Charge)
└── MATERIAL 3 — MetroNexia OTC (One-Time Charge)
```

Interpretasi SAP:

- **Material 1** adalah root/product family atau grouping. Root tidak otomatis menjadi item tagihan.
- **Material 2 / MRC** adalah produk atau material layanan dengan recurring fee dan billing cycle bulanan.
- **Material 3 / OTC** adalah one-off charge seperti aktivasi, instalasi, perangkat, atau perubahan layanan.
- Ketiganya merupakan master/product item yang berbeda. Hubungan root-child harus dimodelkan melalui Product Hierarchy, Material Group, product bundle, atau subscription product configuration. Penamaan saja tidak membuat BOM atau relasi billing.

## Flow general yang dipakai

1. Definisikan material/product dan rate plan MetroNexia.
2. Buat Business Partner, contract account, dan subscription contract.
3. Tangkap subscription order berisi MRC dan OTC.
4. Distribusikan order untuk provisioning dan aktivasi technical resource.
5. Tagihkan OTC satu kali setelah event/order yang memenuhi syarat.
6. Jalankan billing MRC berulang berdasarkan billing cycle dan periode layanan.
7. Posting invoice serta piutang melalui FI-AR atau FI-CA sesuai arsitektur.
8. Terima pembayaran pelanggan dan clearing open item.
9. Kelola perubahan paket, suspend/resume, credit, termination, renewal, dan revenue reporting.

Flow ini berbeda dari tab **Simulation**, yang tetap digunakan untuk belajar investasi infrastruktur, WBS, procurement material/jasa, AVAC, dan settlement CAPEX.

## Hasil audit input

| Area | Status | Keputusan |
| --- | --- | --- |
| InfraNexia, MetroNexia, customer, tarif, dan nomor dokumen | Fixture edukasi | Dipakai sebagai konteks pembelajaran; tidak diklaim sebagai data internal atau data default SAP. |
| Material 1 root, Material 2 MRC, Material 3 OTC | Bersyarat konfigurasi | Dibuat sebagai tiga master/product item; grouping dan hubungan bundle harus dikonfigurasi pada solusi target. |
| MRC | Sesuai konsep SAP | Dimodelkan sebagai recurring fee dengan subscription contract dan billing cycle. Proration, perubahan harga, dan cut-off tetap configurable. |
| OTC | Sesuai konsep SAP | Dimodelkan sebagai one-off charge seperti activation/installation fee dan tidak diperlakukan sebagai recurring contract item secara default. |
| Subscription order dan technical resource | Bersyarat konfigurasi | SAP mendukung product bundle, technical data, contract start date, recurring fee, dan one-time charge; provisioning jaringan membutuhkan integrasi OSS/BSS. |
| Billing → Finance | Bersyarat konfigurasi | Billing dapat mentransfer data ke Finance dan membentuk receivable; pilihan FI-AR/FI-CA, tax, revenue mapping, serta invoice aggregation mengikuti desain target. |
| Incoming payment | Bersyarat konfigurasi | Posting kas, payment lot, auto-clearing, residual/partial payment, dan bank interface harus dikonfigurasi dan diuji. |

## Rujukan resmi SAP

- [SAP Learning — Performing Subscription Order Creation](https://learning.sap.com/courses/implementing-sap-subscription-order-management/performing-the-subscription-order-creation)
- [SAP Help — SAP Subscription Billing](https://help.sap.com/docs/subscription-billing/feature-overview/sap-subscription-billing)
- [SAP Help — Billing Cycle](https://help.sap.com/docs/subscription-billing/feature-overview/billing-cycle)
- [SAP Learning — Billing Process and Integration to SAP S/4HANA Finance](https://learning.sap.com/courses/exploring-sap-s-4hana-sales-essentials/executing-the-billing-process-and-the-integration-to-sap-s-4hana-finance_e2dd5db3-73c3-4cda-8ad5-1e7f39f04fba)
- [SAP Help — Material Master Data](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/af9ef57f504840d2b81be8667206d485/3d7eb65334e6b54ce10000000a174cb4.html)
- [SAP Help — Billing and Revenue Innovation Management](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/a03da85e7c96487aac46d431799bebdf/c918bf4f27f44f71888040e6ae3add31.html)

Rujukan tersebut mendukung konsep proses dan fitur produk, bukan validasi terhadap konfigurasi, tarif, customer, atau master data perusahaan tertentu.
