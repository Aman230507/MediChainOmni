"use client";

import React from "react";
import { Heart, Activity, Droplet, ShieldCheck } from "lucide-react";

interface PatientTelemetryDeckProps {
  heartRate?: number;
  bloodPressure?: string;
  glucoseLevel?: number;
  onSelectComplaint?: (symptom: string) => void;
}

export function PatientTelemetryDeck({
  heartRate = 105,
  bloodPressure = "130/80",
  glucoseLevel = 130,
  onSelectComplaint,
}: PatientTelemetryDeckProps) {
  return (
    <div className="space-y-3.5">
      {/* 1. Patient Profile Card (Matching Screenshot 1 & 2) */}
      <div className="humedix-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-white font-bold text-base">
              PT
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <h3 className="text-sm font-extrabold text-slate-900 truncate">Inpatient #88214</h3>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold text-[9px] flex items-center gap-1 border border-blue-200 shrink-0">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                Zero-PII
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">Male, 34 • Blood Group A+</p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-600 font-medium">
              <span>5&apos;11&quot;</span>
              <span>•</span>
              <span>175 lbs</span>
              <span>•</span>
              <span className="font-mono text-slate-400 truncate">ABHA-1002</span>
            </div>
          </div>
        </div>

        {/* Assigned Doctor Badge */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0">
              JW
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-slate-400 block -mb-0.5 leading-none">Attending</span>
              <span className="font-bold text-slate-800 text-xs block truncate">Dr. Jenny Wilson</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium shrink-0">Cardiology</span>
        </div>
      </div>

      {/* 2. Dual Vitals: Blood Pressure & Hemoglobin (Matching Screenshot 1) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Blood Status / Pressure */}
        <div className="humedix-card p-3">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">Pressure</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[8px] shrink-0">
              Normal
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-extrabold text-slate-900 leading-none">{bloodPressure}</span>
            <span className="text-[9px] font-bold text-slate-400">mmHg</span>
          </div>
          {/* Subtle Mini Radial Arc Visual */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-[#ff6332] h-full w-[72%] rounded-full" />
          </div>
        </div>

        {/* Blood Status / Hemoglobin */}
        <div className="humedix-card p-3">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">Hemoglobin</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[8px] shrink-0">
              Normal
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-extrabold text-slate-900 leading-none">19.3</span>
            <span className="text-[9px] font-bold text-slate-400">g/dL</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[82%] rounded-full" />
          </div>
        </div>
      </div>

      {/* 3. Heart-Rate Activity Card with 3D Anatomical Heart (Matching Screenshots 1 & 2) */}
      <div className="humedix-card p-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 truncate">Heart-rate Activity</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Resting: 60-100 bpm</p>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-2xl font-black text-slate-900">{heartRate}</span>
              <span className="text-xs font-bold text-rose-500">BPM</span>
            </div>
          </div>

          {/* 3D Realistic Anatomical Heart (Pulsing Animation) */}
          <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden shadow-md border border-rose-200/60 bg-rose-50">
            <img
              src="/anatomy/heart_4k.jpg"
              alt="4K Anatomical Heart"
              className="w-full h-full object-cover animate-heartbeat"
            />
          </div>
        </div>

        {/* Dynamic ECG Waveform */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Min 50</span>
          <span className="text-rose-500 font-bold">Current {heartRate}</span>
          <span>Max 130</span>
        </div>
      </div>

      {/* 4. Blood Glucose Levels (Matching Screenshot 2) */}
      <div className="humedix-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-amber-500" />
            Blood Glucose Levels
          </span>
          <span className="text-xs font-extrabold text-slate-900">{glucoseLevel} mg/dL</span>
        </div>
        {/* Multi-Bar Graph Visualization */}
        <div className="flex items-end gap-1.5 h-12 pt-2">
          {[45, 60, 52, 78, 65, 88, 70, 92, 85, 96, 75, 82].map((val, idx) => (
            <div key={idx} className="flex-1 bg-slate-100 rounded-md overflow-hidden h-full flex items-end">
              <div
                style={{ height: `${val}%` }}
                className={`w-full rounded-md transition-all ${
                  idx === 9 ? "bg-[#ff6332]" : "bg-orange-300"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Allergies & Sensitivities */}
      <div className="humedix-card p-4">
        <span className="text-xs font-bold text-slate-700 block mb-2">Patient Allergies & Sensitivities:</span>
        <div className="flex flex-wrap gap-1.5">
          {["Pollen", "Dust Mites", "Lactose", "Animal Dander"].map((al, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-semibold"
            >
              {al}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
