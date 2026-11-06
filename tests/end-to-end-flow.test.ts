import { describe, expect, test } from 'bun:test';
import { auditedInputs, endToEndStages, officialSources, telcoContext, telcoProductMaterials } from '../src/data/end-to-end-flow';

describe('general SAP end-to-end flow', () => {
  test('contains an ordered telco process from product setup through payment lifecycle', () => {
    expect(endToEndStages).toHaveLength(9);
    expect(endToEndStages.map(stage => stage.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(endToEndStages[0].id).toBe('product-master');
    expect(endToEndStages.at(-1)?.id).toBe('lifecycle-reporting');
    expect(endToEndStages.some(stage => stage.id === 'otc-billing')).toBe(true);
    expect(endToEndStages.some(stage => stage.id === 'mrc-billing')).toBe(true);
    expect(endToEndStages.some(stage => stage.id === 'incoming-payment')).toBe(true);
  });

  test('validates stage statuses according to SAP standard vs configuration dependency', () => {
    const conditionalIds = ['product-master', 'customer-contract', 'fulfillment', 'lifecycle-reporting'];
    for (const id of conditionalIds) {
      const stage = endToEndStages.find(item => item.id === id);
      expect(stage?.status).toBe('Bersyarat konfigurasi');
      expect(stage?.control.length).toBeGreaterThan(20);
    }
    const standardIds = ['subscription-order', 'otc-billing', 'mrc-billing', 'customer-invoice', 'incoming-payment'];
    for (const id of standardIds) {
      const stage = endToEndStages.find(item => item.id === id);
      expect(stage?.status).toBe('Sesuai konsep SAP');
    }
  });
  test('models MetroNexia root, MRC, and OTC as separate product/material items', () => {
    expect(telcoContext.company).toBe('InfraNexia');
    expect(telcoContext.brand).toBe('MetroNexia');
    expect(telcoProductMaterials.map(item => [item.materialId, item.billingType])).toEqual([
      ['MATERIAL 1', 'Grouping'],
      ['MATERIAL 2', 'MRC'],
      ['MATERIAL 3', 'OTC'],
    ]);
    expect(telcoProductMaterials.find(item => item.billingType === 'Grouping')?.role.toLowerCase()).toContain('root');
  });
  test('integrates SAP SD Order-to-Cash logic, Sales Area, and VKOA', () => {
    expect(telcoContext.salesArea).toContain('Sales Org 1000');
    expect(telcoContext.salesArea).toContain('Dist. Channel 10');
    expect(telcoContext.salesArea).toContain('Division 01');
    const invoiceStage = endToEndStages.find(stage => stage.id === 'customer-invoice');
    expect(invoiceStage?.transaction).toContain('VKOA');
    expect(invoiceStage?.module).toContain('SAP SD');
    const orderStage = endToEndStages.find(stage => stage.id === 'subscription-order');
    expect(orderStage?.transaction).toContain('VA01');
    const billingOtcStage = endToEndStages.find(stage => stage.id === 'otc-billing');
    expect(billingOtcStage?.transaction).toContain('VF01');
    const billingMrcStage = endToEndStages.find(stage => stage.id === 'mrc-billing');
    expect(billingMrcStage?.transaction).toContain('VF01');
  });

  test('every official reference is an SAP-controlled source', () => {
    expect(officialSources.length).toBeGreaterThanOrEqual(5);
    for (const source of officialSources) {
      expect(source.url.startsWith('https://learning.sap.com/') || source.url.startsWith('https://help.sap.com/')).toBe(true);
    }
    for (const stage of endToEndStages) {
      expect(stage.sources.length).toBeGreaterThan(0);
      for (const source of stage.sources) expect(source.url.includes('sap.com')).toBe(true);
    }
  });

  test('audit keeps synthetic telco identifiers separate from SAP process claims and verifies SD audit', () => {
    expect(auditedInputs.length).toBeGreaterThanOrEqual(7);
    expect(auditedInputs.find(item => item.category === 'MRC')?.status).toBe('Sesuai konsep SAP');
    expect(auditedInputs.find(item => item.category === 'OTC')?.status).toBe('Sesuai konsep SAP');
    expect(auditedInputs.find(item => item.category === 'SAP SD Order-to-Cash & VKOA')?.status).toBe('Sesuai konsep SAP');
    expect(auditedInputs.find(item => item.category === 'Struktur material')?.status).toBe('Bersyarat konfigurasi');
    expect(auditedInputs.every(item => item.finding.length > 30 && item.action.length > 20)).toBe(true);
  });
});
