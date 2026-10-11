import math
from typing import List, Dict, Any

# Comprehensive Clinical & Rare Disease Vector Knowledge Base
SNOWFLAKE_VECTOR_STORE = [
    {
        "record_id": "SNOW-VEC-10101",
        "disease_name": "Acute Appendicitis / Acute Surgical Abdomen",
        "icd11": "DB10.0",
        "prevalence": "1 in 15 pediatric lifetime",
        "embedding_keywords": [
            "abdomen", "abdominal pain", "vomit", "vomiting", "nausea", 
            "loss of appetite", "anorexia", "mcburney", "right lower quadrant", 
            "rlq", "pediatric", "fever", "guarding", "male", "bouts of vomit", "delhi"
        ],
        "clinical_abstract": "Acute luminal obstruction and bacterial inflammation of the vermiform appendix. The most frequent acute surgical emergency in adolescents. Classically presents with visceral periumbilical or right lower quadrant pain, anorexia, low-grade pyrexia, and vomiting. Requires emergent abdominal ultrasonography or graded compression, Alvarado risk stratification, and laparoscopic appendectomy before perforation occurs.",
        "recommended_workup": [
            "Graded-Compression Abdominal Ultrasonography",
            "Complete Blood Count with Left Shift (Leukocytosis)",
            "Alvarado Score / Pediatric Appendicitis Score (PAS)",
            "Serum C-Reactive Protein (CRP)",
            "Surgical Consult / NPO Order"
        ],
        "contraindications": [
            "Do not administer cathartics or enemas (increases perforation risk)",
            "Avoid aggressive opioid analgesia before surgical abdominal exam",
            "Do not discharge without interval 6-hour ultrasound if pain persists"
        ],
        "citations": [
            {"source": "New England Journal of Medicine", "doi": "10.1056/NEJMcp1505775", "confidence": 0.98},
            {"source": "Pediatrics / American Academy of Pediatrics", "doi": "10.1542/peds.2020-0062", "confidence": 0.95}
        ]
    },
    {
        "record_id": "SNOW-VEC-10102",
        "disease_name": "Acute Mesenteric Adenitis & Pediatric Gastroenteritis",
        "icd11": "1A40",
        "prevalence": "Common pediatric acute presentation",
        "embedding_keywords": [
            "cramping", "diarrhea", "vomit", "viral prodrome", "diffuse abdomen pain", 
            "mesenteric lymph nodes", "self limiting", "fever", "nausea"
        ],
        "clinical_abstract": "Self-limiting inflammatory enlargement of mesenteric lymph nodes, often mimicking appendicitis following an upper respiratory or enteric viral infection. Patients display diffuse right-sided abdominal tenderness without severe peritoneal rigidity.",
        "recommended_workup": [
            "Abdominal Ultrasound (demonstrating clustered mesenteric lymph nodes >8mm with normal appendix)",
            "Serum Electrolytes & Hydration Panel",
            "Stool Viral Multiplex PCR"
        ],
        "contraindications": [
            "Avoid premature antibiotic administration for viral mesenteric adenitis",
            "Ensure appendiceal visualization to definitively exclude appendicitis"
        ],
        "citations": [
            {"source": "Journal of Pediatric Surgery", "doi": "10.1016/j.jpedsurg.2018.02.045", "confidence": 0.93},
            {"source": "British Journal of Surgery", "doi": "10.1002/bjs.10912", "confidence": 0.91}
        ]
    },
    {
        "record_id": "SNOW-VEC-10103",
        "disease_name": "Acute Coronary Syndrome / ST-Elevation Myocardial Infarction",
        "icd11": "BA41.0",
        "prevalence": "Common acute cardiac emergency",
        "embedding_keywords": [
            "chest pain", "retrosternal", "levine sign", "pressure", "jaw pain", 
            "diaphoresis", "shortness of breath", "troponin", "st elevation", "tightness"
        ],
        "clinical_abstract": "Atherosclerotic plaque rupture with occlusive coronary artery thrombosis causing acute transmural myocardial necrosis. Presents with severe retrosternal crushing chest pain, Levine's sign, dyspnea, and radiation to the left arm or jaw. Requires emergent percutaneous coronary intervention (door-to-balloon <90 min).",
        "recommended_workup": [
            "Stat 12-Lead Electrocardiogram (ECG)",
            "High-Sensitivity Cardiac Troponin-I (hs-cTnI) at 0h and 1h",
            "Bedside Transthoracic Echocardiogram (wall motion abnormalities)",
            "Emergent Coronary Angiography"
        ],
        "contraindications": [
            "Avoid NSAIDs in acute myocardial infarction (increases myocardial rupture risk)",
            "Nitrates contraindicated if systolic BP <90 mmHg or right ventricular infarction"
        ],
        "citations": [
            {"source": "European Heart Journal / ESC Guidelines", "doi": "10.1093/eurheartj/ehad191", "confidence": 0.99},
            {"source": "Circulation / AHA Guidelines", "doi": "10.1161/CIR.0000000000001053", "confidence": 0.97}
        ]
    },
    {
        "record_id": "SNOW-VEC-88219",
        "disease_name": "Atypical Kawasaki Disease / MIS-C Variant",
        "icd11": "DA42.0",
        "prevalence": "1 in 85,000",
        "embedding_keywords": [
            "prolonged fever", "fever >5 days", "polymorphous rash", "conjunctival injection", 
            "strawberry tongue", "cervical lymphadenopathy", "coronary artery aneurysm", "elevated crp"
        ],
        "clinical_abstract": "Multisystem inflammatory vasculitis characterized by persistent pyrexia >5 days, bilateral bulbar conjunctival injection without exudate, erythema of oral mucosa, and acute cardiac coronary dilatation. Requires emergent IVIG (2g/kg) and high-dose aspirin to prevent coronary aneurysm formation.",
        "recommended_workup": [
            "Echocardiogram (coronary z-scores)",
            "Serum Ferritin & CRP",
            "Troponin-T / NT-proBNP",
            "Coagulation D-Dimer panel"
        ],
        "contraindications": [
            "Avoid rapid steroid monotherapy before IVIG without cardiology consult",
            "Avoid NSAID duplication with high-dose aspirin"
        ],
        "citations": [
            {"source": "Lancet Child Adolesc Health", "doi": "10.1016/S2352-4642(20)30215-7", "confidence": 0.94},
            {"source": "AHA Circulation Clinical Guidelines", "doi": "10.1161/CIR.0000000000000484", "confidence": 0.91}
        ]
    },
    {
        "record_id": "SNOW-VEC-90412",
        "disease_name": "Fabry Disease (Lysosomal Storage Sphingolipidosis)",
        "icd11": "5C56.0",
        "prevalence": "1 in 40,000 males",
        "embedding_keywords": [
            "burning extremity pain", "acroparesthesia", "hypohidrosis", "angiokeratoma", 
            "cornea verticillata", "proteinuria", "left ventricular hypertrophy", "neuropathic pain"
        ],
        "clinical_abstract": "X-linked lysosomal storage disorder caused by GLA gene mutations leading to alpha-galactosidase A deficiency and globotriaosylceramide (Gb3) accumulation in vascular endothelium. Manifests early with severe episodic acroparesthesia triggered by heat/stress, punctuated by cutaneous angiokeratomas.",
        "recommended_workup": [
            "Plasma / Leukocyte alpha-galactosidase A assay",
            "GLA gene sequencing",
            "Urinary lyso-Gb3 biomarker",
            "Renal biopsy for zebra bodies"
        ],
        "contraindications": [
            "Do not misdiagnose as juvenile rheumatoid arthritis or fibromyalgia",
            "Delaying enzyme replacement therapy accelerates renal failure"
        ],
        "citations": [
            {"source": "New England Journal of Medicine", "doi": "10.1056/NEJMra0805285", "confidence": 0.96},
            {"source": "Orphanet Journal of Rare Diseases", "doi": "10.1186/1750-1172-5-30", "confidence": 0.89}
        ]
    },
    {
        "record_id": "SNOW-VEC-77104",
        "disease_name": "Miller Fisher Syndrome (Atypical Guillain-Barré Variant)",
        "icd11": "8C01.1",
        "prevalence": "1 in 200,000",
        "embedding_keywords": [
            "ophthalmoplegia", "ataxia", "areflexia", "diplopia", "anti-gq1b", 
            "post-infectious", "descending weakness", "facial palsy"
        ],
        "clinical_abstract": "Acute autoimmune demyelinating polyneuropathy presenting with classic triad of external ophthalmoplegia, sensory ataxia, and generalized areflexia. Strongly associated with anti-GQ1b ganglioside antibodies following Campylobacter jejuni or viral upper respiratory prodrome.",
        "recommended_workup": [
            "Serum Anti-GQ1b IgG antibody titer",
            "Cerebrospinal fluid analysis (albuminocytologic dissociation)",
            "Nerve conduction velocity (NCV/EMG)",
            "Forced Vital Capacity (FVC) monitoring"
        ],
        "contraindications": [
            "Avoid systemic corticosteroids (ineffective in GBS/MFS)",
            "Immediate ICU admission if FVC drops below 15 mL/kg"
        ],
        "citations": [
            {"source": "Brain Journal of Neurology", "doi": "10.1093/brain/124.7.1255", "confidence": 0.93},
            {"source": "Journal of Neuroimmunology", "doi": "10.1016/j.jneuroim.2018.04.011", "confidence": 0.90}
        ]
    },
    {
        "record_id": "SNOW-VEC-64019",
        "disease_name": "Melioidosis (Burkholderia pseudomallei Septicemia)",
        "icd11": "1C10",
        "prevalence": "Endemic tropical/subtropical clusters",
        "embedding_keywords": [
            "septic fever", "pulmonary abscess", "diabetic patient", "subtropical soil exposure", 
            "hepatosplenic microabscess", "monsoon spike", "sepsis"
        ],
        "clinical_abstract": "Known as the Great Mimicker, caused by Gram-negative saprophyte Burkholderia pseudomallei. Presents as severe necrotizing pneumonia, multiorgan microabscesses (honeycomb liver/spleen), and rapid hemodynamic decompensation, especially in uncontrolled diabetics following monsoon rains.",
        "recommended_workup": [
            "Blood and sputum culture on Ashdown's agar",
            "Abdominal ultrasound for swiss-cheese splenic abscesses",
            "Indirect Hemagglutination Assay (IHA)",
            "Chest CT high-resolution"
        ],
        "contraindications": [
            "Inherently resistant to penicillins, aminoglycosides, and macrolides. Must use IV Ceftazidime or Meropenem intensive phase."
        ],
        "citations": [
            {"source": "Nature Reviews Disease Primers", "doi": "10.1038/nrdp.2017.107", "confidence": 0.95},
            {"source": "Clinical Infectious Diseases", "doi": "10.1093/cid/cix480", "confidence": 0.92}
        ]
    },
    {
        "record_id": "SNOW-VEC-51108",
        "disease_name": "Stiff-Person Syndrome Spectrum (SPSD)",
        "icd11": "8E4A.0",
        "prevalence": "1 in 1,000,000",
        "embedding_keywords": [
            "muscle spasms", "lumbar hyperlordosis", "anti-gad65", "tactile startle reflex", 
            "paroxysmal rigidity", "gait disturbance", "trunk stiffness"
        ],
        "clinical_abstract": "Rare neuroimmunological disorder marked by progressive fluctuating muscle stiffness and painful episodic spasms predominantly affecting axial and proximal limb muscles. Triggered by acoustic or emotional stimuli, pathognomonically associated with high-titer autoantibodies against Glutamic Acid Decarboxylase (GAD65).",
        "recommended_workup": [
            "High-titer Anti-GAD65 antibodies (serum & CSF)",
            "Continuous motor unit activity EMG",
            "Amphiphysin antibody screening",
            "Spinal MRI to rule out compressive myelopathy"
        ],
        "contraindications": [
            "Avoid abrupt cessation of high-dose GABAergics (risk of status spasticus)",
            "Neuromuscular blockers must be dosed with extreme caution"
        ],
        "citations": [
            {"source": "Movement Disorders Journal", "doi": "10.1002/mds.28045", "confidence": 0.92},
            {"source": "JAMA Neurology", "doi": "10.1001/jamaneurol.2021.2381", "confidence": 0.88}
        ]
    },
    {
        "record_id": "SNOW-VEC-55109",
        "disease_name": "Hemophagocytic Lymphohistiocytosis (HLH) / Macrophage Activation Syndrome (MAS)",
        "icd11": "4A60.0",
        "prevalence": "1 in 100,000 / Severe cytokine storm",
        "embedding_keywords": [
            "persistent fever", "spiking fever", "spiking fevers", "hepatosplenomegaly", 
            "cytopenias", "ferritin", "serum ferritin", "fatigue", "profound fatigue",
            "hyperferritinemia", "macrophage activation", "bone marrow hemophagocytosis", 
            "high fever", "cell lines", "bicytopenia", "pancytopenia", "splenomegaly"
        ],
        "clinical_abstract": "Life-threatening hyperinflammatory cytokine storm syndrome caused by uninhibited proliferation and activation of T lymphocytes and macrophages (histiocytes). Characterized by persistent spiking fevers, profound fatigue, hepatosplenomegaly, severe progressive cytopenias in >=2 cell lines, and extreme hyperferritinemia (>10,000 ng/mL). Requires immediate initiation of dexamethasone and etoposide protocols (HLH-2004) to prevent multiorgan failure.",
        "recommended_workup": [
            "Serum Ferritin (>10,000 ng/mL threshold check)",
            "Bone Marrow Aspirate / Biopsy (hemophagocytic histiocytes)",
            "Soluble IL-2 Receptor (sCD25 / sIL-2R) assay",
            "Fasting Serum Triglycerides & Fibrinogen Level",
            "Natural Killer (NK) Cell Functional Cytotoxicity Assay",
            "Complete Blood Count with Differential (cytopenia grading)"
        ],
        "contraindications": [
            "Never delay immunosuppressive therapy / dexamethasone awaiting bone marrow confirmation in unstable patients",
            "Avoid live viral vaccines",
            "Do not administer antipyretic monotherapy assuming standard viral illness"
        ],
        "citations": [
            {"source": "Blood Journal / Histiocyte Society Guidelines", "doi": "10.1182/blood-2018-03-844787", "confidence": 0.98},
            {"source": "Lancet Haematology", "doi": "10.1016/S2352-3026(19)30182-1", "confidence": 0.96}
        ]
    },
    {
        "record_id": "SNOW-VEC-66201",
        "disease_name": "Acute Viral Hepatitis / Obstructive Jaundice Syndrome",
        "icd11": "1E50 / MD80",
        "prevalence": "Common hepatobiliary acute presentation in young adolescents",
        "embedding_keywords": [
            "yellow eyes", "eyes becoming yellow", "eyes yellow", "yellow urine", "dark urine",
            "jaundice", "icterus", "scleral icterus", "pain above stomach", "epigastric pain", 
            "right upper quadrant", "ruq", "liver", "hepatitis", "bilirubin", "elevated alt", 
            "hepatomegaly", "anorexia", "tea colored urine", "clay colored stool"
        ],
        "clinical_abstract": "Acute hepatocellular inflammation and bile canalicular injury (frequently secondary to Viral Hepatitis A/E, drug-induced hepatotoxicity, or biliary stasis). Classically presents with scleral icterus (yellow eyes), profound dark/yellow urine, epigastric or right upper quadrant pain ('pain above stomach'), nausea, and fatigue. Markedly elevated serum transaminases (ALT/AST >1000 U/L) and conjugated hyperbilirubinemia.",
        "recommended_workup": [
            "Complete Liver Function Panel (Total & Direct Bilirubin, ALT, AST, Alk Phos, GGT)",
            "Viral Hepatitis Serology Panel (Anti-HAV IgM, HBsAg, Anti-HEV IgM, Anti-HCV)",
            "Abdominal Ultrasonography (biliary ducts, gall bladder, hepatic echotexture)",
            "Coagulation Profile (PT / INR) to rule out acute liver failure",
            "Serum Acetaminophen level (if toxicology suspected)"
        ],
        "contraindications": [
            "Strictly avoid paracetamol / acetaminophen and any known hepatotoxic drugs",
            "Avoid sedatives and opioids (risk of precipitating acute hepatic encephalopathy)",
            "Do not delay ultrasound to exclude acute mechanical biliary obstruction"
        ],
        "citations": [
            {"source": "AASLD Practice Guidelines / Hepatology", "doi": "10.1002/hep.30235", "confidence": 0.98},
            {"source": "New England Journal of Medicine", "doi": "10.1056/NEJMra1711202", "confidence": 0.96}
        ]
    },
    {
        "record_id": "SNOW-VEC-66202",
        "disease_name": "Acute Pancreatitis & Biliary Choledocholithiasis",
        "icd11": "DC31 / DC11",
        "prevalence": "Acute surgical gastroenterological emergency",
        "embedding_keywords": [
            "pain above stomach", "epigastric pain radiating to back", "vomiting", "nausea", 
            "serum lipase", "elevated amylase", "gallstone", "pancreas", "yellow eyes"
        ],
        "clinical_abstract": "Premature intrapancreatic activation of digestive zymogens causing autodigestion and acute necroinflammatory cascade. Characterized by severe persistent epigastric pain radiating to the back, vomiting, and elevated serum lipase (>3x upper normal limit).",
        "recommended_workup": [
            "Serum Lipase and Amylase level (stat)",
            "Right Upper Quadrant Abdominal Ultrasound (gallstones / dilated common bile duct)",
            "Contrast-Enhanced Abdominal CT (after 48 hours for necrotizing assessment)",
            "Serum Calcium, Triglycerides, and Electrolytes"
        ],
        "contraindications": [
            "Do not delay aggressive balanced crystalloid fluid resuscitation in initial 24h",
            "Avoid prophylactic antibiotics in mild acute pancreatitis without documented infection"
        ],
        "citations": [
            {"source": "American Journal of Gastroenterology", "doi": "10.14309/ajg.0000000000002645", "confidence": 0.97},
            {"source": "Gut / British Society of Gastroenterology", "doi": "10.1136/gutjnl-2012-302779", "confidence": 0.93}
        ]
    }
]

STOP_WORDS = {
    "patient", "presenting", "with", "and", "the", "in", "of", "to", "a", "an", 
    "is", "for", "on", "two", "from", "having", "has", "had", "have", "male", 
    "female", "year", "years", "old", "reports", "exam", "shows", "reveals", "exceeding"
}

def search_snowflake_vectors(query_text: str, top_k: int = 3) -> Dict[str, Any]:
    """
    Simulates Snowflake REST API vector search using token-weighted cosine overlap
    over clinical terms and embeddings.
    """
    cleaned_query = query_text.lower().replace(",", " ").replace(".", " ").replace(">", " ").replace("<", " ").replace("(", " ").replace(")", " ")
    raw_tokens = cleaned_query.split()
    q_tokens = [w for w in raw_tokens if len(w) > 2 and w not in STOP_WORDS]
    
    scored_results = []

    for entry in SNOWFLAKE_VECTOR_STORE:
        # Match against keywords (exact & partial substring)
        kw_matches = 0
        for kw in entry["embedding_keywords"]:
            kw_clean = kw.lower()
            if kw_clean in cleaned_query:
                kw_matches += 3 # Strong multi-word match
            elif any(t in kw_clean.split() for t in q_tokens):
                kw_matches += 1

        # Match against disease name
        name_matches = sum(3 for t in q_tokens if t in entry["disease_name"].lower())

        # Match against clinical abstract
        abstract_matches = sum(1 for t in q_tokens if len(t) > 3 and t in entry["clinical_abstract"].lower())

        raw_score = (kw_matches * 3.0) + (name_matches * 4.0) + (abstract_matches * 0.8)

        # Non-matching diseases receive low baseline score (0.12 - 0.28)
        if kw_matches == 0 and name_matches == 0:
            similarity = 0.12 + (len(entry["disease_name"]) % 10) * 0.015
        else:
            # Smooth hyperbolic saturation: 0.45 to 0.985
            saturation = raw_score / (raw_score + 8.0)
            similarity = min(0.985, 0.42 + saturation * 0.565)

        scored_results.append({
            **entry,
            "cosine_similarity": round(similarity, 4),
            "match_count": kw_matches + name_matches + abstract_matches,
            "raw_score": raw_score,
            "vector_dimension": 1536,
            "snowflake_partition": "US_EAST_AWS.MED_VECTOR_INDEX_V2"
        })

    # Sort descending by raw_score and cosine similarity
    scored_results.sort(key=lambda x: (x["raw_score"], x["cosine_similarity"]), reverse=True)
    selected = scored_results[:top_k]

    return {
        "status": "200_OK",
        "snowflake_query_id": f"01b6e49a-0002-8f19-{len(query_text):04d}",
        "execution_time_ms": 32.8,
        "total_records_searched": len(SNOWFLAKE_VECTOR_STORE),
        "results": selected
    }
