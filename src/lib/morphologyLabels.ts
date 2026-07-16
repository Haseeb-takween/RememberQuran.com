/** Human-readable labels for Quranic Arabic Corpus POS tags and feature codes */

export const POS_LABELS: Record<string, string> = {
  N: "Noun",
  PN: "Proper Noun",
  ADJ: "Adjective",
  ADV: "Adverb",
  V: "Verb",
  PRO: "Pronoun",
  PRON: "Pronoun",
  DEM: "Demonstrative Pronoun",
  REL: "Relative Pronoun",
  DET: "Definite Article",
  P: "Preposition",
  CONJ: "Conjunction",
  CCONJ: "Coordinating Conjunction",
  SUB: "Subordinating Particle",
  PART: "Particle",
  NEG: "Negative Particle",
  CERT: "Certainty Particle",
  EMPH: "Emphasis Particle",
  RET: "Retraction Particle",
  EXH: "Exhortation Particle",
  PREV: "Preventive Particle",
  INC: "Inceptive Particle",
  SUSP: "Surprise Particle",
  SUR: "Surprise Particle",
  AMD: "Amendment Particle",
  EXP: "Explanation Particle",
  INT: "Interrogative Particle",
  FUT: "Future Particle",
  RES: "Resumption Particle",
  VOC: "Vocative Particle",
  EXC: "Exception Particle",
  CIR: "Circumstantial Particle",
  IMPN: "Imperative Noun",
  T: "Time Adverb",
  LOC: "Location Adverb",
  CAUS: "Causative Particle",
  ACT_PCPL: "Active Participle",
  PASS_PCPL: "Passive Participle",
  VN: "Verbal Noun",
  INL: "Letter",
}

export const FEATURE_LABELS: Record<string, string> = {
  // Case
  NOM: "Nominative",
  GEN: "Genitive",
  ACC: "Accusative",
  // Number
  SG: "Singular",
  DU: "Dual",
  PL: "Plural",
  // Gender
  M: "Masculine",
  F: "Feminine",
  // State
  DEF: "Definite",
  INDEF: "Indefinite",
  // Verb aspect
  PERF: "Perfect",
  IMPF: "Imperfect",
  IMPV: "Imperative",
  IMP: "Imperative",
  // Verb voice
  ACT: "Active",
  PASS: "Passive",
  // Verb mood
  IND: "Indicative",
  SUBJ: "Subjunctive",
  JUS: "Jussive",
  // Person
  "1P": "1st Person",
  "2P": "2nd Person",
  "3P": "3rd Person",
  // Pronoun/suffix specifics
  "1S": "1st Person Singular",
  "2MS": "2nd Person Masculine Singular",
  "2FS": "2nd Person Feminine Singular",
  "3MS": "3rd Person Masculine Singular",
  "3FS": "3rd Person Feminine Singular",
  "2D": "2nd Person Dual",
  "3MD": "3rd Person Masculine Dual",
  "3FD": "3rd Person Feminine Dual",
  "2MP": "2nd Person Masculine Plural",
  "2FP": "2nd Person Feminine Plural",
  "3MP": "3rd Person Masculine Plural",
  "3FP": "3rd Person Feminine Plural",
}

const VF_LABELS: Record<string, string> = {
  "1": "Form I", "2": "Form II", "3": "Form III", "4": "Form IV",
  "5": "Form V", "6": "Form VI", "7": "Form VII", "8": "Form VIII",
  "9": "Form IX", "10": "Form X",
}

const MOOD_LABELS: Record<string, string> = {
  IND: "Indicative", SUBJ: "Subjunctive", JUS: "Jussive",
}

export function humanizePOS(pos: string): string {
  return POS_LABELS[pos] ?? pos
}

export function humanizeFeatures(features: string[]): string[] {
  return features
    .filter((f) => f && f !== "SP" && f !== "PART")
    .map((f) => {
      if (f.startsWith("VF:")) return VF_LABELS[f.slice(3)] ?? f
      if (f.startsWith("MOOD:")) return MOOD_LABELS[f.slice(5)] ?? f.slice(5)
      return FEATURE_LABELS[f] ?? f
    })
}
