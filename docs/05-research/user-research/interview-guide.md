# User Interview Guide - Validation Sprint
**Second Brain Foundation - Validation Sprint**

**Date:** November 8, 2025  
**Analyst:** Mary (Business Analyst)  
**Purpose:** Validate demand, pricing, and product-market fit through interviews  

---

## 🎯 Interview Objectives

**Primary Goals:**
1. **Validate the problem exists** (Do they actually have this pain?)
2. **Gauge willingness to pay** (Would they pay? How much?)
3. **Understand current workflow** (What do they do now?)
4. **Identify must-have features** (What would make them switch?)
5. **Uncover objections** (What would prevent them from using this?)

**Secondary Goals:**
1. Get testimonials for landing page
2. Recruit beta testers
3. Build email list of early advocates
4. Understand competitive landscape from user perspective

---

## 👥 Interview Participants

### Target: 20-30 Interviews

**Who to Interview:**

**Tier 1 (Priority - 15 interviews):**
- People who signed up with email
- People who commented "I'd pay for this"
- People who asked detailed questions

**Tier 2 (Secondary - 5 interviews):**
- People who were skeptical/critical
- People who said "I already have a solution"
- People from different user segments (developer vs researcher vs writer)

**Tier 3 (Background - 5-10 interviews):**
- People from other communities (r/PKMS, r/selfhosted)
- Friends/colleagues who use PKM tools
- People who DON'T have the problem (to validate it's real)

### Recruitment Message Template

**For Email Signups:**
```
Subject: Quick 15-min chat about Second Brain Foundation?

Hi [Name],

Thanks for signing up for updates on Second Brain Foundation!

I'm conducting 20 user interviews to make sure I'm building something people actually want. Would you be willing to hop on a 15-minute call this week?

I'll ask about:
- Your current note-taking workflow
- Pain points with organizing knowledge
- What features would make you actually use (and pay for) a tool like this

In exchange, you'll get:
- Early access to beta (when ready)
- Lifetime discount if you decide to purchase
- Direct input on what gets built

Available times: [Calendly link]

No pressure if you're too busy - your signup alone is valuable feedback!

Thanks,
[Your Name]
```

**For Reddit Comments:**
```
Hey [username],

Really appreciated your comment on my r/ObsidianMD post about Second Brain Foundation.

I'm doing 20 user interviews to validate this idea before building. Would you be up for a quick 15-min chat?

I'd love to understand:
- Your current workflow
- Whether this actually solves a problem for you
- What you'd need to see to actually use it

Happy to work around your schedule: [Calendly link]

Thanks!
```

---

## 📋 Interview Structure (15-20 minutes)

### Part 1: Introduction (2 minutes)

**Your Opening:**
```
Hi [Name], thanks so much for making time!

Just to set expectations: This is a 15-20 minute conversation. I'm trying to validate whether Second Brain Foundation solves a real problem before I spend 6-12 months building it.

There are no right or wrong answers - I'm just trying to understand your workflow and pain points. Be as honest and critical as you want. It helps me more than being polite!

I'll take notes, but this won't be recorded unless you're okay with it. Sound good?

Great! Let's start with some background...
```

**Build Rapport:**
- Ask where they're based
- What they do for work
- How they found the post/landing page
- Quick icebreaker about PKM (when did you start?)

---

### Part 2: Current Workflow (5 minutes)

**Goal:** Understand their existing system and pain points

#### Question 1: Note-Taking Setup
"Tell me about your current note-taking setup. What tools do you use?"

**Listen for:**
- Primary tool (Obsidian, Notion, Logseq, etc.)
- Secondary tools (Readwise, Zotero, etc.)
- How long they've been using it
- Satisfaction level (happy vs frustrated)

**Follow-ups:**
- "What do you love about [tool]?"
- "What frustrates you about [tool]?"
- "Have you tried other tools? Why did you switch?"

---

#### Question 2: Organization Workflow
"Walk me through how you organize your notes. What's your process?"

**Listen for:**
- Proactive organization (tags, folders, manual filing)
- Reactive organization (search when needed)
- No organization (capture and forget)
- Automated organization (Dataview, scripts)

**Follow-ups:**
- "How much time do you spend organizing per week?"
- "Do you actually follow your organization system?"
- "What happens when you don't organize?"

---

#### Question 3: The Pain Point
"What's the most frustrating thing about your current workflow?"

**Listen for:**
- Time spent organizing
- Finding notes later
- Forgetting to organize
- Too many unorganized notes
- System complexity
- Privacy concerns with AI tools

**Follow-ups:**
- "How often does this frustration come up?"
- "What have you tried to solve it?"
- "If you could wave a magic wand, what would fix this?"

**🚨 RED FLAG:** If they say "nothing, I'm pretty happy" → Ask why they signed up for updates!

---

### Part 3: Validation Questions (8 minutes)

**Goal:** Gauge interest in YOUR solution specifically

#### Question 4: Problem Recognition
"I described Second Brain Foundation as solving the 'too many daily notes, never organized' problem. Do you have this problem?"

**Listen for:**
- Yes, it's a major problem (STRONG SIGNAL)
- Yes, but I've found workarounds (MEDIUM SIGNAL)
- Not really, I organize as I go (WEAK SIGNAL)
- No, I don't capture much (WRONG AUDIENCE)

**Follow-ups (if YES):**
- "How many unorganized notes do you have right now?"
- "What stops you from organizing them?"
- "How much of a problem is this on a scale of 1-10?"

**Follow-ups (if NO):**
- "What's your secret? How do you stay organized?"
- "Was this ever a problem in the past?"
- "Do you know anyone who has this problem?"

---

#### Question 5: Privacy Concern Validation
"One of the main features is privacy-aware AI - choosing what notes AI can see. Does that matter to you?"

**Listen for:**
- "Yes, absolutely!" (STRONG SIGNAL)
- "Yeah, I guess that's nice to have" (WEAK SIGNAL)
- "Not really, I trust cloud AI" (NO SIGNAL)
- "I'd never use AI with my notes" (WRONG AUDIENCE)

**Follow-ups (if YES):**
- "Why? What kind of notes do you want to keep private?"
- "Have you avoided using AI tools because of privacy?"
- "Would you use local AI (Ollama) vs cloud AI (OpenAI)?"

**Follow-ups (if NO):**
- "Are all your notes public/shareable?"
- "Do you have work notes, personal notes, confidential info?"
- "Would you care if someone read all your notes?"

---

#### Question 6: Feature Prioritization
"I'm going to list 5 features. Tell me which 2 would make you MOST likely to use this."

**The Features:**
1. **Progressive organization** - AI suggests entity extraction after 48 hours
2. **Privacy controls** - Granular permissions for what AI can see
3. **Local AI support** - Process notes locally with Ollama/LMStudio
4. **Typed relationships** - Semantic graph (not just backlinks)
5. **Works with existing notes** - Import from Obsidian/Notion/etc.

**Listen for:**
- Which 2 they pick (shows priorities)
- Why they pick them (shows reasoning)
- What they DON'T pick (shows what's not important)

**Follow-up:**
- "Why those two specifically?"
- "Would you use it without [feature they didn't pick]?"
- "What feature is MISSING from this list?"

---

#### Question 7: The Competitive Landscape
"What have you tried to solve this problem already?"

**Listen for:**
- Obsidian plugins (Dataview, Templater, etc.)
- Other tools (Capacities, Reflect, Notion AI)
- Manual workflows (tagging systems, folder structures)
- Nothing (they've given up)

**Follow-ups:**
- "Why didn't [X] work for you?"
- "What would need to be different for you to switch?"
- "What does [X] do better than what I'm proposing?"

---

### Part 4: Willingness to Pay (3 minutes)

**Goal:** Validate pricing and gauge purchase intent

#### Question 8: Value Perception
"If this existed today and solved your problem, how much would you expect to pay?"

**DON'T suggest prices first. Let them answer.**

**Listen for:**
- Dollar amount ($X/month or $X one-time)
- Payment preference (subscription vs one-time)
- Comparison to other tools ("I pay $X for Obsidian Sync")
- Free expectations ("I'd only use it if free")

**Follow-ups:**
- "Would you prefer monthly subscription or one-time purchase?"
- "At what price point would you definitely NOT buy?"
- "At what price point would it feel like a steal?"

---

#### Question 9: Van Westendorp Pricing (The Money Question)
"I'm going to ask 4 quick pricing questions. Just give me the first number that comes to mind."

**The 4 Questions (ask in order):**

1. **Too Cheap:** "At what price would you think it's too cheap to be good quality?"
   - Record: $____

2. **Bargain:** "At what price would you think it's a great deal?"
   - Record: $____

3. **Getting Expensive:** "At what price would you think it's getting expensive, but you'd still consider it?"
   - Record: $____

4. **Too Expensive:** "At what price is it too expensive - you wouldn't even consider it?"
   - Record: $____

**Analysis:**
- Optimal Price Point = Overlap of "bargain" and "getting expensive"
- Price Floor = "Too cheap" median
- Price Ceiling = "Too expensive" median

**Follow-up:**
"If I told you it was $99 one-time or $7/month, which would you prefer and why?"

---

#### Question 10: Purchase Intent (The Moment of Truth)
"Okay, hypothetically: If this launched tomorrow for $99 (or $7/month), would you buy it?"

**CRITICAL: WAIT FOR THEIR ANSWER. Don't fill the silence.**

**Listen for:**
- "Yes" (STRONG SIGNAL - ask for commitment)
- "Probably" (MEDIUM SIGNAL - probe objections)
- "Maybe" (WEAK SIGNAL - find out what's missing)
- "No" (IMPORTANT SIGNAL - find out why)

**Follow-ups (if YES):**
- "What would you need to see before purchasing? (Demo? Free trial?)"
- "If I offered 50% off for early supporters, would you pre-order today?"
- "Can I put you on the beta list and email when it's ready?"

**Follow-ups (if MAYBE):**
- "What would move you from 'maybe' to 'yes'?"
- "What concerns do you have?"
- "What would need to be true for this to be a no-brainer?"

**Follow-ups (if NO):**
- "Is it the price, the features, or something else?"
- "What would I need to change for you to say yes?"
- "Would you use a free version with limitations?"

---

### Part 5: Wrap-Up (2 minutes)

#### Question 11: Open Feedback
"What haven't I asked that I should have asked?"

**Listen for:**
- Feature suggestions
- Concerns about implementation
- Competitive insights
- Use cases you hadn't considered

---

#### Question 12: Testimonial Request (if positive interview)
"This has been super helpful. Would you be comfortable if I used a quote from this conversation on the landing page? Like: '[Your main pain point] - [Your Name, Your Role]'"

**If yes:**
- "What quote would you be comfortable with?"
- "How should I credit you? (Full name, first name only, anonymous?)"

---

#### Question 13: Beta Tester Recruitment
"When I build the beta, would you want early access?"

**If yes:**
- "Perfect, I'll add you to the list."
- "Any specific features you'd want to test first?"
- "Would you be willing to do a 30-min beta feedback session?"

---

#### Question 14: Referrals
"Do you know anyone else who might have this problem? Anyone I should talk to?"

**If yes:**
- "Can I mention you sent me when I reach out?"
- Get their contact info (email, Twitter, etc.)

---

**Closing:**
```
This has been incredibly valuable, thank you!

Just to recap:
- I'll email you when beta is ready (if interested)
- You'll get early access + discount
- Feel free to email me anytime with thoughts: [your email]

Is there anything else you want to share before we wrap?

Thanks so much for your time! This really helps.
```

---

## 📊 Interview Analysis Framework

### After Each Interview

**Immediately After (5 minutes):**

1. **Rate the interview:**
   - 🟢 GREEN: Strong buyer signal, would pay, clear use case
   - 🟡 YELLOW: Interested but hesitant, needs convincing
   - 🔴 RED: Not interested, wrong audience, or happy with current solution

2. **Note key quotes:**
   - Best pain point description
   - Most compelling feature feedback
   - Strongest objection
   - Pricing feedback

3. **Tag interviewee:**
   - 🎯 Beta tester: Yes/No
   - 💰 Pre-order candidate: Yes/No
   - 📣 Testimonial: Yes/No
   - 🔗 Referral source: Yes/No

---

### After 10 Interviews (Mid-Point Analysis)

**Pattern Recognition:**

| Question | Analyze This |
|----------|-------------|
| Current tools | What tools are most common? What are people switching FROM? |
| Pain points | What's the #1 pain point mentioned? (Should drive messaging) |
| Feature priority | Which 2 features got picked most? (Should be in MVP) |
| Privacy concern | What % care about privacy? (Is this a real differentiator?) |
| Pricing | What's the median "bargain" and "getting expensive" price? |
| Purchase intent | How many "yes" vs "maybe" vs "no"? (Is there demand?) |
| Objections | What are the top 3 objections? (Need to address these) |

**Decision Checkpoints:**

- **If 7+ GREEN signals (70%+):** Strong demand, continue building
- **If 5-6 GREEN signals (50-60%):** Moderate demand, refine value prop
- **If <5 GREEN signals (<50%):** Weak demand, consider pivot

**What to Look For:**
- Are the same pain points mentioned repeatedly? (Validates problem)
- Are the same features prioritized? (Validates solution)
- Is pricing consistent? (Validates business model)
- Are objections solvable? (Validates feasibility)

---

### After 20 Interviews (Final Analysis)

**Quantitative Analysis:**

| Metric | Count | Percentage | Interpretation |
|--------|-------|------------|----------------|
| **Problem Validation** | ___ have the problem | ___% | Need >60% for GO |
| **Feature Validation** | ___ picked progressive org | ___% | Most important feature |
| | ___ picked privacy controls | ___% | Second most important |
| | ___ picked local AI | ___% | Differentiator strength |
| **Pricing Validation** | Median "bargain" price | $____ | Minimum viable price |
| | Median "expensive" price | $____ | Maximum viable price |
| | Preferred model | Sub: ___%, One-time: ___% | Business model |
| **Purchase Intent** | Definite yes | ___% | Conversion estimate |
| | Probable yes | ___% | Warm leads |
| | Maybe/No | ___% | Education needed |
| **Beta Interest** | Want beta access | ___% | Beta pool size |

**Qualitative Analysis:**

**Top 3 Pain Points:**
1. ___________________________
2. ___________________________
3. ___________________________

**Top 3 Desired Features:**
1. ___________________________
2. ___________________________
3. ___________________________

**Top 3 Objections:**
1. ___________________________
2. ___________________________
3. ___________________________

**Best Testimonial Quotes:**
- "___________________________" - [Name, Role]
- "___________________________" - [Name, Role]
- "___________________________" - [Name, Role]

---

## 🚦 GO/NO-GO Decision Framework

### GREEN LIGHT (GO) - Build It
**If you see:**
- ✅ 12+ people (60%+) have the problem strongly
- ✅ 10+ people (50%+) would pay $50+
- ✅ 5+ people (25%+) would pre-order today
- ✅ Clear consensus on top 2 features
- ✅ Pricing has tight range (e.g., $79-$149)
- ✅ Objections are solvable (not fundamental)

**Action:**
- Proceed to build MVP
- Focus on top 2 features first
- Use median pricing from interviews
- Recruit beta testers from GREEN interviews
- Use testimonials on landing page

---

### YELLOW LIGHT (REFINE) - Pivot or Iterate
**If you see:**
- ⚠️ 8-11 people (40-55%) have the problem
- ⚠️ 6-9 people (30-45%) would pay
- ⚠️ 2-4 people (10-20%) would pre-order
- ⚠️ Split opinions on features (no consensus)
- ⚠️ Wide pricing range (e.g., $10-$200)
- ⚠️ Objections are common but addressable

**Action:**
- Refine value proposition (clearer messaging)
- Pick a narrower target audience (developers vs researchers)
- Test Obsidian plugin approach instead of desktop app
- Do 10 more interviews with refined pitch
- Re-assess after additional data

---

### RED LIGHT (STOP) - Don't Build
**If you see:**
- ❌ <8 people (40%>) have the problem
- ❌ <6 people (30%) would pay
- ❌ <2 people (10%) would pre-order
- ❌ No agreement on features (everyone wants different things)
- ❌ "I'd pay $0-20" (price too low to sustain)
- ❌ Fundamental objections ("I'd never trust AI with my notes")

**Action:**
- Do NOT build this
- Either:
  - Pivot to entirely different solution (e.g., templates/education instead of software)
  - Target different audience (enterprise vs individuals)
  - Solve different problem (identified in interviews)
- Thank interviewees for saving you 6-12 months
- Move on to next idea

---

## 📋 Interview Tracking Spreadsheet Template

**Create Google Sheet with these columns:**

| # | Name | Email | Source | Date | Rating | Problem? | Would Pay | Price Point | Features | Beta? | Pre-order? | Notes |
|---|------|-------|--------|------|--------|----------|-----------|-------------|----------|-------|------------|-------|
| 1 | John S | john@... | Reddit | 11/12 | 🟢 | YES (8/10) | YES | $99 one-time | Privacy, AI | YES | YES ($79) | Developer, 2K notes |
| 2 | Sarah L | sarah@... | Email | 11/13 | 🟡 | YES (5/10) | MAYBE | $7/mo | Organization | YES | NO | Researcher, price-sensitive |
| 3 | Mike D | mike@... | Reddit | 11/13 | 🔴 | NO | NO | $0 | None | NO | NO | Happy with Dataview |

**Summary Stats (auto-calculate):**
- Total Interviews: ___
- GREEN: ___ (___%)
- YELLOW: ___ (___%)
- RED: ___ (___%)
- Average Problem Severity: ___ / 10
- Would Pay: ___ (___%)
- Pre-order: ___ (___%)
- Median Price (One-time): $___
- Median Price (Monthly): $___
- Beta List Size: ___

---

## 🎯 Interview Best Practices

### DO:
- ✅ **Listen more than talk** (80/20 rule)
- ✅ **Ask open-ended questions** ("Tell me about..." not "Do you...")
- ✅ **Probe for specifics** ("Can you give me an example?")
- ✅ **Embrace silence** (let them think and fill it)
- ✅ **Ask "why" 3 times** (get to root cause)
- ✅ **Take notes during** (or record with permission)
- ✅ **Thank them genuinely** (their time is valuable)

### DON'T:
- ❌ **Pitch your solution** (you're validating, not selling)
- ❌ **Lead the witness** ("Don't you think privacy matters?")
- ❌ **Defend your idea** (accept criticism)
- ❌ **Talk about features too early** (understand problem first)
- ❌ **Skip the money question** (this is critical validation)
- ❌ **Accept "I'd probably use it"** (probe for commitment)
- ❌ **Rush through** (15-20 min minimum, go longer if valuable)

---

## 🚀 Next Steps After Interviews

**If GREEN LIGHT:**
1. Email all beta candidates: "We're building it - you're on the list"
2. Update landing page with testimonials
3. Post update to Reddit: "I interviewed 20 people - here's what I learned"
4. Negotiate with VC partner: "Validation complete, let's talk terms"
5. Begin development with clear MVP scope

**If YELLOW LIGHT:**
1. Refine messaging based on feedback
2. Do 10 more interviews with refined pitch
3. A/B test landing page messaging
4. Consider plugin vs desktop app pivot
5. Re-assess after 30 total interviews

**If RED LIGHT:**
1. Email interviewees: "Thank you for saving me 6 months"
2. Post update to Reddit: "I learned this isn't viable - here's why"
3. Pivot to different solution (templates, education, different problem)
4. Thank VC partner: "Not proceeding, but appreciate the offer"
5. Move on to next idea with lessons learned

---

**Ready to start scheduling interviews?**

Let me know if you need:
- Calendly setup help
- Email templates
- Interview recording tool recommendations
- Analysis spreadsheet template

You've got this! 🚀

---

*Interview Guide by Mary (Business Analyst)*  
*November 8, 2025*
