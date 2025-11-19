# AEI Mechanics Specification
This document defines the full operational design for **Auto-Entity-Intelligence (AEI)** in the Second Brain Foundation. It instructs developers how to implement ingestion, correlation, memory evolution, evidence tracking, and confidence scoring.

---

# 1. Overview
AEI is the subsystem responsible for:
- Revisiting recent vault entries
- Detecting incidental correlations between entities
- Generating relationship evidence
- Updating confidence of relationship edges
- Promoting/demoting **memory levels** of entities and relationships
- Building an evolving, self-organizing knowledge graph

This document describes the algorithms, metadata, scoring logic, and memory-level transitions.

---

# 2. Memory Levels
Each **entity** and **relationship** has a memory tier:

```
transitory (<48h)
temporary (>48h + at least 1 incidental link)
short_term (growing incidental relationships)
long_term (strong, multi-domain secured connections)
canonical (near-100% certainty or user-pinned)
archived (deprecated, invalid, or historical)
```

Entities and relationships must store:
```yaml
memory_level: transitory | temporary | short_term | long_term | canonical | archived
stability_score: float       # 0–1
importance_score: float      # 0–1
last_active_at: datetime
user_pinned: bool
```

---

# 3. Relationship & Evidence Entities
AEI stores discovered correlations explicitly.

## 3.1 Relationship Edge
```yaml
uid: rel-[source]-[target]-[type]
type: graph.relationship
source_uid: ...
target_uid: ...
relationship_type: correlates_with | related_to | affects | ...
confidence: 0.0–1.0
memory_level: temporary
stability_score: 0.5
importance_score: 0.2
evidence_score_sum: float
evidence_count: int
incidental_count: int
last_updated: datetime
evidence_refs:
  - ev-...
```

## 3.2 Evidence Event
```yaml
uid: ev-[...]
type: graph.relationship_evidence
relationship_uid: rel-...
source_entities:
  - entityA
  - entityB
evidence_type: temporal_cooccurrence | topic_similarity | shared_attribute | pattern_match | direct_reference | schema_match | third_party_bridge
score: float
incidental: true | false
entity_tiers:
  entityA: transitory
  entityB: temporary
created_at: datetime
details: "Human-readable context"
```

---

# 4. Correlation Pipeline
AEI periodically runs the correlation pass:

## 4.1 Select Recent Entities
```
IF entity.memory_level IN {transitory, temporary, short_term}
AND entity.last_active_at >= now - window
THEN include in recent_entities
```

## 4.2 Anchor Selection
For each recent entity `E`, find candidate anchors:
- core entities (long_term + canonical)
- entities referenced directly in YAML
- entities sharing:
  - tags
  - domains
  - topics
  - locations
  - overlapping timestamps
- entities with high text/embedding similarity

## 4.3 Evidence Generation
For each pair (E, A):
- Determine relationship_type
- Generate 1+ evidence events (see scoring)
- Upsert relationship and evidence
- Recompute relationship confidence
- Update memory levels

---

# 5. Scoring Model
Defines how AEI converts evidence into confidence.

## 5.1 Evidence Base Scores
Example defaults:
```
direct_reference:       0.70
schema_match:           0.55
topic_similarity:       0.40
temporal_cooccurrence:  0.30
shared_attribute:       0.25
pattern_match:          0.50
third_party_bridge:     0.35
```

## 5.2 Entity Tier Weights
```
transitory:   0.4
temporary:    0.6
short_term:   0.8
long_term:    1.0
canonical:    1.2
archived:     0.2
```

Tier factor:
```
tier_factor = min(weight(source), weight(target))
```

## 5.3 Evidence Score Formula
```
local_score = base_score
            * recency_factor
            * quality_factor
            * tier_factor
            * incidental_factor_ev
```
Where:
- recency_factor = exp(-Δt / τ)
- incidental_factor_ev = 1.0 + β (β ~ 0.1–0.2) if evidence.incidental == true

## 5.4 Relationship Confidence
```
S = Σ (local_score_i * type_weight_i)
diversity_factor = min(1.3, 1.0 + 0.05 * (#distinct evidence types - 1))
incidental_factor_rel = 1.0 + α * log(1 + incidental_count)
rel_tier_factor = weight(relationship.memory_level)

raw = S * diversity_factor * incidental_factor_rel * rel_tier_factor
confidence = 1 / (1 + exp(-k * (raw - m)))
```
Where typical values: `k = 1.0`, `m = 3.0`, `α = 0.2`.

---

# 6. Memory Level Promotion & Demotion
AEI updates memory levels of both entities and relationships.

## 6.1 Relationship Memory Transitions
```
if confidence < 0.3 AND age > 90d AND evidence_count < 3:
    memory_level = archived

elif confidence >= 0.3 AND confidence < 0.6 AND evidence_count >= 1:
    memory_level = temporary

elif confidence >= 0.6 AND connected_domains >= 2:
    memory_level = short_term

elif confidence >= 0.8 AND connected_domains >= 3 AND distinct_evidence_types >= 3:
    memory_level = long_term

if user_pinned OR explicit_confirmed:
    memory_level = canonical
```

## 6.2 Entity Memory Transitions
```
if transitory:
    if age > 48h AND relationships >= 1:
        temporary
    elif age > 7d AND relationships == 0:
        archived

if temporary:
    if confirmed_links_to_longterm >= 2:
        short_term

if short_term:
    if confirmed_relationships >= 5 AND connected_domains >= 3:
        long_term

if long_term AND user_pinned:
    canonical

if entity invalidated OR user rejects:
    archived
```

---

# 7. Additional Parameters
Developers should support:

## 7.1 Volatility Profile
```yaml
volatility_profile:
  expected_change_rate: low | medium | high
  decay_half_life_days: 30
```

## 7.2 Domain-Specific Trust Weights
```yaml
domain_trust:
  health: 0.9
  finance: 0.7
  news: 0.5
  social_media: 0.3
```

## 7.3 User Validation Hooks
```yaml
user_validation:
  status: unreviewed | confirmed | rejected
  last_reviewed_by: ...
  last_reviewed_at: ...
```

---

# 8. AEI_CORRELATE Developer Workflow

1. Identify recent entities (based on memory tier & last_active_at).
2. For each entity:
   - Find anchors (core + high-similarity)
   - Generate evidence
   - Update relationship edges
   - Recompute confidence
   - Update memory levels of entity & relationship
3. Persist updated YAML
4. Log changes so AEI_SYNTHESIZE can generate summaries

---

# 9. Summary
This specification defines all mechanics required for:
- Evidence tracking
- Confidence scoring
- Memory-level evolution
- Incidental correlation discovery

This model turns the user's knowledge vault into a **self-organizing, adaptive memory system** capable of evolving understanding over time.

