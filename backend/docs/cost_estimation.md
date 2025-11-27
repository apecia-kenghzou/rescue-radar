# AWS Serverless Cost Estimation

This document provides a monthly cost estimation for hosting the Disaster Relief SOS backend on AWS. The architecture is fully serverless, meaning you only pay for what you use, with the exception of the Web Application Firewall (WAF) which has a small fixed monthly fee.

**Region**: US East (N. Virginia) - prices may vary slightly by region.

## 1. Pricing Components

| Service | Metric | Unit Price |
| :--- | :--- | :--- |
| **AWS WAF** | Web ACL (Fixed) | $5.00 / month |
| | Per Rule (Fixed) | $1.00 / rule / month |
| | Requests | $0.60 / million requests |
| **API Gateway** | HTTP API Requests | $1.00 / million requests |
| **AWS Lambda** | Requests | $0.20 / million requests |
| (ARM64) | Duration (GB-seconds) | $0.0000133334 / GB-second |
| **DynamoDB** | Writes (On-Demand) | $1.25 / million units |
| | Reads (On-Demand) | $0.25 / million units |
| | Storage | $0.25 / GB / month |

> **Note**: Lambda pricing assumes 128MB memory and 100ms average execution time.

---

## 2. Cost Scenarios

### Scenario A: Low Traffic / Idle
*Use Case: Development, Testing, or very few emergencies.*
*   **Traffic**: 10,000 requests / month
*   **Storage**: < 1 GB

| Service | Cost Calculation | Monthly Total |
| :--- | :--- | :--- |
| **AWS WAF** | ($5 base) + ($1 rule) + ($0.60 * 0.01M reqs) | **$6.01** |
| **API Gateway** | $1.00 * 0.01M | **$0.01** |
| **Lambda** | Negligible | **<$0.01** |
| **DynamoDB** | Negligible | **<$0.01** |
| **TOTAL** | | **~$6.05** |

### Scenario B: Medium Traffic (Active)
*Use Case: Active usage during a local event.*
*   **Traffic**: 1,000,000 requests / month (approx. 23 requests/minute)
*   **Split**: 500k Writes (SOS Submissions), 500k Reads (Map Views)

| Service | Cost Calculation | Monthly Total |
| :--- | :--- | :--- |
| **AWS WAF** | $6.00 fixed + ($0.60 * 1M) | **$6.60** |
| **API Gateway** | $1.00 * 1M | **$1.00** |
| **Lambda** | ($0.20 * 1M) + Compute (~$0.17) | **$0.37** |
| **DynamoDB** | (0.5M writes * $1.25) + (0.5M reads * $0.25) | **$0.75** |
| **TOTAL** | | **~$8.72** |

### Scenario C: High Traffic (Major Disaster)
*Use Case: Widespread usage, viral sharing.*
*   **Traffic**: 10,000,000 requests / month (approx. 230 requests/minute)
*   **Split**: 2M Writes, 8M Reads (More people viewing map than submitting)

| Service | Cost Calculation | Monthly Total |
| :--- | :--- | :--- |
| **AWS WAF** | $6.00 fixed + ($0.60 * 10M) | **$12.00** |
| **API Gateway** | $1.00 * 10M | **$10.00** |
| **Lambda** | ($0.20 * 10M) + Compute (~$1.70) | **$3.70** |
| **DynamoDB** | (2M writes * $1.25) + (8M reads * $0.25) | **$4.50** |
| **TOTAL** | | **~$30.20** |

---

## 3. Cost Control & Safety

Since this is a public website, cost control is critical.

1.  **AWS WAF (Included)**: The Rate Limit rule (500 reqs / 5 mins per IP) prevents a single attacker from flooding your API and driving up costs.
2.  **API Gateway Throttling (Included)**: The template sets a global rate limit (50 requests/sec) to cap the total throughput of the system.
3.  **AWS Budgets (Recommended)**: You should set up an AWS Budget in the billing console to alert you if costs exceed a threshold (e.g., $20).

## Summary

*   **Fixed Monthly Cost**: **~$6.00** (primarily for the WAF security).
*   **Variable Cost**: Extremely low. You can serve **1 million users for less than $3.00** in additional infrastructure costs.
*   **DDoS Protection**: The WAF is the most expensive part for low traffic, but it is the **most important** for preventing unexpected bills from malicious attacks.
