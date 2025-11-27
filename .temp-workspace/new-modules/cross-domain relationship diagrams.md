| Rank | Domain                                            | Why Top 10                                                                                                                                                 |
| ---- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Construction Ops + Compliance Framework**       | Huge industry, high paperwork, daily logs, inspections, workforce mgmt, scheduling, safety, cost tracking = extremely high pain + high willingness to pay. |
| 2    | **Logistics + Freight Forwarding & Customs Ops**  | Works with agriculture, trade, and export (your Okir business). Exporters, 3PLs, brokers = massive repetitive workflow automation.                         |
| 3    | **Manufacturing & QC/Maintenance Framework**      | Daily QC logs, SOP compliance, machine maintenance automation. High complexity = premium module.                                                           |
| 4    | **Real Estate Property-Ops Framework (PMO)**      | Multi-unit building mgmt, tenant lifecycle, maintenance, payments. Steady recurring revenue.                                                               |
| 5    | **Restaurant + Food Safety (HACCP) Framework**    | Daily checklists, inspections, fridge logs, prep lists, HR, suppliers. High recurring need.                                                                |
| 6    | **Insurance Claims & Field Inspection Framework** | Documentation-heavy: photos, videos, reports, timelines, adjusters. AI automation = huge value.                                                            |
| 7    | **Hotels & Hospitality Ops Framework**            | Shift logs, maintenance, room turnover, guest reviews, cleaning SOPs.                                                                                      |
| 8    | **Renewable Energy Site Ops (Solar/Wind)**        | Growth sector, maintenance logs, inspections, generation tracking.                                                                                         |
| 9    | **Legal Workflow Automation (Small Law Firms)**   | Case mgmt, filings, deadlines, discovery automation. Lawyers pay premium.                                                                                  |
| 10   | **Security Guards + Incident Reporting Ops**      | Patrolling logs, incidents, shift scheduling, video upload automation.                                                                                     |


1) Core Frameworks ↔ Domain Modules

This shows how each domain module consumes the 5 core frameworks.

graph TD

subgraph CoreFrameworks[Core SBF Frameworks]
  FFinancial[frameworks-financial-tracking]
  FHealth[frameworks-health-tracking]
  FKnowledge[frameworks-knowledge-tracking]
  FRel[frameworks-relationship-tracking]
  FTask[frameworks-task-management]
end

subgraph DomainModules[Domain-Specific Ops Modules]
  MConstruction[construction-ops]
  MLogistics[logistics-ops]
  MManufacturing[manufacturing-ops]
  MProperty[property-ops]
  MRestaurant[restaurant-ops / haccp-ops]
  MInsurance[insurance-ops]
  MHOSP[hospitality-ops]
  MRnw[renewable-ops]
  MLegal[legal-ops]
  MSec[security-ops]
  MAgr[agriculture-ops]
  MVA[va-dashboard]
end

%% Financial usage
MConstruction --> FFinancial
MLogistics --> FFinancial
MManufacturing --> FFinancial
MProperty --> FFinancial
MRestaurant --> FFinancial
MInsurance --> FFinancial
MHOSP --> FFinancial
MRnw --> FFinancial
MLegal --> FFinancial
MSec --> FFinancial
MAgr --> FFinancial

%% Health usage
MConstruction --> FHealth
MRestaurant --> FHealth
MInsurance --> FHealth
MSec --> FHealth
MRnw --> FHealth

%% Knowledge usage (SOPs, regs, playbooks)
MConstruction --> FKnowledge
MLogistics --> FKnowledge
MManufacturing --> FKnowledge
MProperty --> FKnowledge
MRestaurant --> FKnowledge
MInsurance --> FKnowledge
MHOSP --> FKnowledge
MRnw --> FKnowledge
MLegal --> FKnowledge
MSec --> FKnowledge
MAgr --> FKnowledge
MVA --> FKnowledge

%% Relationship usage (clients, vendors, staff)
MConstruction --> FRel
MLogistics --> FRel
MManufacturing --> FRel
MProperty --> FRel
MRestaurant --> FRel
MInsurance --> FRel
MHOSP --> FRel
MRnw --> FRel
MLegal --> FRel
MSec --> FRel
MAgr --> FRel
MVA --> FRel

%% Task Management (ops tasks, workflows)
MConstruction --> FTask
MLogistics --> FTask
MManufacturing --> FTask
MProperty --> FTask
MRestaurant --> FTask
MInsurance --> FTask
MHOSP --> FTask
MRnw --> FTask
MLegal --> FTask
MSec --> FTask
MAgr --> FTask
MVA --> FTask



2) Cross-Domain Dependencies (Business Flows)

This one shows how domains depend on each other, not just on the core frameworks — the “business graph.”

graph LR

subgraph PhysicalAssetStack[Physical Asset & Infra Domains]
  MConstruction2[construction-ops]
  MProperty2[property-ops]
  MHOSP2[hospitality-ops]
  MRnw2[renewable-ops]
end

subgraph FlowAndGoods[Flow of Goods & Food Chain]
  MAgr2[agriculture-ops]
  MLogistics2[logistics-ops]
  MRestaurant2[restaurant-ops / haccp-ops]
end

subgraph RiskGov[Risk, Legal & Security]
  MInsurance2[insurance-ops]
  MLegal2[legal-ops]
  MSec2[security-ops]
end

subgraph MetaSupport[Meta Ops]
  MVA2[va-dashboard]
end

%% Physical asset hierarchies
MConstruction2 --> MProperty2
MProperty2 --> MHOSP2
MConstruction2 --> MRnw2

%% Food & goods chain
MAgr2 --> MLogistics2
MLogistics2 --> MRestaurant2
MAgr2 --> MRestaurant2

%% Insurance relationships
MConstruction2 --> MInsurance2
MProperty2 --> MInsurance2
MHOSP2 --> MInsurance2
MRnw2 --> MInsurance2
MAgr2 --> MInsurance2
MLogistics2 --> MInsurance2
MRestaurant2 --> MInsurance2

%% Legal overlays (dashed = governance/contract layer)
MConstruction2 -.-> MLegal2
MProperty2 -.-> MLegal2
MHOSP2 -.-> MLegal2
MRnw2 -.-> MLegal2
MAgr2 -.-> MLegal2
MLogistics2 -.-> MLegal2
MRestaurant2 -.-> MLegal2
MInsurance2 -.-> MLegal2
MSec2 -.-> MLegal2

%% Security overlays
MSec2 --> MHOSP2
MSec2 --> MProperty2
MSec2 --> MConstruction2
MSec2 --> MLogistics2
MSec2 --> MRestaurant2
MSec2 --> MRnw2

%% VA dashboard as cross-domain orchestrator
MVA2 -. orchestrates .-> MConstruction2
MVA2 -. orchestrates .-> MLogistics2
MVA2 -. orchestrates .-> MManufacturing2[manufacturing-ops]
MVA2 -. orchestrates .-> MProperty2
MVA2 -. orchestrates .-> MRestaurant2
MVA2 -. orchestrates .-> MInsurance2
MVA2 -. orchestrates .-> MHOSP2
MVA2 -. orchestrates .-> MRnw2
MVA2 -. orchestrates .-> MLegal2
MVA2 -. orchestrates .-> MSec2
MVA2 -. orchestrates .-> MAgr2



3) Shared Primitive Entities Across Everything

This diagram shows the shared “primitive” entities that every framework/module reuses (super important for AEI graph design & Copilot CLI scaffolding).

graph TD

subgraph Primitives[Shared Primitive Entities]
  EOrg[entity: organization]
  EPerson[entity: person]
  ELocation[entity: location/site]
  EAsset[entity: asset/equipment]
  EDoc[entity: document]
  ETask[entity: task/ticket]
  EEvent[entity: event/log]
end

subgraph Frameworks[Core Frameworks]
  FFin[financial-tracking]
  FHeal[health-tracking]
  FK[knowledge-tracking]
  FRel2[relationship-tracking]
  FTask2[task-management]
end

subgraph Domains[Selected Domains]
  DConstr[construction-ops]
  DLog[logistics-ops]
  DMan[manufacturing-ops]
  DProp[property-ops]
  DRest[restaurant-ops]
  DIns[insurance-ops]
  DHosp[hospitality-ops]
  DRen[renewable-ops]
  DLeg[legal-ops]
  DSec[security-ops]
  DAgr[agriculture-ops]
end

%% Frameworks -> primitives
FFin --> EOrg
FFin --> EPerson
FFin --> EDoc
FFin --> ETask

FHeal --> EPerson
FHeal --> EEvent
FHeal --> EDoc

FK --> EDoc
FK --> EEvent

FRel2 --> EPerson
FRel2 --> EOrg

FTask2 --> ETask
FTask2 --> EEvent

%% Domains -> primitives
DConstr --> ELocation
DConstr --> EAsset
DConstr --> ETask
DConstr --> EDoc

DLog --> ELocation
DLog --> EEvent
DLog --> ETask
DLog --> EOrg

DMan --> EAsset
DMan --> ETask
DMan --> EEvent
DMan --> EDoc

DProp --> ELocation
DProp --> EPerson
DProp --> EOrg
DProp --> EDoc
DProp --> ETask

DRest --> ELocation
DRest --> EEvent
DRest --> EDoc
DRest --> ETask
DRest --> EAsset

DIns --> EPerson
DIns --> EOrg
DIns --> EDoc
DIns --> EEvent
DIns --> ETask

DHosp --> ELocation
DHosp --> EPerson
DHosp --> EEvent
DHosp --> ETask
DHosp --> EDoc

DRen --> ELocation
DRen --> EAsset
DRen --> EEvent
DRen --> ETask

DLeg --> EDoc
DLeg --> EPerson
DLeg --> EOrg
DLeg --> EEvent
DLeg --> ETask

DSec --> ELocation
DSec --> EPerson
DSec --> EEvent
DSec --> ETask
DSec --> EDoc

DAgr --> ELocation
DAgr --> EAsset
DAgr --> ETask
DAgr --> EDoc



