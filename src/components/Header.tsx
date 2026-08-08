import React from 'react';
import { RobotMap } from '../types';
import { PRESET_MAPS } from '../data/presetMaps';
import { soundManager } from '../lib/sound';
import {
  Bot,
  Gamepad2,
  Code2,
  Trophy,
  UserCheck,
  Cpu,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Map,
  Moon,
  Sun,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'control' | 'code';
  setActiveTab: (tab: 'control' | 'code') => void;
  currentMap: RobotMap;
  onSelectMap: (map: RobotMap) => void;
  onOpenAIModal: () => void;
  onOpenChallengeModal: () => void;
  onOpenHardwareModal: () => void;
  onOpenTeacherModal: () => void;
  onResetRobot: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentMap,
  onSelectMap,
  onOpenAIModal,
  onOpenChallengeModal,
  onOpenHardwareModal,
  onOpenTeacherModal,
  onResetRobot,
  isMuted,
  setIsMuted,
  darkMode,
  setDarkMode,
}) => {
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setEnabled(!nextMuted);
  };

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 shadow-2xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500 via-purple-600 to-indigo-600 rounded-2xl shadow-lg ring-2 ring-cyan-400/30">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white">
                ROBOTICS <span className="text-cyan-400">LAB</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-widest">
                STEM & AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Virtual Robotics & AI Learning Platform</p>
          </div>
        </div>

        {/* Primary Tabs (🎮 Điều khiển | 💻 Lập trình) */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('control');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'control'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            🎮 ĐIỀU KHIỂN
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('code');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'code'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            💻 LẬP TRÌNH
          </button>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Map Selector */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs">
            <Map className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            <select
              value={currentMap.id}
              onChange={(e) => {
                const found = PRESET_MAPS.find((m) => m.id === e.target.value);
                if (found) {
                  soundManager.playClick();
                  onSelectMap(found);
                }
              }}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-1"
            >
              {PRESET_MAPS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* AI Assistant Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAIModal();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            🤖 AI Assistant
          </button>

          {/* Challenge Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenChallengeModal();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5" />
            🏆 Thử Thách
          </button>

          {/* Hardware Bridge Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenHardwareModal();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            <Cpu className="w-3.5 h-3.5" />
            Robot Thật
          </button>

          {/* Teacher Mode Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenTeacherModal();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold text-xs rounded-xl border border-slate-700 transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Giáo Viên
          </button>

          {/* Reset Robot Button */}
          <button
            onClick={() => {
              soundManager.playRobotStop();
              onResetRobot();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition"
            title="🔄 Reset Vị Trí Robot"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Đổi Giao diện Tối / Sáng"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
