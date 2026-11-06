import { auditedInputs, endToEndStages, officialSources, telcoContext, telcoProductMaterials, type FlowAuditStatus } from '../data/end-to-end-flow';

const statusClass: Record<FlowAuditStatus, string> = {
  'Sesuai konsep SAP': 'e2e-status-confirmed',
  'Bersyarat konfigurasi': 'e2e-status-conditional',
  'Fixture edukasi': 'e2e-status-fixture',
};

export function EndToEndFlow() {
  return <section className="e2e-page" aria-label="Flow end-to-end SAP telco">
    <div className="eyebrow">KONTEKS TELCO · INFRANEXIA / METRONEXIA</div>
    <h1>Flow End-to-End Penjualan Internet MetroNexia</h1>
    <p className="e2e-lead">Peta ini mengikuti siklus penjualan layanan internet: dari material dan subscription product, order pelanggan, aktivasi, billing MRC/OTC, sampai penerimaan pembayaran dan lifecycle layanan. Angka, nama, dan ID pada contoh adalah fixture edukasi.</p>
    <div className="e2e-legend" aria-label="Legenda status audit">
      <span className="e2e-status e2e-status-confirmed">Sesuai konsep SAP</span>
      <span className="e2e-status e2e-status-conditional">Bersyarat konfigurasi</span>
      <span className="e2e-status e2e-status-fixture">Fixture edukasi</span>
    </div>
    <section className="telco-context-card" aria-labelledby="telco-context-title">
      <div className="eyebrow">MODEL PRODUK DAN MATERIAL SAP</div>
      <h2 id="telco-context-title">{telcoContext.company} · {telcoContext.business}</h2>
      <p>Brand penawaran: <strong>{telcoContext.brand}</strong>. MRC adalah biaya berulang bulanan; OTC adalah biaya satu kali. Root hanya menjadi grouping kecuali solusi target secara eksplisit menjadikannya sellable bundle.</p>
      <div className="telco-material-tree">{telcoProductMaterials.map(material => <div className={`telco-material-node level-${material.level}`} key={material.materialId}>
        <div className="telco-material-head"><span className="telco-material-id">{material.materialId}</span><span className={`e2e-status ${statusClass[material.status]}`}>{material.billingType}</span></div>
        <strong>{material.name}</strong>
        <p>{material.role}</p>
        <small>{material.sapRepresentation}</small>
      </div>)}</div>
      <p className="telco-context-note"><strong>Catatan SAP:</strong> Material 1, 2, dan 3 adalah tiga master/product item yang berbeda. Struktur parent-child perlu dimodelkan lewat product hierarchy, material group, bundle, atau subscription product configuration; penamaan saja tidak membuat BOM atau billing relationship.</p>
    </section>

    <ol className="e2e-flow-list" aria-label="Urutan proses end-to-end">
      {endToEndStages.map(stage => <li className="e2e-stage-card" key={stage.id}>
        <div className="e2e-stage-number">{String(stage.number).padStart(2, '0')}</div>
        <div className="e2e-stage-body">
          <div className="e2e-stage-meta"><span>{stage.phase}</span><span>{stage.module}</span><span className={`e2e-status ${statusClass[stage.status]}`}>{stage.status}</span></div>
          <h2>{stage.title}</h2>
          <p>{stage.purpose}</p>
          <div className="e2e-stage-grid">
            <div><h3>Input utama</h3><ul>{stage.inputs.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h3>Output / perubahan</h3><ul>{stage.outputs.map(item => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="e2e-control"><strong>Control:</strong> {stage.control}</div>
          {stage.branch && <div className="e2e-branch"><strong>Cabang proses:</strong> {stage.branch}</div>}
          <div className="e2e-stage-footer"><code>{stage.transaction}</code><span>Sumber: {stage.sources.map((source, index) => <span key={source.url}>{index > 0 ? ' · ' : ''}<a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></span>)}</span></div>
        </div>
      </li>)}
    </ol>

    <section className="e2e-audit" aria-labelledby="e2e-audit-title">
      <div className="eyebrow">AUDIT INPUT DATA</div>
      <h2 id="e2e-audit-title">Status data yang dipakai di lab</h2>
      <p>Audit ini memisahkan fakta proses SAP dari ID, akun, tarif, dan nilai yang sengaja dibuat sintetis. Tidak ada nomor customer, akun, tarif, atau konfigurasi yang diklaim sebagai data resmi InfraNexia.</p>
      <div className="table-wrap e2e-audit-table-wrap"><table>
        <caption className="sr-only">Audit data input lab terhadap dokumentasi SAP</caption>
        <thead><tr><th>Kategori</th><th>Data pada lab</th><th>Status</th><th>Temuan audit</th><th>Tindakan</th></tr></thead>
        <tbody>{auditedInputs.map(item => <tr key={item.category}><td><strong>{item.category}</strong></td><td>{item.currentValue}</td><td><span className={`e2e-status ${statusClass[item.status]}`}>{item.status}</span></td><td>{item.finding}</td><td>{item.action}</td></tr>)}</tbody>
      </table></div>
    </section>

    <section className="e2e-sources" aria-labelledby="e2e-sources-title">
      <h2 id="e2e-sources-title">Rujukan resmi SAP yang digunakan</h2>
      <ul>{officialSources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
      <p className="e2e-source-note">Rujukan SAP mendeskripsikan proses dan kontrol produk. Ketersediaan aplikasi, T-Code, field, tabel, workflow, tax procedure, dan otorisasi tetap harus divalidasi pada edisi serta release target.</p>
    </section>
  </section>;
}
