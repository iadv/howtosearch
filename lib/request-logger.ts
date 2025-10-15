/**
 * Request Logger for Legal Compliance
 * Captures IP, user agent, geolocation, and other metadata
 */

import { NextRequest } from 'next/server';

export interface RequestMetadata {
  ip_address: string;
  ip_hash: string; // Hashed for privacy
  user_agent: string;
  country?: string;
  city?: string;
  region?: string;
  referrer?: string;
  request_id: string;
  timestamp: string;
}

/**
 * Extract IP address from request
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIp(req: NextRequest): string {
  // Check common proxy headers in order of preference
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  const trueClientIp = req.headers.get('true-client-ip');
  
  // x-forwarded-for can contain multiple IPs (client, proxy1, proxy2)
  // Take the first one (original client)
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Vercel specific
  if (realIp) return realIp;
  
  // Cloudflare specific
  if (cfConnectingIp) return cfConnectingIp;
  
  // Other CDN/proxy
  if (trueClientIp) return trueClientIp;
  
  // Fallback to connection remote address (rare)
  return 'unknown';
}

/**
 * Hash IP address for privacy compliance
 * Uses SHA-256 to anonymize while allowing correlation
 */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + process.env.IP_HASH_SALT || 'default-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get geolocation from Vercel Edge headers
 */
export function getGeolocation(req: NextRequest): {
  country?: string;
  city?: string;
  region?: string;
} {
  return {
    country: req.headers.get('x-vercel-ip-country') || undefined,
    city: req.headers.get('x-vercel-ip-city') || undefined,
    region: req.headers.get('x-vercel-ip-country-region') || undefined,
  };
}

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract all request metadata for logging
 */
export async function getRequestMetadata(req: NextRequest): Promise<RequestMetadata> {
  const ip = getClientIp(req);
  const geo = getGeolocation(req);
  
  return {
    ip_address: ip,
    ip_hash: await hashIp(ip),
    user_agent: req.headers.get('user-agent') || 'unknown',
    country: geo.country,
    city: geo.city,
    region: geo.region,
    referrer: req.headers.get('referer') || undefined,
    request_id: generateRequestId(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if IP is from a suspicious source
 * (VPN, Tor, known bad actors)
 */
export function isSuspiciousIp(ip: string): boolean {
  // Common Tor exit node patterns
  if (ip.startsWith('185.220.') || ip.startsWith('199.249.')) {
    return true;
  }
  
  // Add your own blacklist/whitelist logic here
  // You can integrate with services like:
  // - ipqualityscore.com
  // - getipintel.net
  // - abuseipdb.com
  
  return false;
}

/**
 * Format metadata for database storage
 */
export function formatMetadataForDb(metadata: RequestMetadata): {
  ip_address: string;
  ip_hash: string;
  user_agent: string;
  country?: string;
  city?: string;
  region?: string;
  referrer?: string;
  request_id: string;
} {
  return {
    ip_address: metadata.ip_address,
    ip_hash: metadata.ip_hash,
    user_agent: metadata.user_agent,
    country: metadata.country,
    city: metadata.city,
    region: metadata.region,
    referrer: metadata.referrer,
    request_id: metadata.request_id,
  };
}

/**
 * Privacy compliance: Anonymize old IP addresses
 * Should be run periodically (e.g., after 90 days)
 */
export async function anonymizeOldIps(daysOld: number = 90): Promise<void> {
  // This would be run as a scheduled job
  console.log(`Anonymizing IPs older than ${daysOld} days for GDPR compliance`);
  // Implementation would update database to replace IPs with hashes only
}

/**
 * Export user data for GDPR/CCPA compliance
 */
export async function exportUserData(ipHash: string): Promise<any> {
  // Implementation would gather all data associated with this user
  // for data portability requests
  return {
    message: 'User data export - implement based on your requirements',
    ipHash,
  };
}

/**
 * Delete user data for GDPR/CCPA compliance
 */
export async function deleteUserData(ipHash: string): Promise<void> {
  // Implementation would delete/anonymize all data associated with this user
  // for right to be forgotten requests
  console.log(`Deleting user data for IP hash: ${ipHash}`);
}

