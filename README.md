
# Smurfatcher

## Deterministic Graph-Based Money Muling Detection Engine

**Live Demo:** [Insert Live URL]
**GitHub Repository:** [Insert Repo URL]
**Demo Video:** [Insert LinkedIn Video URL]

---

## Overview

MuleCatcher is a web-based financial forensics engine designed to detect money muling networks using structural graph analysis.

Rather than analyzing transactions in isolation, MuleCatcher models transaction flow as a directed network and identifies coordinated laundering structures including circular routing, smurfing aggregation, and layered shell chains.

The system is deterministic, explainable, and performance-aware. It generates structured analytical indicators to support compliance investigation workflows rather than automatically declaring fraud.

---

## Problem Understanding

Money muling is not a single-transaction anomaly.
It is a coordinated network behavior.

Illicit funds are routed across multiple accounts through layered paths to obscure origin and ownership. Traditional rule-based SQL queries and isolated anomaly detection systems struggle to detect such multi-hop structures.

Effective detection requires:

* Network-level modeling
* Structural pattern detection
* Temporal enforcement
* Ring-level investigation
* Controlled false-positive management
* Explainable scoring

MuleCatcher addresses these requirements directly.

---

## Detection Architecture

### 1. Directed Graph Modeling

* Accounts are represented as nodes
* Transactions are represented as directed edges (sender → receiver)
* The dataset becomes a transaction network

This representation enables structural laundering detection beyond flat rule queries.

---

### 2. Circular Fund Routing (Cycle Detection 3–5 Nodes)

Detects bounded cycles such as:

A → B → C → A

Circular routing is commonly used in the layering stage of money laundering.

Cycle detection is bounded to ensure scalability and controlled computational cost.

All accounts within a detected cycle are grouped into the same fraud ring.

---

### 3. Smurfing Detection (Fan-In / Fan-Out Within 72 Hours)

Detects:

* 10+ senders to one receiver within 72 hours
* One sender to 10+ receivers within 72 hours

Strict temporal enforcement ensures that structural velocity is captured rather than simple high-volume activity.

---

### 4. Layered Shell Chain Detection

Identifies transaction chains of 3 or more hops where intermediate accounts have minimal transaction history.

Low-activity intermediaries often function as temporary pass-through layers in laundering schemes.

---

### 5. Fraud Ring Formation

Suspicious accounts connected through structural patterns are merged into fraud rings.

This mirrors real AML case workflows, where investigations are case-centric rather than account-centric.

---

## Suspicion Scoring Methodology

Each suspicious account receives a **suspicion_score (0–100)** based on:

* Structural pattern type detected
* Multi-pattern reinforcement
* Temporal compression
* Role within the network

Scoring characteristics:

* Fully deterministic
* Transparent logic
* No black-box machine learning
* Traceable risk attribution

Suspicion scores are sorted in descending order as required by the problem statement.

---

## False Positive Controls

To meet precision requirements and avoid over-flagging legitimate activity:

* Single-pattern signals do not automatically escalate to high risk
* Multi-pattern reinforcement increases confidence
* High-volume distributions are evaluated conservatively
* Output remains advisory rather than declarative

The system supports investigator decision-making without replacing it.

---

## AI Interpretation Layer

MuleCatcher includes an optional AI interpretation layer designed to enhance clarity without altering detection logic.

The AI component does not influence:

* Pattern detection
* Ring formation
* Suspicion scoring
* Risk classification

All core detection remains deterministic.

### Purpose

The AI layer generates:

* Executive case summaries
* Structural explanations of detected patterns
* Risk context interpretation
* Suggested next investigation steps

This reduces cognitive load for non-technical reviewers while preserving full transparency.

### Architecture

```
CSV Upload
   ↓
Validation
   ↓
Graph Construction
   ↓
Pattern Detection
   ↓
Ring Formation
   ↓
Deterministic Risk Scoring
   ↓
Structured JSON Output
   ↓
AI Interpretation (Read-Only)
   ↓
Frontend Display
```

The AI model reads structured output only.
It cannot modify detection results or risk scores.

This separation ensures auditability and regulatory defensibility.

---

## What Differentiates This Approach

Many fraud detection systems rely on anomaly scoring or static thresholds.

MuleCatcher differentiates itself through:

**1. Structural Coordination Modeling**
Focuses on coordinated network behavior rather than isolated anomalies.

**2. Deterministic and Explainable Logic**
Every score is derived from explicit structural signals.

**3. Ring-Centric Investigation Model**
Fraud rings are prioritized over individual accounts.

**4. Multi-Pattern Reinforcement Strategy**
Higher risk classifications require overlapping structural signals, improving precision.

**5. Performance-Conscious Engineering**
Bounded cycle detection ensures scalability within the 30-second constraint for datasets up to 10,000 transactions.

---

## Output Schema Compliance

The backend strictly adheres to the required JSON format:

* suspicious_accounts
* fraud_rings
* summary

All mandatory fields are included:

* account_id
* suspicion_score
* detected_patterns
* ring_id
* risk_score
* processing_time_seconds

A downloadable JSON file is provided.

---

## Interactive Visualization

The application provides:

* Directed transaction graph
* Clearly highlighted fraud rings
* Visually distinct suspicious accounts
* Ring summary table
* Clickable node-level details

Visualization prioritizes clarity and interpretability.

---

## Performance

Designed to process up to 10,000 transactions within the required 30-second limit.

Performance optimizations include:

* Bounded cycle detection
* Efficient graph traversal
* Controlled subgraph rendering
* No heavy ML computation

Processing time is recorded and displayed.

---

## Technology Stack

Frontend

* React / Next.js
* TypeScript
* Vercel

Backend

* FastAPI
* NetworkX
* Pandas

Deployment

* Vercel (Frontend)
* Render (Backend)

---

## Known Limitations

* Thresholds are rule-based rather than statistically calibrated
* Transaction amount weighting can be further expanded
* Batch processing only (no streaming ingestion)
* No external enrichment (KYC, sanctions, geography)

These areas can be extended in a production deployment.

---

## Usage

1. Upload CSV file with required schema
2. Run analysis
3. Review fraud rings and suspicious accounts
4. Explore transaction graph
5. Download JSON output

---

## Disclaimer

All outputs are analytical indicators intended for compliance review.
Final decisions require human investigation.

---

## Team

komal gupta
ananya gupta
samridhi 

### Positioning Statement

MuleCatcher models money muling as coordinated network behavior rather than isolated anomalies, enabling explainable, case-centric financial investigation within strict performance and compliance constraints.

