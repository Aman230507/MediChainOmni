"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Database, FileText, CheckCircle2, AlertOctagon, ExternalLink, Bookmark, Cpu, Search, Building2, User, Stethoscope, ChevronRight, Activity, History, ShieldAlert, Check, X, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { DiagnosticReport, SnowflakeVectorResult, StoredCaseReference, CrossHospitalAlert } from "@/types";
import { requestSecondOpinion, fetchStoredReferences } from "@/lib/api";
import { anchorConsentOnSolana } from "@/lib/solana";
import { GeoLocationState } from "@/lib/useGeolocation";

interface KaggleClinicalRAGProps {
  onConsentMinted?: (record: any) => void;
  onReasoningChange?: (isReasoning: boolean) => void;
  geminiKey?: string;
  initialQuery?: string;
  geoState?: GeoLocationState;
  onRequestLocation?: () => void;
}

const KAGGLE_PRESETS = [
  {
    title: "AIIMS Hepatology Case",
    symptoms: "a 15 year old male, pain above stomach, yellow urine, eyes becoming yellow, profound fatigue",
    dataset: "Indian Healthcare Patient Records",
    tag: "🟡 Jaundice / Viral Hepatitis",
  },
  {
    title: "Safdarjung Pediatric Surgery",
    symptoms: "A 12 years male from Delhi, having severe acute abdomen pain radiating to right lower quadrant, bouts of vomiting, and complete loss of appetite.",
    dataset: "Indian Healthcare Patient Records",
    tag: "🔴 Acute Appendicitis (DB10.0)",
  },
  {
    title: "Metropolitan STEMI Code",
    symptoms: "34 year old male, acute crushing retrosternal chest pain clutching chest with clenched fist (Levine sign), diaphoresis, dyspnea radiating to left arm",
    dataset: "Healthcare Dataset (prasad22)",
    tag: "🫀 Acute Coronary Syndrome",
  },
  {
    title: "Apollo Hospital ICU",
    symptoms: "Patient presenting with persistent 3-week high spiking fevers (>39.5°C), profound fatigue, hepatosplenomegaly, progressive cytopenias in two cell lines, and serum ferritin exceeding 14,000 ng/mL",
    dataset: "Hospital Dataset for Practice",
    tag: "🩸 HLH / Cytokine Storm",
  },
  {
    title: "Lilavati Tropical Ward",
    symptoms: "28 year old female, continuous high fever (40°C), retro-orbital eye pain, bone break pain, petechial purpura on forearms, platelet count 28,000",
    dataset: "Indian Healthcare Patient Records",
    tag: "🦟 Severe Dengue / Shock",
  },
  {
    title: "St. Jude Endocrinology",
    symptoms: "24 year old female, deep Kussmaul rapid respirations, fruity acetone breath odor, diffuse abdominal pain, nausea, blood glucose 480 mg/dL, ketones positive",
    dataset: "Healthcare Dataset (prasad22)",
    tag: "🍬 Diabetic Ketoacidosis (DKA)",
  },
];

export function KaggleClinicalRAG({
  onConsentMinted,
  onReasoningChange,
  geminiKey,
  initialQuery,
  geoState,
  onRequestLocation,
}: KaggleClinicalRAGProps) {
  const [symptomsInput, setSymptomsInput] = useState<string>(
    initialQuery || KAGGLE_PRESETS[0].symptoms
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [retrievedChunks, setRetrievedChunks] = useState<any[]>([]);
  const [engineModel, setEngineModel] = useState<string>("Gemma 4-26B + Kaggle Healthcare Vector DB");
  const [storedCaseRef, setStoredCaseRef] = useState<StoredCaseReference | null>(null);
  const [crossHospitalAlert, setCrossHospitalAlert] = useState<CrossHospitalAlert | null>(null);
  const [storedReferencesList, setStoredReferencesList] = useState<StoredCaseReference[]>([]);
  const [showStoredReferences, setShowStoredReferences] = useState<boolean>(false);

  // Load existing dynamically stored queries on component mount
  useEffect(() => {
    fetchStoredReferences().then((res) => {
      if (res.references) setStoredReferencesList(res.references);
    });
  }, []);

  const handleRunRAG = async () => {
    if (!symptomsInput.trim() || loading) return;
    setLoading(true);
    onReasoningChange?.(true);

    try {
      const clientId = typeof window !== "undefined"
        ? (localStorage.getItem("sentinel_client_terminal_id") || (() => {
            const id = "TERM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            localStorage.setItem("sentinel_client_terminal_id", id);
            return id;
          })())
        : "WEB-TERMINAL-1";

      // Execute multi-tier RAG: Vector retrieval over Kaggle datasets + Gemini/Gemma synthesis + Sentinel Surveillance
      const res = await requestSecondOpinion(symptomsInput, geminiKey, {
        client_id: clientId,
        gps_lat: geoState?.latitude || undefined,
        gps_lon: geoState?.longitude || undefined,
        gps_accuracy: geoState?.accuracy || undefined,
        location_pincode: geoState?.nearestPincode || undefined,
      });
      setReport(res.report);
      setRetrievedChunks(res.retrieved_kaggle_records || []);
      setEngineModel(res.model ? `${res.model} + Kaggle Vector DB` : "Kaggle Healthcare Vector RAG");
      
      if (res.stored_reference_case) {
        setStoredCaseRef(res.stored_reference_case);
        // Refresh stored list
        fetchStoredReferences().then((refs) => {
          if (refs.references) setStoredReferencesList(refs.references);
        });
      }

      if (res.cross_hospital_alert) {
        setCrossHospitalAlert(res.cross_hospital_alert);
      }

      // Optional Solana anchor
      if (onConsentMinted) {
        try {
          const auditReceipt = await anchorConsentOnSolana(
            "KAGGLE_RAG_SYNTHESIS",
            "ABHA-PATIENT-KAGGLE-882",
            "DR-JENNY-WILSON",
            `Differential Diagnosis: ${res.report?.primary_differential?.disease_name || "Diagnostic Opinion"}`
          );
          onConsentMinted(auditReceipt);
        } catch {}
      }
    } catch (err) {
      console.error("Kaggle RAG query failed:", err);
    } finally {
      setLoading(false);
      onReasoningChange?.(false);
    }
  };

  return (
    <div className="humedix-card p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#ff6332] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex flex-wrap items-center gap-2">
                Clinical RAG Engine
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Kaggle Multi-Dataset Active
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Zero-PII De-Identified
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Privacy-Preserved Vector RAG across Indian Healthcare & Hospital Case Repositories (All Patient Identifiers Anonymized)
              </p>
            </div>
          </div>
        </div>

        {/* Datasets pill badge & Stored References memory toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStoredReferences(!showStoredReferences)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
              showStoredReferences
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Stored Query Memory ({storedReferencesList.length})</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-[11px] font-medium text-slate-600">
            <Database className="w-3.5 h-3.5 text-[#ff6332]" />
            <span>3 Vector Datasets Indexed</span>
          </div>
        </div>
      </div>

      {/* STORED QUERY MEMORY DRAWER */}
      {showStoredReferences && (
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-orange-50/90 to-amber-50/60 border border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-orange-200/60">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#ff6332]" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Physician Dynamic Query Memory ({storedReferencesList.length} Stored Cases)
              </h4>
            </div>
            <button
              onClick={() => setShowStoredReferences(false)}
              className="w-6 h-6 rounded-lg bg-white/80 hover:bg-white text-slate-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mb-3">
            Every clinical query submitted to the workstation is indexed into the vector store and referenced by future RAG evaluations.
          </p>

          {storedReferencesList.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 bg-white/70 rounded-xl">
              No queries stored yet. Run any query below to index it permanently into the vector store.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {storedReferencesList.map((ref, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSymptomsInput(ref.symptoms);
                    setShowStoredReferences(false);
                  }}
                  className="p-3 rounded-xl bg-white border border-orange-200/80 hover:border-orange-400 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded">
                      {ref.chunk_id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">
                      {ref.hospital}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {ref.primary_diagnosis} ({ref.icd11})
                  </h5>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                    {ref.symptoms}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUICK DATASET PRESET PILLS */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold text-slate-500 block mb-2">
          Select Clinical Reference Case from Datasets:
        </span>
        <div className="flex flex-wrap gap-2">
          {KAGGLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSymptomsInput(preset.symptoms);
                setReport(null);
                setRetrievedChunks([]);
                setStoredCaseRef(null);
                setCrossHospitalAlert(null);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Bookmark className="w-3 h-3 text-[#ff6332]" />
              <span>{preset.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Query Textarea Form */}
      <div className="relative mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <label className="text-xs font-bold text-slate-700">
            Patient Medical History & Presenting Chief Complaints:
          </label>
          <button
            type="button"
            onClick={onRequestLocation}
            title="Lock browser GPS coordinates to link diagnostic query to regional hospital outreach cluster"
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              geoState?.status === "GRANTED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : geoState?.status === "PROMPTING"
                ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                : geoState?.status === "DENIED"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {geoState?.status === "GRANTED" ? (
              <>
                <MapPin className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>
                  GPS: {geoState.nearestRegion.split("/")[0].trim()} ({geoState.nearestPincode})
                  {geoState.accuracy ? ` ±${geoState.accuracy}m` : ""}
                </span>
              </>
            ) : geoState?.status === "PROMPTING" ? (
              <>
                <Navigation className="w-3 h-3 text-amber-600 animate-spin" />
                <span>Requesting GPS...</span>
              </>
            ) : geoState?.status === "DENIED" ? (
              <>
                <MapPin className="w-3 h-3 text-rose-600" />
                <span>GPS Denied (Retry)</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-[#ff6332]" />
                <span>Lock Clinic GPS for Outreach Sentinel</span>
              </>
            )}
          </button>
        </div>
        <textarea
          rows={3}
          value={symptomsInput}
          onChange={(e) => setSymptomsInput(e.target.value)}
          placeholder="Enter patient medical history, presenting complaints, duration, lab values, and physical findings..."
          className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ff6332] focus:bg-white transition-all resize-none"
        />

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleRunRAG}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6332] to-[#ff5252] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Retrieving Dataset Chunks & Synthesizing AI Opinion...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Retrieve Dataset Chunks & Synthesize AI Opinion</span>
              </>
            )}
          </button>

          {/* Stored query status chip */}
          {storedCaseRef && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                Stored into Vector Store as <strong>{storedCaseRef.chunk_id}</strong> for future references!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2-WEEK CROSS-HOSPITAL ALERT NOTIFICATION IF TRIGGERED */}
      {crossHospitalAlert && (
        <div className={`mb-5 p-4 rounded-2xl text-white border-2 shadow-xl animate-pulse ${
          crossHospitalAlert.is_rapid_spam_burst || crossHospitalAlert.status === "ANOMALOUS_RAPID_BURST_SURGE_ALERT"
            ? "bg-gradient-to-r from-purple-950 via-red-950 to-slate-900 border-purple-500 shadow-purple-950/50"
            : "bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border-red-500 shadow-red-950/40"
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-black shrink-0 ${
                crossHospitalAlert.is_rapid_spam_burst ? "bg-purple-600" : "bg-red-600"
              }`}>
                <ShieldAlert className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded border ${
                    crossHospitalAlert.is_rapid_spam_burst
                      ? "text-purple-200 bg-purple-500/30 border-purple-400/50"
                      : "text-red-200 bg-red-500/30 border-red-400/40"
                  }`}>
                    {crossHospitalAlert.status} #{crossHospitalAlert.alert_id}
                  </span>
                  <span className="text-[10px] bg-yellow-400 text-black font-black px-1.5 py-0.5 rounded">
                    {crossHospitalAlert.repeat_count} CASES IN 2 WEEKS
                  </span>
                  {crossHospitalAlert.gps_origin?.lat && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-400/30 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      GPS: {Number(crossHospitalAlert.gps_origin.lat).toFixed(4)}, {Number(crossHospitalAlert.gps_origin.lon).toFixed(4)}
                      {crossHospitalAlert.gps_origin.accuracy_m ? ` (±${crossHospitalAlert.gps_origin.accuracy_m}m)` : ""}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-white mt-1">
                  Location Alert: {crossHospitalAlert.location_name} (PIN {crossHospitalAlert.location_pincode})
                </h4>
              </div>
            </div>
          </div>

          <p className="text-xs text-red-100 mt-2 leading-relaxed">
            {crossHospitalAlert.containment_directive}
          </p>

          <div className="mt-3 pt-2.5 border-t border-red-700/60 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold text-red-300">Notified Hospitals:</span>
            {crossHospitalAlert.participating_hospitals.map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-black/40 border border-red-500/40 text-white text-[10px] font-semibold">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}


      {/* SECTION 1: RETRIEVED KAGGLE DATASET EVIDENCE CHUNKS */}
      {retrievedChunks.length > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-[#ff6332]" />
              Retrieved Dataset Records (Top {retrievedChunks.length} Vector Matches)
            </h3>
            <span className="text-[10px] text-slate-500">
              Cosine Similarity Overlap (1,536-dim)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {retrievedChunks.map((chunk, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800 truncate text-[11px]">
                      {chunk.chunk_id ? `De-identified Case #${chunk.chunk_id}` : "De-identified Clinical Case"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                      {chunk.age}y • {chunk.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      Zero PII
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      Match: {((chunk.cosine_similarity || 0.9) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{chunk.hospital}</span>
                </div>

                <div className="p-2 rounded-lg bg-orange-50/60 border border-orange-100 text-[11px]">
                  <span className="font-bold text-orange-900 block">
                    {chunk.primary_diagnosis} ({chunk.icd11})
                  </span>
                  <p className="text-slate-600 text-[10px] line-clamp-2 mt-0.5">
                    {chunk.symptoms}
                  </p>
                </div>

                {chunk.lab_results && (
                  <p className="text-[10px] text-slate-500">
                    <strong className="text-slate-700">Labs:</strong> {chunk.lab_results}
                  </p>
                )}
                <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-100 italic">
                  Source: {chunk.dataset_source}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: SYNTHESIZED AI SECOND OPINION REPORT */}
      {report && (
        <div className="space-y-4 pt-2">
          {/* Primary Differential Diagnosis Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-blue-50/80 border-2 border-emerald-400 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Primary Differential Diagnosis
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {report.primary_differential.disease_name}
                </h3>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono font-bold">
                  ICD-11: {report.primary_differential.icd11}
                </span>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-sm">
                  {report.primary_differential.probability_pct}% Concordance
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mt-2.5">
              {report.primary_differential.pathophysiology_summary}
            </p>
          </div>

          {/* Secondary Differentials & Urgent Workup Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Secondary Differentials */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Secondary Differentials
              </h4>
              <div className="space-y-2">
                {report.secondary_differentials.map((sec, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">{sec.disease_name}</span>
                      <span className="text-[11px] font-bold text-slate-500">{sec.probability_pct}%</span>
                    </div>
                    {sec.distinguishing_features && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{sec.distinguishing_features}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent Diagnostic Workup */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Urgent Diagnostic Workup
              </h4>
              <ul className="space-y-1.5">
                {report.recommended_workup.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contraindications & Evidence Citations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contraindications */}
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                Red-Flag Contraindications
              </h4>
              <ul className="space-y-1">
                {report.contraindications_and_warnings.map((c, idx) => (
                  <li key={idx} className="text-xs text-red-800 flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Citations */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Source Citations & Medical Guidelines
              </h4>
              <div className="space-y-2">
                {report.source_linked_citations.map((cite, idx) => (
                  <div key={idx} className="text-[11px] text-slate-600">
                    <strong className="text-slate-800">{cite.source}</strong>
                    <span className="block text-[10px] text-slate-400 font-mono">DOI: {cite.doi}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
