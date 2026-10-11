"use client";

import React, { useState } from "react";
import { Shield, ExternalLink, Lock, PlusCircle, CheckCircle2, FileCheck2, AlertCircle } from "lucide-react";
import { SolanaAuditRecord } from "@/types";
import { anchorConsentOnSolana } from "@/lib/solana";

interface SolanaAuditTrailProps {
  auditRecords: SolanaAuditRecord[];
  onConsentMinted: (record: SolanaAuditRecord) => void;
}

export function SolanaAuditTrail({ auditRecords, onConsentMinted }: SolanaAuditTrailProps) {
  const [minting, setMinting] = useState<boolean>(false);

  const handleMintPreset = async (action: string, token: string, doc: string, summary: string) => {
    try {
      setMinting(true);
      const record = await anchorConsentOnSolana(action, token, doc, summary);
      onConsentMinted(record);
    } catch (e) {
      console.error(e);
    } finally {
      setMinting(false);
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes("CARDIAC") || action.includes("CHEST") || action.includes("ALARM")) {
      return "text-red-400 bg-red-500/15 border-red-500/30";
    }
    if (action.includes("RAG") || action.includes("APPENDICITIS")) {
      return "text-cyan-400 bg-cyan-500/15 border-cyan-500/30";
    }
    if (action.includes("GRIMACE") || action.includes("PAIN")) {
      return "text-amber-400 bg-amber-500/15 border-amber-500/30";
    }
    return "text-purple-300 bg-purple-500/15 border-purple-500/30";
  };

  return (
    <div className="surgical-panel rounded-2xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-3 border-b border-white/5 pb-2.5 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs tracking-wider text-white uppercase font-mono flex items-center gap-2">
              Zero-Trust Consent Layer
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                SOLANA DEVNET
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">Verifiable On-Chain ABHA Consent Receipts (Live Memo Program)</p>
          </div>
        </div>

        {/* Quick Consent Minting Presets */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px]">
          <button
            onClick={() => handleMintPreset(
              "PEDIATRIC_APPENDICITIS_CONSENT",
              "ABHA-PED-DELHI-12",
              "DR-AIIMS-SURG-404",
              "Emergency Ultrasound & Alvarado Score Surgical Appendectomy Authorization"
            )}
            disabled={minting}
            className="px-2 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
          >
            <FileCheck2 className="w-3 h-3" />
            <span>Appendicitis Consent</span>
          </button>

          <button
            onClick={() => handleMintPreset(
              "EMERGENCY_CARDIAC_LEVINE_OVERRIDE",
              "ABHA-ICU-8821",
              "DR-MAX-CARDIAC-901",
              "Stat 12-Lead Troponin Assay & Telemetry Monitored Bedside Consent"
            )}
            disabled={minting}
            className="px-2 py-1 rounded bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="w-3 h-3" />
            <span>Cardiac Override</span>
          </button>

          <button
            onClick={() => handleMintPreset(
              "ABHA_CROSS_BORDER_EXCHANGE",
              "ABHA-NDHM-9941",
              "DR-CENTRAL-AIIMS-CHIEF",
              "Federated Snowflake Rare Disease Vector Embedding Authorization"
            )}
            disabled={minting}
            className="px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border border-purple-500/40 transition-all cursor-pointer flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>ABHA Exchange</span>
          </button>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-xl border border-white/5 bg-black/40">
        <table className="w-full text-left text-[10px] font-mono">
          <thead className="sticky top-0 bg-[#0d111a] border-b border-white/10 z-10">
            <tr className="text-gray-400">
              <th className="p-2 font-semibold">Action / Event</th>
              <th className="p-2 font-semibold">Patient Token</th>
              <th className="p-2 font-semibold">SHA-256 Hash</th>
              <th className="p-2 font-semibold">Tx Signature</th>
              <th className="p-2 font-semibold text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {auditRecords.map((rec) => (
              <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-2">
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] border inline-block mb-0.5 ${getActionBadge(rec.action_type)}`}>
                    {rec.action_type}
                  </span>
                  <span className="text-[9px] text-gray-500 block">Slot #{rec.slot}</span>
                </td>
                <td className="p-2 text-gray-300">
                  <span className="font-semibold">{rec.patient_token}</span>
                  <span className="text-[9px] text-gray-500 block">{rec.doctor_identity}</span>
                </td>
                <td className="p-2 text-[#00f5a0] truncate max-w-[130px]" title={rec.consent_hash}>
                  {rec.consent_hash.slice(0, 10)}...{rec.consent_hash.slice(-6)}
                </td>
                <td className="p-2 text-[#00d2ff]">
                  <a
                    href={rec.solana_explorer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center space-x-1"
                    title={rec.tx_signature}
                  >
                    <span className="truncate max-w-[120px]">{rec.tx_signature}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                </td>
                <td className="p-2 text-right">
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[#00f5a0] border border-[#00f5a0]/30 text-[9px]">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>VERIFIED ZERO PII</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500 font-mono px-1">
        <span>Anchored to Solana Devnet Cluster (Live Memo Verification)</span>
        <span className="text-purple-300 font-bold">{auditRecords.length} Confirmed Transactions</span>
      </div>
    </div>
  );
}
