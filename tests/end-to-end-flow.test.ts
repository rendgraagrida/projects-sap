import { describe, expect, test } from 'bun:test';
import { auditedInputs, endToEndStages, officialSources } from '../src/data/end-to-end-flow';

describe('general SAP end-to-end flow', () => {
  test('contains an ordered process from demand through asset closing', () => {
    expect(endToEndStages).toHaveLength(9);
    expect(endToEndStages.map(stage => stage.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(endToEndStages[0].id).toBe('demand');
    expect(endToEndStages.at(-1)?.id).toBe('capitalize-depreciate');
    expect(endToEndStages.some(stage => stage.id === 'receipt' && stage.branch?.includes('MIGO'))).toBe(true);
  });

  test('does not present conditional project steps as universal', () => {
    for (const id of ['demand', 'structure-budget', 'receipt', 'invoice', 'settlement', 'capitalize-depreciate']) {
      const stage = endToEndStages.find(item => item.id === id);
      expect(stage?.status).toBe('Bersyarat konfigurasi');
      expect(stage?.control.length).toBeGreaterThan(20);
    }
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

  test('audit keeps synthetic identifiers separate from SAP process claims', () => {
    expect(auditedInputs.length).toBeGreaterThanOrEqual(6);
    expect(auditedInputs.find(item => item.category === 'Tax dan withholding')?.status).toBe('Fixture edukasi');
    expect(auditedInputs.find(item => item.category === 'Goods movement')?.status).toBe('Bersyarat konfigurasi');
    expect(auditedInputs.every(item => item.finding.length > 30 && item.action.length > 20)).toBe(true);
  });
});
