1. Purpose & Scope

This framework defines core entities, variables, and relationships needed to:

Capture field-level agronomic data

Maintain product & batch traceability from field to buyer

Track post-harvest operations (fermentation, drying, storage, transport)

Support compliance, quality, and finance across the supply chain

It’s designed to be:

Crop-centric, with cocoa/coffee-friendly post-harvest fields

Traceability-first (internal & external)
Farmbrite
+1

CLI/Markdown-ready for Second Brain Foundation (SBF) style tooling

Use this as a shared ontology & variable catalogue for:

Vault templates

CLI commands (init, validate, uid, future agri-* commands)

AEI automation and scheduling

2. Design Principles

Smallest useful unit: Everything is an entity with a UID (farm, field, harvest lot, fermentation batch, shipment, lab test).

Internal + external traceability:

Internal: link product ↔ field/block, operations, people.
Farmbrite

External: link product ↔ shipments, customers, certificates.

Event-driven: Most records are events with time, place, actor, and affected units.

Progressive detail: Start with minimal fields; add advanced variables (e.g., pH, temperature curves) when sensors/skills allow.

Tool-agnostic: All structures are plain markdown + YAML, compatible with SBF PRD.
Open Knowledge
+1

Knowledge-graph friendly: Relationships explicit (UID-to-UID), compatible with knowledge-graph based traceability.
Frontiers
+1

3. Domain Overview & Actors

Key actor types (entities with their own pages):

farmer / farm_manager

farm / cooperative / producer_org

field / block / plot

laborer, harvest_crew, technician, driver

post_harvest_operator (fermentation/drying)

warehouse_operator

trader, exporter, importer

processor (roaster, mill, factory)

lab / qa_lab

certification_body (Fairtrade, RA, Organic, etc.)

These link to operational entities via UID relationships.

4. Process Stages

High-level lifecycle for plant-based commodities:

Pre-season & planning

Land prep, crop planning, input planning, budgeting.

In-season (Pre-harvest)

Planting, fertilizing, spraying, irrigation, weeding, pruning, scouting, weather & soil monitoring.
Local Line
+1

Harvest

Harvest events, crew, yield per field/block, lot creation, initial quality checks.
croptracker.com
+1

Post-harvest handling

Depodding/cherry pulping, fermentation, washing, drying, sorting, grading, packaging, storage. Especially critical for cocoa/coffee quality and safety.
MDPI
+3
ScienceDirect
+3
PMC
+3

Logistics & transformation

Warehouse movements, shipments, transport legs, processing batches, mixing/splitting of lots.
distributeproduce.com
+1

Quality, compliance & sales

Sampling, lab tests, sensory cupping, certifications, incidents, contracts, invoices, payments.

Each stage corresponds to event entities in section 5.

5. Entity Model & Core Variables

Naming is generic; you can specialize per crop (e.g., cocoa_fermentation_batch, coffee_drying_bed).

For each entity we list core variables (recommended minimum), then advanced variables (nice-to-have, sensor-driven, or lab-driven).

5.1 Farm / Organization

Entity: farm, cooperative, organization

Core variables:

uid

name

legal_name

type (farm, coop, exporter, processor)

registration_id / tax_id

country, region, admin_unit

gps_centroid (lat, lon)

area_total_ha

primary_crops (list)

certifications (list of certification UID/IDs)

contact_person_uid

contact_phone, contact_email

Advanced:

farming_system (conventional, organic, agroforestry, regenerative, etc.)

labor_model (family, hired, mixed)

farmer_profile refs (gender, age bracket, training history)
Open Knowledge
+1

5.2 Land Units (Farm / Field / Plot)

Entity: field_block, plot, orchard_section

Core variables:

uid

farm_uid

name or code (e.g., “Block A1”)

gps_polygon (or centroid + area)

area_ha

soil_type (FAO or local)

slope_class (flat, gentle, steep)

shade_cover_pct (for perennial crops)

altitude_masl

Advanced:

soil_tests (array of soil_test UIDs)

irrigation_type (rainfed, drip, sprinkler, flood)

erosion_risk (low/med/high)

5.3 Crop & Variety

Entity: crop_variety

Core variables:

uid

crop_name (e.g., cocoa, coffee, maize)

variety_name / clone / cultivar

maturity_group or days_to_maturity

source (seed company, nursery, own saved seed)

Advanced:

certified_seed (bool, certificate UID)

recommended_plant_density

disease_resistance_notes

5.4 Season / Production Cycle

Entity: season or production_cycle

Core variables:

uid

farm_uid

name (e.g., “2025 Main Crop”, “2025A”)

crop_variety_uid

fields (list of field_block UIDs)

start_date

planned_end_date

Advanced:

target_yield_kg_per_ha

budgeted_cost_per_ha

production_objectives (quality, certification targets, etc.)
fao.org
+1

5.5 Input Inventory & Applications
5.5.1 Input Item

Entity: input_item (fertilizer, pesticide, herbicide, fungicide, foliar, organic amendment)

Core variables:

uid

name (commercial)

category (fertilizer, pesticide, etc.)

active_ingredients

concentration (e.g., N-P-K 14-14-14)

supplier

batch_lot_no

expiry_date

regulatory_registration_no

Advanced:

restricted_entry_interval_hours

pre_harvest_interval_days

safety_data_sheet_link

5.5.2 Input Application Event

Entity: input_application_event

Core variables:

uid

date_time

farm_uid

field_block_uid

season_uid

input_item_uid

application_type (broadcast, banded, foliar, drip, spot)

rate_per_ha (or rate_per_tree)

total_quantity_used

application_equipment_uid

operator_person_uid

weather_conditions (temp, wind, rainfall/irrigation status)

Advanced:

calibration_details

buffer_zone_respected (bool)

reentry_time_notified_to_workers

5.6 Crop Field Operations

You can either have generic field_operation_event or one entity per type. Below are key categories and variables.

5.6.1 Planting / Transplanting Event

Core:

uid

date_time

field_block_uid

crop_variety_uid

season_uid

planting_method (direct seeding, transplanting)

seed_source_uid

seeding_rate_kg_per_ha or plant_spacing (rows and within-row)

area_planted_ha

operator_person_uid

Advanced:

germination_rate_estimate_pct

plant_population_at_establishment
Local Line
+1

5.6.2 Irrigation Event

Core:

uid

date_time

field_block_uid

method (drip, sprinkler, furrow, flood)

water_source (well, river, rainwater tank)

volume_m3 or mm_depth

duration_hours

Advanced:

soil_moisture_before / after (vol%)

energy_use_kWh

5.6.3 Field Observation / Scouting Event

Core:

uid

date_time

field_block_uid

observer_person_uid

phenological_stage (crop growth stage)

pest_disease_presence (list of issues + severity)

notes

photos (links)

Advanced:

est_yield_kg_per_ha

plant_population_at_harvest (for annuals)

5.7 Weather & Environment

Entity: weather_record

Core:

uid

date

farm_uid or nearest_station

rainfall_mm

min_temp_c, max_temp_c

avg_temp_c

relative_humidity_pct (daily avg or range)

Advanced:

solar_radiation

evapotranspiration_mm

wind_speed_m_s
Solutions from the Land
+1

5.8 Harvest & Product Lots
5.8.1 Harvest Event

Entity: harvest_event

Core:

uid

date_time_start, date_time_end

field_block_uid

season_uid

crop_variety_uid

harvest_method (manual, mechanical)

harvest_crew (list of person UIDs or crew UID)

harvested_quantity_kg

unit_type (kg fresh pods, kg cherries, kg fruit, etc.)

created_lot_uids (one or more product_lot UIDs)

Advanced:

reject_quantity_kg and reason

moisture_pct_at_harvest (if measured)

initial_quality_grade (e.g., visual rating)
croptracker.com
+1

5.8.2 Product Lot (Internal Traceability Unit)

Entity: product_lot (aka batch at a given transformation level)

Core:

uid (e.g., lot-2025-11-23-A1-01)

lot_level (farm_lot, wet_lot, dry_lot, export_lot, etc.)

origin_field_block_uids (one or more)

origin_harvest_event_uids

crop_variety_uid

quantity_kg

current_form (pods, wet beans, dried beans, parchment, green coffee, etc.)

creation_date

current_location_uid (warehouse, drying bed, fermentation device, etc.)

Advanced:

mixing_history (list of prior lot UIDs that were combined)

splitting_history (child lot UIDs)

traceability_ids (QR/RFID/barcode codes)
ResearchGate
+1

5.9 Post-Harvest Processing (Cocoa/Coffee-friendly)

Post-harvest variables are crucial for quality and safety in cocoa/coffee; research highlights the importance of fermentation conditions, turning practices, drying regimes, and storage on flavor compounds, defects, and contaminants.
PMC
+4
ScienceDirect
+4
PMC
+4

5.9.1 Depodding / Pulping Event

Core:

uid

date_time

input_lot_uids

output_lot_uids (wet beans / cherries)

equipment_uid (machete/manual/pulper)

operator_person_uid

water_use_l_per_kg (for pulping/washing)

Advanced:

fermentation_start_time (if fermentation starts immediately)

5.9.2 Fermentation Batch

Entity: fermentation_batch

Core:

uid

input_lot_uids (wet beans/cherries)

start_datetime, end_datetime

duration_hours

device_type (wooden box, jute bag, plastic box, heap, tank)
ScienceDirect
+1

capacity_kg

fill_level_pct

ambient_temp_range_c

turning_schedule (array: times & methods)

operator_person_uid

Advanced (quality-critical):

temp_curve (time-series or min/max/avg fermentation temp)

pulp_draining (yes/no, method)

pH_start, pH_mid, pH_end (beans and/or pulp)

microbial_monitoring (if lab / R&D)

additives (e.g., LAB starter cultures, if ever used)

notes_on_anomalies (off-odors, mold, etc.)

5.9.3 Washing / Demucilage

Entity: washing_event

Core:

uid

date_time

fermentation_batch_uid

method (manual wash, demucilager machine)

number_of_washes

water_source

water_volume_l

Advanced:

effluent_disposal_method

5.9.4 Drying Batch

Entity: drying_batch

Core:

uid

input_lot_uids (from fermentation/washing)

start_datetime, end_datetime

drying_method (sun patio, raised bed, solar dryer, mechanical, combination)
PMC
+1

drying_surface_type (concrete, mesh, tarp, table)

target_moisture_pct

ambient_conditions_summary (sun/cloudy, humidity, etc.)

operator_person_uid

Advanced:

daily_moisture_readings (date → %)

max_drying_temp_c (for mechanical)

turning_frequency and thickness_cm of layer

covering_practices (rain covers at night, etc.)

5.9.5 Sorting / Grading Event

Core:

uid

date_time

input_lot_uids

output_lot_uids (by grade)

grading_standard (local, SCA, buyer-specific)

key_metrics (defect counts, bean size distribution, color class)

Advanced:

photos_of_grades

rejection_disposal_method

5.10 Storage & Inventory
5.10.1 Storage Location

Entity: storage_location (warehouse, silo, bin, bag stack, container)

Core:

uid

name

type (warehouse, silo, shipping_container)

address / gps

capacity_kg

conditions_target (temp range, humidity range, pest control practices)

Advanced:

sensors (temp/RH loggers, CO₂ sensors)

5.10.2 Storage Lot Record

Entity: storage_lot_record

Core:

uid

product_lot_uid

storage_location_uid

arrival_date

planned_dispatch_date

quantity_in_kg

packaging_type (jute bag, PP bag, big bag, silo)

bag_count (if bagged)

stack_id or bin_id

Advanced:

periodic_inspection_records (list of inspection UIDs)

storage_conditions_log (summary or link to sensor data)

pest_incidents (if any)

5.11 Logistics & Shipments
5.11.1 Transport Leg

Entity: transport_leg

Core:

uid

from_location_uid

to_location_uid

carrier (company)

vehicle_id

driver_person_uid

date_time_departure, date_time_arrival

transport_conditions (if controlled: temp setpoint, etc.)

product_lot_uids and quantities

Advanced:

incident_reports (delays, temperature excursions, accidents)

tracking_ids (GPS, shipment IDs)

5.11.2 Shipment / Consignment

Entity: shipment

Core:

uid

shipment_ref (invoice/shipping ref)

buyer_organization_uid

seller_organization_uid

incoterm

port_of_loading, port_of_discharge (for export)

product_lot_uids with quantities and grades

documents (bill of lading, phytosanitary, certificates UIDs)
distributeproduce.com
+1

Advanced:

price_per_unit

payment_terms

expected_arrival_date

actual_arrival_date

5.12 Quality, Safety & Lab Tests
5.12.1 Sample Record

Entity: sample

Core:

uid

product_lot_uid

sampling_date

sampling_method (grab, composite, automatic)

sampler_person_uid

sample_destination (internal lab, external lab)

5.12.2 Lab Test

Entity: lab_test

Core:

uid

sample_uid

lab_organization_uid

test_type (moisture, defects, OTA, pesticide residue, microbiology, physical, sensory/cupping)

analysis_date

result_summary (key metrics)

unit per metric (e.g., % moisture, µg/kg OTA, cupping score)

Advanced:

method_standard (ISO, AOAC, SCA protocol, etc.)

pdf_report_link

pass_fail vs. spec

5.13 Compliance & Certifications

Entity: certification_record

Core:

uid

certification_body_uid

scheme (Organic, Fairtrade, RA, GlobalG.A.P., local standard)

scope (farm, coop, processor, product)

certificate_id

valid_from, valid_to

audit_date

auditor_name

Advanced:

non_conformities (list of issues)

corrective_actions (tasks UIDs)

5.14 Tasks, Labor & Equipment
5.14.1 Task

Entity: task

Core:

uid

title

type (field_operation, maintenance, admin, training, corrective_action)

linked_entity_uids (field, lot, equipment, etc.)

assigned_to_person_uid

due_date

status (planned, in_progress, done, cancelled)

Advanced:

est_effort_hours

actual_effort_hours

labor_cost

5.14.2 Labor Record

Entity: labor_record

Core:

uid

date

person_uid or crew_uid

task_uid

hours_worked

wage_rate

total_cost

5.14.3 Equipment

Entity: equipment

Core:

uid

name

type (tractor, sprayer, pulper, dryer, truck, scale)

manufacturer

model

serial_number

purchase_date

Advanced:

maintenance_schedule

maintenance_records (task or event UIDs)

5.15 Finance & Commercial

Entity: transaction

Core:

uid

date

type (input_purchase, sale, wage_payment, service_fee)

counterparty_uid (supplier, buyer, worker)

amount

currency

reference_doc (invoice, receipt)

linked_entity_uids (lots, inputs, etc.)
croptracker.com
+1

Advanced:

cost_category (fertilizer, labor, transport, etc.)

gross_margin_context (link to season or enterprise)
fao.org
+1

6. Traceability Keys & ID Strategy

Minimal ID design for consistent CLI usage:

Actors & locations: farm-{slug}, field-{farmslug}-{code}, warehouse-{slug}

Product lots: lot-{YYYYMMDD}-{fieldcode}-{sequence}

Fermentation batches: ferment-{YYYYMMDD}-{devicecode}-{sequence}

Drying batches: dry-{YYYYMMDD}-{locationcode}-{sequence}

Shipments: ship-{YYYYMMDD}-{buyer_slug}-{sequence}

Each ID should be:

Globally unique within your vault

Stable (never reused)

Used as uid in frontmatter and as foreign key in relationships

7. Example YAML Templates (SBF-Style)

Below are example frontmatter snippets for key entities, aligned with SBF PRD universal parameters (uid, type, title, lifecycle, sensitivity, privacy, rel, bmom, etc.).
Open Knowledge
+1

7.1 Field / Block
---
uid: field-okir-a1
type: field_block
title: "Block A1 – Upper Slope"
aliases: ["A1", "Upper A1"]
farm_uid: farm-okir-main
area_ha: 1.75
gps_centroid: "6.12345,125.67890"
soil_type: "Clay loam"
shade_cover_pct: 35
altitude_masl: 520

lifecycle:
  state: permanent
  review_at: 2026-01-01T00:00:00Z

sensitivity: personal
privacy:
  cloud_ai_allowed: false
  local_ai_allowed: true
  export_allowed: true

rel:
  - [owned_by, farm-okir-main]
  - [used_for, season-2025-main-cocoa]

bmom:
  because: "We need precise field-level yield and quality tracking."
  meaning: "Canonical record of this production block."
  outcome: "Associate every lot to a specific field and season."
  measure: "100% of product_lot records linked to a field_block."

status: active
importance: high
owner: "DGP"
checksum: null
override:
  human_last: null
  prevent_dissolve: true
---

7.2 Harvest Event
---
uid: harvest-2025-03-21-a1-01
type: harvest_event
title: "Harvest – Block A1 – 2025-03-21"
date_time_start: 2025-03-21T06:30:00Z
date_time_end: 2025-03-21T10:15:00Z

field_block_uid: field-okir-a1
season_uid: season-2025-main-cocoa
crop_variety_uid: crop-cocoa-trinitario-mix
harvest_method: manual
harvest_crew:
  - person-crew-lead-anna
  - crew-okir-team-1
harvested_quantity_kg: 780
unit_type: "fresh_pods"
created_lot_uids:
  - lot-20250321-a1-01

lifecycle:
  state: permanent
  review_at: 2025-04-01T00:00:00Z

rel:
  - [generated, lot-20250321-a1-01]
  - [performed_by, crew-okir-team-1]

sensitivity: personal
privacy:
  cloud_ai_allowed: false
  local_ai_allowed: true
  export_allowed: true
---

7.3 Fermentation Batch
---
uid: ferment-2025-03-21-box1-01
type: fermentation_batch
title: "Fermentation – Box 1 – 2025-03-21"

input_lot_uids:
  - lot-20250321-a1-01
device_type: wooden_box
device_code: "BOX-1"
start_datetime: 2025-03-21T14:00:00Z
end_datetime: 2025-03-24T10:00:00Z
duration_hours: 68
capacity_kg: 500
fill_level_pct: 90
ambient_temp_range_c: "26–32"
turning_schedule:
  - { time: "2025-03-22T10:00:00Z", notes: "First turn" }
  - { time: "2025-03-23T09:30:00Z", notes: "Second turn" }
operator_person_uid: person-ferment-master-juan

pH_start: 3.8
pH_mid: 4.5
pH_end: 5.2
notes_on_anomalies: "Slightly cooler night temperatures on day 2."

rel:
  - [processed_from, lot-20250321-a1-01]
  - [contributes_to, drylot-20250325-a1-01]

lifecycle:
  state: permanent

sensitivity: personal
privacy:
  cloud_ai_allowed: false
  local_ai_allowed: true
  export_allowed: true
---

7.4 Shipment
---
uid: ship-2025-05-10-nao-corp-01
type: shipment
title: "Export Shipment – Nao Corp – 2025-05-10"

buyer_organization_uid: org-nao-corp
seller_organization_uid: coop-okir-davao
incoterm: FOB
port_of_loading: "Davao"
port_of_discharge: "Vancouver"
product_lots:
  - { lot_uid: drylot-20250325-a1-01, quantity_kg: 3500, grade: "Premium" }
  - { lot_uid: drylot-20250325-b2-01, quantity_kg: 1500, grade: "Standard" }

documents:
  - cert-fairtrade-2025-okir
  - cert-organic-2025-okir
  - phyto-2025-12345

price_per_tonne_usd: 4200
payment_terms: "30 days after B/L date"

lifecycle:
  state: permanent

rel:
  - [sells_to, org-nao-corp]
  - [ships, drylot-20250325-a1-01]
  - [ships, drylot-20250325-b2-01]
---

8. Notes for CLI & AEI Integration

Treat each entity type above as a template family under Agriculture/ or per-module folders.

Use the uid consistently as the graph key; use SBF uid CLI command to generate deterministic IDs when possible.

A future sbf agri command set can:

Scaffold these templates (sbf agri init farm, sbf agri new harvest, etc.)

Validate required fields by entity type

Enforce ID patterns and relationships (e.g., harvest_event.field_block_uid must exist; fermentation_batch.input_lot_uids must reference product_lot).