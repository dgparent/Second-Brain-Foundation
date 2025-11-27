import { describe, test, expect } from '@jest/globals';
import {
  createFarm,
  createField,
  createSeason,
  recordHarvest,
  createProductLot,
  createFermentationBatch,
  completeFermentation,
  createDryingBatch,
  recordMoistureReading,
  createShipment,
  getFieldsByFarm,
  getHarvestsByField,
  getHarvestsBySeason,
  getLotsByOriginField,
  calculateTotalHarvest,
  calculateYieldPerHectare,
  traceLotToFields,
} from '../index.js';

describe('Agriculture Module', () => {
  describe('Farm Management', () => {
    test('should create a farm', () => {
      const farm = createFarm({
        uid: 'farm-okir-main',
        name: 'Okir Cacao Farm',
        country: 'Philippines',
        region: 'Davao',
        organization_type: 'farm',
        primary_crops: ['cocoa', 'coffee'],
        legal_name: 'Okir Agricultural Enterprises',
      });

      expect(farm.type).toBe('agriculture.farm');
      expect(farm.metadata.name).toBe('Okir Cacao Farm');
      expect(farm.metadata.primary_crops).toContain('cocoa');
      expect(farm.metadata.country).toBe('Philippines');
    });

    test('should create a field', () => {
      const field = createField({
        uid: 'field-okir-a1',
        farm_uid: 'farm-okir-main',
        name: 'Block A1',
        area_ha: 1.75,
        soil_type: 'Clay loam',
      });

      expect(field.type).toBe('agriculture.field');
      expect(field.metadata.farm_uid).toBe('farm-okir-main');
      expect(field.metadata.area_ha).toBe(1.75);
      expect(field.title).toContain('Block A1');
      expect(field.title).toContain('1.75ha');
    });

    test('should create a season', () => {
      const season = createSeason({
        uid: 'season-2025-main-cocoa',
        farm_uid: 'farm-okir-main',
        name: '2025 Main Crop',
        fields: ['field-okir-a1', 'field-okir-a2'],
        start_date: '2025-01-01',
        planned_end_date: '2025-12-31',
      });

      expect(season.type).toBe('agriculture.season');
      expect(season.metadata.name).toBe('2025 Main Crop');
      expect(season.metadata.fields).toHaveLength(2);
      expect(season.lifecycle.state).toBe('active');
    });
  });

  describe('Harvest Operations', () => {
    test('should record a harvest event', () => {
      const harvest = recordHarvest({
        uid: 'harvest-2025-03-21-a1-01',
        field_block_uid: 'field-okir-a1',
        season_uid: 'season-2025-main-cocoa',
        date_time_start: '2025-03-21T06:30:00Z',
        harvested_quantity_kg: 780,
        unit_type: 'fresh_pods',
        harvest_method: 'manual',
        created_lot_uids: ['lot-20250321-a1-01'],
        harvest_crew: ['crew-okir-team-1'],
      });

      expect(harvest.type).toBe('agriculture.harvest_event');
      expect(harvest.metadata.harvested_quantity_kg).toBe(780);
      expect(harvest.metadata.harvest_method).toBe('manual');
      expect(harvest.metadata.created_lot_uids).toContain('lot-20250321-a1-01');
    });

    test('should create a product lot', () => {
      const lot = createProductLot({
        uid: 'lot-20250321-a1-01',
        lot_level: 'farm_lot',
        origin_field_block_uids: ['field-okir-a1'],
        origin_harvest_event_uids: ['harvest-2025-03-21-a1-01'],
        quantity_kg: 780,
        current_form: 'fresh_pods',
        creation_date: '2025-03-21',
      });

      expect(lot.type).toBe('agriculture.product_lot');
      expect(lot.metadata.lot_level).toBe('farm_lot');
      expect(lot.metadata.quantity_kg).toBe(780);
      expect(lot.metadata.current_form).toBe('fresh_pods');
    });
  });

  describe('Post-Harvest Processing', () => {
    test('should create a fermentation batch', () => {
      const batch = createFermentationBatch({
        uid: 'ferment-2025-03-21-box1-01',
        input_lot_uids: ['lot-20250321-a1-01'],
        start_datetime: '2025-03-21T14:00:00Z',
        device_type: 'wooden_box',
        device_code: 'BOX-1',
        capacity_kg: 500,
        fill_level_pct: 90,
      });

      expect(batch.type).toBe('agriculture.fermentation_batch');
      expect(batch.metadata.device_type).toBe('wooden_box');
      expect(batch.metadata.capacity_kg).toBe(500);
      expect(batch.lifecycle.state).toBe('in_progress');
    });

    test('should complete fermentation batch', () => {
      const batch = createFermentationBatch({
        uid: 'ferment-2025-03-21-box1-01',
        input_lot_uids: ['lot-20250321-a1-01'],
        start_datetime: '2025-03-21T14:00:00Z',
        device_type: 'wooden_box',
        capacity_kg: 500,
        fill_level_pct: 90,
      });

      const completed = completeFermentation(
        batch,
        '2025-03-24T10:00:00Z',
        5.2
      );

      expect(completed.lifecycle.state).toBe('completed');
      expect(completed.metadata.end_datetime).toBe('2025-03-24T10:00:00Z');
      expect(completed.metadata.pH_end).toBe(5.2);
      expect(completed.metadata.duration_hours).toBe(68);
    });

    test('should create a drying batch', () => {
      const batch = createDryingBatch({
        uid: 'dry-2025-03-25-patio1-01',
        input_lot_uids: ['lot-20250324-a1-01'],
        start_datetime: '2025-03-25T08:00:00Z',
        drying_method: 'sun_patio',
        target_moisture_pct: 7,
        operator_person_uid: 'person-dry-master-maria',
      });

      expect(batch.type).toBe('agriculture.drying_batch');
      expect(batch.metadata.drying_method).toBe('sun_patio');
      expect(batch.metadata.target_moisture_pct).toBe(7);
      expect(batch.lifecycle.state).toBe('in_progress');
    });

    test('should record moisture readings', () => {
      const batch = createDryingBatch({
        uid: 'dry-2025-03-25-patio1-01',
        input_lot_uids: ['lot-20250324-a1-01'],
        start_datetime: '2025-03-25T08:00:00Z',
        drying_method: 'sun_patio',
        target_moisture_pct: 7,
      });

      const withReading1 = recordMoistureReading(batch, '2025-03-26', 25);
      const withReading2 = recordMoistureReading(withReading1, '2025-03-27', 15);
      const withReading3 = recordMoistureReading(withReading2, '2025-03-28', 8);

      expect(withReading3.metadata.daily_moisture_readings).toHaveLength(3);
      expect(withReading3.metadata.daily_moisture_readings?.[2].moisture_pct).toBe(8);
    });
  });

  describe('Shipments', () => {
    test('should create a shipment', () => {
      const shipment = createShipment({
        uid: 'ship-2025-05-10-nao-corp-01',
        shipment_ref: 'EXP-2025-001',
        buyer_organization_uid: 'org-nao-corp',
        seller_organization_uid: 'coop-okir-davao',
        product_lots: [
          { lot_uid: 'drylot-20250325-a1-01', quantity_kg: 3500, grade: 'Premium' },
          { lot_uid: 'drylot-20250325-b2-01', quantity_kg: 1500, grade: 'Standard' },
        ],
        incoterm: 'FOB',
      });

      expect(shipment.type).toBe('agriculture.shipment');
      expect(shipment.metadata.shipment_ref).toBe('EXP-2025-001');
      expect(shipment.metadata.product_lots).toHaveLength(2);
      expect(shipment.title).toContain('5000kg');
    });
  });

  describe('Query Functions', () => {
    const field1 = createField({
      uid: 'field-1',
      farm_uid: 'farm-1',
      name: 'Field A',
      area_ha: 2.0,
    });

    const field2 = createField({
      uid: 'field-2',
      farm_uid: 'farm-1',
      name: 'Field B',
      area_ha: 1.5,
    });

    const harvest1 = recordHarvest({
      uid: 'harvest-1',
      field_block_uid: 'field-1',
      season_uid: 'season-1',
      date_time_start: '2025-03-01T08:00:00Z',
      harvested_quantity_kg: 1000,
      unit_type: 'pods',
      harvest_method: 'manual',
      created_lot_uids: ['lot-1'],
    });

    const harvest2 = recordHarvest({
      uid: 'harvest-2',
      field_block_uid: 'field-2',
      season_uid: 'season-1',
      date_time_start: '2025-03-05T08:00:00Z',
      harvested_quantity_kg: 750,
      unit_type: 'pods',
      harvest_method: 'manual',
      created_lot_uids: ['lot-2'],
    });

    test('should get fields by farm', () => {
      const fields = getFieldsByFarm([field1, field2], 'farm-1');
      expect(fields).toHaveLength(2);
    });

    test('should get harvests by field', () => {
      const harvests = getHarvestsByField([harvest1, harvest2], 'field-1');
      expect(harvests).toHaveLength(1);
      expect(harvests[0].uid).toBe('harvest-1');
    });

    test('should get harvests by season', () => {
      const harvests = getHarvestsBySeason([harvest1, harvest2], 'season-1');
      expect(harvests).toHaveLength(2);
    });

    test('should calculate total harvest', () => {
      const total = calculateTotalHarvest([harvest1, harvest2]);
      expect(total).toBe(1750);
    });

    test('should calculate yield per hectare', () => {
      const yields = calculateYieldPerHectare([harvest1, harvest2], [field1, field2]);
      expect(yields['field-1']).toBe(500); // 1000kg / 2.0ha
      expect(yields['field-2']).toBe(500); // 750kg / 1.5ha
    });

    test('should trace lot to fields', () => {
      const lot = createProductLot({
        uid: 'lot-1',
        lot_level: 'farm_lot',
        origin_field_block_uids: ['field-1'],
        origin_harvest_event_uids: ['harvest-1'],
        quantity_kg: 1000,
        current_form: 'pods',
        creation_date: '2025-03-01',
      });

      const fields = traceLotToFields(lot, [harvest1, harvest2]);
      expect(fields).toContain('field-1');
      expect(fields).toHaveLength(1);
    });
  });
});
