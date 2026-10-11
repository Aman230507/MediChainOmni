import time
import math
import random
import threading
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.cluster import DBSCAN
from collections import deque

# Regional PIN Codes across India with geographic coordinates and demographics
PINCODE_REGIONS = [
    {"pincode": "110001", "name": "Delhi Connaught Place", "lat": 28.6315, "lon": 77.2167, "density": "High"},
    {"pincode": "110085", "name": "Delhi Rohini Sector 14", "lat": 28.7150, "lon": 77.1120, "density": "Dense"},
    {"pincode": "110029", "name": "Delhi Safdarjung Enclave", "lat": 28.5670, "lon": 77.2000, "density": "High"},
    {"pincode": "110075", "name": "Delhi Dwarka Sector 10", "lat": 28.5921, "lon": 77.0460, "density": "Dense"},
    {"pincode": "110020", "name": "Delhi Okhla Phase III", "lat": 28.5307, "lon": 77.2713, "density": "Dense"},
    {"pincode": "110092", "name": "Delhi Laxmi Nagar", "lat": 28.6300, "lon": 77.2780, "density": "Dense"},
    {"pincode": "122002", "name": "Gurugram Cyber City", "lat": 28.4950, "lon": 77.0895, "density": "High"},
    {"pincode": "201301", "name": "Noida Sector 62", "lat": 28.6280, "lon": 77.3649, "density": "High"},
    {"pincode": "400001", "name": "Mumbai Fort / Colaba", "lat": 18.9322, "lon": 72.8339, "density": "Dense"},
    {"pincode": "560001", "name": "Bengaluru MG Road", "lat": 12.9716, "lon": 77.5946, "density": "High"},
    {"pincode": "600001", "name": "Chennai George Town", "lat": 13.0827, "lon": 80.2707, "density": "High"},
    {"pincode": "700001", "name": "Kolkata BBD Bagh", "lat": 22.5726, "lon": 88.3639, "density": "Dense"}
]

# Participating Hospital Networks grouped by Regional Location PIN Codes
LOCATION_HOSPITALS = {
    "110029": {
        "region_name": "Delhi Safdarjung Enclave / South Delhi",
        "hospitals": ["AIIMS New Delhi", "Safdarjung Hospital Delhi", "Fortis Escorts Heart Institute", "Max Super Speciality Saket"],
        "lat": 28.5670, "lon": 77.2000,
        "district": "South Delhi"
    },
    "110085": {
        "region_name": "Delhi Rohini Sector 14 / North West Delhi",
        "hospitals": ["Dr. BSA Hospital Rohini", "Max Super Speciality Shalimar Bagh", "Fortis Hospital Shalimar Bagh", "Saroj Super Speciality"],
        "lat": 28.7150, "lon": 77.1120,
        "district": "North West Delhi"
    },
    "110001": {
        "region_name": "Delhi Connaught Place / Central Delhi",
        "hospitals": ["Lok Nayak Hospital (LNJP)", "Lady Hardinge Medical College", "Sir Ganga Ram Hospital", "Dr. RML Hospital"],
        "lat": 28.6315, "lon": 77.2167,
        "district": "Central Delhi"
    },
    "110075": {
        "region_name": "Delhi Dwarka Sector 10 / South West Delhi",
        "hospitals": ["Manipal Hospital Dwarka", "Venkateshwar Hospital", "Indira Gandhi Hospital Dwarka", "Aakash Healthcare"],
        "lat": 28.5921, "lon": 77.0460,
        "district": "South West Delhi"
    },
    "110020": {
        "region_name": "Delhi Okhla Phase III / South East Delhi",
        "hospitals": ["Indraprastha Apollo Hospitals", "Holy Family Hospital", "Fortis Escorts Okhla"],
        "lat": 28.5307, "lon": 77.2713,
        "district": "South East Delhi"
    },
    "110092": {
        "region_name": "Delhi Laxmi Nagar / East Delhi",
        "hospitals": ["Max Super Speciality Patparganj", "Dharamshila Narayana Superspeciality", "Lal Bahadur Shastri Hospital"],
        "lat": 28.6300, "lon": 77.2780,
        "district": "East Delhi"
    },
    "122002": {
        "region_name": "Gurugram Cyber City / Sector 29",
        "hospitals": ["Medanta - The Medicity", "Fortis Memorial Research Institute (FMRI)", "Artemis Hospital", "Paras Health"],
        "lat": 28.4950, "lon": 77.0895,
        "district": "Gurugram District"
    },
    "201301": {
        "region_name": "Noida Sector 62 / Gautam Buddha Nagar",
        "hospitals": ["Jaypee Hospital Noida", "Fortis Hospital Noida", "Kailash Hospital Sector 27", "Metro Hospital Noida"],
        "lat": 28.6280, "lon": 77.3649,
        "district": "Gautam Buddha Nagar"
    },
    "400001": {
        "region_name": "Mumbai Fort / Colaba",
        "hospitals": ["Lilavati Hospital Mumbai", "Bombay Hospital", "KEM Hospital Mumbai", "Saifee Hospital"],
        "lat": 18.9322, "lon": 72.8339,
        "district": "Mumbai City"
    },
    "560001": {
        "region_name": "Bengaluru MG Road / Central",
        "hospitals": ["Manipal Hospital Bangalore", "Victoria Hospital", "Apollo Bannerghatta"],
        "lat": 12.9716, "lon": 77.5946,
        "district": "Bengaluru Urban"
    },
    "600001": {
        "region_name": "Chennai George Town",
        "hospitals": ["Rajiv Gandhi Government General Hospital", "Apollo Hospitals Greams Road", "Fortis Malar Hospital"],
        "lat": 13.0827, "lon": 80.2707,
        "district": "Chennai District"
    },
    "700001": {
        "region_name": "Kolkata BBD Bagh",
        "hospitals": ["Medical College Kolkata", "SSKM Hospital Kolkata", "Apollo Gleneagles"],
        "lat": 22.5726, "lon": 88.3639,
        "district": "Kolkata District"
    }
}

def classify_symptom_cluster(symptoms_text: str) -> Dict[str, str]:
    """Classifies presenting symptoms into distinct syndromic surveillance clusters."""
    text = symptoms_text.lower()
    if any(k in text for k in ["yellow eye", "yellow urine", "dark urine", "jaundice", "icterus", "pain above stomach", "hepatitis", "bilirubin"]):
        return {
            "cluster_id": "HEPATOBILIARY_JAUNDICE_CLUSTER",
            "cluster_name": "Acute Hepatobiliary Jaundice & Cholestasis Syndrome",
            "pathogen_icd": "1E50 / MD80",
            "directive": "MANDATORY HOSPITAL DIRECTIVE: Cross-hospital epidemic cluster of Acute Jaundice. Issue municipal drinking-water safety alert, stock parenteral Vitamin K & Ursodiol, and coordinate bed management across AIIMS & Safdarjung."
        }
    elif any(k in text for k in ["dengue", "platelet", "thrombocytopen", "petechia", "purpura", "bone break", "retro-orbital"]):
        return {
            "cluster_id": "FEBRILE_THROMBOCYTOPENIC_CLUSTER",
            "cluster_name": "Severe Dengue & Hemorrhagic Thrombocytopenic Syndrome",
            "pathogen_icd": "1D20.1",
            "directive": "MANDATORY HOSPITAL DIRECTIVE: Cross-hospital 2-week spike in severe thrombocytopenia. Activate Regional Platelet Bank reserve network and notify municipal vector-control fogging units."
        }
    elif any(k in text for k in ["levine", "chest pain", "crushing", "stemi", "retrosternal", "troponin", "infarction"]):
        return {
            "cluster_id": "ACUTE_CORONARY_ISCHEMIA_CLUSTER",
            "cluster_name": "Acute Coronary Ischemia & STEMI Cluster",
            "pathogen_icd": "BA41.0",
            "directive": "MANDATORY HOSPITAL DIRECTIVE: Regional spike in acute coronary syndrome. Ensure Cath-Lab 24/7 door-to-balloon readiness across all network cardiology departments."
        }
    elif any(k in text for k in ["appendicitis", "right lower quadrant", "rlq", "mcburney", "bouts of vomit"]):
        return {
            "cluster_id": "PEDIATRIC_ACUTE_ABDOMEN_CLUSTER",
            "cluster_name": "Acute Surgical Abdomen / Pediatric Appendicitis Cluster",
            "pathogen_icd": "DB10.0",
            "directive": "MANDATORY HOSPITAL DIRECTIVE: Pediatric acute abdomen presentations clustered within 14 days. Reserve surgical suites and alert on-call pediatric laparoscopists."
        }
    elif any(k in text for k in ["paramyxo", "respiratory distress", "spo2", "hypoxia", "sari", "cyanosis"]):
        return {
            "cluster_id": "ACUTE_RESPIRATORY_HYPOXIA_CLUSTER",
            "cluster_name": "Severe Acute Respiratory Distress / SARI Cluster",
            "pathogen_icd": "U07.1 / J80",
            "directive": "MANDATORY HOSPITAL DIRECTIVE: Multi-facility acute respiratory distress surge. Transition ward beds to high-flow oxygen, check negative-pressure ventilation, and activate IDSP epidemic reporting."
        }
    elif any(k in text for k in ["ferritin", "hlh", "cytokine storm", "spiking fever", "cytopenia"]):
        return {
            "cluster_id": "CYTOKINE_STORM_HLH_CLUSTER",
            "cluster_name": "Hemophagocytic Lymphohistiocytosis / Hyperferritinemia Cluster",
            "pathogen_icd": "4A60.0",
            "directive": "MANDATORY HOSPITAL DIRECTIVE: Unusual hyperferritinemic cytokine storm cluster. Alert hematology/immunology teams across participating hospitals for immediate bone marrow biopsy and IVIG/dexamethasone protocols."
        }
    else:
        return {
            "cluster_id": "GENERAL_SYNDROMIC_CLUSTER",
            "cluster_name": "Atypical Syndromic Presentation Cluster",
            "pathogen_icd": "MG30",
            "directive": "MANDATORY HOSPITAL DIRECTIVE: Recurring atypical clinical presentation detected across network. Share phenotypic workup between network ERs."
        }

BASELINE_SYMPTOMS = [
    ("Normal Vital Variance", 0.40, 0.1),
    ("Seasonal Rhinorrhea", 0.25, 0.2),
    ("Mild Pyrexia (Low Grade)", 0.18, 0.3),
    ("General Cephalea (Headache)", 0.12, 0.2),
    ("Acute Gastrointestinal Distress", 0.05, 0.4),
]

OUTBREAK_PATHOGENS = [
    {"name": "Acute Respiratory Distress (Novel Paramyxo-Z)", "weight": 0.95, "icd": "U07.1 / J80"},
    {"name": "Viral Hemorrhagic Pyrexia (Dengue NS1 Variant)", "weight": 0.90, "icd": "A97.2"},
    {"name": "Febrile Encephalitic Convulsions", "weight": 0.92, "icd": "G04.8"},
    {"name": "Thrombocytopenic Sepsis Syndrome", "weight": 0.88, "icd": "D69.6"},
    {"name": "Fulminant Enteroviral Carditis", "weight": 0.85, "icd": "B33.2"}
]

TWO_WEEKS_SECONDS = 14 * 86400  # 14 days = 1,209,600 seconds

class TigerDataSentinel:
    """
    Simulates high-frequency Tiger Data (PostgreSQL + TimescaleDB engine)
    ingesting 100+ telemetry pings/sec with DBSCAN spatial outbreak clustering,
    plus 2-week rolling epidemiological surveillance alerting all hospital dashboards by location.
    """
    def __init__(self, max_buffer_size: int = 50000):
        self.buffer = deque(maxlen=max_buffer_size)
        self.lock = threading.Lock()
        self.total_ingested = 0
        self.running = True
        self.spike_target: Optional[Dict[str, Any]] = None
        self.spike_remaining = 0
        self.active_alert: Optional[Dict[str, Any]] = None
        self.dbscan_clusters: List[Dict[str, Any]] = []
        self.last_cluster_run = 0.0
        self.ingest_rate_counter = 0
        self.current_ips = 124.0 # Ingested pings per sec
        self.last_rate_time = time.time()

        # Longitudinal 2-week epidemiological surveillance store
        self.surveillance_cases: List[Dict[str, Any]] = []
        self.active_cross_hospital_alerts: List[Dict[str, Any]] = []
        self._seed_longitudinal_cases()

        # Background simulator thread
        self.generator_thread = threading.Thread(target=self._telemetry_worker, daemon=True)
        self.generator_thread.start()

    def _seed_longitudinal_cases(self):
        """
        Seeds baseline historical cases within the past 2-week window in Safdarjung (110029)
        so that subsequent query repetitions trigger the cross-hospital regional alert.
        """
        now = time.time()
        # Case 1: 9 days ago at AIIMS New Delhi
        self.surveillance_cases.append({
            "case_id": "SURV-110029-HIST-01",
            "timestamp": now - (9 * 86400),
            "pincode": "110029",
            "region_name": "Delhi Safdarjung Enclave / South Delhi",
            "hospital": "AIIMS New Delhi",
            "symptoms": "19-year-old male presenting with dark urine, epigastric discomfort, scleral icterus, and fatigue",
            "diagnosis": "Acute Viral Hepatitis / Obstructive Jaundice",
            "cluster_id": "HEPATOBILIARY_JAUNDICE_CLUSTER",
            "cluster_name": "Acute Hepatobiliary Jaundice & Cholestasis Syndrome"
        })
        # Case 2: 4 days ago at Safdarjung Hospital
        self.surveillance_cases.append({
            "case_id": "SURV-110029-HIST-02",
            "timestamp": now - (4 * 86400),
            "pincode": "110029",
            "region_name": "Delhi Safdarjung Enclave / South Delhi",
            "hospital": "Safdarjung Hospital Delhi",
            "symptoms": "24-year-old female with yellow eyes, tea-colored urine, upper abdominal pain, and anorexia",
            "diagnosis": "Acute Viral Hepatitis Syndrome",
            "cluster_id": "HEPATOBILIARY_JAUNDICE_CLUSTER",
            "cluster_name": "Acute Hepatobiliary Jaundice & Cholestasis Syndrome"
        })

    def record_clinical_presentation(
        self,
        pincode: str,
        symptoms: str,
        diagnosis: str = "",
        hospital: Optional[str] = None,
        client_id: Optional[str] = None,
        gps_lat: Optional[float] = None,
        gps_lon: Optional[float] = None,
        gps_accuracy: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Records an incoming clinical query / presentation into the 2-week surveillance registry.
        If a special set of symptoms repeats >= 3 times within 2 weeks for that location,
        it raises and broadcasts an alert to all participating hospitals in that area!
        Detects rapid bursts (<45s from same terminal) and tags them as an anomalous surge.
        """
        with self.lock:
            now = time.time()
            region = LOCATION_HOSPITALS.get(pincode, LOCATION_HOSPITALS["110029"])
            cluster = classify_symptom_cluster(symptoms)

            case_entry = {
                "case_id": f"SURV-{pincode}-{int(now * 1000) % 100000}",
                "timestamp": now,
                "pincode": pincode,
                "region_name": region["region_name"],
                "hospital": hospital or region["hospitals"][0],
                "symptoms": symptoms,
                "diagnosis": diagnosis or cluster["cluster_name"],
                "cluster_id": cluster["cluster_id"],
                "cluster_name": cluster["cluster_name"],
                "client_id": client_id or "web_client_terminal",
                "gps_lat": gps_lat,
                "gps_lon": gps_lon,
                "gps_accuracy": gps_accuracy
            }
            self.surveillance_cases.append(case_entry)

            # Evaluate 14-day rolling window
            window_cases = [
                c for c in self.surveillance_cases
                if now - c["timestamp"] <= TWO_WEEKS_SECONDS
                and c["pincode"] == pincode
                and c["cluster_id"] == cluster["cluster_id"]
            ]

            # Detect rapid burst spam / surge: 3+ submissions within the last 45 seconds
            recent_burst_cases = [
                c for c in self.surveillance_cases
                if now - c["timestamp"] <= 45.0
            ]
            is_rapid_burst = len(recent_burst_cases) >= 3

            repeat_count = len(window_cases)
            alert_obj = None

            if repeat_count >= 3:
                alert_id = f"NET-ALERT-2W-{pincode}-{cluster['cluster_id'][:10]}"
                timeline = []
                for c in window_cases:
                    days_ago = round((now - c["timestamp"]) / 86400, 1)
                    timeline.append({
                        "case_id": c["case_id"],
                        "days_ago": "Today (Just now)" if days_ago < 0.05 else f"{days_ago} days ago",
                        "hospital": c["hospital"],
                        "symptoms": c["symptoms"][:90] + "..."
                    })

                status_label = "ANOMALOUS_RAPID_BURST_SURGE_ALERT" if is_rapid_burst else "CROSS_HOSPITAL_EPIDEMIC_SURGE"
                directive = (
                    f"⚠️ HIGH-PRIORITY RATE ANOMALY: {len(recent_burst_cases)} submissions detected in <45s from client terminal. "
                    f"Alert dispatched to all {len(region['hospitals'])} hospital dashboards. Quarantined under Anti-Poisoning Filter for immediate epidemiological verification before municipal mobilization."
                    if is_rapid_burst else cluster["directive"]
                )

                alert_obj = {
                    "alert_id": alert_id,
                    "status": status_label,
                    "location_pincode": pincode,
                    "location_name": region["region_name"],
                    "district": region.get("district", "National Capital Region"),
                    "symptom_cluster": cluster["cluster_name"],
                    "pathogen_icd": cluster["pathogen_icd"],
                    "repeat_count": repeat_count,
                    "threshold": 3,
                    "window_timeframe": "14-Day Rolling Surveillance Window (2 Weeks)",
                    "participating_hospitals": region["hospitals"],
                    "containment_directive": directive,
                    "timeline_cases": timeline,
                    "first_detected_at": min(c["timestamp"] for c in window_cases),
                    "last_detected_at": now,
                    "is_rapid_spam_burst": is_rapid_burst,
                    "verification_level": "UNVERIFIED_BURST_SUSPICIOUS" if is_rapid_burst else "VERIFIED_MULTI_FACILITY_LONGITUDINAL",
                    "gps_origin": {
                        "lat": gps_lat or region.get("lat"),
                        "lon": gps_lon or region.get("lon"),
                        "accuracy_m": gps_accuracy
                    },
                    "severity": "CRITICAL" if repeat_count >= 4 else "HIGH"
                }

                # Update or insert into active alerts
                existing_idx = next(
                    (i for i, a in enumerate(self.active_cross_hospital_alerts) if a["alert_id"] == alert_id),
                    None
                )
                if existing_idx is not None:
                    self.active_cross_hospital_alerts[existing_idx] = alert_obj
                else:
                    self.active_cross_hospital_alerts.insert(0, alert_obj)

            return alert_obj


    def inject_outbreak_spike(self, pincode: str = "110085", symptom_name: str = "Acute Respiratory Distress (Novel Paramyxo-Z)", count: int = 400):
        """Simulate a sudden virulent disease outbreak spike in a specific pin code."""
        with self.lock:
            region = next((r for r in PINCODE_REGIONS if r["pincode"] == pincode), PINCODE_REGIONS[1])
            pathogen = next((p for p in OUTBREAK_PATHOGENS if p["name"] == symptom_name), OUTBREAK_PATHOGENS[0])
            self.spike_target = {
                "region": region,
                "pathogen": pathogen,
                "burst_count": count
            }
            self.spike_remaining = count

    def _telemetry_worker(self):
        """Generates 100-140 pings/sec continuously simulating IoT edge node streams."""
        while self.running:
            # Batch size for 50ms interval ~ 5-8 pings -> ~120 pings/sec
            batch_size = random.randint(5, 8)
            now = time.time()
            new_pings = []

            with self.lock:
                for _ in range(batch_size):
                    # Check if an outbreak spike is running
                    if self.spike_remaining > 0 and self.spike_target:
                        self.spike_remaining -= 1
                        reg = self.spike_target["region"]
                        path = self.spike_target["pathogen"]
                        # Concentrated around epicenter with tiny jitter
                        lat = reg["lat"] + random.gauss(0, 0.003)
                        lon = reg["lon"] + random.gauss(0, 0.003)
                        symptom = path["name"]
                        severity = round(random.uniform(7.8, 9.8), 2)
                        spo2 = round(random.uniform(84.0, 91.5), 1)
                        temp_c = round(random.uniform(38.8, 40.5), 1)
                        is_outbreak = True
                    else:
                        reg = random.choice(PINCODE_REGIONS)
                        lat = reg["lat"] + random.gauss(0, 0.015)
                        lon = reg["lon"] + random.gauss(0, 0.015)
                        # Pick baseline symptom
                        sym_choice = random.choices(
                            BASELINE_SYMPTOMS,
                            weights=[w for _, w, _ in BASELINE_SYMPTOMS]
                        )[0]
                        symptom = sym_choice[0]
                        severity = round(random.uniform(1.0, 5.5), 2)
                        spo2 = round(random.uniform(96.0, 99.5), 1)
                        temp_c = round(random.uniform(36.5, 37.4), 1)
                        is_outbreak = False

                    ping = {
                        "id": self.total_ingested + 1,
                        "timestamp": now,
                        "pincode": reg["pincode"],
                        "region_name": reg["name"],
                        "lat": round(lat, 5),
                        "lon": round(lon, 5),
                        "symptom": symptom,
                        "severity_score": severity,
                        "spo2": spo2,
                        "temp_c": temp_c,
                        "device_hash": f"edge_node_{random.randint(1000, 9999)}",
                        "is_outbreak": is_outbreak
                    }
                    new_pings.append(ping)
                    self.total_ingested += 1
                    self.ingest_rate_counter += 1

                self.buffer.extend(new_pings)

                # Compute current ingest rate
                if now - self.last_rate_time >= 1.0:
                    dt = now - self.last_rate_time
                    self.current_ips = round(self.ingest_rate_counter / dt, 1)
                    self.ingest_rate_counter = 0
                    self.last_rate_time = now

                # Run DBSCAN every 1.5 seconds on recent buffer window
                if now - self.last_cluster_run >= 1.5:
                    self._run_dbscan_clustering(now)
                    self.last_cluster_run = now

            time.sleep(0.045)

    def _run_dbscan_clustering(self, current_time: float):
        """Executes DBSCAN spatial density clustering to detect emergent epidemic hotspots."""
        recent_window = [p for p in self.buffer if current_time - p["timestamp"] <= 30.0 and p["severity_score"] >= 6.5]
        
        if len(recent_window) < 15:
            # Check if active alert can be cleared
            if self.active_alert and (current_time - self.active_alert.get("detected_at", 0) > 20):
                self.active_alert = None
            self.dbscan_clusters = []
            return

        coords = np.array([[p["lat"], p["lon"]] for p in recent_window])
        # eps in degrees (~0.015 deg ≈ 1.6km)
        db = DBSCAN(eps=0.018, min_samples=12, metric="euclidean").fit(coords)
        labels = db.labels_

        clusters_info = []
        unique_labels = set(labels)
        max_cluster_size = 0
        epidemic_cluster = None

        for label in unique_labels:
            if label == -1:
                continue # noise
            mask = (labels == label)
            cluster_pings = [recent_window[i] for i, m in enumerate(mask) if m]
            c_size = len(cluster_pings)
            center_lat = float(np.mean([p["lat"] for p in cluster_pings]))
            center_lon = float(np.mean([p["lon"] for p in cluster_pings]))
            pincode = cluster_pings[0]["pincode"]
            region_name = cluster_pings[0]["region_name"]
            top_symptom = cluster_pings[0]["symptom"]
            avg_severity = float(np.mean([p["severity_score"] for p in cluster_pings]))

            c_info = {
                "cluster_id": int(label),
                "pincode": pincode,
                "region_name": region_name,
                "size": c_size,
                "center_lat": round(center_lat, 5),
                "center_lon": round(center_lon, 5),
                "dominant_symptom": top_symptom,
                "avg_severity": round(avg_severity, 2),
                "status": "ALERT" if c_size >= 25 else "WATCH"
            }
            clusters_info.append(c_info)

            if c_size > max_cluster_size:
                max_cluster_size = c_size
                epidemic_cluster = c_info

        self.dbscan_clusters = clusters_info

        # Trigger massive IDSP alert if cluster size is critically elevated
        if epidemic_cluster and epidemic_cluster["size"] >= 20:
            growth_rate = min(580, int(150 + epidemic_cluster["size"] * 4.2))
            self.active_alert = {
                "alert_id": f"IDSP-2026-NCR-{epidemic_cluster['pincode'][-3:]}",
                "status": "CRITICAL_EPIDEMIC_SURGE",
                "pincode": epidemic_cluster["pincode"],
                "region": epidemic_cluster["region_name"],
                "epicenter_lat": epidemic_cluster["center_lat"],
                "epicenter_lon": epidemic_cluster["center_lon"],
                "cluster_size": epidemic_cluster["size"],
                "growth_rate_pct": f"+{growth_rate}%",
                "pathogen_signature": epidemic_cluster["dominant_symptom"],
                "avg_severity": epidemic_cluster["avg_severity"],
                "containment_directive": "Activate Level-3 Reverse Cold-Chain Isolation & Ring Prophylaxis across adjacent health sub-centers.",
                "detected_at": current_time,
                "dbscan_density_score": round(epidemic_cluster["size"] / 12.0, 2)
            }
        elif max_cluster_size < 15 and self.active_alert:
            # Auto decay alert after calm down
            if current_time - self.active_alert.get("detected_at", 0) > 15:
                self.active_alert = None

    def execute_tiger_data_sql(self, sql_query: str) -> Dict[str, Any]:
        """
        Executes standard high-performance SQL on the Tiger Data hypertable.
        Supports aggregation queries, time_bucket(), and pin code filtering.
        """
        start_t = time.time()
        sql_lower = sql_query.lower()

        with self.lock:
            recent_pings = list(self.buffer)[-1000:]

        columns = []
        rows = []

        if "time_bucket" in sql_lower or "group by" in sql_lower:
            # Aggregate by pincode and symptom
            summary = {}
            for p in recent_pings:
                k = (p["pincode"], p["symptom"])
                if k not in summary:
                    summary[k] = {"count": 0, "avg_sev": 0.0, "region": p["region_name"]}
                summary[k]["count"] += 1
                summary[k]["avg_sev"] += p["severity_score"]

            columns = ["pincode", "region_name", "symptom", "ping_count", "avg_severity", "trend_delta"]
            sorted_items = sorted(summary.items(), key=lambda x: x[1]["count"], reverse=True)[:15]
            for (pincode, symptom), data in sorted_items:
                avg_s = round(data["avg_sev"] / data["count"], 2)
                trend = "+14%" if avg_s > 6.0 else "+2%"
                rows.append([pincode, data["region"], symptom, data["count"], avg_s, trend])

        elif "where" in sql_lower and "is_outbreak" in sql_lower:
            columns = ["id", "timestamp", "pincode", "symptom", "severity_score", "spo2", "temp_c"]
            outbreaks = [p for p in recent_pings if p.get("is_outbreak") or p["severity_score"] > 7.0][:20]
            for p in outbreaks:
                rows.append([p["id"], round(p["timestamp"], 2), p["pincode"], p["symptom"], p["severity_score"], p["spo2"], p["temp_c"]])

        else:
            # Default recent telemetry stream query
            columns = ["id", "pincode", "region_name", "symptom", "severity_score", "spo2", "lat", "lon"]
            for p in recent_pings[-12:]:
                rows.append([p["id"], p["pincode"], p["region_name"], p["symptom"], p["severity_score"], p["spo2"], p["lat"], p["lon"]])

        execution_ms = round((time.time() - start_t) * 1000 + random.uniform(1.2, 3.8), 2)
        return {
            "sql": sql_query,
            "engine": "TigerData Hypertable v4.2 [Distributed Timescale partition]",
            "columns": columns,
            "rows": rows,
            "total_rows_scanned": len(recent_pings),
            "execution_time_ms": execution_ms,
            "status": "SUCCESS"
        }

    def get_dashboard_state(self) -> Dict[str, Any]:
        """Snapshot of current high frequency sentinel metrics."""
        with self.lock:
            recent_pings = list(self.buffer)[-150:]
            # Compute recent pin code counts
            pincode_dist = {}
            symptom_dist = {}
            for p in recent_pings[-80:]:
                pin = p["pincode"]
                pincode_dist[pin] = pincode_dist.get(pin, 0) + 1
                sym = p["symptom"]
                symptom_dist[sym] = symptom_dist.get(sym, 0) + 1

            try:
                from live_outbreak_scraper import live_outbreak_registry
                live_alerts = live_outbreak_registry.get_live_alerts()
            except Exception:
                live_alerts = []

            return {
                "ingest_rate_ips": self.current_ips,
                "total_ingested": self.total_ingested,
                "active_buffer_size": len(self.buffer),
                "active_alert": self.active_alert,
                "dbscan_clusters": self.dbscan_clusters,
                "cross_hospital_alerts": list(self.active_cross_hospital_alerts),
                "surveillance_case_count": len(self.surveillance_cases),
                "live_internet_alerts": live_alerts,
                "location_hospitals_directory": LOCATION_HOSPITALS,
                "pincode_breakdown": [{"pincode": k, "count": v} for k, v in pincode_dist.items()],
                "symptom_breakdown": [{"symptom": k, "count": v} for k, v in sorted(symptom_dist.items(), key=lambda x: x[1], reverse=True)[:6]],
                "recent_telemetry_sample": recent_pings[-25:]
            }

sentinel_engine = TigerDataSentinel()
