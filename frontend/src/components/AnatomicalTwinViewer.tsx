"use client";

import React, { useState } from "react";
import { Heart, Activity, Brain, Wind, ShieldAlert, Sparkles, ChevronRight, Layers, Eye } from "lucide-react";

interface HotspotPin {
  id: string;
  label: string;
  sublabel: string;
  topPct: number;
  leftPct: number;
  zone: "CHEST" | "LIVER" | "ABDOMEN" | "HEAD";
  symptomQuery: string;
  color: string;
}

const BODY_HOTSPOTS: HotspotPin[] = [
  {
    id: "chest-pin",
    label: "Acute Heart Pain",
    sublabel: "Retrosternal (Levine Sign)",
    topPct: 27,
    leftPct: 53,
    zone: "CHEST",
    symptomQuery: "34 year old male, acute crushing retrosternal chest pain clutching chest with clenched fist, diaphoresis, dyspnea",
    color: "#ff4d4f",
  },
  {
    id: "liver-pin",
    label: "Liver & Epigastrium",
    sublabel: "Bile Stasis / Jaundice",
    topPct: 37,
    leftPct: 52,
    zone: "LIVER",
    symptomQuery: "15 year old male, pain above stomach, yellow urine, eyes becoming yellow, profound fatigue",
    color: "#f59e0b",
  },
  {
    id: "abdomen-pin",
    label: "Right Iliac Fossa",
    sublabel: "McBurney / Appendicitis",
    topPct: 44,
    leftPct: 48,
    zone: "ABDOMEN",
    symptomQuery: "12 year old male from Delhi, severe acute abdomen pain in right lower quadrant, bouts of vomit, loss of appetite",
    color: "#ef4444",
  },
  {
    id: "head-pin",
    label: "Cranial Vault",
    sublabel: "Full Brain MRI / Headache",
    topPct: 9,
    leftPct: 50,
    zone: "HEAD",
    symptomQuery: "42 year old female, acute diplopia, bilateral external ophthalmoplegia, unsteady staggering gait, absent deep tendon reflexes",
    color: "#8b5cf6",
  },
];

interface AnatomicalTwinViewerProps {
  onSelectHotspot: (query: string, zone: string) => void;
  activeZone?: string;
}

export function AnatomicalTwinViewer({ onSelectHotspot, activeZone }: AnatomicalTwinViewerProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<"body" | "heart" | "lungs" | "brain">("body");
  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotPin | null>(null);

  return (
    <div className="humedix-card p-5 flex flex-col items-center justify-between relative overflow-hidden h-full min-h-[580px]">
      {/* Top Header Controls */}
      <div className="w-full flex items-center justify-between mb-2 z-10">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Musculoskeletal & Organ Telemetry</h3>
          <p className="text-xs text-slate-500 font-medium">Digital Bio-Twin Anterior Model</p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setSelectedOrgan("body")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              selectedOrgan === "body" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
            }`}
          >
            Full Body
          </button>
          <button
            onClick={() => setSelectedOrgan("heart")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              selectedOrgan === "heart" ? "bg-white text-[#ff5722] shadow-xs font-bold" : "hover:text-slate-900"
            }`}
          >
            <Heart className="w-3 h-3 text-[#ff5722]" />
            Heart
          </button>
          <button
            onClick={() => setSelectedOrgan("brain")}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              selectedOrgan === "brain" ? "bg-white text-purple-600 shadow-xs font-bold" : "hover:text-slate-900"
            }`}
          >
            <Brain className="w-3 h-3 text-purple-600" />
            Brain
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {selectedOrgan === "body" && (
        <div className="relative w-full flex-1 flex items-center justify-center my-3 min-h-[430px]">
          {/* Photorealistic Anatomy Frame */}
          <div className="relative w-full max-w-[310px] sm:max-w-[330px] aspect-[2/3] rounded-3xl overflow-hidden shadow-xl border border-slate-200/90 group/anatomy bg-gradient-to-b from-slate-100 to-slate-200">
            <img
              src="/anatomy/human_body_4k.jpg"
              alt="Human Anatomy Model"
              className="w-full h-full object-cover select-none transition-transform duration-500 group-hover/anatomy:scale-[1.02]"
            />

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

            {/* Interactive Glowing Hotspot Pins accurately placed on organs */}
            {BODY_HOTSPOTS.map((pin) => {
              const isActive = activeZone === pin.zone;
              const isVisible = hoveredHotspot?.id === pin.id || (isActive && !hoveredHotspot);
              return (
                <div
                  key={pin.id}
                  style={{ top: `${pin.topPct}%`, left: `${pin.leftPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                  onClick={() => onSelectHotspot(pin.symptomQuery, pin.zone)}
                  onMouseEnter={() => setHoveredHotspot(pin)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  {/* Outer pulse wave */}
                  <span
                    className="absolute -inset-2 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: pin.color }}
                  />
                  {/* Pin Circle Marker */}
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-125"
                    style={{ backgroundColor: pin.color }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>

                  {/* Single Floating Tooltip */}
                  <div
                    className={`absolute ${
                      pin.leftPct >= 50 ? "left-5" : "right-5"
                    } top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border border-slate-200 text-left transition-all duration-200 pointer-events-none z-30 min-w-[120px] max-w-[160px] ${
                      isVisible
                        ? "opacity-100 scale-100 ring-2 ring-orange-500/20"
                        : "opacity-0 pointer-events-none scale-95"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pin.color }} />
                      <span className="text-[11px] font-bold text-slate-900 truncate">{pin.label}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium block truncate mt-0.5">{pin.sublabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heart Detail View */}
      {selectedOrgan === "heart" && (
        <div className="flex-1 flex flex-col items-center justify-center my-3 w-full">
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-gradient-to-b from-rose-50 to-slate-100">
            <img
              src="/anatomy/heart_4k.jpg"
              alt="Anatomical Heart"
              className="w-full h-full object-cover animate-heartbeat select-none"
            />
          </div>
          <div className="text-center mt-3">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-slate-900 font-mono">105</span>
              <span className="text-xs font-bold text-rose-500 font-mono">BPM</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">Coronary LAD Perfusion • Normal Sinus Rhythm</p>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Left Anterior Descending Artery Patent</span>
          </div>
        </div>
      )}

      {/* Brain Detail View */}
      {selectedOrgan === "brain" && (
        <div className="flex-1 flex flex-col items-center justify-center my-3 w-full">
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-gradient-to-b from-purple-50 to-slate-100">
            <img
              src="/anatomy/brain_4k.jpg"
              alt="Anatomical Brain"
              className="w-full h-full object-cover select-none"
            />
          </div>
          <div className="text-center mt-3">
            <span className="text-xs font-bold text-slate-800">Cerebral Synaptic Connectome</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Axial T2-FLAIR Volumetric Synthesis • 0.3mm Resolution</p>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-0.5">✓ Intracranial Vasculature Clear</span>
          </div>
        </div>
      )}

      {/* Bottom Organ Selector Pills (Matching Screenshot 3) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 z-10">
        <span className="text-[11px] text-slate-500 font-medium shrink-0">Focus:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectHotspot("42 year old female, dyspnea, wheezing, bilateral bronchial constriction", "LUNGS")}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Wind className="w-3 h-3 text-blue-500" />
            <span>Lungs</span>
          </button>
          <button
            onClick={() => onSelectHotspot("34 year old male, acute crushing retrosternal chest pain clutching chest with clenched fist", "CHEST")}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Heart className="w-3 h-3 text-rose-500" />
            <span>Heart</span>
          </button>
          <button
            onClick={() => onSelectHotspot("42 year old female, acute diplopia, ataxia, ophthalmoplegia", "HEAD")}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-600 text-slate-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Brain className="w-3 h-3 text-purple-500" />
            <span>Brain</span>
          </button>
        </div>
      </div>
    </div>
  );
}
