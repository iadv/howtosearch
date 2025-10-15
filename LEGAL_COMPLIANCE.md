# Legal Compliance & Data Logging

This document outlines the comprehensive logging system implemented for legal compliance, law enforcement cooperation, and data protection regulations.

## 📋 Overview

The application automatically logs all user interactions with detailed metadata to comply with:
- ✅ **DMCA** (Digital Millennium Copyright Act)
- ✅ **GDPR** (General Data Protection Regulation)
- ✅ **CCPA** (California Consumer Privacy Act)
- ✅ **COPPA** (Children's Online Privacy Protection Act)
- ✅ **Computer Fraud and Abuse Act**
- ✅ **Terms of Service enforcement**
- ✅ **Law enforcement requests**

## 🗄️ Data Collected

### For Every Request

| Field | Description | Purpose |
|-------|-------------|---------|
| **ip_address** | User's IPv4/IPv6 address | Identity verification, abuse tracking |
| **ip_hash** | SHA-256 hash of IP + salt | Privacy-preserving correlation |
| **user_agent** | Browser/device information | Device tracking, bot detection |
| **country** | ISO country code (e.g., US, GB) | Geolocation, jurisdiction |
| **city** | City name | Geolocation refinement |
| **region** | State/province | Regional compliance |
| **referrer** | HTTP referrer URL | Traffic source analysis |
| **request_id** | Unique identifier | Request tracing, debugging |
| **timestamp** | Request time (UTC) | Timeline reconstruction |
| **user_message** | Full query text | Content moderation, context |
| **assistant_response** | AI response | Quality assurance, liability |

## 🔐 Privacy Protections

### IP Address Hashing
```typescript
// IP addresses are hashed for privacy
ip_hash = SHA256(ip_address + secret_salt)
```

**Benefits:**
- Correlate requests from same user
- No personally identifiable IP storage (after anonymization)
- Compliant with GDPR's pseudonymization requirements

### Data Retention Policy

| Data Type | Retention | After Expiry |
|-----------|-----------|--------------|
| Full IP Address | 90 days | Replaced with hash only |
| IP Hash | Indefinite | Used for analytics |
| User Messages | 1 year | Archived/deleted |
| Geolocation | 90 days | Anonymized |
| Request IDs | 1 year | For audit trails |

### Anonymization Schedule
Run this periodically (recommended: daily cron job):
```sql
-- Anonymize IPs older than 90 days
UPDATE chat_logs 
SET ip_address = NULL 
WHERE created_at < NOW() - INTERVAL '90 days' 
AND ip_address IS NOT NULL;

UPDATE image_logs 
SET ip_address = NULL 
WHERE created_at < NOW() - INTERVAL '90 days' 
AND ip_address IS NOT NULL;
```

## ⚖️ Legal Requests

### Law Enforcement Requests

When served with a valid subpoena or warrant, you can provide:

```sql
-- Get all data for a specific IP
SELECT 
  created_at,
  ip_address,
  user_agent,
  country,
  city,
  user_message,
  assistant_response,
  request_id
FROM chat_logs
WHERE ip_hash = 'HASH_FROM_WARRANT'
ORDER BY created_at DESC;

-- Get all data within a timeframe
SELECT *
FROM chat_logs
WHERE ip_hash = 'HASH_FROM_WARRANT'
AND created_at BETWEEN '2025-01-01' AND '2025-01-31';
```

### DMCA Takedown Compliance

If content is flagged for DMCA violation:
```sql
-- Find all instances of copyrighted content
SELECT *
FROM chat_logs
WHERE user_message ILIKE '%specific copyrighted term%'
OR assistant_response ILIKE '%specific copyrighted term%';
```

### Terms of Service Violations

Track repeat offenders:
```sql
-- Count violations by IP hash
SELECT 
  ip_hash,
  country,
  COUNT(*) as violation_count,
  array_agg(user_message) as violations
FROM chat_logs
WHERE model = 'safety-filter'
AND created_at > NOW() - INTERVAL '30 days'
GROUP BY ip_hash, country
HAVING COUNT(*) > 5
ORDER BY violation_count DESC;
```

## 👤 GDPR/CCPA User Rights

### Right to Access (Data Export)

```sql
-- Export all user data
SELECT 
  created_at,
  user_message,
  assistant_response,
  country,
  city,
  user_agent
FROM chat_logs
WHERE ip_hash = 'USER_IP_HASH'
ORDER BY created_at DESC;
```

### Right to Erasure (Delete)

```sql
-- Delete all user data
DELETE FROM chat_logs WHERE ip_hash = 'USER_IP_HASH';
DELETE FROM image_logs WHERE ip_hash = 'USER_IP_HASH';
DELETE FROM audit_logs WHERE ip_hash = 'USER_IP_HASH';
```

### Right to Rectification

```sql
-- Update incorrect data
UPDATE chat_logs
SET user_message = '[REDACTED BY USER REQUEST]',
    assistant_response = '[REDACTED BY USER REQUEST]'
WHERE ip_hash = 'USER_IP_HASH';
```

## 🚨 Abuse Detection

### Identify Suspicious Activity

```sql
-- High volume from single IP
SELECT 
  ip_hash,
  ip_address,
  country,
  COUNT(*) as request_count,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM chat_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_hash, ip_address, country
HAVING COUNT(*) > 100
ORDER BY request_count DESC;

-- Safety filter violations
SELECT 
  ip_hash,
  country,
  COUNT(*) as blocked_count,
  array_agg(DISTINCT error) as violation_types
FROM chat_logs
WHERE model = 'safety-filter'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_hash, country
ORDER BY blocked_count DESC;
```

### Geographic Analysis

```sql
-- Requests by country
SELECT 
  country,
  COUNT(*) as requests,
  COUNT(DISTINCT ip_hash) as unique_users
FROM chat_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY country
ORDER BY requests DESC;
```

## 🔍 Audit Logging

All data access events are logged:

```typescript
// Log data export for GDPR request
INSERT INTO audit_logs (event_type, ip_hash, details)
VALUES ('gdpr_export', 'USER_HASH', '{"request_id": "123", "date": "2025-10-15"}');

// Log data deletion
INSERT INTO audit_logs (event_type, ip_hash, details)
VALUES ('gdpr_deletion', 'USER_HASH', '{"deleted_rows": 42}');

// Log law enforcement request
INSERT INTO audit_logs (event_type, ip_hash, details)
VALUES ('law_enforcement', 'USER_HASH', '{"agency": "FBI", "case": "2025-001"}');
```

## 📊 Analytics Queries

### Safety Filter Effectiveness

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_blocked,
  COUNT(DISTINCT ip_hash) as unique_violators,
  json_object_agg(
    SPLIT_PART(error, ': ', 2), 
    COUNT(*)
  ) as violations_by_category
FROM chat_logs
WHERE model = 'safety-filter'
AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Geographic Risk Analysis

```sql
SELECT 
  country,
  COUNT(*) FILTER (WHERE model = 'safety-filter') as violations,
  COUNT(*) as total_requests,
  ROUND(
    COUNT(*) FILTER (WHERE model = 'safety-filter')::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as violation_rate
FROM chat_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY country
HAVING COUNT(*) > 100
ORDER BY violation_rate DESC;
```

## 🛡️ Security Best Practices

### 1. Environment Variables
```bash
# Required in .env.local or Vercel
DATABASE_URL=postgresql://...
IP_HASH_SALT=your-random-secret-salt-here
```

**Important:** The `IP_HASH_SALT` should be:
- Cryptographically random
- Never changed (breaks hash correlation)
- Kept secret
- Backed up securely

### 2. Access Control

Limit database access:
```sql
-- Create read-only user for analytics
CREATE USER analytics_readonly WITH PASSWORD 'secure_password';
GRANT SELECT ON chat_logs, image_logs TO analytics_readonly;

-- Create compliance user for legal requests
CREATE USER legal_compliance WITH PASSWORD 'secure_password';
GRANT SELECT, UPDATE, DELETE ON chat_logs, image_logs, audit_logs TO legal_compliance;
```

### 3. Monitoring

Set up alerts for:
- ⚠️ High violation rates from specific IPs
- ⚠️ Unusual geographic patterns
- ⚠️ Sudden spikes in traffic
- ⚠️ Safety filter bypasses

## 📜 Required Legal Notices

### Privacy Policy

Your privacy policy MUST disclose:
1. **What data is collected**: IP, location, device info, queries
2. **Why it's collected**: Security, compliance, service improvement
3. **How long it's kept**: Retention periods outlined above
4. **User rights**: Access, deletion, rectification (GDPR/CCPA)
5. **Data sharing**: Who gets access (law enforcement, etc.)

### Terms of Service

Your ToS MUST include:
1. **Prohibited uses**: Reference to safety filter categories
2. **Monitoring**: Disclosure that interactions are logged
3. **Cooperation with law enforcement**: Subpoena compliance
4. **Data retention**: How long logs are kept
5. **Geographic restrictions**: If blocking certain countries

## 📞 Contact Information

For legal requests:
- **DMCA Agent**: [Your designated agent]
- **Legal Department**: legal@yourdomain.com
- **Data Protection Officer**: dpo@yourdomain.com (GDPR requirement)

## ⚡ Quick Reference

| Task | Command |
|------|---------|
| Export user data | See "Right to Access" SQL |
| Delete user data | See "Right to Erasure" SQL |
| Find IP hash | `SELECT DISTINCT ip_hash FROM chat_logs WHERE ip_address = 'X.X.X.X'` |
| View violations | `SELECT * FROM chat_logs WHERE model = 'safety-filter'` |
| Anonymize old IPs | See "Anonymization Schedule" SQL |
| Audit trail | `SELECT * FROM audit_logs WHERE ip_hash = 'HASH'` |

---

**Disclaimer**: This documentation provides technical implementation details. Consult with legal counsel to ensure full compliance with applicable laws in your jurisdiction.

