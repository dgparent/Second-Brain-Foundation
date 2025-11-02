# Second Brain Foundation Knowledge Architecture

## 1. Context & Purpose
This defines a complete graph-based Markdown knowledge architecture for the **Second Brain Foundation**, integrating principles from professional knowledge management, AI augmentation, and semantic data modeling. It unifies structures potentially compatible with **Obsidian**, **NotebookLM**, and **AnythingLLM**, ensuring context-aware privacy, human oversight, and interoperability.

---

## 2. Objectives
- **Progressive organization (48h lifecycle):** Temporary notes mature or dissolve into structured entities within 48 hours.
- **Context-aware privacy:** Entities carry embedded permissions (`cloud_ai`, `local_ai`, `export`).
- **Human override supremacy:** All AI inferences and merges defer to `override.human_last` and `checksum` tracking.
- **Cross-platform portability:** Uniform Markdown schema usable across multiple AI-enhanced platforms.
- **Ontology-driven graph model:** Entities interlinked through typed relationships and consistent metadata.

---

## 3. Core Entities

| Type | Description |
|------|--------------|
| **Topic** | Conceptual knowledge or theory. |
| **Project** | Goal-driven coordinated work. |
| **Person / Org** | Human or organizational actors. |
| **Place** | Geographic or operational context. |
| **Source** | Research paper, file, or dataset. |
| **Artifact** | Produced material (document, design, code). |
| **Process** | Method, SOP, or workflow. |
| **Event** | Temporal activity or session. |
| **Daily Note** | Entry point for raw capture (zero-decision stage). |
| **Experiment** | Structured test, R&D, or analysis. |
| **Task** | Actionable element with ownership. |
| **Policy / Standard** | Governance and sensitivity model. |
| **AEI Session** | Automated Extraction & Inference log. |
| **Privacy Context** | Defined permission schema or rule set. |

---

## 4. Universal Parameters

| Parameter | Description |
|------------|-------------|
| `uid` | Stable universal ID. |
| `type` | Entity classification. |
| `title`, `aliases` | Human-readable identifiers. |
| `created`, `updated` | Temporal metadata. |
| `lifecycle.state` | Capture, transitional, permanent. |
| `lifecycle.review_at` | Scheduled review date. |
| `sensitivity.level` | Public, personal, confidential, secret. |
| `privacy.permissions` | Cloud/local/export visibility. |
| `provenance.sources` | Evidence and citations. |
| `rel` | Relationships to other entities. |
| `confidence` | AI inference confidence. |
| `status` | Active, planned, paused, done, archived. |
| `importance` | Priority score (1–5). |
| `owner`, `stakeholders` | Responsible parties. |
| `bmom` | Because–Meaning–Outcome–Measure statement. |
| `checksum` | Edit integrity hash. |
| `override.human_last` | Human decision timestamp. |
| `tool.compat` | Cross-platform compatibility markers. |

---

## 5. Relationship Model

### Standard Edge Types
```
[informs]       concept ? project
[uses]          process ? artifact
[occurs_at]     project ? place
[authored_by]   artifact ? person
[cites]         artifact ? source
[subproject_of] project ? project
[duplicates]    entity ? entity
```

### Example
```
rel:
  - [informs, topic_vacuum_roasting, project_horizon_coffee]
  - [uses, process_fermentation, equipment_lab_chamber]
```

---

## 6. Privacy & Sensitivity Model

| Level | Description | AI / Export Permissions |
|--------|--------------|--------------------------|
| **Public** | Safe for cloud indexing. | Cloud ? / Local ? / Export ? |
| **Personal** | Private workspace data. | Cloud ? / Local ? / Export ? |
| **Confidential** | Sensitive internal use. | Cloud ? / Local ? / Export (limited) |
| **Secret** | Restricted. | Cloud ? / Local ? / Export ? |

---

## 7. 48-Hour Lifecycle Logic

1. **Capture Stage:** All new notes default to `lifecycle.state: capture`.
2. **Transitional Stage:** AI/AEI classifies and links detected entities.
3. **Permanent Stage:** After 48h or manual confirmation, contents dissolve into relevant Topics, Projects, or Logs.
4. **Dissolution Control:** `dissolve_at` timestamp + `override.human_last` override authority.

---

## 8. Metrics & Governance

| Metric | Purpose |
|---------|----------|
| Node Degree | Connectivity health. |
| Orphan Count | Detect isolated notes. |
| Tag Density | Consistency of taxonomy. |
| Reciprocity Ratio | Bidirectional link audit. |
| Sensitivity Violations | Cloud-unsafe content checks. |
| Review Staleness | Age since last `updated` or `review_at`. |

---

## 9. Structural Layout
```
/00_Meta/ontology.yaml
/01_Topics/
/02_Projects/
/03_People_Orgs/
/04_Places/
/05_Sources/
/06_Artifacts/
/07_Processes/
/08_Events/
/09_Experiments/
/10_Tasks/
/Daily/
```

---

## 10. Example YAML Templates

Each entity has a reusable Markdown front-matter header with the parameters and relationships defined in the schema. See the **Second Brain Templates** document for detailed YAML blueprints of all 11 core entities and the ontology definition.

---

## 11. Downloadable Vault Package
A ready-to-use `.zip` archive has been produced containing:
- Full folder hierarchy.
- `ontology.yaml` master file.
- Template `.md` files for each entity type.

?? **Download:** [SecondBrainVault.zip](sandbox:/mnt/data/SecondBrainVault.zip)

---

## 12. Implementation Notes
- **Cross-Compatibility:** Works seamlessly with Dataview, Templater, and NotebookLM ingestion.
- **Auditability:** All AI actions logged in AEI sessions for review.
- **Interoperability:** Fields formatted as YAML to allow JSON-LD or RDF export.
- **Expandability:** Ontology can extend with domain-specific entities like `Equipment`, `Material`, `Regulation`, or `Dataset`.

