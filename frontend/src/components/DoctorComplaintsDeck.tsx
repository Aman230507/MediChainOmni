"use client";

import React from "react";
import { UserCheck, Shield } from "lucide-react";

interface DoctorComplaintsDeckProps {
  onSelectComplaint?: (symptom: string) => void;
}

export function DoctorComplaintsDeck({ onSelectComplaint }: DoctorComplaintsDeckProps) {
  const doctors = [
    { name: "Dr. Jenny Wilson", role: "Cardiologist", hospital: "Metropolitan General", avatar: "JW" },
    { name: "Dr. Rajiv Sharma", role: "Senior Hepatologist", hospital: "AIIMS New Delhi", avatar: "RS" },
    { name: "Dr. Ananya Sen", role: "Pediatric Surgeon", hospital: "Safdarjung Hospital", avatar: "AS" },
    { name: "Dr. Robert Downey", role: "Neurologist", hospital: "Apollo Hospitals", avatar: "RD" },
  ];

  const complaints = [
    {
      title: "Acute Heart Pain",
      date: "10-Oct-2026",
      desc: "Patient with acute heart distress clutching sternum (Levine sign). Recommended stat 12-lead ECG and troponin assay.",
      treatments: ["Coronary Disease", "Arterial Spasm"],
      query: "34 year old male, acute crushing retrosternal chest pain clutching chest with clenched fist (Levine sign), diaphoresis, dyspnea",
    },
    {
      title: "Epigastric Pain & Yellow Sclera",
      date: "10-Oct-2026",
      desc: "15-year-old male with yellow urine, yellow eyes, and acute pain above stomach. Suspected viral hepatitis or bile canalicular obstruction.",
      treatments: ["Hepatic Ultrasound", "Viral Serology"],
      query: "a 15 year old male, pain above stomach, yellow urine, eyes becoming yellow, profound fatigue",
    },
    {
      title: "RLQ Abdominal Guarding",
      date: "10-Oct-2026",
      desc: "12-year-old male presenting with acute right lower quadrant pain, bouts of vomit, and anorexia. Alvarado score 9.",
      treatments: ["Appendectomy Consult", "NPO Hydration"],
      query: "A 12 years male from Delhi, having severe acute abdomen pain radiating to right lower quadrant, bouts of vomiting, and complete loss of appetite",
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* 1. Attending Doctors Directory (Matching Screenshot 2) */}
      <div className="humedix-card p-4">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Attending Clinical Team
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">4 Assigned</span>
        </div>

        <div className="space-y-2.5">
          {doctors.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-[#ff6332] font-black text-xs flex items-center justify-center shrink-0">
                  {doc.avatar}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">{doc.name}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{doc.role} • {doc.hospital}</span>
                </div>
              </div>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                On Duty
              </span>
            </div>
          ))}
        </div>

        {/* Cross-Hospital Surveillance Connectivity */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 text-[11px]">
          <span className="flex items-center gap-1.5 font-bold text-emerald-700 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Regional Synced
          </span>
          <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
            14-Day Surveillance
          </span>
        </div>
      </div>

      {/* 2. Patient Complaints & Treatment Feed (Matching Screenshot 2) */}
      <div className="humedix-card p-4">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Patient Complaints & Triage
          </h3>
          <span className="text-[10px] text-[#ff6332] font-bold">Live Stream</span>
        </div>

        <div className="space-y-2.5">
          {complaints.map((c, idx) => (
            <div
              key={idx}
              onClick={() => onSelectComplaint?.(c.query)}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200/80 hover:border-orange-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1 gap-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-[#ff6332] transition-colors truncate">
                  {c.title}
                </span>
                <span className="text-[9px] text-slate-400 font-mono shrink-0">{c.date}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-2 line-clamp-2">
                {c.desc}
              </p>

              {/* Treatment Tags */}
              <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-200/60">
                <span className="text-[9px] font-semibold text-slate-400">Rx:</span>
                {c.treatments.map((t, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[9px] font-bold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
