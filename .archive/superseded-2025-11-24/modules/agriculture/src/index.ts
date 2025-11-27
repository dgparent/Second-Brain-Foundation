/**
 * Agriculture Module - Farm management, field operations, and traceability
 * Built on agriculture tracking framework principles
 */

/**
 * Base Entity interface
 */
interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: { state: string; review_at?: string };
  sensitivity: string;
  privacy: {
    cloud_ai_allowed: boolean;
    local_ai_allowed: boolean;
    export_allowed: boolean;
  };
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

/**
 * Farm / Organization Entity
 */
export interface FarmEntity extends Entity {
  type: 'agriculture.farm';
  metadata: {
    name: string;
    legal_name?: string;
    organization_type: 'farm' | 'cooperative' | 'exporter' | 'processor';
    registration_id?: string;
    tax_id?: string;
    country: string;
    region: string;
    gps_centroid?: { lat: number; lon: number };
    area_total_ha?: number;
    primary_crops: string[];
    certifications?: string[];
    contact_person?: string;
    contact_phone?: string;
    contact_email?: string;
    farming_system?: 'conventional' | 'organic' | 'agroforestry' | 'regenerative';
  };
}

/**
 * Field / Block Entity
 */
export interface FieldEntity extends Entity {
  type: 'agriculture.field';
  metadata: {
    farm_uid: string;
    name: string;
    code?: string;
    gps_polygon?: string;
    gps_centroid?: { lat: number; lon: number };
    area_ha: number;
    soil_type?: string;
    slope_class?: 'flat' | 'gentle' | 'steep';
    shade_cover_pct?: number;
    altitude_masl?: number;
    irrigation_type?: 'rainfed' | 'drip' | 'sprinkler' | 'flood';
  };
}

/**
 * Season / Production Cycle Entity
 */
export interface SeasonEntity extends Entity {
  type: 'agriculture.season';
  metadata: {
    farm_uid: string;
    name: string;
    crop_variety_uid?: string;
    fields: string[];
    start_date: string;
    planned_end_date?: string;
    target_yield_kg_per_ha?: number;
    budgeted_cost_per_ha?: number;
    production_objectives?: string[];
  };
}

/**
 * Harvest Event Entity
 */
export interface HarvestEventEntity extends Entity {
  type: 'agriculture.harvest_event';
  metadata: {
    date_time_start: string;
    date_time_end?: string;
    field_block_uid: string;
    season_uid: string;
    crop_variety_uid?: string;
    harvest_method: 'manual' | 'mechanical';
    harvest_crew?: string[];
    harvested_quantity_kg: number;
    unit_type: string;
    created_lot_uids: string[];
    reject_quantity_kg?: number;
    reject_reason?: string;
    moisture_pct_at_harvest?: number;
    initial_quality_grade?: string;
  };
}

/**
 * Product Lot Entity (Traceability Unit)
 */
export interface ProductLotEntity extends Entity {
  type: 'agriculture.product_lot';
  metadata: {
    lot_level: 'farm_lot' | 'wet_lot' | 'dry_lot' | 'export_lot';
    origin_field_block_uids: string[];
    origin_harvest_event_uids: string[];
    crop_variety_uid?: string;
    quantity_kg: number;
    current_form: string;
    creation_date: string;
    current_location_uid?: string;
    mixing_history?: string[];
    splitting_history?: string[];
    traceability_ids?: string[];
  };
}

/**
 * Fermentation Batch Entity (Post-harvest)
 */
export interface FermentationBatchEntity extends Entity {
  type: 'agriculture.fermentation_batch';
  metadata: {
    input_lot_uids: string[];
    start_datetime: string;
    end_datetime?: string;
    duration_hours?: number;
    device_type: 'wooden_box' | 'jute_bag' | 'plastic_box' | 'heap' | 'tank';
    device_code?: string;
    capacity_kg: number;
    fill_level_pct: number;
    ambient_temp_range_c?: string;
    turning_schedule?: Array<{ time: string; notes: string }>;
    operator_person_uid?: string;
    temp_curve?: string;
    pH_start?: number;
    pH_mid?: number;
    pH_end?: number;
    notes_on_anomalies?: string;
  };
}

/**
 * Drying Batch Entity (Post-harvest)
 */
export interface DryingBatchEntity extends Entity {
  type: 'agriculture.drying_batch';
  metadata: {
    input_lot_uids: string[];
    start_datetime: string;
    end_datetime?: string;
    drying_method: 'sun_patio' | 'raised_bed' | 'solar_dryer' | 'mechanical' | 'combination';
    drying_surface_type?: string;
    target_moisture_pct: number;
    ambient_conditions_summary?: string;
    operator_person_uid?: string;
    daily_moisture_readings?: Array<{ date: string; moisture_pct: number }>;
    max_drying_temp_c?: number;
    turning_frequency?: string;
    thickness_cm?: number;
  };
}

/**
 * Shipment Entity
 */
export interface ShipmentEntity extends Entity {
  type: 'agriculture.shipment';
  metadata: {
    shipment_ref: string;
    buyer_organization_uid: string;
    seller_organization_uid: string;
    incoterm?: string;
    port_of_loading?: string;
    port_of_discharge?: string;
    product_lots: Array<{
      lot_uid: string;
      quantity_kg: number;
      grade?: string;
    }>;
    documents?: string[];
    price_per_unit?: number;
    payment_terms?: string;
    expected_arrival_date?: string;
    actual_arrival_date?: string;
  };
}

/**
 * Helper to create privacy settings
 */
function createAgriculturePrivacy(level: 'personal' | 'confidential' = 'personal') {
  return {
    level,
    privacy: {
      cloud_ai_allowed: false,
      local_ai_allowed: true,
      export_allowed: true,
    },
  };
}

/**
 * Create a farm
 */
export function createFarm(data: {
  uid: string;
  name: string;
  country: string;
  region: string;
  organization_type: FarmEntity['metadata']['organization_type'];
  primary_crops: string[];
  legal_name?: string;
}): FarmEntity {
  return {
    uid: data.uid,
    type: 'agriculture.farm',
    title: data.name,
    lifecycle: { state: 'permanent' },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      name: data.name,
      legal_name: data.legal_name || data.name,
      organization_type: data.organization_type,
      country: data.country,
      region: data.region,
      primary_crops: data.primary_crops,
    },
  };
}

/**
 * Create a field
 */
export function createField(data: {
  uid: string;
  farm_uid: string;
  name: string;
  area_ha: number;
  gps_centroid?: { lat: number; lon: number };
  soil_type?: string;
}): FieldEntity {
  return {
    uid: data.uid,
    type: 'agriculture.field',
    title: `${data.name} (${data.area_ha}ha)`,
    lifecycle: { state: 'permanent' },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      farm_uid: data.farm_uid,
      name: data.name,
      area_ha: data.area_ha,
      gps_centroid: data.gps_centroid,
      soil_type: data.soil_type,
    },
  };
}

/**
 * Create a season
 */
export function createSeason(data: {
  uid: string;
  farm_uid: string;
  name: string;
  fields: string[];
  start_date: string;
  planned_end_date?: string;
}): SeasonEntity {
  return {
    uid: data.uid,
    type: 'agriculture.season',
    title: data.name,
    lifecycle: { state: 'active', review_at: data.planned_end_date },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      farm_uid: data.farm_uid,
      name: data.name,
      fields: data.fields,
      start_date: data.start_date,
      planned_end_date: data.planned_end_date,
    },
  };
}

/**
 * Record a harvest event
 */
export function recordHarvest(data: {
  uid: string;
  field_block_uid: string;
  season_uid: string;
  date_time_start: string;
  harvested_quantity_kg: number;
  unit_type: string;
  harvest_method: 'manual' | 'mechanical';
  created_lot_uids: string[];
  harvest_crew?: string[];
}): HarvestEventEntity {
  return {
    uid: data.uid,
    type: 'agriculture.harvest_event',
    title: `Harvest - ${data.field_block_uid} - ${data.date_time_start.split('T')[0]}`,
    lifecycle: { state: 'permanent' },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      date_time_start: data.date_time_start,
      field_block_uid: data.field_block_uid,
      season_uid: data.season_uid,
      harvest_method: data.harvest_method,
      harvested_quantity_kg: data.harvested_quantity_kg,
      unit_type: data.unit_type,
      created_lot_uids: data.created_lot_uids,
      harvest_crew: data.harvest_crew,
    },
  };
}

/**
 * Create a product lot
 */
export function createProductLot(data: {
  uid: string;
  lot_level: ProductLotEntity['metadata']['lot_level'];
  origin_field_block_uids: string[];
  origin_harvest_event_uids: string[];
  quantity_kg: number;
  current_form: string;
  creation_date: string;
}): ProductLotEntity {
  return {
    uid: data.uid,
    type: 'agriculture.product_lot',
    title: `Lot ${data.uid} - ${data.current_form} (${data.quantity_kg}kg)`,
    lifecycle: { state: 'active' },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      lot_level: data.lot_level,
      origin_field_block_uids: data.origin_field_block_uids,
      origin_harvest_event_uids: data.origin_harvest_event_uids,
      quantity_kg: data.quantity_kg,
      current_form: data.current_form,
      creation_date: data.creation_date,
    },
  };
}

/**
 * Create a fermentation batch
 */
export function createFermentationBatch(data: {
  uid: string;
  input_lot_uids: string[];
  start_datetime: string;
  device_type: FermentationBatchEntity['metadata']['device_type'];
  capacity_kg: number;
  fill_level_pct: number;
  device_code?: string;
}): FermentationBatchEntity {
  return {
    uid: data.uid,
    type: 'agriculture.fermentation_batch',
    title: `Fermentation - ${data.device_type} - ${data.start_datetime.split('T')[0]}`,
    lifecycle: { state: 'in_progress' },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      input_lot_uids: data.input_lot_uids,
      start_datetime: data.start_datetime,
      device_type: data.device_type,
      device_code: data.device_code,
      capacity_kg: data.capacity_kg,
      fill_level_pct: data.fill_level_pct,
    },
  };
}

/**
 * Complete fermentation batch
 */
export function completeFermentation(
  batch: FermentationBatchEntity,
  end_datetime: string,
  pH_end: number
): FermentationBatchEntity {
  const start = new Date(batch.metadata.start_datetime);
  const end = new Date(end_datetime);
  const duration_hours = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));

  return {
    ...batch,
    lifecycle: { state: 'completed' },
    updated: new Date().toISOString(),
    metadata: {
      ...batch.metadata,
      end_datetime,
      duration_hours,
      pH_end,
    },
  };
}

/**
 * Create a drying batch
 */
export function createDryingBatch(data: {
  uid: string;
  input_lot_uids: string[];
  start_datetime: string;
  drying_method: DryingBatchEntity['metadata']['drying_method'];
  target_moisture_pct: number;
  operator_person_uid?: string;
}): DryingBatchEntity {
  return {
    uid: data.uid,
    type: 'agriculture.drying_batch',
    title: `Drying - ${data.drying_method} - ${data.start_datetime.split('T')[0]}`,
    lifecycle: { state: 'in_progress' },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      input_lot_uids: data.input_lot_uids,
      start_datetime: data.start_datetime,
      drying_method: data.drying_method,
      target_moisture_pct: data.target_moisture_pct,
      operator_person_uid: data.operator_person_uid,
    },
  };
}

/**
 * Record moisture reading
 */
export function recordMoistureReading(
  batch: DryingBatchEntity,
  date: string,
  moisture_pct: number
): DryingBatchEntity {
  const readings = batch.metadata.daily_moisture_readings || [];
  return {
    ...batch,
    updated: new Date().toISOString(),
    metadata: {
      ...batch.metadata,
      daily_moisture_readings: [...readings, { date, moisture_pct }],
    },
  };
}

/**
 * Create a shipment
 */
export function createShipment(data: {
  uid: string;
  shipment_ref: string;
  buyer_organization_uid: string;
  seller_organization_uid: string;
  product_lots: Array<{ lot_uid: string; quantity_kg: number; grade?: string }>;
  incoterm?: string;
}): ShipmentEntity {
  const totalKg = data.product_lots.reduce((sum, lot) => sum + lot.quantity_kg, 0);
  
  return {
    uid: data.uid,
    type: 'agriculture.shipment',
    title: `Shipment ${data.shipment_ref} - ${totalKg}kg`,
    lifecycle: { state: 'scheduled' },
    sensitivity: 'personal',
    ...createAgriculturePrivacy(),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      shipment_ref: data.shipment_ref,
      buyer_organization_uid: data.buyer_organization_uid,
      seller_organization_uid: data.seller_organization_uid,
      product_lots: data.product_lots,
      incoterm: data.incoterm,
    },
  };
}

/**
 * Query helpers
 */

export function getFieldsByFarm(fields: FieldEntity[], farm_uid: string): FieldEntity[] {
  return fields.filter(f => f.metadata.farm_uid === farm_uid);
}

export function getHarvestsByField(
  harvests: HarvestEventEntity[],
  field_uid: string
): HarvestEventEntity[] {
  return harvests.filter(h => h.metadata.field_block_uid === field_uid);
}

export function getHarvestsBySeason(
  harvests: HarvestEventEntity[],
  season_uid: string
): HarvestEventEntity[] {
  return harvests.filter(h => h.metadata.season_uid === season_uid);
}

export function getLotsByOriginField(
  lots: ProductLotEntity[],
  field_uid: string
): ProductLotEntity[] {
  return lots.filter(lot => lot.metadata.origin_field_block_uids.includes(field_uid));
}

export function calculateTotalHarvest(harvests: HarvestEventEntity[]): number {
  return harvests.reduce((sum, h) => sum + h.metadata.harvested_quantity_kg, 0);
}

export function calculateYieldPerHectare(
  harvests: HarvestEventEntity[],
  fields: FieldEntity[]
): Record<string, number> {
  const yields: Record<string, { total_kg: number; area_ha: number }> = {};

  harvests.forEach(harvest => {
    const fieldUid = harvest.metadata.field_block_uid;
    const field = fields.find(f => f.uid === fieldUid);
    
    if (field) {
      if (!yields[fieldUid]) {
        yields[fieldUid] = { total_kg: 0, area_ha: field.metadata.area_ha };
      }
      yields[fieldUid].total_kg += harvest.metadata.harvested_quantity_kg;
    }
  });

  const result: Record<string, number> = {};
  for (const [fieldUid, data] of Object.entries(yields)) {
    result[fieldUid] = data.total_kg / data.area_ha;
  }
  
  return result;
}

export function traceLotToFields(
  lot: ProductLotEntity,
  harvests: HarvestEventEntity[]
): string[] {
  const fieldUids = new Set<string>();
  
  lot.metadata.origin_harvest_event_uids.forEach(harvestUid => {
    const harvest = harvests.find(h => h.uid === harvestUid);
    if (harvest) {
      fieldUids.add(harvest.metadata.field_block_uid);
    }
  });
  
  return Array.from(fieldUids);
}
