"use client";

import React, { useState, useEffect } from "react";
import { SentinelState } from "@/types";
import { MapPin, AlertTriangle, ShieldCheck, Zap, Radio, Crosshair } from "lucide-react";

interface NCRNode {
  pincode: string;
  name: string;
  zone: string;
  lat: number;
  lon: number;
  // Normalized 0-100 coordinates on radar viewport
  x: number;
  y: number;
}

const DELHI_NCR_NODES: NCRNode[] = [
  { pincode: "110085", name: "Rohini Sec 14", zone: "North-West Delhi", lat: 28.7150, lon: 77.1120, x: 38, y: 18 },
  { pincode: "110001", name: "Connaught Place", zone: "Central Delhi", lat: 28.6315, lon: 77.2167, x: 54, y: 44 },
  { pincode: "110029", name: "Safdarjung Enclave", zone: "South Delhi", lat: 28.5670, lon: 77.2000, x: 50, y: 64 },
  { pincode: "110075", name: "Dwarka Sec 10", zone: "South-West Delhi", lat: 28.5921, lon: 77.0460, x: 26, y: 58 },
  { pincode: "110020", name: "Okhla Phase III", zone: "South-East Delhi", lat: 28.5307, lon: 77.2713, x: 68, y: 72 },
  { pincode: "110092", name: "Laxmi Nagar", zone: "East Delhi", lat: 28.6300, lon: 77.2780, x: 72, y: 45 },
  { pincode: "122002", name: "Gurugram CyberCity", zone: "NCR South-West", lat: 28.4950, lon: 77.0895, x: 32, y: 84 },
  { pincode: "201301", name: "Noida Sector 62", zone: "NCR East", lat: 28.6280, lon: 77.3649, x: 88, y: 48 },
];

interface DelhiNCRRadarMapProps {
  sentinelState: SentinelState | null;
  onTriggerSurge: (pincode: string, symptom: string) => void;
}

export function DelhiNCRRadarMap({ sentinelState, onTriggerSurge }: DelhiNCRRadarMapProps) {
  const [selectedNode, setSelectedNode] = useState<NCRNode>(DELHI_NCR_NODES[0]);
  const [radarAngle, setRadarAngle] = useState<number>(0);

  // Radar continuous 360-degree sweep animation
  useEffect(() => {
    let animId: number;
    const sweep = () => {
      setRadarAngle((prev) => (prev + 1.2) % 360);
      animId = requestAnimationFrame(sweep);
    };
    animId = requestAnimationFrame(sweep);
    return () => cancelAnimationFrame(animId);
  }, []);

  const activeAlert = sentinelState?.active_alert;
  const dbscanClusters = sentinelState?.dbscan_clusters || [];

  // Helper to test if a node is in active surge/alert
  const getNodeAlertState = (pincode: string) => {
    const isAlert = activeAlert?.pincode === pincode;
    const cluster = dbscanClusters.find((c) => c.pincode === pincode);
    return {
      isAlert,
      cluster,
      status: isAlert ? "CRITICAL_SURGE" : cluster ? cluster.status : "NORMAL",
      density: cluster ? cluster.size : Math.floor(14 + (parseInt(pincode) % 19)),
    };
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Tactical Radar Display Card */}
      <div className="relative w-full h-[270px] bg-[#030712] rounded-xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Radar Concentric Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[85%] h-[85%] rounded-full border border-emerald-500/10 dashed" />
          <div className="absolute w-[60%] h-[60%] rounded-full border border-emerald-500/15" />
          <div className="absolute w-[35%] h-[35%] rounded-full border border-emerald-500/20" />
          <div className="absolute w-[12%] h-[12%] rounded-full border border-emerald-500/30 bg-emerald-500/5" />
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-emerald-500/15" />
          <div className="absolute h-full w-[1px] bg-emerald-500/15" />
        </div>

        {/* Rotating Radar Sweep Cone */}
        <div
          className="absolute w-[90%] h-[90%] rounded-full pointer-events-none transition-transform"
          style={{
            transform: `rotate(${radarAngle}deg)`,
            background:
              "conic-gradient(from 0deg, rgba(0, 245, 160, 0.22) 0deg, rgba(0, 245, 160, 0.04) 35deg, transparent 55deg)",
          }}
        />

        {/* Tactical HUD Header Overlays */}
        <div className="absolute top-2.5 left-3 flex items-center gap-2 pointer-events-none z-10">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold uppercase">
            <Radio className="w-3 h-3 text-[#00f5a0] animate-pulse" />
            NCR SENTINEL RADAR • 100+ IPS
          </span>
          <span className="px-1.5 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] text-gray-400">
            DBSCAN RADIUS: 1.8km
          </span>
        </div>

        <div className="absolute top-2.5 right-3 text-right pointer-events-none z-10">
          <span className="text-[9px] text-gray-400 block">COORDINATE ORIGIN</span>
          <span className="text-[10px] text-emerald-300 font-bold">28.6139° N, 77.2090° E</span>
        </div>

        {/* Plotted Delhi NCR Nodes */}
        {DELHI_NCR_NODES.map((node) => {
          const { isAlert, cluster, status, density } = getNodeAlertState(node.pincode);
          const isSelected = selectedNode.pincode === node.pincode;

          return (
            <div
              key={node.pincode}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => setSelectedNode(node)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              {/* Pulsing shockwave ring if alert/spike */}
              {isAlert && (
                <>
                  <span className="absolute -inset-2 rounded-full bg-red-600/40 animate-ping" />
                  <span className="absolute -inset-4 rounded-full border border-red-500/60 animate-pulse" />
                </>
              )}

              {/* Node Marker Dot */}
              <div
                className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-125 ${
                  isAlert
                    ? "bg-[#ff2a55] shadow-lg shadow-red-500/80 border-2 border-white"
                    : cluster
                    ? "bg-amber-400 border border-amber-200"
                    : isSelected
                    ? "bg-[#00f5a0] border-2 border-white shadow-lg shadow-[#00f5a0]/60"
                    : "bg-emerald-500/80 border border-emerald-300/60"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAlert ? "bg-white animate-ping" : isSelected ? "bg-black" : "bg-white/80"
                  }`}
                />
              </div>

              {/* Regional Node Tag */}
              <div
                className={`absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                  isAlert
                    ? "bg-red-950/90 border-red-500 text-red-200"
                    : isSelected
                    ? "bg-[#00f5a0]/20 border-[#00f5a0] text-[#00f5a0]"
                    : "bg-black/80 border-white/10 text-gray-300 opacity-80 group-hover:opacity-100"
                }`}
              >
                <span>{node.name}</span>
                <span className="ml-1 text-[8px] opacity-70">({node.pincode})</span>
              </div>
            </div>
          );
        })}

        {/* Bottom Legend */}
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between text-[8px] sm:text-[9px] text-gray-400 bg-black/75 px-2 py-1 rounded border border-white/10 pointer-events-none z-10 gap-1.5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0] shrink-0" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> Elevated
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ff2a55] animate-pulse shrink-0" /> IDSP Surge
            </span>
          </div>
          <span className="text-[#00f5a0] font-mono shrink-0">GPS ±12m</span>
        </div>
      </div>

      {/* Selected Regional Hub Telemetry Drawer */}
      <div className="p-3 rounded-xl bg-black/50 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00f5a0]/15 text-[#00f5a0]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white">{selectedNode.name}</h4>
                <span className="text-[10px] text-[#00f5a0] bg-[#00f5a0]/15 px-1.5 py-0.2 rounded font-mono">
                  PIN: {selectedNode.pincode}
                </span>
                <span className="text-[9px] text-gray-400">({selectedNode.zone})</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                GPS: {selectedNode.lat.toFixed(4)}°N, {selectedNode.lon.toFixed(4)}°E • Ring Isolation: Level-1
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerSurge(selectedNode.pincode, "Acute Respiratory Distress (Novel Paramyxo-Z)")}
              className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-[10px] font-bold text-red-200 flex items-center gap-1 transition-all cursor-pointer shadow-md"
            >
              <Zap className="w-3 h-3 text-red-400 animate-bounce" />
              <span>Simulate Surge Here</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics for this Regional Pin */}
        {(() => {
          const { isAlert, cluster, status, density } = getNodeAlertState(selectedNode.pincode);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[10px]">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[9px]">Status</span>
                <span
                  className={`font-bold ${
                    isAlert ? "text-[#ff2a55] animate-pulse" : cluster ? "text-amber-300" : "text-[#00f5a0]"
                  }`}
                >
                  {status}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[9px]">Verified Case Load</span>
                <span className="font-bold text-white">{density} Signals / min</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[9px]">DBSCAN Density Factor</span>
                <span className="font-bold text-[#00d2ff]">
                  {cluster ? `${(cluster.size / 12).toFixed(2)}x` : "1.04x (Baseline)"}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[9px]">Containment Ring</span>
                <span className="font-bold text-gray-200">
                  {isAlert ? "Active Quarantine" : "Clear / Surveillance"}
                </span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
