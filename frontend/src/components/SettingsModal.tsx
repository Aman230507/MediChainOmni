"use client";

import React, { useState } from "react";
import { X, Key, Shield, Check, Info } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  onSaveGeminiKey: (key: string) => void;
  elevenLabsKey: string;
  onSaveElevenLabsKey: (key: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  geminiKey,
  onSaveGeminiKey,
  elevenLabsKey,
  onSaveElevenLabsKey,
}: SettingsModalProps) {
  const [gemKeyInput, setGemKeyInput] = useState(geminiKey);
  const [elevenKeyInput, setElevenKeyInput] = useState(elevenLabsKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveGeminiKey(gemKeyInput);
    onSaveElevenLabsKey(elevenKeyInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-2xl glass-panel-elevated border border-white/10 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#007aff]/20 text-[#007aff] flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white uppercase tracking-wide">
              API Credentials & Clinical Config
            </h3>
            <p className="text-xs text-gray-400">Configure AI Providers & Voice Synthesis Engines</p>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 mb-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-start space-x-2">
          <Info className="w-4 h-4 text-[#007aff] shrink-0 mt-0.5" />
          <p>
            You can enter your personal API keys here, or leave them as placeholders. When placeholders are active, high-fidelity neural fallback simulations run seamlessly.
          </p>
        </div>

        {/* Gemini API Key Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={gemKeyInput}
              onChange={(e) => setGemKeyInput(e.target.value)}
              placeholder="AIzaSy... (or YOUR_API_KEY_HERE)"
              className="w-full px-3 py-2 text-xs font-mono bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#007aff]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Powers federated clinical librarian RAG engine.
            </span>
          </div>

          {/* ElevenLabs API Key Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              ElevenLabs API Key
            </label>
            <input
              type="password"
              value={elevenKeyInput}
              onChange={(e) => setElevenKeyInput(e.target.value)}
              placeholder="xi_... (or YOUR_API_KEY_HERE)"
              className="w-full px-3 py-2 text-xs font-mono bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#007aff]"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Generates empathetic bedside voice audio stream on high pain score.
            </span>
          </div>

          {/* Snowflake REST Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Snowflake Rare-Disease Vector Base
            </label>
            <input
              type="text"
              disabled
              value="SNOW-US-EAST.CLINICAL_VECTORS_1536D (Active REST Mock)"
              className="w-full px-3 py-2 text-xs font-mono bg-black/30 border border-white/5 rounded-lg text-gray-400"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold bg-[#007aff] hover:bg-[#007aff]/80 text-white rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-[#007aff]/20"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Apply</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
