# Source Intelligence & Credibility Mapping Use Case

## Overview
This use case establishes a structured framework for evaluating the credibility, bias, reliability, and historical performance of information sources—news outlets, journalists, research institutions, influencers, YouTube creators, Reddit communities, Discord groups, newsletters, and niche blogs. It enables the user to maintain a living intelligence profile of all major sources that shape their worldview.

---

## User Goals
- Evaluate and classify information sources by credibility, bias, and expertise.
- Track a source’s historical accuracy, tone, and patterns of reporting.
- Identify which sources influence which domains (finance, health, politics, AI, hobbies).
- Detect signals vs. noise and reduce low-quality information intake.
- Maintain a trust graph that evolves as sources change.

---

## Problems & Pain Points
- Users consume information from unvetted or inconsistent sources.
- Bias and reliability vary dramatically between platforms.
- No tools create longitudinal credibility scores.
- Social media surfaces content based on virality, not truthfulness.
- Hard to identify which sources have proven accurate over time.

---

## Data Requirements
- **Source metadata:** name, platform, topic domain.
- **Credibility metrics:** accuracy, bias, expertise, transparency.
- **Historical logs:** changes in reliability, controversies, notable reports.
- **Relationships:** articles, research topics, assets, topics influenced.
- **Community indicators:** upvotes, user reputation, moderation quality.

---

## Entity Model
### Entity: `info.source`
### Entity: `info.source_profile`
### Entity: `info.source_evaluation`

Key relationships:
- `publishes`: articles, videos, threads
- `evaluated_by`: source_evaluation
- `influences`: topics, assets, projects

---

## YAML Example — Source Profile
```yaml
---
uid: sourceprofile-politico-eu
type: info.source_profile
source_uid: source-politico
topic_domains:
  - politics
  - regulation
credibility_score: 8.7
bias_rating: "center-left"
expertise_rating: 9.2
transparency: high
historical_accuracy: 8.5
notes: "Consistent and well-sourced reporting."
last_evaluated: 2025-11-10
---
```

---

## YAML Example — Source Evaluation
```yaml
---
uid: sourceeval-politico-2025-11
type: info.source_evaluation
source_uid: source-politico
date: 2025-11-10
criteria:
  accuracy: 9
  bias: 4
  transparency: 8
  expertise: 9
  evidence_quality: 8
summary: |
  Politico maintains a high level of reporting quality with strong sourcing.
  Slight bias detection but overall reliable.
recommendations:
  - "Continue monitoring EU regulatory reporting"
  - "Tag articles for AI governance and macro policy"
sensitivity: normal
---
```

---

## Integration Architecture
### RSS & News APIs
- Pull source metadata from feeds.

### Social Media Metadata
- Analyze engagement metrics from Reddit, YouTube, X.

### AI-Assisted Evaluation
- AEI computes credibility heuristics:
  - Citation density
  - Factual consistency with other sources
  - Sentiment & bias analysis
  - Historical correction tracking

### Browser Plugin (Future)
- Evaluate sources while browsing.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| NewsGuard | Manual expert ratings | Subscription & limited scope | SBF builds personal trust map |
| Media Bias Fact Check | Broad database | Mixed methodology | SBF contextualizes to user domains |
| Ad-hoc user filtering | Intuitive | No structure | SBF structured, longitudinal credibility profiles |

---

## SBF Implementation Notes
- CLI: `sbf new info.source_profile`, `sbf new info.source_evaluation`.
- AEI: track changes in source reliability; detect anomalies in reporting tone.
- Dashboard: trust graph, bias map, topic influence network.
- Cross-domain ties: finance decisions, health misinformation guardrails, research quality.

