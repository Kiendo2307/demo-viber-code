import React, { useState } from 'react';
import { Challenge } from '../types';
import { ROBOT_CHALLENGES } from '../data/challenges';
import { soundManager } from '../lib/sound';
import { Trophy, Star, Clock, Target, Play, ShieldAlert, Award } from 'lucide-react';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChallenge: (challenge: Challenge) => void;
  activeChallenge: Challenge | null;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onSelectChallenge,
  activeChallenge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-2xl shadow-lg">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">🏆 BẢNG THỬ THÁCH ROBOTICS STEM</h3>
              <p className="text-xs text-slate-400">
                Thực hành bài tập thực tế: Lập trình robot vượt mê cung, thu gom ngọc và dò đường để tích điểm!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Challenges List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROBOT_CHALLENGES.map((ch) => {
            const isCurrent = activeChallenge?.id === ch.id;

            return (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                      CẤP ĐỘ {ch.id}
                    </span>
                    <div className="flex items-center gap-0.5 text-yellow-400">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current text-yellow-400" />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-white">{ch.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{ch.description}</p>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 text-xs flex flex-col gap-1 text-slate-300 font-mono">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Target className="w-3.5 h-3.5" />
                    <span>Mục tiêu: {ch.goal}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Thời gian: {ch.maxTime}s
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-purple-400" /> Điểm thưởng: +{ch.targetScore}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    onSelectChallenge(ch);
                    onClose();
                  }}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-slate-800 hover:bg-amber-600 text-white hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isCurrent ? 'ĐANG THỰC HIỆN' : 'BẮT ĐẦU THỬ THÁCH'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
