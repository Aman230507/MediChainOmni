"use client";

import React, { useState } from "react";
import { AlertTriangle, Building2, MapPin, Calendar, ShieldAlert, ChevronDown, ChevronUp, BellRing, Activity } from "lucide-react";
import { CrossHospitalAlert } from "@/types";

interface CrossHospitalAlertBannerProps {
  alerts: CrossHospitalAlert[];
}

export function CrossHospitalAlertBanner({ alerts }: CrossHospitalAlertBannerProps) {
  const [expanded, setExpanded] = useState<boolean>(true);

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4 shadow-xl shadow-red-500/20 border border-red-400/40 animate-pulse-slow"
        >
          {/* Subtle background icon */}
          <ShieldAlert className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 pointer-events-none" />

          {/* Top Headline Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-black shadow-md shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {alert.is_rapid_spam_burst || alert.status === "ANOMALOUS_RAPID_BURST_SURGE_ALERT" ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-200 font-mono font-black text-[10px] tracking-wider uppercase border border-purple-400/80 animate-pulse">
                      ⚠️ RAPID BURST ANOMALY (&lt;45s) • ANTI-POISONING QUARANTINE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-mono font-black text-[10px] tracking-wider uppercase border border-white/30">
                      CROSS-HOSPITAL 14-DAY SURVEILLANCE ALERT
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-black/30 text-amber-200 font-mono text-[10px] font-bold">
                    #{alert.alert_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-red-950 font-black text-[10px]">
                    {alert.repeat_count} REPEATED CASES WITHIN 2 WEEKS
                  </span>
                  {alert.gps_origin?.lat && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      GPS: {Number(alert.gps_origin.lat).toFixed(4)}, {Number(alert.gps_origin.lon).toFixed(4)}
                      {alert.gps_origin.accuracy_m ? ` (±${alert.gps_origin.accuracy_m}m)` : ""}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-black tracking-tight mt-1 text-white truncate">
                  Location Cluster: {alert.location_name} (PIN {alert.location_pincode})
                </h3>
              </div>
            </div>

            {/* Expand / Minimize Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{expanded ? "Hide Details" : "View All Hospital Actions"}</span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expandable Content Body */}
          {expanded && (
            <div className="mt-3.5 pt-3 border-t border-white/20 space-y-3 relative z-10 text-xs">
              {/* Symptom Cluster & Containment Directive */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-4 p-3 rounded-xl bg-black/25 border border-white/15">
                  <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider block mb-1">
                    Epidemic Symptom Cluster
                  </span>
                  <p className="font-extrabold text-white text-xs">
                    {alert.symptom_cluster}
                  </p>
                  <span className="text-[10px] text-white/80 block mt-1 font-mono">
                    ICD-11: {alert.pathogen_icd} • Window: {alert.window_timeframe}
                  </span>
                </div>

                <div className="md:col-span-8 p-3 rounded-xl bg-black/25 border border-white/15">
                  <span className="text-[10px] text-amber-200 font-bold uppercase tracking-wider block mb-1">
                    Emergency Containment Directive
                  </span>
                  <p className="text-white/95 text-xs leading-relaxed font-medium">
                    {alert.containment_directive}
                  </p>
                </div>
              </div>

              {/* Participating Hospital Emergency Departments Broadcast */}
              <div className="p-3 rounded-xl bg-white/15 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Alert Dispatched to All Regional Hospital Dashboards ({alert.participating_hospitals.length} Facilities in {alert.district}):
                  </span>
                  <span className="text-[10px] text-emerald-200 font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-300 animate-pulse" />
                    Broadcast Active
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {alert.participating_hospitals.map((hosp, hIdx) => (
                    <span
                      key={hIdx}
                      className="px-2.5 py-1 rounded-lg bg-black/40 text-white font-bold text-[11px] border border-white/20 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {hosp}
                    </span>
                  ))}
                </div>
              </div>

              {/* 2-Week Timeline of Case Presentations */}
              {alert.timeline_cases && alert.timeline_cases.length > 0 && (
                <div className="p-2.5 rounded-xl bg-black/20 text-[11px]">
                  <span className="text-[10px] text-white/80 font-bold block mb-1.5">
                    2-Week Presentation Timeline ({alert.repeat_count} Patients):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {alert.timeline_cases.map((tc, tcIdx) => (
                      <div key={tcIdx} className="p-2 rounded-lg bg-black/30 border border-white/10">
                        <div className="flex justify-between items-center text-[10px] font-bold text-amber-300">
                          <span>{tc.hospital}</span>
                          <span>{tc.days_ago}</span>
                        </div>
                        <p className="text-[10px] text-white/90 truncate mt-0.5">
                          {tc.symptoms}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
