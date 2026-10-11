"use client";

import React, { useState, useEffect } from "react";
import { Radio, AlertTriangle, Database, Flame, Terminal, MapPin, Zap, BarChart3, Radar, Building2, ShieldAlert, Globe, ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { SentinelState, EpidemicAlert, DBSCANCluster, LiveInternetAlert } from "@/types";
import { triggerOutbreakSpike, executeTigerSQL, fetchLiveInternetAlerts } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DelhiNCRRadarMap } from "./DelhiNCRRadarMap";

interface OutbreakSentinelProps {
  sentinelState: SentinelState | null;
  onConsentMinted: (record: any) => void;
}

export function OutbreakSentinel({ sentinelState, onConsentMinted }: OutbreakSentinelProps) {
  const [chartData, setChartData] = useState<Array<{ time: string; ips: number; severe: number }>>([]);
  const [isSimulatingSpike, setIsSimulatingSpike] = useState<boolean>(false);
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT time_bucket('10s', ts), pincode, symptom, count(*) FROM sentinel_telemetry WHERE ts > NOW() - INTERVAL '5m' GROUP BY 1, 2, 3 ORDER BY count DESC LIMIT 10;"
  );
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlRunning, setSqlRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"radar" | "stream" | "dbscan" | "sql" | "crossAlerts" | "webAlerts">("webAlerts");
  const [liveWebAlerts, setLiveWebAlerts] = useState<LiveInternetAlert[]>([]);
  const [isRefreshingWeb, setIsRefreshingWeb] = useState<boolean>(false);

  // Sync live internet alerts
  useEffect(() => {
    if (sentinelState?.live_internet_alerts && sentinelState.live_internet_alerts.length > 0) {
      setLiveWebAlerts(sentinelState.live_internet_alerts);
    } else {
      fetchLiveInternetAlerts().then((res) => {
        if (res.alerts) setLiveWebAlerts(res.alerts);
      });
    }
  }, [sentinelState]);

  const handleRefreshWeb = async () => {
    setIsRefreshingWeb(true);
    try {
      const res = await fetchLiveInternetAlerts();
      if (res.alerts) setLiveWebAlerts(res.alerts);
    } finally {
      setIsRefreshingWeb(false);
    }
  };

  // Maintain smooth sliding window for time-series chart
  useEffect(() => {
    if (!sentinelState) return;

    const now = new Date();
    const timeStr = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, "0")}`;
    const currentIps = sentinelState.ingest_rate_ips || 132;
    const severeCount = sentinelState.recent_telemetry_sample.filter(p => p.severity_score >= 7.0).length;

    setChartData(prev => {
      const next = [...prev, { time: timeStr, ips: currentIps, severe: severeCount * 4 }];
      return next.slice(-20);
    });
  }, [sentinelState]);

  // Trigger Outbreak Spike
  const handleTriggerSpike = async (pincode: string = "110085", symptom: string = "Acute Respiratory Distress (Novel Paramyxo-Z)") => {
    try {
      setIsSimulatingSpike(true);
      await triggerOutbreakSpike(pincode, symptom, 420);
      setTimeout(() => setIsSimulatingSpike(false), 2000);
    } catch (e) {
      console.error(e);
      setIsSimulatingSpike(false);
    }
  };

  // Run SQL Query on Tiger Data
  const handleRunSQL = async () => {
    try {
      setSqlRunning(true);
      const res = await executeTigerSQL(sqlQuery);
      setSqlResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSqlRunning(false);
    }
  };

  const alert = sentinelState?.active_alert;

  return (
    <div className={`bg-slate-950 text-white rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden shadow-2xl space-y-3.5 ${
      alert ? "border-rose-500 shadow-rose-950/50" : "border-slate-800 shadow-slate-950/20"
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            alert ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
          }`}>
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-tight">
                Outbreak Sentinel
              </h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold shrink-0">
                TIGER DATA • DBSCAN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">100+ IPS Ingestion & Spatial DBSCAN Hotspot Sentinel</p>
          </div>
        </div>

        {/* Real-time Rate Badge & Burst Simulation Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono font-bold">
            <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{(sentinelState?.ingest_rate_ips || 135).toFixed(0)} Pings/Sec</span>
          </div>

          <button
            onClick={() => handleTriggerSpike("110085", "Acute Respiratory Distress (Novel Paramyxo-Z)")}
            disabled={isSimulatingSpike}
            className="px-2.5 py-1 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span>Surge (PIN 110085)</span>
          </button>
        </div>
      </div>

      {/* CRITICAL IDSP EPIDEMIC ALERT BANNER */}
      {alert && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/90 via-red-900/60 to-black/80 border-2 border-rose-500 shadow-2xl shadow-red-600/30 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black animate-bounce shadow-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-[10px] font-black tracking-widest text-red-300 uppercase bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/40">
                    IDSP EPIDEMIC ALERT #{alert.alert_id}
                  </span>
                  <span className="text-xs text-white font-bold">
                    SURGE: {alert.growth_rate_pct}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-white mt-0.5 font-sans">
                  Pathogen: {alert.pathogen_signature}
                </h3>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[9px] text-gray-400 uppercase block">Epicenter PIN</span>
              <span className="text-sm font-black text-red-400">{alert.pincode}</span>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-1.5 rounded bg-black/50 border border-red-500/30">
              <span className="text-[9px] text-gray-400 block">DBSCAN Density Cluster Size</span>
              <span className="font-bold text-white">{alert.cluster_size} Verified Cases in 30s</span>
            </div>
            <div className="p-1.5 rounded bg-black/50 border border-red-500/30">
              <span className="text-[9px] text-gray-400 block">Spatial Coordinates</span>
              <span className="font-bold text-white">{alert.epicenter_lat}°N, {alert.epicenter_lon}°E</span>
            </div>
            <div className="p-1.5 rounded bg-black/50 border border-red-500/30">
              <span className="text-[9px] text-gray-400 block">Containment Directive</span>
              <span className="font-bold text-amber-300 truncate block font-sans">{alert.containment_directive}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-[11px] overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("radar")}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === "radar" ? "bg-emerald-500 text-slate-950 shadow-xs font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Radar className="w-3 h-3" />
          <span>Delhi Radar</span>
        </button>
        <button
          onClick={() => setActiveTab("stream")}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === "stream" ? "bg-emerald-500 text-slate-950 shadow-xs font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-3 h-3" />
          <span>Live Stream</span>
        </button>
        <button
          onClick={() => setActiveTab("dbscan")}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === "dbscan" ? "bg-emerald-500 text-slate-950 shadow-xs font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          <MapPin className="w-3 h-3" />
          <span>DBSCAN ({sentinelState?.dbscan_clusters.length || 0})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("sql");
            if (!sqlResult) handleRunSQL();
          }}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === "sql" ? "bg-emerald-500 text-slate-950 shadow-xs font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Terminal className="w-3 h-3" />
          <span>Tiger SQL</span>
        </button>
        <button
          onClick={() => setActiveTab("crossAlerts")}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === "crossAlerts" ? "bg-amber-400 text-slate-950 shadow-xs font-extrabold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Building2 className="w-3 h-3" />
          <span>Hospital 2W ({sentinelState?.cross_hospital_alerts?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("webAlerts")}
          className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === "webAlerts" ? "bg-emerald-400 text-slate-950 shadow-xs font-black" : "text-emerald-400 hover:text-emerald-300"
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>Live Web Outbreaks ({liveWebAlerts.length})</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Tab 0: Tactical Delhi NCR Radar Map */}
      {activeTab === "radar" && (
        <DelhiNCRRadarMap sentinelState={sentinelState} onTriggerSurge={handleTriggerSpike} />
      )}

      {/* Tab 1: Area Chart */}
      {activeTab === "stream" && (
        <div>
          <div className="h-40 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="mintIps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#00f5a0" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="crimsonSevere" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2a55" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ff2a55" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d111a",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    fontSize: "11px",
                    color: "#fff",
                    fontFamily: "monospace"
                  }}
                />
                <Area type="monotone" dataKey="ips" stroke="#00f5a0" strokeWidth={2} fillOpacity={1} fill="url(#mintIps)" name="Ingest (IPS)" />
                <Area type="monotone" dataKey="severe" stroke="#ff2a55" strokeWidth={2} fillOpacity={1} fill="url(#crimsonSevere)" name="Severe Signals" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono">
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-gray-400 block">Total Ingested</span>
              <span className="text-xs font-bold text-white">
                {(sentinelState?.total_ingested || 18000).toLocaleString()} pings
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-gray-400 block">Tiger Hypertable</span>
              <span className="text-xs font-bold text-[#00f5a0]">
                {(sentinelState?.active_buffer_size || 5000).toLocaleString()} rows
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-gray-400 block">Top PIN Active</span>
              <span className="text-xs font-bold text-[#00d2ff]">
                {sentinelState?.pincode_breakdown[0]?.pincode || "110001"} ({sentinelState?.pincode_breakdown[0]?.count || 14})
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-[9px] text-gray-400 block">Hotspots</span>
              <span className={`text-xs font-bold ${alert ? "text-[#ff2a55]" : "text-gray-300"}`}>
                {sentinelState?.dbscan_clusters.length || 0} Clusters
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DBSCAN Spatial Clusters */}
      {activeTab === "dbscan" && (
        <div className="space-y-2">
          {sentinelState?.dbscan_clusters && sentinelState.dbscan_clusters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono">
              {sentinelState.dbscan_clusters.map((cluster) => (
                <div
                  key={cluster.cluster_id}
                  className={`p-2.5 rounded-xl border ${
                    cluster.status === "ALERT" 
                      ? "bg-red-950/30 border-red-500/40 glow-border-crimson" 
                      : "bg-black/40 border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#00f5a0]" />
                      PIN {cluster.pincode} ({cluster.region_name})
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      cluster.status === "ALERT" ? "bg-red-500 text-white animate-pulse" : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {cluster.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 truncate font-sans">{cluster.dominant_symptom}</p>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Density: {cluster.size} nodes</span>
                    <span>{cluster.center_lat}°N, {cluster.center_lon}°E</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center text-xs text-gray-400 rounded-xl bg-black/20 border border-white/5 font-mono">
              <p>DBSCAN density filter running in real-time (eps: 0.018°, min_samples: 12).</p>
              <p className="mt-1 text-gray-500">No statistically abnormal outbreak clusters in current buffer.</p>
              <button
                onClick={() => handleTriggerSpike("110085", "Acute Respiratory Distress (Novel Paramyxo-Z)")}
                className="mt-2.5 px-3 py-1 rounded-md bg-[#ff2a55]/20 hover:bg-[#ff2a55]/30 text-[#ff2a55] border border-[#ff2a55]/40 text-xs font-semibold cursor-pointer"
              >
                Inject Outbreak Spike to Test DBSCAN
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tiger Data SQL Terminal */}
      {activeTab === "sql" && (
        <div className="space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full p-2 text-xs font-mono bg-black/80 border border-white/10 rounded-lg text-[#00f5a0] focus:outline-none focus:border-[#00f5a0]"
            />
            <button
              onClick={handleRunSQL}
              disabled={sqlRunning}
              className="absolute bottom-2 right-2 px-2.5 py-1 text-xs font-mono bg-[#00f5a0] text-black font-bold rounded cursor-pointer flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" />
              <span>{sqlRunning ? "Running..." : "Run SQL"}</span>
            </button>
          </div>

          {sqlResult && (
            <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/50 max-h-40 overflow-y-auto">
              <div className="px-2.5 py-1 bg-white/5 border-b border-white/10 text-[9px] font-mono text-gray-400 flex justify-between">
                <span>{sqlResult.engine}</span>
                <span>Scanned {sqlResult.total_rows_scanned} rows in {sqlResult.execution_time_ms}ms</span>
              </div>
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400">
                    {sqlResult.columns.map((col: string, idx: number) => (
                      <th key={idx} className="p-1.5 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {sqlResult.rows.map((row: any[], rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02]">
                      {row.map((cell: any, cIdx: number) => (
                        <td key={cIdx} className="p-1.5">{String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Cross-Hospital 2-Week Epidemiological Alerts */}
      {activeTab === "crossAlerts" && (
        <div className="space-y-3">
          {(!sentinelState?.cross_hospital_alerts || sentinelState.cross_hospital_alerts.length === 0) ? (
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-center text-xs text-gray-400 font-mono">
              No active 14-day cross-hospital alerts. System is monitoring longitudinal clusters across all regional PIN codes.
            </div>
          ) : (
            sentinelState.cross_hospital_alerts.map((alert, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {alert.alert_id} • {alert.window_timeframe}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono font-bold text-[10px]">
                    {alert.repeat_count} CASES
                  </span>
                </div>

                <div className="font-bold text-white text-xs">
                  {alert.location_name} (PIN {alert.location_pincode}) — {alert.symptom_cluster}
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed font-mono">
                  {alert.containment_directive}
                </p>

                <div className="pt-2 border-t border-white/10 text-[10px] text-gray-400 font-mono">
                  <strong className="text-gray-200">Alerted Hospitals: </strong>
                  {alert.participating_hospitals.join(", ")}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Live Internet Disease Outbreak Feeds (Direct from Web) */}
      {activeTab === "webAlerts" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Globe className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-slate-100 block truncate text-xs">
                  Live Public Health Feeds
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  PIB • MoHFW • WHO • Gavi • NDTV • MCD bulletins
                </span>
              </div>
            </div>

            <button
              onClick={handleRefreshWeb}
              disabled={isRefreshingWeb}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingWeb ? "animate-spin" : ""}`} />
              <span>{isRefreshingWeb ? "Updating..." : "Refresh"}</span>
            </button>
          </div>

          {liveWebAlerts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 font-mono">
              Fetching real-time disease outbreak alerts from verified web sources...
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[360px] overflow-y-auto pr-1">
              {liveWebAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 text-xs space-y-2 transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold text-[10px] tracking-wide border border-emerald-500/30 shrink-0 uppercase">
                        {alert.source}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono font-bold shrink-0">
                        ICD-11 {alert.icd11}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {alert.published_at ? alert.published_at.replace(/GMT.*$/, "").slice(0, 16).trim() : "Live Alert"}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-100 text-xs leading-snug group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {alert.headline}
                  </h5>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold truncate max-w-[240px]">
                      🦠 {alert.pathogen}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 truncate max-w-[180px]">
                      📍 {alert.region}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Verified Public Health Alert
                    </span>
                    <a
                      href={alert.web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                    >
                      <span>Read Bulletin</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
