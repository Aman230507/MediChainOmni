"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Volume2 } from "lucide-react";

interface AIOrbProps {
  isReasoning: boolean;
  isSpeaking: boolean;
  statusText?: string;
}

export function AIOrb({ isReasoning, isSpeaking, statusText }: AIOrbProps) {
  const active = isReasoning || isSpeaking;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-50 flex items-center space-x-4 p-4 rounded-2xl glass-panel-elevated shadow-2xl border border-[#007aff]/40"
        >
          {/* Animated 3D Pulsing Orb */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Outer Chromatic Glow Rings */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.7, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#007aff] via-[#bf5af2] to-[#ff2d55] blur-md opacity-60"
            />

            {/* Middle Energy Pulse */}
            <motion.div
              animate={{
                scale: [1.1, 0.9, 1.1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-1 rounded-full bg-gradient-to-br from-[#007aff] to-[#5e5ce6] blur-sm"
            />

            {/* Inner Core */}
            <div className="relative w-9 h-9 rounded-full bg-[#0a0f1d] border border-white/40 flex items-center justify-center shadow-inner">
              {isSpeaking ? (
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#007aff] animate-spin" style={{ animationDuration: "4s" }} />
              )}
            </div>
          </div>

          {/* Reasoning / Voice Status text */}
          <div className="pr-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                {isSpeaking ? "Empathetic Audio Stream" : "Clinical RAG Synthesizer"}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#007aff] animate-ping" />
            </div>
            <p className="text-[11px] text-gray-300 font-medium">
              {statusText || (isSpeaking ? "ElevenLabs Vocal Stream Active" : "Gemini Cross-Referencing Snowflake Vectors...")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
