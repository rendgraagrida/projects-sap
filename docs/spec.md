# Spesifikasi Arsitektur — SAP S/4HANA & ECC 6.0 Mastery Lab

Status: rancangan implementasi lokal, bukan aplikasi yang sudah dibangun atau hasil verifikasi runtime. Bahasa UI utama Indonesia. Dokumen ini adalah kontrak implementasi `coder` dan kontrak penerimaan `tester`.

## 1. Ruang lingkup, sumber, dan keputusan dasar

### 1.1 Sumber yang dianalisis

Seluruh isi sumber berikut dibaca untuk rancangan ini:

- [Aturan repository](../AGENTS.md) dan [README](../README.md).
- [01 — Enterprise Structure & Master Data](curriculum/01-enterprise-structure-and-master-data.md): ECC/S/4, command field, organisasi, material V/S, BP, GL, dan WBS.
- [02 — FI](curriculum/02-sap-fi-financial-accounting.md): tipe dokumen, posting key, AP/DP/payment, AA, pajak, dan closing.
- [03 — MM](curriculum/03-sap-mm-materials-management.md): PR/PO, P/Q, SES, movement, OBYC, coverage MAP, dan invoice block.
- [04 — PS](curriculum/04-sap-ps-project-system.md): status WBS, AVAC, commitment replacement, settlement, dan AuC.
- [05 — Integrasi](curriculum/05-integration-and-end-to-end-case-study.md): seluruh 10 langkah CAPEX, transaksi majemuk, jurnal, pajak, serta dua AuC/final asset.
- [06 — Kamus & Ujian](curriculum/06-tcode-spro-tables-and-exam-prep.md): daftar T-Code/Fiori/SPRO/tabel, relasi, enam error, dan lima kasus ujian aktual.
- SOP kanonikal `D:/DEVELOPMENT/general/WORKFLOW_7_LEVELS.md`.

Kondisi repository yang ditemukan: dokumen kurikulum, README, AGENTS, serta metadata Git; belum ada aplikasi, package manifest, lockfile, test runner, atau CI yang terlihat pada root. Semua struktur `src/`, dependency, script, dan test di bawah adalah target implementasi, bukan klaim sudah tersedia. Tidak memakai asumsi game.

### 1.2 Target dan non-goal

Wajib: SPA host-local **Bun + Vite + React 18 + TypeScript strict + Tailwind CSS + Zustand**, tiga panel, enam modul lengkap, search, dictionary T-Code/SPRO/SE16N, kuis, engine deterministik, calculator bebas, AVAC tester, serta stepper CAPEX lengkap. Tidak perlu backend, SAP connection, database server, cloud, autentikasi, Docker, LLM, maupun transaksi finansial nyata.

Simulator adalah model pendidikan dengan dataset sintetis; bukan implementasi SAP produktif, ABAP, seluruh customizing SAP, atau saran pajak. Tampilkan badge tetap `Simulasi pendidikan — bukan koneksi SAP`. Mode bebas tidak membuat pembayaran bank nyata. Semua metadata per transaksi simulasi memuat T-Code, Fiori (bila sumber menyebutkan), sumber/jalur SPRO (bila tersedia), jurnal atau alasan tanpa jurnal, dan tabel yang berubah.

Hanya `docs/spec.md` dibuat pada penugasan arsitektur ini. Implementasi, instalasi dependency, Git mutation, commit/push/PR/merge/deploy, build, dan test tidak termasuk izin penugasan ini.

### 1.3 Kebijakan untuk ketidakkonsistenan sumber

Markdown tidak diperbaiki diam-diam, tidak disalin menjadi teks UI tandingan, dan tetap ditampilkan utuh. Panel penjelasan simulator menampilkan kebijakan lab berikut dengan tautan sumber:

1. **Budget $100,000 bukan actual $100,000.** Hasil kasus modul 05 adalah actual/capitalized **$90,000**, sisa budget **$10,000**. Pembagian final modul 05 adalah bangunan $35,000 dan mesin $55,000. Contoh 70%/30% atas $100,000 modul 04 adalah skenario settlement terpisah, bukan pengganti kasus modul 05.
2. **Q stock dan AVAC.** Pada `101 Q`, stok bernilai bertambah tetapi biaya konsumsi WBS/CJI3 tetap nol. Untuk mencegah $50,000 tiba-tiba menjadi budget bebas antara `101 Q` dan `221 Q`, lab mempertahankan alokasi budget Q sampai GI. Rumus utama tetap `PR + PO + Actual`; komponen PO untuk budget di UI adalah `open PO commitment + held Q allocation`. `held Q allocation` adalah proyeksi lab eksplisit, **bukan klaim bahwa baris COOI procurement tetap open setelah full GR**. Tabel COOI hanya menampilkan commitment procurement sesungguhnya dalam model; monitor merinci tambahan `Alokasi stok Q (lab)`. Tidak membuat baris COOI palsu. Ketika GI, alokasi Q berkurang dan actual bertambah secara atomik. Kebijakan tersebut bukan universal AVAC SAP dan tidak menambah alokasi Q ke actual konsumsi.
3. **Posting keys.** Modul 02 memakai contoh GL `40/50`, sedangkan modul 05 memperlihatkan WRX logistik `96` pada GR dan `86` pada IR; keduanya tidak boleh diratakan menjadi angka yang sama secara tersembunyi. Profil lab `curriculum-logistics` memakai `BSX 89/99`, `WRX 86/96`, `GBB/PRD/KDM 40/50`, asset `70/75`, vendor `31/25/26/29/39`. DP menyimpan `postingKey='29'` atau `'39'` dan `specialGl='A'`, bukan string `29A` sebagai key database. UI menerangkan perbedaan entry/logistics view terhadap contoh GL. Mapping ini adalah fixture lab, bukan konfigurasi universal SAP.
4. **Account assignment langsung.** PO `P/K` membawa akun biaya eksplisit dari account assignment (secara pendidikan sering diberi label GBB-VBR oleh kurikulum). Line tersebut berprovenance `ACCOUNT_ASSIGNMENT`, bukan mengklaim setiap PO konsumsi di SAP selalu resolve GBB melalui T030. `KBS` menjadi label penjelasan account-assigned posting, bukan rule OBYC tambahan fiktif. GI `201/221/281` benar-benar memakai resolver `GBB-VBR` lab.
5. **KDM.** Lab memakai kebijakan eksplisit `separate-KDM`: perubahan kurs di MIRO ke KDM, selisih harga ke BSX/PRD atau biaya langsung. Variasi customizing aktual dijelaskan tetapi tidak disimulasikan diam-diam.
6. **Tax.** Kasus memakai USD, PPN deductible **11%** dan PPh jasa **2%** sesuai angka sumber; bukan tarif pajak terkini yang diambil dari tanggal komputer. Non-deductible tax tersedia sebagai input calculator. Withholding diposting saat invoice dalam model ini.
7. **Kuis.** Modul 06 mempunyai lima kasus nyata walaupun tujuan pembelajaran menyebut sepuluh; tampilkan lima, jangan menciptakan lima soal sumber tambahan. README juga menjelaskan lima.
8. **Database.** Tabel inspector adalah proyeksi kolom terpilih sintetis, bukan DDIC SAP lengkap. ECC menampilkan BKPF/BSEG dan MKPF/MSEG; S/4 menampilkan BKPF/ACDOCA dan MATDOC, dengan BSEG sebagai entry-view projection bila dibuka. ACDOCA tidak berarti BKPF/BSEG hilang; MATDOC tidak berarti seluruh master/stock table fisik SAP dihapus. Penyederhanaan naratif sumber tetap terbaca dan diberi catatan konteks simulator.
9. **CJ88/AIBU.** Operasi full settlement lab menggunakan jalur `CJ88` yang diajarkan, dengan catatan sistem nyata dapat menggunakan AIAB/AIBU sesuai setup. Jangan memposting keduanya untuk nilai yang sama.
10. **GBB-INV.** Wajib tersedia di resolver dan dijalankan lewat kalkulasi physical-inventory `701/702` tambahan yang memang ada pada modul 03. Tidak memasangkan INV ke `551` atau `561` demi memenuhi checklist.

## 2. Arsitektur dan boundary

### 2.1 Dependency dan data flow

```text
docs/curriculum/*.md --Vite ?raw--> data/curriculum.ts
           |                          |
           +----> lib/study-engine.ts +----> reader/search/dictionary/quiz

components/forms --typed command--> store/use-sap-store.ts
                                          |
                                   lib/sap-engine.ts (pure)
                                          |
                        Result<state + journals + events + trace>
                                          |
                             commit satu Zustand set()
                                          |
                          lib/sap-tables.ts (pure projection)
                                          |
          journal inspector + budget monitor + database inspector
```

- `types/`: hanya kontrak, tidak mengimpor React/Zustand/data/lib.
- `data/`: raw source dan fixture konfigurasi immutable; tidak mengimpor store/UI.
- `lib/study-engine.ts`: pembentukan AST/index/anchors/dictionary; tidak memiliki transaksi atau state global.
- **`lib/sap-engine.ts`**: satu pemilik kebijakan transaksi dan fungsi publik domain. Tidak mengimpor DOM, React, Zustand, storage, clock, randomness, atau network. Perhitungan numerik murni berada di `sap-money.ts`; proyeksi DDIC berada di `sap-tables.ts` agar tidak mencampur posting dengan rendering tabel.
- `store/`: orkestrasi sinkron, pemilihan workspace, atomic commit, view state. Tidak membuat formula jurnal/AVAC tersendiri.
- `components/`: form dan presentasi. Tidak mengubah domain map atau membentuk jurnal secara manual.
- `tests/`: menguji public API dan perilaku UI, bukan assertion substring kode.

Semua inspector membaca snapshot workspace yang sama; tidak ada masing-masing store untuk FI/MM/PS yang dapat berbeda commit. Tidak memakai event-sourcing framework atau backend palsu. Event list hanya jejak pengajaran atas state yang sudah dihitung.

### 2.2 Struktur target dan tanggung jawab

```text
src/
  main.tsx
  App.tsx
  index.css
  vite-env.d.ts
  types/
    sap.ts                       # seluruh kontrak domain/public study engine
    ui.ts                        # route, draft form, selection, study progress
  data/
    curriculum.ts                # enam import literal ?raw, tidak copy isi
    sap-config.ts                # chart/plant/OBYC/AO90/posting keys/tax fixtures
    capex-case.ts                # seed sintetis, 10 steps, commands dan checkpoints
    study-metadata.ts            # source refs, quiz options, metadata enrichment
  lib/
    sap-engine.ts                # public pure transaction API + domain orchestration
    sap-money.ts                 # integer/rational parsing, rounding, formatting helpers
    sap-tables.ts                # domain -> SAP educational row projections/schema
    study-engine.ts              # AST, heading ids, text index, dictionary, quiz retrieval
    study-links.ts               # relative Markdown links -> internal reader routes
  store/
    use-sap-store.ts              # Zustand actions + selectors atas engine
  components/
    layout/
      LabShell.tsx               # header command field + tiga panel/tab responsive
      LeftPanel.tsx
      CenterPanel.tsx
      RightPanel.tsx
    study/
      CurriculumNavigation.tsx
      CurriculumReader.tsx
      MaterialSearch.tsx
      DictionaryBrowser.tsx
      QuizRunner.tsx
      MermaidBlock.tsx
    transactions/
      SapCommandField.tsx
      TransactionWorkspace.tsx
      CapexStepper.tsx
      TransactionForm.tsx        # common field/error shell, bukan rule domain
      ProcurementForm.tsx       # PR, PO, approval, SES
      GoodsMovementForm.tsx
      InvoiceForm.tsx
      BudgetTester.tsx
      SettlementForm.tsx
      DepreciationForm.tsx
      CaseActionForm.tsx         # project/budget/release, DP/clearing/payment/asset
    inspectors/
      JournalInspector.tsx
      WbsBudgetMonitor.tsx
      SapTableInspector.tsx
      TraceInspector.tsx
    shared/
      MoneyValue.tsx
      SourceReference.tsx
      TransactionContext.tsx     # T-Code/Fiori/SPRO/tables dan alasan no-FI
      EmptyState.tsx
      ErrorNotice.tsx
tests/
  unit/
    sap-money.test.ts
    study-engine.test.ts
    sap-engine.obyc.test.ts
    sap-engine.migo.test.ts
    sap-engine.miro.test.ts
    sap-engine.avac.test.ts
    sap-engine.settlement.test.ts
    sap-engine.commands.test.ts
    sap-tables.test.ts
  integration/
    capex-case.test.ts
    sap-store.test.ts
  ui/
    mastery-lab.spec.ts          # Playwright, alur user sebenarnya
```

Target root tooling: `package.json`, satu lockfile Bun yang dihasilkan installer, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, dan `playwright.config.ts`. Jangan menambahkan parallel package manager/lockfile. Gunakan React 18 secara eksplisit; jangan upgrade otomatis ke React 19. Pilihan Tailwind konsisten: Tailwind 4 dengan `@tailwindcss/vite`, bukan mencampur konfigurasi v3/v4. Script target: `dev` = Vite host `127.0.0.1`, `typecheck` = TypeScript noEmit, `build` = typecheck lalu Vite build, `test` = Bun test unit/integration, `test:ui` = Playwright. Versi minor dependency dan lockfile dipilih coder saat setup sesuai paket yang kompatibel, bukan diklaim sudah ada.

Dependency reader yang direkomendasikan: `react-markdown`, `remark-gfm`, `remark-math`, `rehype-katex`, `katex`, `rehype-raw`, `rehype-sanitize`, `unified`, `remark-parse`, `mermaid`; UI/test: Zustand, React 18 types, Vite React plugin, TypeScript, Tailwind, Playwright. Tidak memakai router library hanya untuk beberapa route internal; route adalah state typed. Gunakan parser Markdown yang sama untuk indexing dan rendering agar heading/source refs tidak menyimpang. Import Mermaid secara lazy.

## 3. Kontrak TypeScript: `src/types/sap.ts`

Berikut deklarasi kontrak; ini bukan implementasi. Fields `readonly` berlaku juga untuk koleksi bersarang. Input form string tidak boleh langsung masuk engine sebelum diparse. Jangan menggunakan `any`, nominal SAP ID sebagai `number`, atau object dictionary dengan nilai campuran tidak bertipe.

### 3.1 Primitif, hasil, dan provenance

```ts
export type SapEdition = 'ECC' | 'S4';
export type Domain = 'MM' | 'PS' | 'FI' | 'BASIS';
export type Currency = 'USD' | 'IDR';
export type Minor = bigint;              // USD cents; IDR rupiah
export type Qty = bigint;                // 1 unit dasar = 1000 Qty
export type BasisPoints = number;        // integer; 1100 = 11%
export type ISODate = string;            // YYYY-MM-DD, validated at boundary
export type YearMonth = string;          // YYYY-MM, validated at boundary
export type Id = string;
export type TCode = string;              // uppercase canonical; registry validated
export type WbsId = string;              // external POSID
export type AssetId = string;            // ANLN1-ANLN2 display identifier
export type MaterialId = string;
export type StockId = string;            // deterministic composite key
export type PoItemId = string;           // EBELN/EBELP
export type PrItemId = string;           // BANFN/BNFPO
export interface FxRate { readonly numerator: bigint; readonly denominator: bigint }
export interface UnitPrice { readonly amount: Minor; readonly perQty: Qty }
export interface Money { readonly amount: Minor; readonly currency: Currency }
export interface SourceRef {
  readonly moduleId: CurriculumModuleId;
  readonly headingId: string;
  readonly startLine: number;
  readonly endLine: number;
}
export type ErrorCode =
  | 'INVALID_INPUT' | 'UNKNOWN_REFERENCE' | 'INSUFFICIENT_STOCK'
  | 'M8 534' | 'KI 235' | 'BP604' | 'KD 503'
  | 'STATUS_BLOCKED' | 'PO_NOT_RELEASED' | 'GR_REQUIRED'
  | 'QUANTITY_EXCEEDED' | 'DUPLICATE_DOCUMENT' | 'DUPLICATE_PERIOD'
  | 'ALREADY_SETTLED' | 'UNSUPPORTED_COMMAND' | 'CASE_SEQUENCE';
export interface EngineError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly field?: string;
  readonly wbsId?: WbsId;
  readonly overrun?: Money;
  readonly source?: SourceRef;
}
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: EngineError };
export interface TraceEntry {
  readonly stage: 'VALIDATE' | 'OBYC' | 'PRICE' | 'AVAC' | 'SETTLEMENT' | 'TAX';
  readonly explanation: string;
  readonly values: Readonly<Record<string, string>>; // serializable display facts
  readonly source: SourceRef;
}
```

Konvensi nilai: semua `Minor` balance/delta boleh signed jika field menyebut delta/balance; jumlah transaksi dan line jurnal harus positif. `Qty` transaksi positif; stock balance tidak negatif. `BasisPoints` divalidasi finite integer `0..10000`. `FxRate` positif dan direduksi secara rasional; 1:1 bila mata uang sama. Penjumlahan lintas currency dilarang. Engine mengembalikan `Result`, bukan exception JS untuk BP604; UI menampilkan severity ERROR tanpa kehilangan preview. Bug programmer tetap boleh throw; jangan catch-all menjadi hasil finansial palsu.

### 3.2 Curriculum, dictionary, dan quiz

```ts
export type CurriculumModuleId = '01' | '02' | '03' | '04' | '05' | '06';
export interface CurriculumModule {
  readonly id: CurriculumModuleId;
  readonly order: number;
  readonly title: string;
  readonly fileName: string;
  readonly rawMarkdown: string;
  readonly headings: readonly CurriculumHeading[];
}
export interface CurriculumHeading {
  readonly id: string;
  readonly depth: number;
  readonly text: string;
  readonly startLine: number;
  readonly endLine: number;
}
export interface StudySearchHit {
  readonly id: string;
  readonly source: SourceRef;
  readonly title: string;
  readonly excerpt: string;
  readonly score: number;
}
export interface FioriReference { readonly name: string; readonly appId: string | null }
export interface TCodeEntry {
  readonly code: TCode;
  readonly title: string;
  readonly domains: readonly Domain[];
  readonly kind: 'OPERATIONAL' | 'CONFIGURATION' | 'REPORT' | 'NAVIGATION';
  readonly fiori: readonly FioriReference[];
  readonly sproPaths: readonly string[]; // empty = sumber tidak memberi full path
  readonly tables: readonly SapTableName[];
  readonly relatedCodes: readonly TCode[];
  readonly simulation: 'EXECUTABLE' | 'READ_ONLY';
  readonly sources: readonly SourceRef[];
}
export interface SproEntry {
  readonly id: string;
  readonly area: string;
  readonly shortcutCodes: readonly TCode[];
  readonly fullPath: string | null;
  readonly description: string;
  readonly sources: readonly SourceRef[];
}
export interface TableDictionaryEntry {
  readonly table: string; // boleh tabel sumber di luar proyeksi runtime
  readonly title: string;
  readonly keyFields: readonly string[];
  readonly relatedTables: readonly string[];
  readonly edition: 'ECC' | 'S4' | 'BOTH';
  readonly sources: readonly SourceRef[];
}
export interface QuizQuestion {
  readonly id: string;                    // case-01 .. case-05
  readonly promptSource: SourceRef;       // stem diambil dari Markdown AST
  readonly options: readonly { readonly id: string; readonly text: string }[];
  readonly correctOptionId: string;
  readonly explanationSource: SourceRef;  // isi details sumber, bukan duplikasi
  readonly relatedCodes: readonly TCode[];
}
export interface QuizAttempt {
  readonly questionId: string;
  readonly selectedOptionId: string;
  readonly correct: boolean;
}
```

Dictionary membedakan `SapTableName` runtime dan tabel lain yang hanya ada di materi. Entri tanpa Fiori ID tetap mempunyai nama bila sumber menyediakan; ketiadaan jalur IMG lengkap tampil `Jalur lengkap tidak dicantumkan dalam sumber`, bukan URL/path karangan. Transaksi executable mendapat metadata dari registry, bukan string yang diduplikasi pada masing-masing form.

### 3.3 Konfigurasi OBYC, material, dan account assignment

```ts
export type PriceControl = 'V' | 'S';
export type ObycKey = 'BSX' | 'WRX' | 'GBB' | 'PRD' | 'KDM';
export type GbbModifier = 'VBR' | 'VNG' | 'INV' | 'BSA';
export type ObycQuery = {
  readonly chartOfAccounts: string;
  readonly valuationGroupingCode: string;
  readonly valuationClass: string;
  readonly side: 'DEBIT' | 'CREDIT';
  readonly stockKind: 'GENERAL' | 'PROJECT_Q' | 'SERVICE';
} & (
  | { readonly key: 'GBB'; readonly modifier: GbbModifier }
  | { readonly key: Exclude<ObycKey, 'GBB'>; readonly modifier: null }
);
export interface ObycRule {
  readonly id: string;
  readonly chartOfAccounts: string;
  readonly valuationGroupingCode: string | null;
  readonly valuationClass: string | null;
  readonly stockKind: 'GENERAL' | 'PROJECT_Q' | 'SERVICE' | null;
  readonly key: ObycKey;
  readonly modifier: GbbModifier | null;
  readonly debitAccount: string;
  readonly creditAccount: string;
  readonly source: SourceRef;
}
export interface ResolvedAccount {
  readonly ruleId: string;
  readonly account: string;
  readonly query: ObycQuery;
}
export type AccountAssignment =
  | { readonly category: 'STOCK' }
  | { readonly category: 'K'; readonly costCenter: string; readonly expenseAccount: string }
  | { readonly category: 'P'; readonly wbsId: WbsId; readonly expenseAccount: string }
  | { readonly category: 'Q'; readonly wbsId: WbsId }
  | { readonly category: 'A'; readonly assetId: AssetId }
  | { readonly category: 'N'; readonly networkId: string; readonly activityId: string;
      readonly wbsId: WbsId; readonly expenseAccount: string };
export interface MaterialMaster {
  readonly id: MaterialId;
  readonly description: string;
  readonly baseUom: string;
  readonly valuationClass: string;
  readonly priceControl: PriceControl;
  readonly standardPrice: UnitPrice;
}
export interface StockBucket {
  readonly id: StockId;
  readonly materialId: MaterialId;
  readonly plant: string;
  readonly storageLocation: string;
  readonly specialStock: 'NONE' | 'Q';
  readonly ownerWbsId: WbsId | null;
  readonly unrestrictedQty: Qty;
  readonly blocked103Qty: Qty;       // non-valuated GR blocked, tidak masuk MAP
  readonly value: Minor;
}
export interface ValuationPool {
  readonly id: string;               // material + valuation area + Q owner bila relevan
  readonly materialId: MaterialId;
  readonly plant: string;
  readonly ownerWbsId: WbsId | null;
  readonly quantity: Qty;            // total valuated buckets pool
  readonly value: Minor;
}
export interface PlantConfig {
  readonly plant: string;
  readonly companyCode: string;
  readonly currency: Currency;
  readonly chartOfAccounts: string;
  readonly valuationGroupingCode: string;
}
export interface AssetAccounts {
  readonly assetClass: '8000' | '2000' | '3000';
  readonly acquisitionAccount: string;
  readonly accumulatedDepreciationAccount: string | null;
  readonly depreciationExpenseAccount: string | null;
}
export interface SapConfiguration {
  readonly plants: readonly PlantConfig[];
  readonly obycRules: readonly ObycRule[];
  readonly assetAccounts: readonly AssetAccounts[];
  readonly fxPolicy: 'separate-KDM';
  readonly postingKeyProfile: 'curriculum-logistics';
  readonly invoicePriceToleranceBps: BasisPoints;
  readonly warningThresholdBps: 8000;
  readonly errorThresholdBps: 10000;
}
```

`stockKind` membedakan akun general BSX `114010` dari Q `114015` tanpa mengaku bahwa field khusus ini adalah kolom fisik T030; ia dimensi konfigurasi **lab** untuk memodelkan valuation stock proyek. UI menunjukkan query beserta label dimensi lab. Service tidak memerlukan material palsu; query WRX SERVICE memiliki valuation class kategori jasa yang ditentukan fixture, bukan membaca MBEW material fiktif.

Valuation berada pada pool plant (serta Q owner untuk segregasi proyek); bukan harga MAP independen per SLoc. `311` wajib mempertahankan pool value dan MAP. Setiap bucket memiliki value alokasi; ketika update MAP, alokasikan ulang value bucket berdasarkan kuantitas, residual ke bucket terakhir dalam urutan ID, sehingga sum bucket = pool. GI memakai pool price, bukan harga historis bucket.

### 3.4 Journal, procurement, dan input MIGO/MIRO

```ts
export type PostingKey = '25' | '26' | '29' | '31' | '39' | '40' | '50'
  | '70' | '75' | '86' | '89' | '96' | '99';
export type DocumentType = 'WE' | 'WA' | 'RE' | 'SA' | 'KZ' | 'ZP' | 'AA' | 'AF';
export type AccountOrigin =
  | { readonly kind: 'OBYC'; readonly key: ObycKey;
      readonly modifier: GbbModifier | null; readonly ruleId: string }
  | { readonly kind: 'ACCOUNT_ASSIGNMENT' | 'VENDOR_MASTER' | 'AO90'
      | 'TAX_CONFIG' | 'BANK_CONFIG' | 'SETTLEMENT_CONFIG'; readonly reference: string };
export interface JournalLine {
  readonly id: string;
  readonly side: 'DEBIT' | 'CREDIT';
  readonly postingKey: PostingKey;
  readonly specialGl: 'A' | null;
  readonly accountType: 'S' | 'K' | 'A' | 'M';
  readonly glAccount: string;
  readonly amount: Minor;              // local currency, strictly > 0
  readonly wbsId: WbsId | null;
  readonly assetId: AssetId | null;
  readonly vendorId: string | null;
  readonly materialId: MaterialId | null;
  readonly costCenter: string | null;
  readonly origin: AccountOrigin;
  readonly text: string;
}
export interface FiDocument {
  readonly id: string;
  readonly companyCode: string;
  readonly fiscalYear: number;
  readonly documentNumber: string;
  readonly type: DocumentType;
  readonly tcode: TCode;
  readonly postingDate: ISODate;
  readonly currency: Currency;
  readonly reference: string;
  readonly lines: readonly JournalLine[];
}
export interface PostingContext {
  readonly commandId: string;
  readonly postingDate: ISODate;
  readonly companyCode: string;
}
export interface PrItem {
  readonly id: PrItemId;
  readonly assignment: AccountAssignment;
  readonly kind: 'MATERIAL' | 'SERVICE';
  readonly quantity: Qty;
  readonly remainingQty: Qty;
  readonly estimatedUnitPrice: UnitPrice;
  readonly currency: Currency;
}
export interface PoItem {
  readonly id: PoItemId;
  readonly vendorId: string;
  readonly assignment: AccountAssignment;
  readonly kind: 'MATERIAL' | 'SERVICE';
  readonly materialId: MaterialId | null;
  readonly quantity: Qty;
  readonly netUnitPrice: UnitPrice;
  readonly currency: Currency;
  readonly commitmentFx: FxRate;
  readonly released: boolean;
  readonly deliveryCompleted: boolean;
  readonly finalInvoice: boolean;
  readonly grBasedIv: boolean;
  readonly referencedPrId: PrItemId | null;
}
export interface ReceiptLot {
  readonly id: string;
  readonly poItemId: PoItemId;
  readonly materialDocumentId: string;
  readonly quantity: Qty;
  readonly invoiceOpenQty: Qty;
  readonly giOpenQty: Qty;               // Q receipt allocation tracking
  readonly poNetDocumentAmount: Minor;
  readonly grLocalAmount: Minor;        // valeur WRX historique
  readonly grFx: FxRate;
  readonly heldQAllocation: Minor;
}
export type IssueMovement = '201' | '221' | '281' | '551';
export type MigoInput = PostingContext & (
  | { readonly kind: 'RECEIPT'; readonly movement: '101' | '103' | '105';
      readonly poItemId: PoItemId; readonly quantity: Qty;
      readonly plant: string; readonly storageLocation: string;
      readonly grFx: FxRate; readonly blockedReceiptId: string | null }
  | { readonly kind: 'ISSUE'; readonly movement: IssueMovement;
      readonly stockId: StockId; readonly quantity: Qty;
      readonly receiver: AccountAssignment | null }
  | { readonly kind: 'TRANSFER'; readonly movement: '301' | '311';
      readonly stockId: StockId; readonly quantity: Qty;
      readonly targetPlant: string; readonly targetStorageLocation: string }
  | { readonly kind: 'INITIAL'; readonly movement: '561';
      readonly stockId: StockId; readonly quantity: Qty; readonly entryValue: Minor }
  | { readonly kind: 'INVENTORY_DIFFERENCE'; readonly movement: '701' | '702';
      readonly stockId: StockId; readonly quantity: Qty; readonly gainValue: Minor | null }
);
export interface TaxInput {
  readonly code: 'V0' | 'V1' | 'V2';
  readonly rateBps: BasisPoints;
  readonly deductible: boolean;
  readonly withholdingBps: BasisPoints;
}
export interface MiroInput extends PostingContext {
  readonly poItemId: PoItemId;
  readonly receiptLotIds: readonly string[];
  readonly invoiceQuantity: Qty;
  readonly invoiceNet: Minor;           // document currency, tax-exclusive
  readonly invoiceCurrency: Currency;
  readonly invoiceFx: FxRate;
  readonly invoiceReference: string;
  readonly tax: TaxInput;
}
export interface MigoOutput {
  readonly state: SapSimulationState;
  readonly documents: readonly FiDocument[];
  readonly materialDocumentIds: readonly string[];
  readonly noFiReason: string | null;
  readonly budget: readonly AvacResult[];
  readonly trace: readonly TraceEntry[];
}
export interface MiroOutput {
  readonly state: SapSimulationState;
  readonly documents: readonly FiDocument[];
  readonly invoiceId: string;
  readonly paymentBlock: 'R' | null;
  readonly priceDifference: Minor;
  readonly exchangeDifference: Minor;
  readonly capitalizedVariance: Minor;
  readonly expensedVariance: Minor;
  readonly budget: readonly AvacResult[];
  readonly trace: readonly TraceEntry[];
}
```

Untuk `221 Q` tidak membuat movement string terpisah: `movement='221'` dan stock bucket `specialStock='Q'`. UI menampilkannya `221 Q`. Input `281` wajib assignment N, `221` wajib P (atau N jika pemetaan WBS eksplisit); `201` wajib K; `551` receiver null. Issue Q harus owner WBS sama dengan receiver; tidak memindahkan biaya proyek lain. Transfer Q lintas plant tidak termasuk subset calculator; tolak sebagai unsupported input, bukan mengubah owner. `103/105` mereferensikan PO dan blocked receipt lot; `105` tidak boleh berdiri sendiri.

### 3.5 WBS, AVAC, settlement, dan asset

```ts
export type WbsStatus = 'CRTD' | 'REL' | 'TECO' | 'CLSD';
export interface WbsBudgetState {
  readonly wbsId: WbsId;
  readonly internalPspnr: string;
  readonly objectNumber: string;
  readonly projectId: string;
  readonly status: WbsStatus;
  readonly accountAssignmentEnabled: boolean;
  readonly currency: Currency;
  readonly originalBudget: Minor;
  readonly releasedBudget: Minor;
  readonly avacActive: boolean;
  readonly prCommitment: Minor;
  readonly openPoCommitment: Minor;
  readonly heldQAllocation: Minor;       // explicit lab reserve, not COOI
  readonly actualCost: Minor;            // cumulative budget-relevant consumption
  readonly settledToAuc: Minor;          // separate from actual, never subtract from AVAC
  readonly aucAssetId: AssetId | null;
}
export interface BudgetDelta {
  readonly wbsId: WbsId;
  readonly prCommitment: Minor;
  readonly openPoCommitment: Minor;
  readonly heldQAllocation: Minor;
  readonly actualCost: Minor;
}
export interface AvacResult {
  readonly wbsId: WbsId;
  readonly poCommitment: Minor;          // openPoCommitment + heldQAllocation
  readonly assignedValue: Minor;
  readonly availableBudget: Minor;
  readonly utilizationBps: number | null; // null: budget zero + assigned positive
  readonly status: 'OK' | 'WARNING' | 'ERROR';
  readonly messageCode: 'BP604' | null;
  readonly overrun: Minor;
}
export interface SettlementRule {
  readonly id: string;
  readonly senderWbsId: WbsId;
  readonly type: 'PER' | 'FUL';
  readonly receiverAssetId: AssetId;
  readonly shareBps: BasisPoints;
}
export interface AssetState {
  readonly id: AssetId;
  readonly companyCode: string;
  readonly assetClass: '8000' | '2000' | '3000';
  readonly description: string;
  readonly acquisitionValue: Minor;
  readonly accumulatedDepreciation: Minor;
  readonly residualValue: Minor;
  readonly usefulLifeMonths: number;    // 0 for AuC, >0 for final assets
  readonly capitalizationDate: ISODate | null;
  readonly depreciationStartPeriod: YearMonth | null;
  readonly depreciationCostCenter: string | null;
  readonly depreciationKey: '0000' | 'LINR';
  readonly postedDepreciationPeriods: readonly YearMonth[];
}
export interface SettlementInput extends PostingContext {
  readonly projectId: string;
  readonly wbsIds: readonly WbsId[];
  readonly period: YearMonth;
  readonly type: 'PER' | 'FUL';
  readonly rules: readonly SettlementRule[];
}
export interface SettlementOutput {
  readonly state: SapSimulationState;
  readonly documents: readonly FiDocument[];
  readonly transferred: readonly { readonly from: string; readonly to: AssetId;
    readonly amount: Minor }[];
  readonly trace: readonly TraceEntry[];
}
export interface DepreciationInput extends PostingContext {
  readonly assetIds: readonly AssetId[];
  readonly period: YearMonth;
}
export interface DepreciationOutput {
  readonly state: SapSimulationState;
  readonly documents: readonly FiDocument[];
  readonly amounts: readonly { readonly assetId: AssetId; readonly amount: Minor }[];
  readonly trace: readonly TraceEntry[];
}
```

WBS status dan flags `BUDG/AVAC/AUC` berbeda konsep: status enum lifecycle disimpan satu, flags diturunkan dari budget/avac/asset fields. Tidak menambah enum gabungan `REL BUDG AVAC AUC`.

### 3.6 State domain, command, event, dan CAPEX

```ts
export interface ProjectState {
  readonly id: string;
  readonly internalPspnr: string;
  readonly companyCode: string;
  readonly controllingArea: string;
  readonly plant: string;
  readonly profile: string;
  readonly description: string;
}
export interface VendorState {
  readonly id: string;
  readonly name: string;
  readonly reconciliationAccount: string;
  readonly downPaymentAccount: string;
}
export interface SupplierInvoice {
  readonly id: string;
  readonly poItemId: PoItemId;
  readonly vendorId: string;
  readonly reference: string;
  readonly documentCurrency: Currency;
  readonly localGrossPayable: Minor;
  readonly openPayable: Minor;
  readonly paymentBlock: 'R' | null;
  readonly fiDocumentId: string;
}
export interface DownPayment {
  readonly id: string;
  readonly poItemId: PoItemId;
  readonly vendorId: string;
  readonly paid: Minor;
  readonly cleared: Minor;
}
export interface MaterialMovement {
  readonly id: string;
  readonly postingDate: ISODate;
  readonly movement: MigoInput['movement'];
  readonly materialId: MaterialId | null;
  readonly stockId: StockId | null;
  readonly targetStockId: StockId | null;
  readonly quantity: Qty;
  readonly value: Minor;
  readonly poItemId: PoItemId | null;
  readonly wbsId: WbsId | null;
  readonly specialStock: 'NONE' | 'Q';
  readonly serviceEntryId: string | null;
}
export interface ServiceEntry {
  readonly id: string;
  readonly poItemId: PoItemId;
  readonly quantity: Qty;
  readonly accepted: boolean;
  readonly receiptLotId: string | null;
}
export interface PoHistoryEvent {
  readonly id: string;
  readonly poItemId: PoItemId;
  readonly kind: 'GR' | 'IR' | 'DP' | 'DP_CLEAR' | 'PAYMENT';
  readonly referenceId: string;
  readonly quantity: Qty;
  readonly localAmount: Minor;
}
export interface LabEvent {
  readonly id: string;
  readonly commandId: string;
  readonly tcode: TCode;
  readonly description: string;
  readonly documentIds: readonly string[];
  readonly changedEntities: readonly string[];
}
export interface SapSimulationState {
  readonly id: string;
  readonly currency: Currency;
  readonly nextSequence: number;
  readonly processedCommandIds: readonly string[];
  readonly projects: Readonly<Record<string, ProjectState>>;
  readonly wbs: Readonly<Record<WbsId, WbsBudgetState>>;
  readonly materials: Readonly<Record<MaterialId, MaterialMaster>>;
  readonly stocks: Readonly<Record<StockId, StockBucket>>;
  readonly valuations: Readonly<Record<string, ValuationPool>>;
  readonly vendors: Readonly<Record<string, VendorState>>;
  readonly prItems: Readonly<Record<PrItemId, PrItem>>;
  readonly poItems: Readonly<Record<PoItemId, PoItem>>;
  readonly receipts: Readonly<Record<string, ReceiptLot>>;
  readonly serviceEntries: Readonly<Record<string, ServiceEntry>>;
  readonly invoices: Readonly<Record<string, SupplierInvoice>>;
  readonly downPayments: Readonly<Record<string, DownPayment>>;
  readonly assets: Readonly<Record<AssetId, AssetState>>;
  readonly settlementRules: readonly SettlementRule[];
  readonly documents: readonly FiDocument[];
  readonly movements: readonly MaterialMovement[];
  readonly poHistory: readonly PoHistoryEvent[];
  readonly events: readonly LabEvent[];
}
export interface WbsDefinition {
  readonly id: WbsId; readonly internalPspnr: string; readonly objectNumber: string;
  readonly description: string; readonly accountAssignmentEnabled: boolean;
}
export type SapCommand =
  | { readonly kind: 'CREATE_PROJECT'; readonly context: PostingContext;
      readonly project: ProjectState; readonly wbs: readonly WbsDefinition[] }
  | { readonly kind: 'SET_BUDGET'; readonly context: PostingContext;
      readonly entries: readonly { readonly wbsId: WbsId;
        readonly original: Minor; readonly released: Minor }[] }
  | { readonly kind: 'SET_WBS_STATUS'; readonly context: PostingContext;
      readonly wbsIds: readonly WbsId[]; readonly status: WbsStatus }
  | { readonly kind: 'CREATE_PR'; readonly context: PostingContext; readonly item: PrItem }
  | { readonly kind: 'CREATE_PO'; readonly context: PostingContext; readonly item: PoItem;
      readonly convertPrQuantity: Qty | null }
  | { readonly kind: 'RELEASE_PO'; readonly context: PostingContext; readonly poItemId: PoItemId }
  | { readonly kind: 'COMPLETE_PO'; readonly context: PostingContext; readonly poItemId: PoItemId;
      readonly deliveryCompleted: boolean; readonly finalInvoice: boolean }
  | { readonly kind: 'MIGO'; readonly input: MigoInput }
  | { readonly kind: 'ACCEPT_SES'; readonly context: PostingContext; readonly poItemId: PoItemId;
      readonly quantity: Qty }
  | { readonly kind: 'MIRO'; readonly input: MiroInput }
  | { readonly kind: 'REQUEST_DP'; readonly context: PostingContext; readonly poItemId: PoItemId;
      readonly amount: Minor }
  | { readonly kind: 'PAY_DP'; readonly context: PostingContext; readonly poItemId: PoItemId;
      readonly amount: Minor; readonly bankAccount: string }
  | { readonly kind: 'CLEAR_DP'; readonly context: PostingContext; readonly downPaymentId: string;
      readonly invoiceId: string; readonly amount: Minor }
  | { readonly kind: 'PAY_INVOICES'; readonly context: PostingContext;
      readonly invoiceIds: readonly string[]; readonly bankAccount: string }
  | { readonly kind: 'CREATE_ASSET'; readonly context: PostingContext; readonly asset: AssetState }
  | { readonly kind: 'SETTLE'; readonly input: SettlementInput }
  | { readonly kind: 'DEPRECIATE'; readonly input: DepreciationInput };
export interface TransactionOutput {
  readonly state: SapSimulationState;
  readonly documents: readonly FiDocument[];
  readonly events: readonly LabEvent[];
  readonly budget: readonly AvacResult[];
  readonly trace: readonly TraceEntry[];
  readonly affectedTables: readonly SapTableName[];
  readonly noFiReason: string | null;
}
export type CapexStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export interface CapexAction {
  readonly id: string; readonly title: string; readonly tcode: TCode;
  readonly command: SapCommand; readonly source: SourceRef;
}
export interface CapexCheckpoint {
  readonly afterActionId: string;
  readonly released: Minor; readonly assigned: Minor; readonly actual: Minor;
  readonly available: Minor; readonly aucValue: Minor; readonly fixedAssetValue: Minor;
}
export interface CapexStep {
  readonly id: CapexStepId; readonly title: string;
  readonly prerequisites: readonly CapexStepId[];
  readonly actions: readonly CapexAction[];
  readonly checkpoints: readonly CapexCheckpoint[];
  readonly source: SourceRef;
}
export interface CapexCaseStudy {
  readonly id: 'capex-100k'; readonly currency: 'USD';
  readonly budget: Minor; readonly expectedActual: Minor;
  readonly seed: SapSimulationState;
  readonly steps: readonly CapexStep[]; // registry validate exactly IDs 1..10 once
}
export interface CapexProgress {
  readonly completedActionIds: readonly string[];
  readonly completedStepIds: readonly CapexStepId[];
  readonly nextActionId: string | null;
  readonly selectedStepId: CapexStepId;
}
```

Draft PR `remainingQty` harus sama dengan quantity saat create; PO receipt/invoice totals diturunkan dari receipts/invoices, tidak diinput pengguna sebagai trusted state. AuC saat REL dibuat oleh engine dengan IDs deterministik fixture mapping dan PER rule 100%, bukan caller yang menyisipkan aset/jurnal. `REQUEST_DP` menghasilkan noted event, belum `DownPayment.paid`, belum jurnal; `PAY_DP` yang membuat saldo DP. Semua record/ID reject duplikat. Sequence dokumen bukan input user kecuali ID bisnis fixture (PO, aset) yang memang diajarkan.

### 3.7 Command parser

```ts
export type SapNavigationCommand =
  | { readonly kind: 'OPEN_TRANSACTION'; readonly tcode: TCode; readonly newSession: boolean }
  | { readonly kind: 'HOME' }
  | { readonly kind: 'LOGOFF'; readonly confirm: boolean };
export interface ParsedTCodeCommand {
  readonly command: SapNavigationCommand;
  readonly executable: boolean;
  readonly source: SourceRef;
}
```

Parser hanya menghasilkan intent navigasi. Tidak pernah menjalankan JavaScript/shell, posting transaksi, membuka URL, atau melakukan jaringan.

### 3.8 SAP database row contracts

Kolom SAP uppercase; identifier string mempertahankan leading zero. Field `__lab` hanya metadata, bukan kolom DDIC. `PSPNR/PS_PSP_PNR` internal berbeda dari POSID external. Primary key riil yang kompleks disederhanakan secara eksplisit; kunci tabel di bawah adalah kunci proyeksi lab, bukan pernyataan semua key DDIC.

```ts
export interface RowMeta { readonly sourceEventId: string | null; readonly opening: boolean }
export interface BkpfRow { readonly BUKRS: string; readonly BELNR: string; readonly GJAHR: number;
  readonly BLART: DocumentType; readonly BUDAT: ISODate; readonly WAERS: Currency;
  readonly TCODE: TCode; readonly XBLNR: string; readonly __lab: RowMeta }
export interface AcdocaRow { readonly RLDNR: '0L'; readonly RBUKRS: string;
  readonly BELNR: string; readonly GJAHR: number; readonly DOCLN: string;
  readonly RACCT: string; readonly DRCRK: 'S' | 'H'; readonly HSL: Minor;
  readonly RHCUR: Currency; readonly PS_POSID: string | null;
  readonly ANLN1: string | null; readonly ANLN2: string | null;
  readonly LIFNR: string | null;
  readonly __lab: RowMeta & { readonly postingKey: PostingKey; readonly origin: AccountOrigin } }
export interface BsegRow { readonly BUKRS: string; readonly BELNR: string; readonly GJAHR: number;
  readonly BUZEI: string; readonly BSCHL: PostingKey; readonly KOART: JournalLine['accountType'];
  readonly HKONT: string; readonly SHKZG: 'S' | 'H'; readonly DMBTR: Minor;
  readonly LIFNR: string | null; readonly UMSKZ: 'A' | null;
  readonly PROJK: string | null; readonly ANLN1: string | null;
  readonly ANLN2: string | null; readonly __lab: RowMeta }
export interface MatdocRow { readonly MBLNR: string; readonly MJAHR: number; readonly ZEILE: string;
  readonly BUDAT: ISODate; readonly BWART: MigoInput['movement']; readonly MATNR: string | null;
  readonly WERKS: string; readonly LGORT: string; readonly SOBKZ: 'Q' | '';
  readonly MENGE: Qty; readonly SHKZG: 'S' | 'H'; readonly DMBTR: Minor;
  readonly EBELN: string | null; readonly EBELP: string | null;
  readonly PS_PSP_PNR: string | null; readonly __lab: RowMeta }
export interface MkpfRow { readonly MBLNR: string; readonly MJAHR: number;
  readonly BUDAT: ISODate; readonly __lab: RowMeta }
export type MsegRow = Omit<MatdocRow, 'BUDAT'>;
export interface EkkoRow { readonly EBELN: string; readonly BUKRS: string; readonly LIFNR: string;
  readonly WAERS: Currency; readonly EKORG: string; readonly __lab: RowMeta }
export interface EkpoRow { readonly EBELN: string; readonly EBELP: string; readonly MATNR: string | null;
  readonly PSTYP: '0' | '9'; readonly KNTTP: '' | 'K' | 'P' | 'Q' | 'A' | 'N';
  readonly MENGE: Qty; readonly NETWR: Minor; readonly ELIKZ: boolean;
  readonly EREKZ: boolean; readonly __lab: RowMeta }
export interface EkknRow { readonly EBELN: string; readonly EBELP: string; readonly ZEKKN: '01';
  readonly PS_PSP_PNR: string | null; readonly SAKTO: string | null;
  readonly ANLN1: string | null; readonly ANLN2: string | null; readonly __lab: RowMeta }
export interface ProjRow { readonly PSPNR: string; readonly PSPID: string; readonly POST1: string;
  readonly VBUKR: string; readonly __lab: RowMeta }
export interface PrpsRow { readonly PSPNR: string; readonly POSID: string; readonly PSPHI: string;
  readonly OBJNR: string; readonly BELKZ: boolean;
  readonly __lab: RowMeta & { readonly lifecycleStatus: WbsStatus } }
export interface BudgetRow { readonly OBJNR: string; readonly WRTTP: '41'; readonly VERSN: '000';
  readonly WTGES: Minor; readonly __lab: RowMeta & { readonly releasedBudget: Minor } }
export interface BpjaRow extends BudgetRow { readonly GJAHR: number; readonly WTJHR: Minor }
export interface CooiRow { readonly OBJNR: string; readonly GJAHR: number;
  readonly WRTTP: '21' | '22'; readonly REFBN: string; readonly RFPOS: string;
  readonly WTGBTR: Minor; readonly __lab: RowMeta }
export interface AnlaRow { readonly BUKRS: string; readonly ANLN1: string; readonly ANLN2: string;
  readonly ANLKL: AssetState['assetClass']; readonly TXT50: string; readonly AKTIV: ISODate | null;
  readonly __lab: RowMeta }
export interface AnlbRow { readonly BUKRS: string; readonly ANLN1: string; readonly ANLN2: string;
  readonly AFABE: '01'; readonly AFASL: '0000' | 'LINR'; readonly NDJAR: number;
  readonly NDPER: number; readonly __lab: RowMeta }
export interface AnlcRow { readonly BUKRS: string; readonly ANLN1: string; readonly ANLN2: string;
  readonly GJAHR: number; readonly AFABE: '01'; readonly KANSW: Minor;
  readonly KNAFA: Minor; readonly __lab: RowMeta }
export interface EbanRow { readonly BANFN: string; readonly BNFPO: string; readonly MENGE: Qty;
  readonly PREIS: Minor; readonly __lab: RowMeta & { readonly pricePerQty: Qty } }
export interface EbknRow { readonly BANFN: string; readonly BNFPO: string;
  readonly ZEBKN: '01'; readonly PS_PSP_PNR: string | null; readonly __lab: RowMeta }
export interface EkbeRow { readonly EBELN: string; readonly EBELP: string; readonly BELNR: string;
  readonly GJAHR: number; readonly MENGE: Qty; readonly DMBTR: Minor;
  readonly __lab: RowMeta & { readonly historyKind: PoHistoryEvent['kind'] } }
export interface RbkpRow { readonly BELNR: string; readonly GJAHR: number; readonly BUKRS: string;
  readonly LIFNR: string; readonly XBLNR: string; readonly WAERS: Currency;
  readonly __lab: RowMeta & { readonly paymentBlock: 'R' | null } }
export interface RsegRow { readonly BELNR: string; readonly GJAHR: number; readonly BUZEI: string;
  readonly EBELN: string; readonly EBELP: string; readonly MENGE: Qty; readonly __lab: RowMeta }
export interface StockRow { readonly MATNR: string; readonly WERKS: string; readonly LGORT: string;
  readonly LABST: Qty; readonly __lab: RowMeta }
export interface MsprRow { readonly MATNR: string; readonly WERKS: string; readonly LGORT: string;
  readonly PSPNR: string; readonly PRLAB: Qty; readonly __lab: RowMeta }
export interface ValuationRow { readonly MATNR: string; readonly BWKEY: string; readonly BKLAS: string;
  readonly VPRSV: PriceControl; readonly LBKUM: Qty; readonly SALK3: Minor;
  readonly STPRS: Minor;
  readonly __lab: RowMeta & { readonly standardPricePerQty: Qty;
    readonly mapNumerator: Minor; readonly mapDenominator: Qty; readonly ownerWbsId: WbsId | null } }
export interface EssrRow { readonly LBLNI: string; readonly EBELN: string; readonly EBELP: string;
  readonly KZABN: boolean; readonly __lab: RowMeta }
export interface EslhRow { readonly PACKNO: string; readonly __lab: RowMeta }
export interface EsllRow { readonly PACKNO: string; readonly INTROW: string; readonly MENGE: Qty;
  readonly __lab: RowMeta & { readonly netValue: Minor } }
export interface CobrbRow { readonly OBJNR: string; readonly LFDNR: string; readonly PERBZ: 'PER' | 'FUL';
  readonly ANLN1: string; readonly ANLN2: string; readonly PROZS: BasisPoints; readonly __lab: RowMeta }
export interface SapTableRows {
  readonly BKPF: readonly BkpfRow[];
  readonly ACDOCA: readonly AcdocaRow[];
  readonly BSEG: readonly BsegRow[];
  readonly MATDOC: readonly MatdocRow[];
  readonly MKPF: readonly MkpfRow[];
  readonly MSEG: readonly MsegRow[];
  readonly EKKO: readonly EkkoRow[];
  readonly EKPO: readonly EkpoRow[];
  readonly EKKN: readonly EkknRow[];
  readonly PROJ: readonly ProjRow[];
  readonly PRPS: readonly PrpsRow[];
  readonly BPGE: readonly BudgetRow[];
  readonly BPJA: readonly BpjaRow[];
  readonly COOI: readonly CooiRow[];
  readonly ANLA: readonly AnlaRow[];
  readonly ANLB: readonly AnlbRow[];
  readonly ANLC: readonly AnlcRow[];
  readonly EBAN: readonly EbanRow[];
  readonly EBKN: readonly EbknRow[];
  readonly EKBE: readonly EkbeRow[];
  readonly RBKP: readonly RbkpRow[];
  readonly RSEG: readonly RsegRow[];
  readonly MARD: readonly StockRow[];
  readonly MSPR: readonly MsprRow[];
  readonly MBEW: readonly ValuationRow[];
  readonly ESSR: readonly EssrRow[];
  readonly ESLH: readonly EslhRow[];
  readonly ESLL: readonly EsllRow[];
  readonly COBRB: readonly CobrbRow[];
}
export type SapTableName = keyof SapTableRows;
export interface SapTableSchema<K extends SapTableName> {
  readonly name: K;
  readonly primaryKey: readonly (keyof SapTableRows[K][number] & string)[];
  readonly edition: 'ECC' | 'S4' | 'BOTH';
  readonly description: string;
  readonly source: SourceRef;
}
```

Proyeksi tambahan:

- `ACDOCA.HSL` signed (debit positif, credit negatif), `BSEG.DMBTR` positif + SHKZG. BSCHL bukan kolom ACDOCA yang dikarang; ditampilkan lewat `__lab.postingKey` dan BSEG join.
- `MATDOC` transfer menghasilkan dua baris sumber/tujuan dengan SHKZG berlawanan; `311` nilai mutasi FI nol tetapi kuantitas dua arah. `103` DMBTR nol. SES accepted mencatat automatic GR dengan MATNR null dan `__lab` penjelasan jasa; tidak menambah stock material fisik.
- BPGE `WTGES` original budget; released ditandai `__lab`, bukan mengarang field SAP. BPJA current fiscal year adalah proyeksi keseluruhan kasus satu tahun; annual budgeting lintas tahun bukan cakupan simulator.
- COOI hanya open PR/PO, WRTTP lab mapping `21=PR`, `22=PO`; nilai nol tidak dianggap open row. Reserve Q ditampilkan di monitor, bukan disisipkan sebagai WRTTP palsu.
- `PSTYP` internal `0=standard`, `9=service D`; UI menampilkan external D. Tidak menyimpan huruf D seolah internal PSTYP numeric.
- ANLA master tidak menyimpan saldo APC/penyusutan: saldo ada di ANLC dan jurnal. ANLB memuat key/masa manfaat.
- MBEW MAP ditampilkan sebagai rasio pada metadata lab agar tidak memalsukan presisi field VERPR. Value Q diberi penanda proyeksi terpisah; bukan klaim MBEW fisik menampung seluruh special-stock valuation SAP.
- Key registry minimal: BKPF `BUKRS/BELNR/GJAHR`; ACDOCA `RLDNR/RBUKRS/GJAHR/BELNR/DOCLN`; BSEG `BUKRS/BELNR/GJAHR/BUZEI`; MATDOC/MSEG `MBLNR/MJAHR/ZEILE`; EKKO `EBELN`; EKPO `EBELN/EBELP`; EKKN tambah ZEKKN; PRPS `PSPNR`; BPGE `OBJNR/WRTTP/VERSN`; BPJA tambah GJAHR; COOI `OBJNR/WRTTP/REFBN/RFPOS`; ANLA `BUKRS/ANLN1/ANLN2`; ANLB tambah AFABE; ANLC tambah GJAHR/AFABE. Tabel lain memakai identifier komposit yang tampak pada kontraknya; schema registry harus menetapkan key eksplisit sebelum rendering.

## 4. Sumber kurikulum, pencarian, dictionary, dan kuis

### 4.1 Raw import dan reader

`src/data/curriculum.ts` memuat enam import literal seperti `../../docs/curriculum/01-enterprise-structure-and-master-data.md?raw`, satu untuk setiap nama file sumber yang tercantum pada §1.1. Metadata urutan/judul boleh eksplisit; body hanya `rawMarkdown` hasil import. Tidak fetch remote, tidak copy-paste Markdown ke array string/JSON, tidak hanya mengambil ringkasan/heading, tidak mengganti `<details>` dengan placeholder. Vite HMR memperbarui data/parser saat file Markdown berubah.

Reader mendukung GFM tables, fenced code, inline code, lists, blockquotes, LaTeX inline/display, Mermaid, native details/summary dan heading anchors. Pipeline HTML: raw parse -> sanitize dengan allowlist `details/summary` serta elemen atribut aman -> KaTeX render melalui trusted plugin; konten sumber tidak boleh memasukkan script/event handlers/iframe. Jangan mengaktifkan arbitrary raw HTML lewat `dangerouslySetInnerHTML`. Mermaid dirender di komponen terisolasi dengan securityLevel strict, HTML labels/non-safe links dimatikan, hasil SVG disanitasi, ID deterministik dari module/heading/block index; error diagram menampilkan **kode sumber aslinya + pesan**, bukan menghilangkan materi. Textual/ASCII diagrams tetap code block.

Semua body, termasuk pembahasan kuis tersembunyi, masuk document tree. Tautan `./02-...md` dan `../../README.md` diselesaikan secara internal: modul -> route module/anchor; README -> halaman indeks belajar yang memuat raw README bila didukung, atau navigasi modul dengan tautan sumber repository yang jelas, bukan broken URL `.md`. Untuk konsistensi pilih indeks internal yang merender README dari `?raw` tambahan; README bukan modul ketujuh. External links dibatasi http/https dan `rel=noopener noreferrer`; `javascript:`/file/local absolute URL ditolak. URL hash hasil search membuka `<details>` ancestor yang relevan sebelum scroll/focus.

### 4.2 Parsing/indexing

Fungsi publik `study-engine.ts`:

```ts
parseCurriculum(id: CurriculumModuleId, fileName: string, raw: string): CurriculumModule;
buildStudyIndex(modules: readonly CurriculumModule[]): StudyIndex;
searchStudy(index: StudyIndex, query: string, limit?: number): readonly StudySearchHit[];
buildDictionaries(modules: readonly CurriculumModule[], metadata: StudyMetadata): StudyDictionaries;
buildQuiz(modules: readonly CurriculumModule[], metadata: StudyMetadata): readonly QuizQuestion[];
```

`StudyIndex`, `StudyMetadata`, dan `StudyDictionaries` juga dideklarasikan di `sap.ts`: index berisi sections `{id, source, title, plainText, normalizedText}`, metadata berisi source-backed enrichment keyed canonical code/quiz id, dictionary berisi arrays TCodeEntry/SproEntry/TableDictionaryEntry. AST/renderer-specific node types tetap lokal di library, bukan domain state Zustand.

- Parse sekali per raw source identity; source range berasal dari AST position. Heading slug: trim, Unicode normalization NFKC, lowercase, keep letters/digits, collapse separators `-`, suffix `-2`, `-3` untuk duplikat. Parser dan renderer menggunakan fungsi slug yang sama.
- Index mencakup semua teks, tabel, code, math source dan details, dengan unit section yang tidak menghapus konten sebelum heading pertama.
- Search normalize case/diacritics/whitespace; tokenize, semua token wajib cocok. Exact T-Code/table match mendapat prioritas, lalu heading, lalu body. Tie-break module order/startLine. Query kosong menghasilkan array kosong, bukan dump semua modul. `BP 604` dan `BP604` dinormalisasi sebagai alias pencarian, bukan dua error berbeda.
- Dictionary membaca tabel operasional/SPRO modul 06 dan daftar struktur/master/OBYC di modul 01–05. Expand sel `MM01 / MM02 / MM03` menjadi tiga code dengan source ref sama; panah alur bukan bagian code. Multirow code merge berdasarkan canonical code tanpa membuang source refs. Gunakan metadata kecil hanya untuk domain/type/link tambahan yang tidak dapat diturunkan otomatis. Setiap code yang disebut sumber dapat dicari; code executable dibatasi registry simulator.
- Schema table dictionary mengambil nama/key yang disebut materi; tabel non-simulated seperti BUT000, LFA1, SKA1, RPSCO tetap dapat dicari dan ditandai `Referensi materi; tidak ada proyeksi live`, bukan ditampilkan kosong seolah gagal posting.
- Quiz: lima kasus modul 06 menjadi single-choice dengan empat pilihan authored di study-metadata, satu benar; pertanyaan dan explanation diambil dari source refs AST saat runtime. Pilihan tidak menyalin seluruh explanation. Submit -> feedback -> pembahasan -> next; jawaban tak bisa di-submit dua kali untuk menambah skor. Review ulang tetap boleh; retry reset attempt. Skor jumlah benar / 5, tanpa timer/random order. Source explanation baru tampil setelah submit atau di mode review, tidak dihapus dari reader biasa.

## 5. Algoritma deterministik `src/lib/sap-engine.ts`

### 5.1 API publik

```ts
resolveObycAccount(config: SapConfiguration, query: ObycQuery): Result<ResolvedAccount>;
calculateAvac(wbs: WbsBudgetState): AvacResult;
guardBudgetChange(wbs: WbsBudgetState, delta: BudgetDelta): Result<AvacResult>;
simulateMigo(state: SapSimulationState, input: MigoInput,
  config: SapConfiguration): Result<MigoOutput>;
simulateMiro(state: SapSimulationState, input: MiroInput,
  config: SapConfiguration): Result<MiroOutput>;
settleProject(state: SapSimulationState, input: SettlementInput,
  config: SapConfiguration): Result<SettlementOutput>;
calculateDepreciation(state: SapSimulationState, input: DepreciationInput,
  config: SapConfiguration): Result<DepreciationOutput>;
executeSapCommand(state: SapSimulationState, command: SapCommand,
  config: SapConfiguration): Result<TransactionOutput>;
executeCommandBatch(state: SapSimulationState, commands: readonly SapCommand[],
  config: SapConfiguration): Result<TransactionOutput>;
parseTCodeCommand(raw: string, dictionary: readonly TCodeEntry[]): Result<ParsedTCodeCommand>;
```

`sap-tables.ts`: `projectSapTables(state: SapSimulationState, edition: SapEdition): SapTableRows`; `getTableSchema<K extends SapTableName>(name: K): SapTableSchema<K>`. Projection menghasilkan data yang sama untuk snapshot yang sama; tidak mutate state. Common table arrays tersedia pada kedua edition; tidak relevan edition diberi empty array dengan UI label, bukan data fisik lintas edition yang disamarkan.

Perintah atomik: validate references/status/input -> hitung candidate state/journal/delta -> guard AVAC seluruh WBS terdampak -> validasi invariant -> return success. Store commit hanya success. Kegagalan tidak mengubah input, sequence, history, document list, stock, maupun progress. Batch mensimulasikan berurutan pada candidate lokal; jika command ke-N gagal, seluruh batch ditolak. Bukan transaksi sebagian yang meninggalkan jurnal tanpa state atau sebaliknya.

### 5.2 Arithmetic dan identitas

- `sap-money.ts` menyediakan signature `parseMoney(text, currency): Result<Minor>`, `parseQuantity(text): Result<Qty>`, `roundRatio(numerator: bigint, denominator: bigint): bigint`, `extendPrice(price: UnitPrice, qty: Qty): Minor`, `convertCurrency(amount: Minor, rate: FxRate): Minor`, `formatMoney(amount, currency): string`. Parser memakai format input canonical decimal titik (tanpa pemisah ribuan) dengan label/contoh eksplisit; output dilokalisasi. IDR input fractional ditolak; quantity maksimum tiga angka pecahan. Tidak memakai `parseFloat`/epsilon.
- FX rate mendefinisikan **local minor units per document minor unit**; UI kurs satu major unit dikonversi ke rasio dengan currency scales terlebih dahulu. Contoh USD $1,000 = 100,000 cents ke IDR Rp15,000/USD -> rate 150 rupiah/cents -> 15,000,000 IDR. Tidak mengalikan cents dengan 15,000 tanpa scale adjustment.
- Rounding half-away-from-zero, integer BigInt. Prorata cumulative allocation/partial receipt menggunakan difference-of-rounded-cumulative amounts, sehingga bagian akhir menyerap residual dan total tepat. Kalkulasi harga MAP menyimpan rasio value/qty, tidak menyimpan harga rounded sebagai sumber kebenaran.
- Penurunan stock terakhir mengeluarkan **seluruh** value tersisa pool bila qty pool menjadi nol; tidak meninggalkan cents phantom. Input/rasio dengan denominator <=0 ditolak. Nilai negatif akibat price-credit yang membuat pool <0 ditolak dengan pesan jelas, bukan diam-diam clamped; credit memo terpisah tidak termasuk input MIRO ini.
- ID FI/material/invoice/event dihasilkan dari `state.nextSequence` dengan prefix/width deterministik; sequence bertambah hanya pada committed commands. Tidak Date.now/Math.random/UUID. Posting date/period berasal dari input yang valid, fixture case memakai November 2026.
- Batas input operasional lab didokumentasikan di form: nominal <= 10^15 minor units, quantity <= 10^12 Qty, rate numerator/denominator <= 10^12, life <=1200 bulan, batch <=50 commands. Semua perbandingan dana menggunakan BigInt; utilization number hanya display, clamp bar 0..100%, teks tetap menampilkan overrun asli. Batas ini menjaga form/formatting, bukan pembatas SAP riil.

### 5.3 Resolver OBYC

1. Plant -> company code/CoA/valuation grouping; material atau kategori service -> valuation class; movement/line purpose -> transaction key/modifier/stockKind/side.
2. Filter key + CoA exact; GBB modifier harus exact; non-GBB modifier wajib null. Rule nullable dimension berarti wildcard yang disengaja, bukan fallback otomatis ke akun default.
3. Urutan specificity total: stockKind exact sebelum wildcard, lalu valuationGrouping exact sebelum wildcard, lalu valuationClass exact sebelum wildcard. Bandingkan tuple secara lexicographic; jangan hanya menghitung jumlah field terisi yang bisa seri ambigu. Dua rule dengan tuple specificity sama untuk query adalah configuration error `INVALID_INPUT` dengan rule IDs; konfigurasi harus dicek saat bootstrap.
4. Ambil debitAccount/creditAccount sesuai side. Tidak menemukan mapping -> `M8 534` dengan seluruh query tercetak aman. Tidak menebak akun berdasarkan awalan angka.
5. Simpan rule ID/query di trace dan origin setiap line OBYC. Tidak berikan label OBYC ke tax/vendor/AO90 line.

Fixture minimum (CoA CAID, grouping 0001; plant 1100 dan 1200 satu company code 1000):

| Key/modifier | Dimensi | G/L |
| --- | --- | --- |
| BSX | class 3000 general | 114010 |
| BSX | class 3000 Q | 114015 |
| BSX | class 3040 general | 114040 |
| WRX | material | 210090 |
| WRX | service | 210095 |
| GBB-VBR | material | 510010 |
| GBB-VNG | material | 510090 |
| GBB-INV | material | 510080 |
| GBB-BSA | material | 399999 |
| PRD | material | 520010 |
| KDM | material/direct procurement | 710020 |

Service account-assignment account 510020; vendor recon 210010; DP 116010; bank 111020; deductible tax 115010; withholding 213023; settlement credit 599010; AuC 129010; final building 121020, machine 121030; depreciation expense 610010 and accumulated 122020/122030. Keseluruhan mapping fixture diberi source refs, wildcard class service/material tidak boleh overlap ambigu. UI boleh mengubah price control/price dan konfigurasi rule pada workspace sandbox tanpa mengubah konstanta case atau materi Markdown.

### 5.4 MIGO valuation dan jurnal

Gunakan `q` quantity, `G` PO amount untuk received portion dikonversi dengan GR FX, `C` standard valuation (`q × standard price`), dan `I` issue amount dari pool MAP untuk V atau standard price untuk S. Amount signed delta dijadikan line debit jika positif, credit jika negatif; nol tidak membuat line.

| Movement / konteks | Perubahan | Jurnal dan budget |
| --- | --- | --- |
| 101 STOCK | tambah valuated qty | V: Dr BSX G / Cr WRX G. S: Dr BSX C; Dr PRD G-C bila positif, Cr PRD bila negatif; Cr WRX G. Tidak actual WBS. |
| 101 P/K/N | tidak tambah stock | Dr akun assignment G / Cr WRX G; partial open PO commitment berkurang, WBS actual bertambah untuk P/N. Expense object wajib; KI 235 jika hilang. |
| 101 A | kapitalisasi asset langsung | Dr asset AO90 PKey70 G / Cr WRX G; tidak menyusutkan di sini. |
| 101 Q | tambah stock Q milik WBS | Valuation V/S seperti stock, open PO berkurang, held-Q bertambah sebesar budget portion, actual konsumsi tetap nol. Selisih PRD bila ada dan WBS-relevant ditambahkan actual hanya sekali. |
| 103 | tambah blocked103Qty, buat blocked receipt ref | **Tidak FI**, tidak valued pool/MAP, open PO tetap terikat; tidak mengizinkan invoice GR-based atas blocked quantity. |
| 105 | kurangi blocked103Qty referensi, tambah valuated qty / direct cost | jurnal dan commitment conversion seperti 101, hanya untuk qty 103 yang masih open. Jangan menggandakan received qty untuk batas PO. |
| 201 K | kurangi general stock | Dr GBB-VBR I / Cr BSX I; cost center wajib; tidak PS actual. |
| 221 P | kurangi general stock | Dr GBB-VBR I WBS / Cr BSX I; tambah actual WBS. |
| 221 Q | kurangi Q stock owner | Dr GBB-VBR I WBS / Cr BSX I; held Q berkurang prorata lot FIFO, actual bertambah I; selisih reserve vs I ikut candidate AVAC. |
| 281 N | kurangi general atau Q stock owner | Dr GBB-VBR I dengan network/activity/WBS / Cr BSX I; budget berperilaku seperti 221; reservasi network direpresentasikan assignment, bukan inventaris kedua. |
| 301 | pindah plant valuation area berbeda, satu company code | Cr BSX sumber I; Dr BSX tujuan I untuk V atau C tujuan untuk S; selisih I-C ke PRD tujuan. Qty sumber turun/tujuan naik, pool MAP tujuan dihitung ulang. Tolak lintas company code karena intercompany balancing tidak termasuk subset. |
| 311 | pindah SLoc dalam plant sama | **Tidak FI**, pool value/qty/MAP tidak berubah; hanya bucket location, source != target wajib. |
| 551 | scrapping | Dr GBB-VNG I / Cr BSX I; tidak GBB-INV. |
| 561 | initial stock | V: Dr BSX entryValue / Cr GBB-BSA entryValue. S: Dr BSX C / Cr GBB-BSA entryValue dan PRD entryValue-C sesuai tanda. |
| 701/702 | inventory gain/loss calculator | 701 Dr BSX gainValue (S memakai C), Cr GBB-INV; selisih standar jika relevan ke PRD. 702 Dr GBB-INV I / Cr BSX I. |

P/S price control hanya relevan untuk inventory; jangan membuat PRD material standar pada PO service/direct consumption yang tidak menilai stock. 101 P berharga invoice berbeda kemudian dibebankan ke expense, bukan menaikkan stok yang tidak ada.

Keterkaitan stock Q/S: budget reserve receipt = PO budget portion dikurangi actual PRD relevan yang sudah dicatat; total reserve + actual = received procurement budget local amount. Pada GI standar, release reserve sesuai lot dan actual sebesar standard issue value; remaining PRD tetap actual, sehingga tidak double count. MIRO tambahan pada Q dibagi BSX/PRD sesuai coverage; portion yang mengubah stock value juga mengubah held Q allocation, portion PRD WBS-relevant menambah actual. Seluruh perubahan dapat memicu BP604 sebelum commit.

103/105 memerlukan data blocked lot quantity walau belum valued `ReceiptLot`: engine dapat menyimpan nonvaluated receipt lot dengan grLocalAmount=0 dan `giOpenQty=0`; 105 mengurangi blocked lot dan membuat valued lot baru. Invoice memilih hanya valued lots. Metadata receipt harus menyertakan status `'BLOCKED_103' | 'VALUATED'` sebagai field wajib tambahan `ReceiptLot.status`; code/test tidak boleh mengandalkan amount=0 untuk menebak status.

### 5.5 MIRO: price variance, FX, tax, dan payment block

Untuk receipt subset yang dipilih (FIFO by receipt ID jika lebih dari satu), `qIR <= sum(invoiceOpenQty)`; receipt milik PO yang sama, valued, tidak duplicate. Default grBasedIv fixture aktif. Input invoice quantity > received ditolak; jangan membuat stock negatif atau menghilangkan GR-required guard hanya karena invoice bisa payment-blocked. PO service membutuhkan accepted SES.

Hitung per allocated receipt portion:

- `Pdoc` = historical PO net document amount untuk invoice quantity.
- `G` = historical GR WRX local amount untuk quantity itu, prorata berdasarkan remaining receipt value dengan residual final.
- `P_at_IR = convert(Pdoc, invoiceFx)`.
- `N = convert(invoiceNet, invoiceFx)`.
- **FX difference `F = P_at_IR - G`**.
- **Price difference `D = N - P_at_IR`**. Maka `G + F + D = N` tepat setelah rounding; koreksi residual rounding ke D, bukan journal unbalanced.
- Non-deductible tax ditambahkan ke D sebagai acquisition/cost uplift; deductible tax tidak masuk AVAC. Withholding mengurangi payable, bukan actual procurement cost.

Jurnal dasar: Dr WRX **G**; signed F ke KDM; signed D ke tujuan berikut; Dr deductible input tax; Cr vendor `N + tax - withholding`; Cr withholding tax. Untuk tax non-deductible tidak ada Dr input tax; uplift acquisition/cost ditambah ke D sehingga debit tetap cocok dengan gross payable. Semua amount lokal; simpan document currency/reference pada invoice metadata. Jika nilai signed F/D negatif, posting credit; jangan menghasilkan amount line negatif.

Tujuan D:

- Stock S: seluruh price variance ke PRD; stock value/standard price tidak berubah.
- Stock V: `coverage = min(remaining valuated pool qty, invoice qty) / invoice qty`. Untuk general gunakan pool yang benar, Q hanya pool owner yang benar. `capitalized = round(D * coveredQty / invoiceQty)`, `expensed = D - capitalized`. Capitalized ke BSX, sisanya PRD. FX F tetap KDM (kebijakan separate-KDM), bukan digabung menjadi price difference.
- P/K/N: price difference dan non-deductible tax ke akun biaya assignment. P/N actual WBS berubah signed sebesar tambahan yang budget-relevant.
- A: uplift ke asset acquisition AO90, bukan PRD material.
- WBS relevansi KDM/PRD: untuk assignment P/N/Q diposting dengan WBS (fixture cost-element account) dan diperhitungkan actual satu kali. PRD/KDM untuk general stock memakai default cost center `CC-MM-VAR` fixture, tidak membebani WBS yang tidak dimiliki. Ini memenuhi KI235 tanpa memalsukan WBS.

Partial invoices tidak menghapus seluruh lot/PO; reduce invoiceOpenQty hanya allocated quantity. Jangan mengubah GR history; WRX clearing mengikuti original GR rate. PO commitment sudah diganti di GR/SES, sehingga MIRO hanya menambah/mengurangi variance/stock reserve, bukan membentuk actual sebesar invoice base kedua kali.

Payment block: `price variance ratio = abs(invoiceNet - Pdoc) / Pdoc` dalam document currency, tax excluded. Di atas tolerance 5% fixture -> dokumen **tetap diposting** dengan block R, kecuali BP604 atau validasi fundamental gagal. Tepat 5% tidak blocked. Pdoc=0 ditolak untuk PO non-gratis subset ini. Payment run menolak invoice blocked; tidak auto-release MRBR. MRBR tampil referensi/read-only pada dictionary kecuali fitur release block secara eksplisit ditugaskan kemudian. Duplicate invoice guard memakai company code + vendor + normalized reference + fiscal year. UI menampilkan bahwa credit memo/subsequent debit dan kurs multi-currency ledger tidak termasuk calculator ini.

### 5.6 AVAC dan lifecycle guard

`poCommitment = openPoCommitment + heldQAllocation`.

`assigned = prCommitment + poCommitment + actualCost`.

`available = releasedBudget - assigned`.

Severity memakai perbandingan integer exact, bukan utilization rounded:

- assigned > released -> ERROR / `BP604`; overrun = assigned - released.
- selain itu, released >0 dan `assigned*10000 >= released*8000` -> WARNING.
- sisanya OK. Tepat 100% adalah WARNING, bukan ERROR. Budget 0 & assigned 0 = OK; budget 0 & assigned >0 = ERROR dan utilization null (`∞` di UI).
- Warning mengizinkan commit; ERROR menolak seluruh transaksi. `avacActive=false` tidak melakukan budget veto, tetapi calculator tetap menampilkan perhitungan dengan badge `Kontrol nonaktif`. Lifecycle/ref/quantity guards tetap berlaku. Case mengaktifkan AVAC pada budget release.
- `guardBudgetChange` harus memeriksa wbs ID, currency, dan candidate components nonnegative. Formula computed, tidak disimpan sebagai total yang bisa stale. `settledToAuc` bukan pengurang actual AVAC; settlement/AFAB/payment tidak membebaskan budget proyek.

Konversi procurement:

1. CREATE_PR menambah estimated remaining commitment. WBS REL dan account-assignment-enabled wajib.
2. CREATE_PO dari PR mengurangi PR **berdasarkan converted quantity × harga estimasi PR**, lalu menambah nilai PO negotiated quantity × PO price. Partial conversion menyisakan remaining PR; direct PO tidak menghapus PR yang tak direferensikan.
3. RELEASE_PO tidak menghitung commitment kedua kali; blocked PO sudah mengikat budget saat create. MIGO/SES butuh released PO.
4. P/N GR atau accepted SES mengurangi open PO portion dan menambah actual received value; Q GR mengurangi open PO lalu menambah held Q; `103` tidak convert; GI Q convert held -> actual. General stock procurement tanpa WBS tidak memengaruhi PS.
5. `COMPLETE_PO` dengan deliveryCompleted meniadakan remaining open quantity commitment saja, tidak menghapus actual/Q reserve dan tidak mengubah received qty; finalInvoice flag mencegah invoice quantity baru setelah selesai, bukan menghapus invoice open payable.
6. Budget set/release: `0 <= released <= original`; pengurangan release di bawah assigned ditolak ketika AVAC aktif. Tidak ada budget negatif.

Lifecycle matrix:

| WBS | Yang diizinkan dalam lab |
| --- | --- |
| CRTD | create structure, original/release budget; tidak procurement/posting |
| REL | procurement, goods/services, invoice, periodic settlement, TECO transition |
| TECO | MIRO atas PO lama, clearing/payment, periodic residual settlement dan full settlement; tidak PR/PO baru atau GR/GI/SES |
| CLSD | hanya display; tidak posting atau perubahan budget |

Transisi maju CRTD->REL->TECO->CLSD saja dalam lab. CLSD butuh outstanding commitment/reserve nol, unsettled WBS nol, AuC nol, dan invoice payable/DP linked selesai; error menjelaskan saldo penyebab. Budget actions tidak memerlukan REL (langkah 2 masih CRTD). Invoice tanpa WBS tidak melewati lifecycle PS. Status guard dan BP604 terpisah agar error tidak disalahartikan.

### 5.7 CJ88 periodic/full settlement

**PER:** WBS REL/TECO, receiver AuC class 8000 key0000, company code/currency sama, valid PER rule 100%. `unsettled = cumulative actualCost - settledToAuc`; bila <=0 return ALREADY_SETTLED (tidak dokumen nol). Dr AuC 129010 PKey70; Cr settlement 599010 PKey50 dengan WBS. Tambah asset acquisitionValue dan settledToAuc dengan amount sama. Actual consumption tetap historis; assigned/available tidak berubah. PER setelah tambahan MIRO/GI hanya memindahkan residual, tidak mengapitalisasi ulang total lama.

**FUL:** WBS TECO; tidak open PR/PO/held Q, seluruh actual sudah periodic-settled; linked AuC mempunyai positive balance. Rules total **10000 bps per sender**, receiver class2000/3000, company code sama, asset usefulLife/residual/key valid, tidak receiver AuC yang sama. Allocate AuC balance ke rules dalam urutan receiver ID; last allocation menyerap residual. Dr final asset AO90 PKey70; Cr sender AuC PKey75. Kurangi AuC acquisitionValue (untuk model remaining APC); tambah final acquisitionValue dan capitalization date/dep start. Sisa AuC nol. Ini transfer asset, bukan kredit settlement 599010 kedua kali dan bukan additional WBS actual.

Missing receiver/rule/AuC atau total share !=10000 -> KD503; salah status -> STATUS_BLOCKED. Repeated PER tanpa residual -> ALREADY_SETTLED; repeated FUL saldo0 -> ALREADY_SETTLED. Tidak memindahkan released budget $100k jika actual hanya $90k. UI menampilkan mapping WBS -> AuC -> final dan cumulative/period residual berbeda.

### 5.8 AFAB monthly straight-line

Lab mensimulasikan depreciation area01 saja, `LINR` straight-line. Asset class8000/key0000 menghasilkan amount0 dan trace `AuC tidak disusutkan`, tanpa journal nol. Final asset perlu useful life >0, residual >=0 dan <=APC, capitalization date, depStartPeriod, serta cost center depresiasi. Missing CO object -> KI235.

Depreciable base `B=acquisitionValue-residualValue`. Konvensi lab **full-month mulai bulan kapitalisasi**, tanpa daily proration; period sebelum start -> amount0. Untuk bulan aktif urutan `k` mulai1, normal monthly amount `m=round(B/lifeMonths)`; k<life memakai min(m,remaining depreciable balance), bulan terakhir mengambil seluruh remaining. Dengan demikian hasil pertama bangunan **$145.83**, mesin **$458.33**, total **$604.16** sesuai modul05; jangan memakai selisih cumulative rounding yang memberi $604.17 pada first month. Pada bulan terakhir residual rounding diselesaikan agar tidak over-depreciate.

Untuk menghindari skip/catch-up tersembunyi, AFAB hanya memposting **periode aktif berikutnya** per asset; periode yang dilompati ditolak INVALID_INPUT dengan periode yang harus dijalankan. Periode sudah posted -> DUPLICATE_PERIOD; semua asset dalam batch divalidasi dahulu. Amount0 sebelum mulai/AuC tidak ditandai posted depreciation period. Dr expense610010 PKey40 dengan cost center; Cr accumulated depreciation122020/122030 PKey75 dengan asset. `accumulatedDepreciation` bertambah, APC tidak berkurang, NBV=APC-accumulated; tidak menambah actual WBS. Tidak support acquisition tambahan sesudah first depreciation dalam subset ini; transaction yang mencoba uplift asset yang sudah disusutkan ditolak eksplisit, bukan recalculation diam-diam.

### 5.9 Parser command field

Trim spasi pinggir, uppercase canonical; spasi internal T-Code ditolak. Grammar menerima bare known code, `/n<CODE>`, `/o<CODE>`, `/n`, `/nend`, `/nex`. Periksa `/nend` dan `/nex` **sebelum** pola `/nCODE`. `/n` HOME; `/nend` LOGOFF confirm=true; `/nex` LOGOFF confirm=false. Logoff pada lab berarti menutup view sesi ke home, bukan menghapus domain state atau keluar akun nyata. UI memberi penjelasan batas simulasi.

`/oCODE` membuat logical UI session tambahan (maksimal6), bukan popup browser/OS; domain workspace sama, draft tiap sesi terpisah. `/nCODE` mengganti transaksi pada sesi aktif; dirty draft memakai konfirmasi discard di UI. Command unknown -> UNSUPPORTED_COMMAND dan dictionary suggestions; command known tetapi READ_ONLY -> buka dictionary/context, tidak fake successful transaction. `/o` tanpa code, URL, karakter shell, string ekstra, dan `F1/F4` sebagai posting command ditolak. F1/F4 tetap bantuan field/search-help UI bila diimplementasikan, bukan engine transaction.

## 6. Studi kasus CAPEX: urutan dan checkpoint wajib

### 6.1 Seed dan isolasi

Case seed belum mempunyai project/WBS/PO/aset. Ada perusahaan/plant/vendor/material/config dan stock umum **100 m kabel $5,000** (V, qty=100000 Qty, value=500000 cents). Seed diberi badge `opening stock sintetis`, tidak dianggap jurnal dari langkah1. Trafo stock nol; price control V, harga case $50,000 per unit. USD lokal/document 1:1. Date November2026, month end `2026-11-30`. Aset memakai useful life 240/120 bulan dan residual0. Tidak memakai GL balance palsu untuk menyeimbangkan opening inventory; inspector scope jurnal hanya transaksi simulasi, opening inventory dijelaskan terpisah.

Stepper dan sandbox adalah **dua workspace domain terpisah**. User yang bereksperimen MIRO $110k di calculator tidak merusak checkpoint CAPEX. Right panel selalu menunjuk workspace aktif dan badge namanya; berpindah mode mempertahankan masing-masing snapshot. Reset case dengan konfirmasi mengembalikan seed+progress, tidak mereset study/quiz atau sandbox.

### 6.2 Actions dalam sepuluh langkah

Setiap subaction dapat dieksekusi/diinspeksi sendiri. Tombol `Jalankan langkah` menjalankan sisa subactions sebagai batch atomik, sehingga masih tersedia tampilan keadaan `101 Q` **sebelum GI**, PR sebelum PO, dan invoice sebelum payment. Step tidak boleh hanya berganti angka tanpa command engine.

| Step | Subactions berurutan | Checkpoint agregat USD setelah step |
| --- | --- | --- |
| 1 CJ20N | create project P-2026-GI01, .01 sipil, .02 material, CRTD | budget0, assigned0, actual0, no FI; PROJ/PRPS |
| 2 CJ30/CJ32 | original dan release .01=40k, .02=60k, AVAC aktif | released100k, assigned0, available100k; BPGE/BPJA |
| 3 CJ20N REL | release dua WBS, auto AuC8000015-0/.01 dan8000016-0/.02, PER rules | available100k; ANLA/ANLB/COBRB; **no FI** |
| 4 ME51N/ME21N/ME29N | create PR trafo50k dan jasa35k; convert masing-masing ke PO4500010001/00010 Q dan4500010002/00010 D/P; approve dua PO | PR0, PO85k, actual0, assigned85k, available15k; .01 available5k, .02 available10k; no FI |
| 5 F-47/F-48 | noted DP request7k, bayar DP7k contractor | budget tidak berubah; Dr DP1160107k PKey29/A, Cr bank1110207k |
| 6 MIGO | 6A101Q trafo1 unit50k; 6B221Q50k; 6C221 kabel100m5k ke.02 | .02 actual55k, PO0; .01 PO35k actual0; assigned90k, available10k |
| 7 ML81N | accepted SES35k PO jasa (automatic GR) | .01 actual35k, .02 actual55k, PR/PO0, assigned90k, available10k |
| 8 MIRO/F-54/F110 | invoice trafo50k+VAT5.5k ->AP55.5k; invoice jasa35k+VAT3.85k-WHT.7k ->AP38.15k; clear DP7k ->AP31.15k; bayar dua vendor86.65k | actual90k, available10k, AP/DP/GRIR0; withholding liability700 tetap unpaid |
| 9 CJ88 PER | settle .0135k dan .0255k ->dua AuC | AuC90k, unsettled WBS0; budget tetap actual90k/available10k |
| 10 AS01/CJ20N/CJ88/AFAB | create building2000099-0, machine3000099-0; TECO; FUL100% per sender; AFAB2026-11 | AuC0, final APC90k, depreciation604.16, NBV89,395.84; available10k |

Checkpoint **antara** subactions6A/6B: setelah6A `.02 openPo=0`, heldQ50k, actual0, assigned50k, available10k; COOI material tidak open, MSPR1 unit, FI Dr114015/Cr21009050k. Setelah6B heldQ0 actual50k, same assigned/available, MSPR0. Ini acceptance penting untuk membuktikan state bukan gambar hasil akhir saja.

Detail jurnal step8 wajib persis angka sumber: supplier service payable **38,150** (bukan38,850); clear DP **7,000**; payment **86,650**; total bank outflow termasuk DP **93,650**. VAT total **9,350**, WHT **700**. Tidak membayar WHT ke negara otomatis karena bukan action kurikulum. Step9 jurnal Dr12901035k+55k / Cr59901035k+55k masing-masing WBS. Step10 Dr12102035k+12103055k / Cr12901090k, lalu Dr610010604.16 / Cr122020145.83+122030458.33.

Progress menyimpan action IDs sukses; completed step hanya bila seluruh actions-nya committed. Tidak skip prerequisites. Step lama boleh dibuka/read-only; tidak replay posting sukses. Reset diperlukan untuk mengulang kasus dari seed. Perubahan input case yang menyimpang dari fixture disediakan melalui `Coba di Sandbox`, bukan mengubah kasus fixed sehingga acceptance hilang. Tombol tersebut menyalin snapshot ke sandbox dengan label asal, bukan berbagi reference mutable.

## 7. UI tiga panel

### 7.1 Layout dan aksesibilitas

Desktop >=1280px: grid kiri sekitar260px, tengah `minmax(0,1fr)`, kanan sekitar380px; semua panel mempunyai heading dan scroll sendiri, main reader tetap `min-width:0`. Tablet768..1279: kiri dapat collapse, kanan drawer/tab; mobile<768: tabs `Belajar / Simulasi / Inspector` dengan navigasi accessible. Tidak mengecilkan tiga panel sampai form tidak terbaca. Header global memuat judul, workspace, edition switch ECC/S4, dan command field.

Keyboard navigation, visible focus, form labels, aria-live polite untuk posting success/budget warning dan assertive untuk error, tabel memakai caption/header; warna AVAC didampingi teks/icon. Kontras memadai; jangan memakai merah/hijau saja. Numeric inputs mempertahankan draft string; error dekat field. Journal debit/credit selalu explicit, bukan hanya signed number.

### 7.2 Panel kiri

- Enam modul berurutan, nested heading navigation dan progress baca manual (`Tandai selesai`) yang tidak memalsukan mastery.
- Search global semua materi dengan hasil source/snippet; klik ke module/heading dan highlight sementara.
- Tabs kamus `T-Code / SPRO / Tabel SE16N`, filter module MM/PS/FI dan query.
- Quiz entry, progress/score5 kasus; jawaban tidak muncul sebelum submit.
- Pilih dictionary executable -> buka transaction workspace terkait; configuration/report unsupported -> source-backed explanation, bukan form kosong.

### 7.3 Panel tengah

Mode reader, dictionary, quiz, dan simulator. Simulator mempunyai tabs `CAPEX 10 langkah`, `MIGO/MIRO & OBYC`, `AVAC`, `Settlement/AFAB`; procurement/DP/asset commands dapat dibuka melalui stepper/command field tanpa memaksakan tab baru per code.

- `TransactionContext`: T-Code/Fiori/SPRO/data tables/sources di atas form; transaction unsupported jelas read-only.
- Form MIGO memilih movement dan field kondisional; Q checkbox berasal dari stock/assignment, bukan free text yang dapat bertentangan. Tampilkan pool MAP sebelum/sesudah dan OBYC trace. `103/311` memiliki banner `Tidak ada jurnal FI` tetapi material changes tetap terlihat.
- Form MIRO memilih PO, valued receipt lots, qty/net/tax/FX; preview menunjukkan GR historical value, price delta, FX delta, BSX/PRD coverage, payable/block dan AVAC sebelum/sesudah. `Hitung` tidak mengubah state; `Post ke Sandbox` commit candidate melalui command baru.
- Budget tester memilih WBS/scenario PR/PO/GR/GI/SES/MIRO, memasukkan input yang sama dengan engine, bukan langsung mengedit total assigned. Boleh menampilkan baseline/virtual delta via `guardBudgetChange` untuk demonstrasi formula, tetapi posting nyata hanya lewat executable command; label kedua mode berbeda.
- Settlement/AFAB forms menampilkan rules, sender balances, useful life, dep start dan duplicate-period feedback. Tidak menyediakan shortcut `set AuC total` yang melewati posting.
- Capex stepper: input source read-only, actions executable, previous/future steps inspectable, table/journal diffs per action; source links ke modul05. Tombol posting dinonaktifkan setelah committed.

### 7.4 Panel kanan

Ketiga inspector selalu tersedia (tabs/accordion pada layar sempit):

1. **JournalInspector**: pilih latest/document/event, document header BKPF dan baris Debit/Credit, PKey, special GL, account/subledger, WBS/asset, OBYC key/modifier atau origin lain. Footer totals/balance; no-FI events menjelaskan alasan, tidak menghilangkan jurnal historis. Klik line -> related table/document selection.
2. **WbsBudgetMonitor**: WBS selection + project aggregate; original/released, PR, open PO, held Q lab, PO budget total, actual, assigned, available, settled/unsettled. AVAC bar capped visual100% dengan nilai actual utilization/overrun tertulis. Warning>=80%, ERROR>100%; error candidate ditampilkan berdampingan dengan baseline tanpa mengganti committed monitor.
3. **SapTableInspector**: table picker, schema/key badges, edition label, text filter (canonical number string/date/ID), selected event diff added/changed/removed dan row join navigation. Default tabs ACDOCA/BKPF, MATDOC, EKKO/EKPO/EKKN, PRPS/COOI/BPGE, ANLA/ANLC. Row IDs stabil dari schema key. Click WBS POSID -> PRPS internal PSPNR/OBJNR -> related COOI/BPGE/ACDOCA; click PO -> items/assignments/receipts/invoice; asset -> ANLA/ANLB/ANLC/journal. Empty table pada event no-posting adalah valid state dengan alasan, bukan fabricated row.

`TraceInspector` dapat berupa expandable section di tengah/kanan, berisi rumus+inputs+source refs. Jangan menaruh trace panjang di toast yang hilang.

## 8. Zustand: `src/store/use-sap-store.ts`

### 8.1 Bentuk store dan aksi

State domain tidak dipersist ke localStorage dalam scope ini; reload mereset lab secara jelas. Ini menghindari BigInt serialization/versioning yang tidak dibutuhkan. Study progress juga session-only; tampilkan penjelasan. Tidak membuat account/cloud sync.

```ts
// ui.ts — shapes refer to contracts in sap.ts
export type WorkspaceId = 'case' | 'sandbox';
export type CenterRoute =
  | { readonly kind: 'INDEX' }
  | { readonly kind: 'MODULE'; readonly moduleId: CurriculumModuleId; readonly headingId: string | null }
  | { readonly kind: 'DICTIONARY'; readonly tab: 'TCODE' | 'SPRO' | 'TABLE'; readonly entryId: string | null }
  | { readonly kind: 'QUIZ'; readonly questionId: string | null }
  | { readonly kind: 'TRANSACTION'; readonly tcode: TCode };
export interface SapUiSession {
  readonly id: string; readonly route: CenterRoute;
  readonly draft: TransactionDraft | null;
  readonly dirty: boolean;
}
export type TransactionDraft = // discriminated by tcode/form; numeric fields are strings
  | GoodsMovementDraft | InvoiceDraft | ProcurementDraft | SettlementDraft
  | DepreciationDraft | BudgetDraft | CaseActionDraft;
export interface PreviewState {
  readonly workspaceId: WorkspaceId;
  readonly baseRevision: number;
  readonly command: SapCommand;
  readonly result: Result<TransactionOutput>;
}
export interface InspectorSelection {
  readonly documentId: string | null; readonly eventId: string | null;
  readonly wbsId: WbsId | null; readonly table: SapTableName;
  readonly rowKey: string | null;
}
export interface SapStoreState {
  readonly edition: SapEdition;
  readonly activeWorkspace: WorkspaceId;
  readonly workspaces: Readonly<Record<WorkspaceId, SapSimulationState>>;
  readonly workspaceRevision: Readonly<Record<WorkspaceId, number>>;
  readonly sessions: readonly SapUiSession[];
  readonly activeSessionId: string;
  readonly capexProgress: CapexProgress;
  readonly preview: PreviewState | null;
  readonly lastError: EngineError | null;
  readonly selection: InspectorSelection;
  readonly searchQuery: string;
  readonly readModuleIds: readonly CurriculumModuleId[];
  readonly quizAttempts: readonly QuizAttempt[];
}
export interface SapStoreActions {
  navigate(route: CenterRoute): void;
  runCommandField(raw: string): Result<ParsedTCodeCommand>;
  setEdition(edition: SapEdition): void;
  selectWorkspace(id: WorkspaceId): void;
  setDraft(draft: TransactionDraft): void;
  previewCommand(command: SapCommand): Result<TransactionOutput>;
  postCommand(command: SapCommand): Result<TransactionOutput>;
  executeCaseAction(actionId: string): Result<TransactionOutput>;
  executeCaseStep(stepId: CapexStepId): Result<TransactionOutput>;
  selectCaseStep(stepId: CapexStepId): void;
  copyCaseToSandbox(): void;
  resetWorkspace(id: WorkspaceId): void;
  selectInspector(selection: Partial<InspectorSelection>): void;
  setSearchQuery(query: string): void;
  markModuleRead(id: CurriculumModuleId, read: boolean): void;
  submitQuizAnswer(questionId: string, optionId: string): void;
  resetQuiz(): void;
}
```

Draft constituent interfaces tinggal di `ui.ts`, satu per form, berisi hanya field yang muncul pada input kontrak terkait; references selected sebagai string ID, date string, decimal string dan boolean. Parser form mengubah draft menjadi typed command via shared money parser; parse error tetap Result dengan field path, tidak mengevaluasi expression arithmetic dari input.

### 8.2 Atomic state flow

1. User edit -> draft sesi, preview sebelumnya dibatalkan.
2. `previewCommand`: parse/validate context, panggil engine terhadap workspace aktif; simpan result + baseRevision. Tidak memasukkan candidate state ke workspaces dan tidak advance case.
3. `postCommand`: gunakan input typed terkini; hitung ulang terhadap current snapshot (atau gunakan preview hanya bila command identity dan revision persis cocok). Pilihan paling sederhana: selalu satu engine execution sinkron saat Post. Preview tidak pernah dipercaya bila baseline berubah. Tidak async race/network.
4. Jika error: simpan `lastError` dan candidate display data yang tersedia, state domain/reference tetap, case progress tetap. `BP604` menampilkan projected overrun; candidate AVAC dapat dihitung ulang dari input tanpa memposting.
5. Success: satu `set` mengganti workspace state+revision, selection latest event/document, clear preview/error, update completed case actions/steps bila jalur case; draft clear sesuai sesi. UI inspector subscribe snapshot ini.
6. `executeCaseStep`: derive commands sisa action -> executeCommandBatch -> satu commit domain+progress. Dilarang memakai loop `postCommand` yang commit sebagian pada step gagal.
7. `postCommand` bebas hanya sandbox. Workspace case menerima command melalui case actions saja; command field dalam case memilih action relevan atau menawarkan `Buka di Sandbox`, bukan bypass urutan.
8. Edition switch hanya mengganti projection/view; nilai domain/journal/step progress tidak diposting ulang. Logical GUI sessions juga berbagi workspace snapshot, bukan masing-masing SAP database.

Selectors terpisah: active snapshot, latest/selected documents, budgets per WBS/aggregate, tables per edition, case next action, quiz score. Projection tabel dihitung sekali per `(snapshot identity, edition)` dan dipakai semua consumers; gunakan memoization module-local dengan cache kecil atau `useMemo` pada provider/surface, bukan recompute seluruh table set per cell. Zustand selector shallow untuk tuple UI; tidak subscribe seluruh store pada input per-keystroke. Jangan menyimpan assigned/available, stock MAP display, atau table rows sebagai duplikasi mutable. Perubahan state copy hanya map/array yang terdampak; tidak JSON clone (BigInt), tidak blanket structuredClone setiap preview.

## 9. Error, invariant, dan keamanan konten

### 9.1 Invariant sesudah setiap command sukses

- Setiap FI document mempunyai >=2 nonzero lines, sum debit=sum credit persis, currency/company konsisten, account origin lengkap; account/subledger dan posting key side sesuai profile.
- Sum valued buckets=valuation pool qty/value; blocked103 tidak valued; stock/Q ownership benar; qty/value tidak negatif; pool qty0 -> value0.
- Remaining PR/receipt invoice quantity, outstanding PO quantity dan DP/invoice open balances tidak negatif; tidak invoice/clear/pay lebih dari saldo.
- Assigned formula tepat; tidak menggandakan PR+converted PO, PO+GR, Q reserve+GI actual, MIRO base actual, atau WBS actual+settlement.
- AuC tidak depreciated; final NBV>=residual; APC transferred konservatif; no duplicate settlement/depreciation.
- Semua synthetic IDs dan FK yang ditampilkan di SAP table inspector resolve ke record terkait; leading zero tidak hilang.
- Snapshot awal tidak berubah; input immutable. Error tidak mengonsumsi sequence atau menyisipkan events/journals/partial case progress.

Tidak semua error modul06 merupakan engine fitur. `M7 053` dan `F5 201` tetap searchable troubleshooting source; runtime lab tidak mengimplementasikan kalender posting FI/MM configurable karena bukan acceptance engine. Jangan menampilkan seolah simulator benar-benar memvalidasi semua periode SAP. `M8 534`, `KI235`, `BP604`, `KD503` memiliki guard nyata seperti di atas.

### 9.2 User-facing behavior

- Unknown references menunjukkan jenis dan ID yang salah; tidak fallback ke first WBS/PO/material.
- Preview/error panel membedakan committed state dan candidate; journal historis tidak hilang ketika transaksi baru ditolak.
- Input numeric bukan NaN/Infinity/negative; empty field bukan nol otomatis. Quantity/amount0 hanya diperbolehkan pada field saldo awal/budget, bukan transaksi posting.
- No-FI state (`103`, `311`, budget, PR/PO, release master, F47) adalah hasil valid dengan table/event effects yang benar; tidak membuat jurnal dummy seimbang0.
- Input/Markdown tidak boleh menjalankan script, command OS, atau link executable. Tidak mencetak secret atau menambahkan telemetry. Data kasus synthetic dan tidak berisi rekening bank nyata/PHI.
- `SapTableInspector` hanya membaca proyeksi; tidak ada edit sel langsung untuk bypass engine. Mengubah config calculator dilakukan lewat form config sandbox typed dengan validate configuration, tidak melalui tabel SAP palsu.

## 10. Rencana task modular dan ownership paralel

Tidak menulis implementasi sebelum kontrak disepakati integration owner. Satu pemilik integrasi menggabungkan hasil; task label berikut boleh dipakai otomatis. Tidak memaksa jumlah agen tertentu.

| Task label | Pemilik target eksklusif | Hasil dan dependency |
| --- | --- | --- |
| `sap-contracts-and-host-tooling` | `src/types/**`, root package/lock/config/index.html, `src/main.tsx`, `src/vite-env.d.ts` | kontrak §3/§8 dan bootstrap; diselesaikan dahulu sebelum consumers. Tidak mengedit docs/curriculum. |
| `sap-curriculum-study-engine` | `src/data/curriculum.ts`, `src/data/study-metadata.ts`, `src/lib/study-engine.ts`, `src/lib/study-links.ts`, `src/components/study/**` | reader utuh, search/dictionaries/5quiz/source linking; bergantung types. |
| `sap-deterministic-domain-engine` | `src/data/sap-config.ts`, `src/data/capex-case.ts`, `src/lib/sap-engine.ts`, `src/lib/sap-money.ts`, `src/lib/sap-tables.ts` | seluruh algoritma/commands/fixtures/projection, tanpa Zustand/UI; bergantung types. Jangan membagi sap-engine.ts ke dua owner bersamaan. |
| `sap-state-and-three-panel-ui` | `src/store/**`, `src/App.tsx`, `src/index.css`, `src/components/layout/**`, `src/components/transactions/**`, `src/components/inspectors/**`, `src/components/shared/**` | store/actions/forms/3-panel, consume engine dan study API; kontrak types stabil dahulu, wiring akhir setelah engine/study land. |
| `sap-independent-behavior-tests` | `tests/**`, `playwright.config.ts` | unit/integration/e2e dengan oracle angka §6/§11; tidak mengubah produksi agar assertion lolos. Root Playwright config dimiliki task ini, bukan tooling task. |
| `sap-integration-and-documentation` | `README.md` dan `docs/spec.md` hanya bila ada keputusan integrasi sah | integration owner: selaraskan script dokumentasi setelah entrypoint nyata tersedia, keputusan kontrak, jalankan checks gabungan setelah semua land sesuai izin. Tidak menyunting curriculum untuk menutupi mismatch. |

`coder` boleh merangkap beberapa task; `tester` memegang tests agar expected amounts tidak dihitung ulang memakai helper yang sedang diuji. Perubahan kontrak setelah consumer mulai harus dibawa ke integration owner, diperbarui pada **satu** file `sap.ts/ui.ts`, lalu semua callers/test/docs dimigrasikan; tidak alias/shim legacy.

## 11. Kontrak penerimaan dan matriks uji untuk tester

Bagian ini menetapkan pemeriksaan implementasi mendatang. **Tidak ada build/test yang dijalankan dalam penugasan arsitektur.** Tester/integration owner menjalankan hanya setelah implementasi terintegrasi dan sesuai izin assignment mereka; hasil tidak boleh diklaim sekarang.

### 11.1 Unit domain dan angka oracle

1. OBYC: lookup exact/wildcard precedence, side mapping, unknown M8 534, GBB modifier obligatoire, INV/VNG/BSA terpisah, Q BSX114015 vs general114010, ambiguity rule ditolak; provenance tidak hilang.
2. Modul03 V: PO100×Rp10,000, GR -> BSX1,000,000/WRX1,000,000; invoice1,100,000 full stock -> BSX uplift100,000. Sesudah issue60 unit -> stock tersisa40,000? **Nilai stock sebelum invoice adalah Rp400,000**, uplift40,000, PRD60,000, value sesudah440,000 dan MAP11,000. Expected assertion harus menggunakan nilai400,000, bukan menyalahartikan remaining quantity40 sebagai nominal40,000.
3. Modul03 S9,500: GR BSX950,000+PRD50,000/WRX1,000,000; MIRO WRX1,000,000+PRD100,000/AP1,100,000; stock unchanged950,000. Uji price variance negatif dengan signed credit line dan tetap balanced.
4. KDM modul06: USD1,000, GR rate15,000 IDR/USD -> WRX15m; stock habis, IR rate16,000 -> DrWRX15m + DrKDM1m / CrAP16m, bukan PRD1m. Gabungan perubahan harga+kurs membuktikan D/F tidak double-count.
5. Coverage V: full/partial/zero, unrelated plant/Q owner tidak menambah coverage; partial invoice dan rounding residual tepat; GI terakhir pool value0. Perubahan MAP berlaku sama lintas SLoc satu plant.
6. MIGO: semua required101,103/105,201,221,221Q,281,301,311,551,561 exercised; 701/702 membuktikan INV. 103 no FI dan cannot invoice; 105 requires blocked lot. 311 same-pool conservation; 301 source/destination V/S dengan PRD dan intercompany reject. 201 missing cost center,221 missing WBS,281missing activity -> error jelas tanpa mutation.
7. AVAC boundaries released100,000: assigned79,999.99 OK;80,000 WARNING;100,000 WARNING;100,000.01 ERROR/BP604 overrun.01. Zero-budget0/0OK,0/positiveERROR. Rupiah scale tidak berubah ke cents.
8. PR30k -> negotiated PO28k: PR0, PO28k, available22k dari release50k. GR28k -> actual28k; MIRO29k ->actual29k available21k. PO25k berikut ->projected54k, BP604 overrun4k, committed state unchanged. Test partial PR conversion/PO receipt serta delivery completed melepaskan remaining10% tanpa menghapus actual.
9. Q intermediate: GR changes COOI/openPO ->held reserve, CJI3actual0; GI reserve->actual; project available tidak melompat. S-Q PRD dan MIRO stock uplift tidak counted twice.
10. SES accepted baru menghasilkan GR/journal; PO service tanpa SES tidak invoice. Double accept quantity ditolak. Payment block >5%, tepat5% tidak blocked, BP604 mengalahkan permission post. Duplicate invoice dan over-invoice quantity ditolak.
11. Settlement: PER only residual, no budget freed, FUL status/rules/receiver guards, 70/30 generic100k ->70k/30k; case35k/55k tetap terpisah. Repeat no duplicates; allocations rounding100% konservatif.
12. AFAB: AuC0 no journal; building35k/240=145.83; machine55k/120=458.33, total604.16; repeated/skip period rejected, final month exact remaining, NBV residual floor, expense CO assignment wajib. Tidak membebani WBS lagi.
13. DP7k, invoice contractor38,150, clearing7k, payable31,150; invalid overclear/wrong vendor/blocked payment reject. F47 no FI. Payment does not change actual/AVAC.
14. Pure determinism: same initial state+commands+config equal IDs/values/table rows; deep-freeze input; failed command and failed batch tidak mutate atau consume sequence. Dua posting commandId sama menolak DUPLICATE_DOCUMENT.
15. Parser: `/nME21N`, `/nMIGO`, `/nCJ20N`, `/oFS10N`, lowercase/outer whitespace, bareAFAB, `/n`, `/nend`, `/nex`, unknown, malformed, no code, unsafe strings. Known READ_ONLY tidak berpura-pura executable. Max6 UI sessions diuji store/UI.

### 11.2 Study, projection, dan store integration

- Runtime source body berasal dari keenam raw imports; perubahan fixture Markdown yang diberikan ke parser langsung mengubah heading, search, dictionary dan explanation tanpa copy data. Tests memeriksa perilaku parser/reader, bukan regex memastikan string import ada.
- Search menemukan `GBB-VBR`, `BP 604`, `MATDOC`, `Price Control`, termasuk dalam tables/code/details, dengan stable source target dan duplicate heading IDs. Semua6 modul dapat dibuka sampai bagian akhir dan next/back/README links tidak broken.
- Markdown menampilkan table, math, details dan diagram; malicious script/event/javascript URL fixture tidak executable. Mermaid error tidak menghapus kode asli.
- Dictionary menyertakan seluruh operational/config/report entries dari sumber, split code groups benar, missing Fiori/path ditandai, SE16N key/join navigation PSPNR/OBJNR benar. Quiz tepat5, submit/review/reset/score benar, source explanation terbaru digunakan.
- Projection FK/unique lab primary keys, amounts signedACDOCA/positiveBSEG, no fabricated ACDOCA.BSCHL, Q owner mapping, original/released distinction dan read-only table outside runtime.
- CAPEX execute seluruh subactions1..10 lewat public command/store API, assert checkpoints §6, journal balanced per doc, AuC90k->0, finalAPC90k, dep604.16, VAT9,350/WHT700/bankout93,650, AP/DP/GRIR0. Jangan hanya snapshot hasil akhir atau langsung assign expected state.
- Store atomic revisions/selection/progress, stale preview invalidated, error leaves domain unchanged, case/sandbox isolation, edition switch no posting, reset scoped, repeated step prevented.

### 11.3 UI surface nyata

Playwright menjalankan host Vite lokal melalui canonical script yang sudah tersedia sesudah coder setup. Tidak menggunakan Docker. Wajib alur nyata:

1. Buka keenam modul, navigasi search ke heading/details, lihat tabel/math/Mermaid dan source link.
2. Cari T-Code/SPRO/SE16N, buka read-only code, jawab satu kuis salah lalu benar dalam retry dan selesaikan5.
3. Gunakan command field `/nME21N`, `/nMIGO`, `/nCJ20N`, unknown command dan logical `/o`; navigation tidak otomatis memposting.
4. Jalankan CAPEX step1..10, berhenti inspeksi substep6A: FI stockQ dan WBSactual0/reserve50k;6Bactual50k; selesai10APC90k/dep604.16. Perhatikan ketiga panel benar-benar berubah sinkron.
5. Di sandbox bandingkan V/S MIRO full/partial stock dan FX, lihat payment block, coba AVAC80%/100%/>100%, lihat BP604 tanpa stock/journal/progress mutation.
6. Jalankan103/105 dan311 no-FI; settlement/depreciation duplicate guard; reset sandbox tidak mengubah case atau quiz.
7. Desktop tiga panel, tablet drawer, mobile tabs, keyboard focus/form errors/table scroll/aria labels. Ambil bukti visual pada masing-masing viewport dan inspector no-FI/error, bukan hanya compile.

### 11.4 Gate selesai implementasi

Implementasi diterima hanya ketika seluruh named scope berfungsi pada UI, engine API, dan proyeksi live; keenam Markdown utuh; semua required movements/engines/case actions bukan stub; tidak ada duplicate sources of truth atau fake fallback. Integration owner mencatat perintah dan observasi yang benar-benar dijalankan, kegagalan serta batasnya. Build lulus saja tidak membuktikan UI/angka benar. File sumber kurikulum pengguna dipertahankan; README diperbarui dengan setup/run/check nyata oleh task integrasi, bukan menuliskan command yang belum tersedia sebagai fakta.
