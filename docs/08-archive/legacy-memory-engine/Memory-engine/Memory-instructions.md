Thought for 25s
# AEI Memory–Security Code Specification

**Purpose:**  
Define how AEI generates a **single, human-readable code per entity** that encodes:

- Memory tier (transitory → canonical → archived)
- Security level (0–9) and scope
- Privacy / AI handling (cloud vs. local, export)
- Visibility / access

This code is **derived metadata** on top of:

- Memory model (transitory, temporary, short_term, long_term, canonical, archived)
- Security Classification Standard (levels 0–9, scopes, privacy flags)   

Developers must implement this as a **pure function** over existing fields (no duplication of truth).

---

## 1. Core Principles

1. The **AEI code is a compact, readable summary**, not a new source of truth.
2. It must be **deterministic**: same entity metadata → same AEI code.
3. It must be **safe to expose in logs / UIs**, even for sensitive entities (no content leakage).
4. AEI must **never downgrade security** automatically. It may propose upgrades as suggestions.
5. Memory level changes and security changes must **immediately regenerate** the AEI code.

---

## 2. Required Inputs Per Entity

Each entity must have (from existing specs):

### 2.1 Memory Fields

```yaml
memory_level: transitory | temporary | short_term | long_term | canonical | archived
stability_score: float        # 0–1
importance_score: float       # 0–1
last_active_at: datetime
user_pinned: bool

2.2 Security & Privacy Fields (from Security Classification Standard)
sensitivity:
  level: 0-9                  # master sensitivity index
  scope: public_group | shareable_group | internal_group | secret_group | compartmentalized_group
  privacy:
    cloud_ai_allowed: bool
    local_ai_allowed: bool
    export_allowed: bool
  group_access: [string]      # optional
  visibility: public | internal | user | restricted

risk:
  probability_damage: 1-5
  severity_damage: 1-5

control:
  requires_human_approval: bool
  requires_audit_log: bool
  AEI_restriction_mode: permissive | cautious | hardened


AEI generates the AEI code string from these.

3. Code Structure

We define a standard, parseable format:

MEM:[MEM_CODE] | SEC:[SENS_LEVEL]-[SCOPE_CODE] | AI:[AI_CODE] | EXP:[EXP_CODE] | VIS:[VIS_CODE]


Example:

MEM:ST | SEC:4-PERS | AI:LOC | EXP:NO | VIS:USER


This code is stored as:

aei_code: "MEM:ST | SEC:4-PERS | AI:LOC | EXP:NO | VIS:USER"

3.1 Memory Codes (MEM:)
memory_level	MEM_CODE	Meaning
transitory	TR	< 48h, not stabilized
temporary	TMP	> 48h, at least 1 incidental link
short_term	ST	actively referenced, growing links
long_term	LT	multi-domain, secure paths
canonical	CN	near-100% certainty, pinned
archived	AR	deprecated / historical only

Mapping rule:

if memory_level == "transitory"  → MEM:TR
if memory_level == "temporary"   → MEM:TMP
if memory_level == "short_term"  → MEM:ST
if memory_level == "long_term"   → MEM:LT
if memory_level == "canonical"   → MEM:CN
if memory_level == "archived"    → MEM:AR

3.2 Security Codes (SEC:)

The security segment encodes:

sensitivity.level (0–9)

scope compressed into one of a few short tokens

Scope → code mapping:

scope	SCOPE_CODE
none / omitted	GEN
public_group	PUB
shareable_group	SHR
internal_group	INT
secret_group	SEC
compartmentalized_group	CMP

SEC code pattern:

SEC:[sensitivity.level]-[SCOPE_CODE]


Examples:

Level 1, public_group → SEC:1-PUB

Level 4, user-only personal finance (no group) → SEC:4-PERS (see below)

Level 7, compartmentalized project → SEC:7-CMP

Special-case: for purely personal entities where sensitivity.level >= 3 and visibility: user, AEI may normalize scope to PERS inside the code for readability, even if scope is not explicitly set.

3.3 AI Handling Codes (AI:)

This captures AI routing:

Inputs:

sensitivity.level

sensitivity.privacy.cloud_ai_allowed

sensitivity.privacy.local_ai_allowed

control.AEI_restriction_mode

AI_CODE:

Condition	AI_CODE	Meaning
level in 0–2 and cloud+local allowed	FULL	cloud + local allowed
cloud_ai_allowed = false, local_ai_allowed = true	LOC	local-only AI
level ≥ 8 or (cloud=false & local=false)	NONE	no AI processing
level in 4–7 and AEI_restriction_mode = hardened	META	metadata-only (no body content)
level in 3–7 and AEI_restriction_mode = cautious, local=true	LOC-C	local-only, cautious mode

Resolution precedence (from most restrictive to least):

If level ≥ 8 OR (cloud_ai_allowed == false AND local_ai_allowed == false) → AI:NONE

Else if AEI_restriction_mode == hardened → AI:META

Else if cloud_ai_allowed == false AND local_ai_allowed == true:

if AEI_restriction_mode == cautious → AI:LOC-C

else → AI:LOC

Else (cloud & local allowed, low sensitivity) → AI:FULL

3.4 Export Codes (EXP:)

Using sensitivity.privacy.export_allowed:

Condition	EXP_CODE
export_allowed = true	YES
export_allowed = false	NO

So:

EXP:YES   # can leave the vault (e.g. export to other tools)
EXP:NO    # must remain inside vault

3.5 Visibility Codes (VIS:)

Based on sensitivity.visibility:

visibility	VIS_CODE
public	PUB
internal	INT
user	USER
restricted	RST

If group_access is non-empty and visibility is internal, AEI may switch to:

VIS:GRP to indicate group-limited visibility.

Rule:

if visibility == "public"      → VIS:PUB
if visibility == "internal"    → VIS:INT (or VIS:GRP if group_access not empty)
if visibility == "user"        → VIS:USER
if visibility == "restricted"  → VIS:RST

4. Putting It Together – Examples
4.1 Personal Finance Note (Private, Local AI only)
memory_level: short_term
sensitivity:
  level: 4
  scope: null
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: false
  visibility: user


AEI-derived code:

MEM:ST | SEC:4-PERS | AI:LOC | EXP:NO | VIS:USER

4.2 Public Documentation Page
memory_level: long_term
sensitivity:
  level: 1
  scope: public_group
  privacy:
    cloud_ai_allowed: true
    local_ai_allowed: true
    export_allowed: true
  visibility: public


AEI-derived code:

MEM:LT | SEC:1-PUB | AI:FULL | EXP:YES | VIS:PUB

4.3 Highly Sensitive Legal File (Eyes-Only)
memory_level: long_term
sensitivity:
  level: 8
  scope: compartmentalized_group
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: false
    export_allowed: false
  visibility: restricted
control:
  AEI_restriction_mode: hardened


AEI-derived code:

MEM:LT | SEC:8-CMP | AI:NONE | EXP:NO | VIS:RST

4.4 Archived, Non-Veritable Info
memory_level: archived
sensitivity:
  level: 2
  scope: internal_group
  privacy:
    cloud_ai_allowed: true
    local_ai_allowed: true
    export_allowed: false
  visibility: internal


AEI code:

MEM:AR | SEC:2-INT | AI:FULL | EXP:NO | VIS:INT

5. AEI Responsibilities
5.1 On Ingest (AEI_INGEST)

When a new entity is created:

Initialize memory fields:

memory_level: transitory
stability_score: 0.1
importance_score: 0.1
last_active_at: now
user_pinned: false


Set default security if user does not specify:

For clearly public sources (RSS feeds, public web pages):

sensitivity.level = 0–1, scope = public_group, visibility = public

For personal notes, journals, finance, health:

minimum sensitivity.level = 3–4, visibility = user

Derive AEI code from the above and store in aei_code.

Rule: AEI_INGEST must not assign a sensitivity level lower than what a template or user explicitly provides.

5.2 On Correlation & Memory Evolution (AEI_CORRELATE)

Whenever AEI:

Adds relationship evidence

Updates relationship confidence

Promotes/demotes memory_level

Adjusts stability_score or importance_score

AEI must:

Recompute AEI code for the affected entity.

Ensure that security-related fields are not relaxed automatically:

e.g., no auto downgrade from level 4 → 3.

If AEI detects that risk is higher than implied (e.g. PII or bank info in a level-2 file), it:

Suggests raising sensitivity.level, not lowering.

5.3 On Security Updates

If the user or policy engine updates:

sensitivity.level

privacy flags

visibility

group_access

control.AEI_restriction_mode

Then:

AEI immediately recomputes aei_code.

AEI adjusts behavior accordingly:

e.g. if AI code becomes AI:NONE, AEI must stop reading content, only keep minimal metadata.

6. Implementation Guide (Developers)
6.1 Core Function

Implement a pure function:

function computeAeiCode(
  memory_level: string,
  sensitivity: {
    level: number,
    scope?: string,
    privacy: {
      cloud_ai_allowed: boolean,
      local_ai_allowed: boolean,
      export_allowed: boolean
    },
    visibility: string,
    group_access?: string[]
  },
  control?: {
    AEI_restriction_mode?: "permissive" | "cautious" | "hardened"
  }
): string


This returns a string like:

"MEM:ST | SEC:4-PERS | AI:LOC | EXP:NO | VIS:USER"

6.2 Call Sites

AEI_INGEST: after assigning initial memory + security, call computeAeiCode and write aei_code.

AEI_CORRELATE: after each memory promotion/demotion or relationship update that changes memory_level, call computeAeiCode.

Security/Policy Engine: after any changes to sensitivity or privacy, also call computeAeiCode.

6.3 Logging

For debug:

When logging AEI actions, log only:

uid

type

aei_code

memory_level

sensitivity.level

Never log sensitive body content in AEI logs.

7. Developer Checklist

 Implement computeAeiCode() exactly as specified.

 Make AEI code derived only (no user manual edits).

 Ensure all entity templates include memory_level and sensitivity sections.

 Ensure all entities created via CLI or AEI get a valid aei_code.

 Integrate AEI code into:

Debug logs

Developer dashboards

Optional UI badges (not required but recommended)

8. Summary

This specification defines how every entity in the Second Brain Foundation system will have a single, readable AEI code that encodes:

Memory tier and stability

Security level and scope

AI routing (cloud/local/none)

Export and visibility policy

This allows your AEI engines, tools, and UIs to:

Quickly understand how to treat each entity,

Respect privacy and security constraints,

And reason about memory evolution in a consistent, auditable way.