# Content Subscription Map Use Case

## Overview
This use case defines a unified system for tracking all digital content sources a person follows—YouTube channels, newsletters, blogs, podcasts, Reddit subs, Discord servers, X (Twitter) accounts, and RSS feeds. It centralizes a person’s knowledge inputs into a single graph, enabling better filtering, prioritization, and connection to hobbies, projects, and research topics.

---

## User Goals
- Maintain a complete list of content sources they follow across platforms.
- Categorize sources by topic, quality, frequency, and relevance.
- Track what content has been consumed and what remains unread/unwatched.
- Link content sources to projects, hobbies, research topics, and goals.
- Identify information overload and prune low‑value subscriptions.

---

## Problems & Pain Points
- Subscriptions scattered across dozens of platforms.
- Users forget why they followed a channel or subscribed to a newsletter.
- No global “attention map” that shows which topics dominate their intake.
- Hard to manage content backlog and prioritize meaningful consumption.

---

## Data Requirements
- **Source metadata:** name, platform, URL, topic category, frequency.
- **Content items:** videos, posts, episodes, threads, newsletters.
- **Engagement state:** unread, watching, saved, archived.
- **Relationships:** linked projects, research topics, hobbies.
- **Quality signals:** rating, priority, influence.

---

## Entity Model
### Entity: `hobby.content_source`
### Entity: `hobby.channel`
### Entity: `hobby.community`

Key relationships:
- `publishes`: content (videos, posts, newsletters)
- `relevant_to`: hobby projects, research topics
- `belongs_to_category`: topic classifications
- `associated_with`: communities (Discord/Reddit)

---

## YAML Example — Content Source (YouTube)
```yaml
---
uid: yt-coffee-vision
type: hobby.content_source
title: "Coffee Vision"
platform: youtube
url: "https://youtube.com/@coffeevision"
category: coffee_science
frequency: weekly
priority: high
tags:
  - brewing
  - r_and_d
notes: "Excellent breakdowns of extraction theory"
linked_projects:
  - hobbyproj-vacuum-roaster-v1
sensitivity: normal
---
```

---

## YAML Example — Community (Discord)
```yaml
---
uid: discord-llm-builders
type: hobby.community
name: "LLM Builders Discord"
platform: discord
invite_url: "https://discord.gg/example"
topics:
  - ai
  - mcp_tools
relevance: high
linked_projects:
  - sbf-agent-cli-research
notes: "Useful for new MCP extensions and tool integrations"
sensitivity: normal
---
```

---

## Integration Architecture
### YouTube Data API
- Pull channel metadata and latest videos.
- Track watch state via manual or synced logs.

### Reddit API
- Import saved posts and subscribed subreddits.

### Discord API
- Bot to track activity in selected channels.

### RSS / Newsletters
- Parse via RSS feeds or email integrations.

### Podcasts
- Parse OPML or RSS feeds

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Readwise Reader | Multi‑source ingestion | Closed cloud | SBF = local-first & graph-based |
| Feedly / Inoreader | Strong RSS tools | Limited cross‑platform intake | SBF unifies everything |
| YouTube Subscriptions | Easy tracking | Single-platform | SBF cross‑domain linking |

---

## SBF Implementation Notes
- CLI: `sbf new hobby.content_source`.
- AEI can detect redundant sources and suggest pruning.
- Dashboard: content map by platform and topic.
- Cross-domain: connect sources → research, hobby projects, personal goals.

