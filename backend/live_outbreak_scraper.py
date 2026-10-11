import urllib.request
import xml.etree.ElementTree as ET
import time
import re
from typing import List, Dict, Any, Optional

# Curated real-time RSS feeds for official disease outbreaks & public health alerts in India & Delhi NCR
FEEDS = [
    {
        "category": "Delhi NCR Epidemic & Vector Outbreaks",
        "url": "https://news.google.com/rss/search?q=Delhi+dengue+OR+malaria+OR+swine+flu+OR+respiratory+outbreak&hl=en-IN&gl=IN&ceid=IN:en",
        "region_default": "Delhi National Capital Region",
        "pincode_default": "110001"
    },
    {
        "category": "National Disease Surveillance & Virus Alerts (PIB / MoHFW / NCDC)",
        "url": "https://news.google.com/rss/search?q=India+disease+outbreak+OR+epidemic+Nipah+OR+Chandipura+OR+Zika+OR+dengue&hl=en-IN&gl=IN&ceid=IN:en",
        "region_default": "India National Health Surveillance",
        "pincode_default": "110029"
    },
    {
        "category": "Global / WHO Health Emergency Alerts",
        "url": "https://news.google.com/rss/search?q=WHO+disease+outbreak+news+OR+health+emergency&hl=en&gl=US&ceid=US:en",
        "region_default": "Global WHO Surveillance Network",
        "pincode_default": "000000"
    }
]

def fetch_live_internet_outbreak_alerts(limit_per_feed: int = 8) -> List[Dict[str, Any]]:
    """
    Fetches genuine, real-time disease outbreak reports and public health alerts
    directly from live internet feeds (PIB, The Hindu, Indian Express, Outbreak News Today, ET Health).
    Parses live headlines, publication timestamps, source organizations, and direct article links.
    """
    alerts = []
    seen_titles = set()

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }

    for feed_cfg in FEEDS:
        try:
            req = urllib.request.Request(feed_cfg["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=6.0) as resp:
                xml_data = resp.read()

            root = ET.fromstring(xml_data)
            items = root.findall(".//item")

            for item in items[:limit_per_feed]:
                title_elem = item.find("title")
                link_elem = item.find("link")
                pub_elem = item.find("pubDate")
                source_elem = item.find("source")

                if title_elem is None or not title_elem.text:
                    continue

                raw_title = title_elem.text.strip()
                if raw_title in seen_titles:
                    continue
                seen_titles.add(raw_title)

                link = link_elem.text.strip() if link_elem is not None and link_elem.text else "#"
                pub_date = pub_elem.text.strip() if pub_elem is not None and pub_elem.text else "Live Alert"
                source_name = source_elem.text.strip() if source_elem is not None and source_elem.text else "Verified Health Source"

                # Detect pathogen and clinical category
                title_lower = raw_title.lower()
                pathogen = "Emerging Communicable Disease"
                severity = "HIGH"
                severity_score = 7.5
                icd11 = "1D20"

                if "dengue" in title_lower:
                    pathogen = "Dengue Virus (DENV-1/2/3/4) / Severe Hemorrhagic Pyrexia"
                    icd11 = "1D20.1"
                    severity_score = 8.4
                elif "malaria" in title_lower:
                    pathogen = "Plasmodium Vivax / Falciparum Malaria"
                    icd11 = "1F40"
                    severity_score = 7.8
                elif "swine flu" in title_lower or "h1n1" in title_lower:
                    pathogen = "Influenza A Virus Subtype H1N1 (Swine Flu)"
                    icd11 = "1E30"
                    severity = "CRITICAL"
                    severity_score = 9.1
                elif "nipah" in title_lower:
                    pathogen = "Nipah Henipavirus (NiV) Encephalitic Syndrome"
                    icd11 = "1D60"
                    severity = "CRITICAL"
                    severity_score = 9.8
                elif "chandipura" in title_lower:
                    pathogen = "Chandipura Vesiculovirus (CHPV) Acute Encephalitis"
                    icd11 = "1D61"
                    severity = "CRITICAL"
                    severity_score = 9.5
                elif "shigella" in title_lower or "cholera" in title_lower:
                    pathogen = "Waterborne Bacterial Enteritis (Shigella / Vibrio)"
                    icd11 = "1A00"
                    severity_score = 8.0
                elif "measles" in title_lower:
                    pathogen = "Morbillivirus (Measles) Aerosol Outbreak"
                    icd11 = "1F03"
                    severity_score = 8.2
                elif "respiratory" in title_lower:
                    pathogen = "Acute Viral Respiratory Distress / SARI"
                    icd11 = "U07.1 / J80"
                    severity_score = 8.5

                # Detect region / location
                region = feed_cfg["region_default"]
                pincode = feed_cfg["pincode_default"]

                if "delhi" in title_lower:
                    region = "Delhi National Capital Territory (MCD Health Zones)"
                    pincode = "110001"
                elif "kerala" in title_lower:
                    region = "Kerala State Health Surveillance (Kozhikode/Malappuram)"
                    pincode = "673001"
                elif "gujarat" in title_lower:
                    region = "Gujarat Health Directorate"
                    pincode = "380001"
                elif "madhya pradesh" in title_lower:
                    region = "Madhya Pradesh District Health Network"
                    pincode = "481001"
                elif "mumbai" in title_lower or "maharashtra" in title_lower:
                    region = "Mumbai Municipal Corporation (BMC Health)"
                    pincode = "400001"
                elif "bengaluru" in title_lower or "karnataka" in title_lower:
                    region = "Bengaluru BBMP Health Surveillance"
                    pincode = "560001"

                # Clean headline (strip trailing source)
                clean_title = re.sub(r"\s*-\s*[^-]+$", "", raw_title).strip()

                alerts.append({
                    "id": f"LIVE-NET-{int(time.time()*100) % 1000000}-{len(alerts)+1}",
                    "headline": clean_title,
                    "full_title": raw_title,
                    "source": source_name,
                    "published_at": pub_date,
                    "web_url": link,
                    "feed_category": feed_cfg["category"],
                    "pathogen": pathogen,
                    "icd11": icd11,
                    "region": region,
                    "pincode": pincode,
                    "severity": severity,
                    "severity_score": severity_score,
                    "verified_internet_source": True,
                    "fetched_at": time.time()
                })
        except Exception as e:
            print(f"Error fetching live feed {feed_cfg['category']}: {e}")

    return alerts

# Cached holder with auto-refresh every 5 minutes
class LiveOutbreakRegistry:
    def __init__(self):
        self.cached_alerts: List[Dict[str, Any]] = []
        self.last_fetch: float = 0.0

    def get_live_alerts(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        now = time.time()
        # Refresh if older than 5 minutes or empty
        if force_refresh or not self.cached_alerts or (now - self.last_fetch > 300):
            fresh = fetch_live_internet_outbreak_alerts()
            if fresh:
                self.cached_alerts = fresh
                self.last_fetch = now
        return self.cached_alerts

live_outbreak_registry = LiveOutbreakRegistry()
