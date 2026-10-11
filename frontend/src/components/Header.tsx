"use client";

import React from "react";
import { Search, Settings, Bell, Sparkles, Activity, Plus, MapPin, MapPinOff, Navigation } from "lucide-react";
import { GeoLocationState } from "@/lib/useGeolocation";

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
  audioActive: boolean;
  aiReasoning: boolean;
  onSearch?: (query: string) => void;
  geoState?: GeoLocationState;
  onRequestLocation?: () => void;
}

export function Header({
  currentTab,
  onSelectTab,
  onOpenSettings,
  audioActive,
  aiReasoning,
  onSearch,
  geoState,
  onRequestLocation,
}: HeaderProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "camera", label: "Camera Pain AI" },
    { id: "rag", label: "Clinical RAG" },
    { id: "anatomy", label: "3D Anatomy" },
    { id: "sentinel", label: "Outbreak Radar" },
    { id: "solana", label: "Devnet Audit" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo for MediChain Omni */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => onSelectTab("overview")}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff6332] to-[#ff8f66] flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">
            <span className="text-xl leading-none font-bold">M</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                MediChain
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#ff6332] to-[#ff8f66] text-white flex items-center justify-center text-[10px] font-black uppercase tracking-wider shadow-xs">
                Omni
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 tracking-wider block -mt-0.5">
              CLINICAL WORKSTATION
            </span>
          </div>
        </div>

        {/* Center Pill Navigation Bar (Responsive & Non-Colliding) */}
        <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-inner shrink-0">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-[11px] xl:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Search Bar, Controls, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Bar Input (Only on 2xl screens to avoid collision) */}
          <div className="hidden 2xl:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200/60 w-44 text-slate-600 focus-within:bg-white focus-within:border-[#ff6332] focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search symptoms..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* GPS Location Status Pill */}
          {geoState && (
            <button
              onClick={onRequestLocation}
              title={
                geoState.status === "GRANTED"
                  ? `GPS Active: Lat ${geoState.latitude?.toFixed(4)}, Lon ${geoState.longitude?.toFixed(4)} (±${geoState.accuracy}m). Click to re-acquire.`
                  : geoState.status === "DENIED"
                  ? "Location permission was denied. Click to retry."
                  : "Click to enable browser GPS permission for outreach sentinel telemetry"
              }
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer shrink-0 ${
                geoState.status === "GRANTED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-xs"
                  : geoState.status === "PROMPTING"
                  ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                  : geoState.status === "DENIED"
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80"
              }`}
            >
              {geoState.status === "GRANTED" ? (
                <>
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
                  <span className="truncate max-w-[110px]">
                    GPS: {geoState.nearestRegion.split("/")[0].replace("Delhi ", "")}
                  </span>
                </>
              ) : geoState.status === "PROMPTING" ? (
                <>
                  <Navigation className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                  <span>Locking GPS...</span>
                </>
              ) : geoState.status === "DENIED" ? (
                <>
                  <MapPinOff className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>GPS Blocked</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-[#ff6332] shrink-0" />
                  <span>Tag GPS</span>
                </>
              )}
            </button>
          )}

          {/* AI Reason Status Pill */}
          {aiReasoning && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#ff6332] text-[11px] font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              RAG Processing
            </span>
          )}

          {/* Settings Button (Opens API Key credentials modal) */}
          <button
            onClick={onOpenSettings}
            title="Settings & API Key Credentials"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notification Bell (Quick access to live outbreak sentinel alerts) */}
          <div className="relative">
            <button
              onClick={() => onSelectTab("sentinel")}
              title="View Regional Outbreak Radar & Hospital Alerts"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#ff6332] text-slate-600 flex items-center justify-center transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff6332] ring-2 ring-white" />
          </div>

          {/* Profile Badge (Matching Screenshot) */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              JW
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <span className="text-xs font-bold text-slate-900 block">Dr. Jenny Wilson</span>
              <span className="text-[10px] text-slate-500 block font-medium">Chief of Cardiology</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Tab Scroll Strip (Only visible on screens < lg) */}
      <div className="lg:hidden w-full border-t border-slate-200/60 bg-white/95 px-4 py-2 overflow-x-auto flex items-center gap-1.5">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs font-black"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
