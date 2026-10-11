export interface FacialActionUnits {
  au4_brow_lowerer: number;      // 0 - 1 (Corrugator supercilii)
  au6_cheek_raiser: number;      // 0 - 1 (Orbicularis oculi, orbital)
  au7_lid_tightener: number;     // 0 - 1 (Orbicularis oculi, palpebral)
  au9_nose_wrinkler: number;     // 0 - 1 (Levator labii superioris alaeque nasi)
  au10_upper_lip_raiser: number; // 0 - 1 (Levator labii superioris)
  au43_eye_closure: number;      // 0 - 1 (Blink / eyelid occlusion)
  blink_latency_ms: number;      // ms
  composite_tension: number;     // 0 - 1
  pain_score: number;            // 0 - 10
}

export interface SnowflakeCitation {
  source: string;
  doi: string;
  clinical_relevance: string;
}

export interface DifferentialDiagnosis {
  disease_name: string;
  icd11: string;
  probability_pct: number;
  pathophysiology_summary: string;
}

export interface DiagnosticReport {
  primary_differential: DifferentialDiagnosis;
  secondary_differentials: Array<{
    disease_name: string;
    probability_pct: number;
    distinguishing_features: string;
  }>;
  source_linked_citations: SnowflakeCitation[];
  recommended_workup: string[];
  contraindications_and_warnings: string[];
  clinical_librarian_synthesis: string;
}

export interface SnowflakeVectorResult {
  record_id: string;
  disease_name: string;
  icd11: string;
  prevalence: string;
  cosine_similarity: number;
  clinical_abstract: string;
  recommended_workup: string[];
  contraindications: string[];
  citations: Array<{ source: string; doi: string; confidence: number }>;
}

export interface TelemetryPing {
  id: number;
  timestamp: number;
  pincode: string;
  region_name: string;
  lat: number;
  lon: number;
  symptom: string;
  severity_score: number;
  spo2: number;
  temp_c: number;
  is_outbreak?: boolean;
}

export interface DBSCANCluster {
  cluster_id: number;
  pincode: string;
  region_name: string;
  size: number;
  center_lat: number;
  center_lon: number;
  dominant_symptom: string;
  avg_severity: number;
  status: "ALERT" | "WATCH";
}

export interface EpidemicAlert {
  alert_id: string;
  status: string;
  pincode: string;
  region: string;
  epicenter_lat: number;
  epicenter_lon: number;
  cluster_size: number;
  growth_rate_pct: string;
  pathogen_signature: string;
  avg_severity: number;
  containment_directive: string;
  detected_at: number;
  dbscan_density_score: number;
}

export interface SentinelState {
  ingest_rate_ips: number;
  total_ingested: number;
  active_buffer_size: number;
  active_alert: EpidemicAlert | null;
  dbscan_clusters: DBSCANCluster[];
  pincode_breakdown: Array<{ pincode: string; count: number }>;
  symptom_breakdown: Array<{ symptom: string; count: number }>;
  recent_telemetry_sample: TelemetryPing[];
  cross_hospital_alerts?: CrossHospitalAlert[];
  surveillance_case_count?: number;
  live_internet_alerts?: LiveInternetAlert[];
}

export interface LiveInternetAlert {
  id: string;
  headline: string;
  full_title: string;
  source: string;
  published_at: string;
  web_url: string;
  feed_category: string;
  pathogen: string;
  icd11: string;
  region: string;
  pincode: string;
  severity: "CRITICAL" | "HIGH" | "ELEVATED";
  severity_score: number;
  verified_internet_source: boolean;
  fetched_at: number;
}

export interface CrossHospitalAlert {
  alert_id: string;
  status: string;
  location_pincode: string;
  location_name: string;
  district: string;
  symptom_cluster: string;
  pathogen_icd: string;
  repeat_count: number;
  threshold: number;
  window_timeframe: string;
  participating_hospitals: string[];
  containment_directive: string;
  timeline_cases: Array<{
    case_id: string;
    days_ago: string;
    hospital: string;
    symptoms: string;
  }>;
  first_detected_at: number;
  last_detected_at: number;
  severity: "CRITICAL" | "HIGH" | "ELEVATED";
  is_rapid_spam_burst?: boolean;
  verification_level?: string;
  gps_origin?: {
    lat?: number;
    lon?: number;
    accuracy_m?: number;
  };
}

export interface StoredCaseReference {
  chunk_id: string;
  dataset_source: string;
  patient_name: string;
  age: number;
  gender: string;
  blood_group: string;
  hospital: string;
  location_pincode: string;
  doctor: string;
  primary_diagnosis: string;
  icd11: string;
  admission_type: string;
  symptoms: string;
  medical_history: string;
  lab_results: string;
  medication: string;
  clinical_abstract: string;
  embedding_keywords: string[];
  stored_at: number;
  is_dynamic_reference: boolean;
}

export interface SolanaAuditRecord {
  id: string;
  tx_signature: string;
  slot: number;
  timestamp: number;
  action_type: string;
  patient_token: string;
  doctor_identity: string;
  consent_hash: string;
  proof_statement: string;
  solana_explorer_url: string;
}

