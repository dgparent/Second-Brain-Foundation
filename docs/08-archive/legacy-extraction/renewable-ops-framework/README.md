# Renewable Energy Site Operations Framework (Solar & Wind)

This framework defines the ontology, entity structure, workflows, compliance rules, and automation logic for **renewable energy field operations**, including:
- Solar farms
- Rooftop commercial installations
- Residential solar systems (fleet model)
- Wind farms (onshore)
- Hybrid systems (solar + battery + wind)
- Inverter and monitoring systems

This framework supports the operational module **@sbf/renewable-ops**.

---
# 1. Purpose & Scope
This framework provides the structural definitions required for:
- Field inspections
- Preventive maintenance
- Reactive maintenance & fault diagnosis
- Inverter and turbine performance logging
- Energy generation reporting
- Environmental and safety compliance
- Work order management
- Asset performance optimization

Target users:
- Solar O&M teams
- Wind technicians
- EPC contractors
- Field engineers
- Renewable energy operators (IPP)
- Technicians and inspectors

---
# 2. Domain Pillars
- **Asset Registry & Metadata** (panels, strings, inverters, turbines)
- **Site Operations & Inspections**
- **Preventive Maintenance Scheduling**
- **Reactive Maintenance & Fault Logging**
- **Generation Reporting & Analytics**
- **Environmental & Safety Compliance**
- **Technician Workforce Management**
- **Grid & Interconnection Compliance**

---
# 3. Core Entities
- `energy_site`
- `array_block` (solar) / `turbine_unit` (wind)
- `inverter`
- `string_line` (solar)
- `weather_station`
- `generation_log`
- `efficiency_report`
- `inspection_record`
- `maintenance_request`
- `work_order`
- `safety_incident`
- `environmental_log`
- `fault_event`
- `technician_profile`
- `technician_shift`
- `spare_part`
- `part_usage_record`
- `grid_interconnection_record`

---
# 4. Ontology Relationships
- An `energy_site` contains many `array_block` or `turbine_unit` entities.
- Solar arrays contain `string_line` objects; wind turbines stand alone.
- Each block/turbine has one or more `inverter` units.
- `generation_log` references inverter or turbine.
- `inspection_record` links to site, inverter, or turbine.
- `maintenance_request` creates a `work_order`.
- `technician_profile` links to shifts and work orders.
- `fault_event` may reference inverter, panel strings, or turbine components.
- `efficiency_report` aggregates generation data and temperature/weather inputs.
- `grid_interconnection_record` connects site to local grid
- `environmental_log` captures compliance events.

---
# 5. Core Processes

## 5.1 Preventive Maintenance
- Schedule per OEM recommendations
- Check mechanical/electrical systems
- Inspect panels/turbine blades
- Clean panels or perform torque checks
- Update records & generate compliance documentation

## 5.2 Reactive Maintenance
- Fault event detection
- Root-cause analysis
- Work order dispatch
- Field repair & verification

## 5.3 Performance Monitoring
- Inverter-level generation data
- Turbine performance (power curve)
- PR (Performance Ratio) calculations
- Detect underperforming strings/turbines

## 5.4 Inspection Workflow
- Visual inspections
- IR thermal scans
- Drone inspections
- Annual compliance inspections

## 5.5 Health, Safety & Environmental Compliance
- H&S logs
- Environmental impact logs
- Hazard reports
- PPE checks
- Incident escalation

## 5.6 Grid Reporting
- Monthly generation reports
- Outage events
- Interconnection compliance filings

---
# 6. YAML Schemas

## 6.1 energy_site
```yaml
uid: site-solar-001
type: energy_site
name: "Riverside Solar Farm"
site_type: solar
capacity_mw: 12.5
location: "Kingston, Ontario"
commissioned_date: 2021-06-15
operator_uid: org-greenpower
```

## 6.2 inverter
```yaml
uid: inv-01-sf001
type: inverter
site_uid: site-solar-001
model: "SMA Sunny Highpower 75kW"
serial_number: "SMA-HP75-3442"
max_power_kw: 75
commissioned_date: 2021-06-15
status: active
```

## 6.3 generation_log
```yaml
uid: gen-2025-03-11-01
type: generation_log
inverter_uid: inv-01-sf001
date_time: 2025-03-11T12:00
energy_kwh: 124.5
temperature_c: 17
irradiance_wm2: 812
```

## 6.4 inspection_record
```yaml
uid: inspect-2025-03-11-01
type: inspection_record
site_uid: site-solar-001
inspection_type: thermal_scan
timestamp: 2025-03-11T09:15
inspector_uid: tech-223
findings:
  - "Hotspot detected on string 2B"
photos: []
```

## 6.5 maintenance_request
```yaml
uid: mr-2025-03-11-01
type: maintenance_request
site_uid: site-solar-001
reported_by: tech-223
issue_type: inverter_fault
description: "Inverter 01 shows Error Code 485"
priority: high
status: new
```

## 6.6 fault_event
```yaml
uid: fault-2025-03-11-01
type: fault_event
inverter_uid: inv-01-sf001
fault_code: "485"
severity: critical
description: "Grid communication fault"
timestamp: 2025-03-11T12:10
```

## 6.7 technician_profile
```yaml
uid: tech-223
type: technician_profile
name: "Michael Torres"
skills:
  - solar_maintenance
  - inverter_diagnostics
certifications:
  - ESA_Electrician_Level2
```

---
# 7. Automation Capabilities
- Fault detection and automated ticket creation
- Preventive maintenance scheduling engine
- Efficiency deviation detection
- Drone capture analysis ingestion
- Automated generation summaries
- Environmental compliance reminders
- Technician shift and task routing
- Grid outage reporting triggers

---
# 8. Compliance Requirements
- ESA/CSA electrical safety codes (Canada)
- OEM warranty conditions
- Grid interconnection agreements
- Environmental reporting (noise, wildlife impact)
- Annual engineering certifications

---
# 9. Integration with SBF Frameworks
- **Task** → maintenance, inspection, corrective actions
- **Health** → safety incidents
- **Financial** → repair costs, spare part costs
- **Knowledge** → SOPs, maintenance manuals, safety procedures
- **Relationship** → technicians, vendors, utilities

---
# 10. Roadmap
- Phase 1: Asset registry + generation logging
- Phase 2: Maintenance & fault workflows
- Phase 3: Drone inspection integration
- Phase 4: Performance optimization AI layer
- Phase 5: Multi-site operator dashboard

