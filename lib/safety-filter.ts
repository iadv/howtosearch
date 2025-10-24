/**
 * Safety Filter for Content Moderation
 * Blocks unethical, unlawful, and immoral queries
 */

interface SafetyResult {
  isSafe: boolean;
  category?: string;
  severity?: string;
  matchedTerms?: string[];
}

// Normalize text for better matching
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Remove accents and special characters
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Leetspeak mapping
  const leetMap: Record<string, string> = {
    '1': 'i', '!': 'i', '|': 'i',
    '0': 'o', '3': 'e', '4': 'a',
    '@': 'a', '5': 's', '$': 's',
    '7': 't'
  };
  
  normalized = normalized.split('').map(char => leetMap[char] || char).join('');
  
  return normalized;
}

// Violence & Homicide
const VIOLENCE_KEYWORDS = [
  'kill', 'killing', 'murder', 'assassinate', 'execute', 'slaughter',
  'behead', 'lynch', 'strangle', 'poison', 'arson', 'acid attack',
  'honor killing', 'supari', 'hitman', 'contract killing'
];

const VIOLENCE_PATTERNS = [
  /\bk[\W_]*[i1|!][\W_]*ll\b/i,
  /\bmur[\W_]*d[\W_]*er\b/i,
  /\bassassinat(e|ion|or)?\b/i,
  /\bpoison(ing)?\b/i,
  /\barson\b/i,
  /\bacid[\W_]*attack\b/i
];

// Self-harm & Suicide
const SELF_HARM_KEYWORDS = [
  'suicide', 'self harm', 'self-harm', 'kill myself', 'end my life',
  'cutting', 'hang myself', 'overdose', 'unalive myself'
];

const SELF_HARM_PATTERNS = [
  /\bsu[\W_]*[i1][\W_]*c[\W_]*[i1][\W_]*de\b/i,
  /\b(unalive|end)[\W_]*(my|your|their)[\W_]*life\b/i,
  /\bover[\W_]*dose\b/i
];

// Sexual Exploitation of Minors
const CSAM_KEYWORDS = [
  'child porn', 'teen sex', 'underage sex', 'minor nude', 'jailbait',
  'young girl nude', 'young boy nude'
];

const CSAM_PATTERNS = [
  /\b(child|kid|minor|under\s*age|teen)\s*(porn|sex|nude)/i,
  /\b(lo+li|sho+ta)\b/i
];

// Sexual Violence
const SEXUAL_VIOLENCE_KEYWORDS = [
  'rape', 'raping', 'date rape', 'sexual assault', 'roofie',
  'spike drink', 'nonconsensual'
];

const SEXUAL_VIOLENCE_PATTERNS = [
  /\brap(e|ing|ist)\b/i,
  /\broofi(e|ng)\b/i,
  /\bspik(e|ing)\s*(drink|beverage)\b/i
];

// Weapons & Explosives
const WEAPONS_KEYWORDS = [
  'make a bomb', 'pipe bomb', 'ied', 'explosive',
  'thermite', 'napalm', 'ghost gun', 'unregistered gun',
  '3d printed gun', 'silencer'
];

const WEAPONS_PATTERNS = [
  /\bb[0o]mb\b/i,
  /\bpipe\s*bomb\b/i,
  /\b(i|l)ed\b/i,
  /\bthermite\b/i,
  /\bghost\s*gun\b/i,
  /\b3d\s*print(ed)?\s*gun\b/i,
  /\bsilenc(er|e)\b/i,
  /\bmake\s*(a\s*)?bomb\b/i
];

// Drugs & Illicit Substances
const DRUGS_KEYWORDS = [
  'cook meth', 'make meth', 'make cocaine', 'grow opium',
  'dmt extraction', 'lsd synthesis', 'pill press'
];

const DRUGS_PATTERNS = [
  /\b(cook|make|synth(esize)?)\s*(meth|methamphetamine|lsd|cocaine)\b/i,
  /\bfentanyl\b/i,
  /\bpill\s*press\b/i
];

// Cybercrime
const CYBERCRIME_KEYWORDS = [
  'ddos', 'dos attack', 'botnet', 'keylogger', 'rat malware',
  'zero day exploit', 'credential stuffing', 'ransomware',
  'phishing kit', 'carder'
];

const CYBERCRIME_PATTERNS = [
  /\bdd?dos\b/i,
  /\bbot\s*net\b/i,
  /\bkey\s*logg?er\b/i,
  /\brat\s*(malware|tool)?\b/i,
  /\bsql\s*injection\b/i,
  /\bransom\s*ware\b/i,
  /\bphishing\s*kit\b/i,
  /\bcredential\s*stuffing\b/i
];

// Financial Crime & Fraud
const FRAUD_KEYWORDS = [
  'fake id', 'counterfeit money', 'skimmer', 'embezzle',
  'wire fraud', 'money mule', 'check washing', 'tax fraud'
];

const FRAUD_PATTERNS = [
  /\bfake\s*(id|passport|license)\b/i,
  /\bcounterfeit\s*(money|cash|bills?)\b/i,
  /\b(card|atm)\s*skimmer\b/i,
  /\b(check)\s*wash(ing)?\b/i,
  /\bwire\s*fraud\b/i
];

// Hate & Extremism
const HATE_KEYWORDS = [
  'genocide', 'ethnic cleansing', 'neo-nazi', 'kkk',
  'join isis', 'pledge to isis', 'white power'
];

const HATE_PATTERNS = [
  /\bgenocide\b/i,
  /\bethnic\s*cleansing\b/i,
  /\b(gas|kill)\s*the\s+[a-z]+\b/i,
  /\bneo[-\s]*nazi\b/i,
  /\bkkk\b/i,
  /\b(join|pledge)\s*(isis|al[-\s]*qaeda|boko\s*haram)\b/i
];

// Privacy Violations & Stalking
const STALKING_KEYWORDS = [
  'dox', 'doxx', 'track phone without consent', 'stalk',
  'hidden camera', 'airtag someone', 'spy on spouse'
];

const STALKING_PATTERNS = [
  /\bdox+x?\b/i,
  /\b(track|monitor|spy)\s*(phone|device|partner|spouse)\b/i,
  /\bhidden\s*camera\b/i,
  /\bair\s*tag\s*(someone|car|bag)\b/i
];

// Bio/Chem Hazards
const BIOCHEM_KEYWORDS = [
  'ricin', 'sarin', 'vx', 'mustard gas', 'homemade napalm',
  'make anthrax', 'bioweapon', 'pathogen culture'
];

const BIOCHEM_PATTERNS = [
  /\bricin\b/i, /\bsarin\b/i, /\bvx\b/i, /\bmustard\s*gas\b/i,
  /\b(make|grow)\s*anthrax\b/i, /\bbioweapon\b/i
];

// Risky "How To" Combinations 'how to', 'best way to', 'steps to', 'guide to',
//  'tips to', 'methods to', 'tutorial to'
const HOW_TO_VERBS = [
  'best way to', 'steps to', 'guide to',
  'tips to', 'methods to'
];

const VIOLENT_OBJECTS = [
  'kill', 'hurt', 'harm', 'disable', 'maim', 'attack',
  'assault', 'poison', 'burn', 'blow up'
];

const VULNERABLE_TARGETS = [
  'people', 'neighbor', 'partner',
  'spouse', 'teacher', 'boss', 'child', 'children'
];

// Allowlist for legitimate contexts
const ALLOWLIST_PATTERNS = [
  /\bkill\s+(a\s+process|the\s+app|the\s+server|a\s+task)\b/i, // Software context
  /\bkill\s+switch\b/i, // Safety feature
  /\bkill\s+bill\b/i, // Movie title
  /\bbomb\s+calorimeter\b/i, // Chemistry apparatus
  /\bacid\s+test\b/i, // Idiom/test
  /\bshoot\s+(a\s+photo|video|footage)\b/i, // Photography
  /\bexecute\s+(a\s+program|code|script|query)\b/i, // Programming
  /\bhack\s+(growth|a\s+solution)\b/i, // Business/productivity
];

/**
 * Check if text matches allowlist (legitimate contexts)
 */
function isAllowlisted(text: string): boolean {
  const normalized = normalizeText(text);
  return ALLOWLIST_PATTERNS.some(pattern => pattern.test(normalized));
}

/**
 * Check text against a category
 */
function checkCategory(
  text: string,
  keywords: string[],
  patterns: RegExp[],
  categoryName: string
): SafetyResult | null {
  const normalized = normalizeText(text);
  const matched: string[] = [];
  
  // Check keywords
  for (const keyword of keywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
  }
  
  // Check regex patterns
  for (const pattern of patterns) {
    if (pattern.test(normalized)) {
      matched.push(pattern.source);
    }
  }
  
  if (matched.length > 0) {
    return {
      isSafe: false,
      category: categoryName,
      severity: 'block',
      matchedTerms: matched
    };
  }
  
  return null;
}

/**
 * Check risky "How To" combinations
 */
function checkRiskyHowTo(text: string): SafetyResult | null {
  const normalized = normalizeText(text);
  
  // Check if it's a "how to" query
  const hasHowTo = HOW_TO_VERBS.some(verb => normalized.includes(verb));
  
  if (!hasHowTo) return null;
  
  // Check for violent objects
  const hasViolentObject = VIOLENT_OBJECTS.some(obj => 
    new RegExp(`\\b${obj}\\b`, 'i').test(normalized)
  );
  
  // Check for vulnerable targets
  const hasVulnerableTarget = VULNERABLE_TARGETS.some(target =>
    new RegExp(`\\b${target}\\b`, 'i').test(normalized)
  );
  
  if (hasViolentObject || hasVulnerableTarget) {
    return {
      isSafe: false,
      category: 'risky_howto_combination',
      severity: 'block',
      matchedTerms: ['how_to + violence/harm']
    };
  }
  
  return null;
}

/**
 * Main safety check function
 */
export function checkSafety(text: string): SafetyResult {
  // First check allowlist - if matched, it's safe
  if (isAllowlisted(text)) {
    return { isSafe: true };
  }
  
  // Check all categories
  const checks = [
    checkCategory(text, VIOLENCE_KEYWORDS, VIOLENCE_PATTERNS, 'violence_homicide'),
    checkCategory(text, SELF_HARM_KEYWORDS, SELF_HARM_PATTERNS, 'self_harm_suicide'),
    checkCategory(text, CSAM_KEYWORDS, CSAM_PATTERNS, 'sexual_exploitation_minors'),
    checkCategory(text, SEXUAL_VIOLENCE_KEYWORDS, SEXUAL_VIOLENCE_PATTERNS, 'sexual_violence'),
    checkCategory(text, WEAPONS_KEYWORDS, WEAPONS_PATTERNS, 'weapons_explosives'),
    checkCategory(text, DRUGS_KEYWORDS, DRUGS_PATTERNS, 'drugs_illicit'),
    checkCategory(text, CYBERCRIME_KEYWORDS, CYBERCRIME_PATTERNS, 'cybercrime'),
    checkCategory(text, FRAUD_KEYWORDS, FRAUD_PATTERNS, 'financial_crime'),
    checkCategory(text, HATE_KEYWORDS, HATE_PATTERNS, 'hate_extremism'),
    checkCategory(text, STALKING_KEYWORDS, STALKING_PATTERNS, 'privacy_stalking'),
    checkCategory(text, BIOCHEM_KEYWORDS, BIOCHEM_PATTERNS, 'bio_chem_hazard'),
    checkRiskyHowTo(text),
  ];
  
  // Return first violation found
  for (const check of checks) {
    if (check && !check.isSafe) {
      return check;
    }
  }
  
  // All checks passed
  return { isSafe: true };
}

/**
 * Get safety rejection message
 */
export function getSafetyMessage(category?: string): string {
  return "I cannot provide assistance with that request. I'm designed to help with safe, legal, and ethical 'how-to' questions. Please ask about something constructive and positive!";
}

/**
 * Log safety violation (for monitoring)
 */
export function logSafetyViolation(
  query: string,
  result: SafetyResult,
  userId?: string
): void {
  console.warn('🛡️ Safety filter triggered:', {
    category: result.category,
    severity: result.severity,
    matchedTerms: result.matchedTerms,
    queryHash: hashString(query),
    timestamp: new Date().toISOString(),
    userIdHash: userId ? hashString(userId) : 'anonymous'
  });
}

// Simple hash function for privacy
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

