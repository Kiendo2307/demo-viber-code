import React, { useEffect, useState } from 'react';
import { RobotController } from '../lib/RobotController';
import { LedColor, RobotState } from '../types';
import { soundManager } from '../lib/sound';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Gauge, Compass, Ruler, Volume2, Sparkles } from 'lucide-react';

interface DirectControlPanelProps {
  controller: RobotController;
  robotState: RobotState;
  setRobotState: React.Dispatch<React.SetStateAction<RobotState>>;
  addLog: (text: string, type?: 'info' | 'action' | 'warning' | 'success' | 'sensor') => void;
}

export const DirectControlPanel: React.FC<DirectControlPanelProps> = ({
  controller,
  robotState,
  setRobotState,
  addLog,
}) => {
  const [distanceStep, setDistanceStep] = useState<number>(20); // 10, 20, 50, 100 cm
  const [turnAngle, setTurnAngle] = useState<number>(90); // 45, 90, 180, 360 deg
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Keyboard controls listener (W, S, A, D, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (['W', 'ARROWUP'].includes(key)) {
        e.preventDefault();
        setActiveKey('FWD');
        handleMoveForward();
      } else if (['S', 'ARROWDOWN'].includes(key)) {
        e.preventDefault();
        setActiveKey('BWD');
        handleMoveBackward();
      } else if (['A', 'ARROWLEFT'].includes(key)) {
        e.preventDefault();
        setActiveKey('TL');
        handleTurnLeft();
      } else if (['D', 'ARROWRIGHT'].includes(key)) {
        e.preventDefault();
        setActiveKey('TR');
        handleTurnRight();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setActiveKey('STOP');
        handleStop();
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [distanceStep, turnAngle, robotState.speed]);

  const handleMoveForward = async () => {
    soundManager.playRobotStart();
    addLog(`Tiến ${distanceStep} cm (Tốc độ ${robotState.speed}%)`, 'action');
    await controller.moveForward(distanceStep);
  };

  const handleMoveBackward = async () => {
    soundManager.playRobotStart();
    addLog(`Lùi ${distanceStep} cm (Tốc độ ${robotState.speed}%)`, 'action');
    await controller.moveBackward(distanceStep);
  };

  const handleTurnLeft = async () => {
    soundManager.playRobotStart();
    addLog(`Quay trái ${turnAngle}°`, 'action');
    await controller.turnLeft(turnAngle);
  };

  const handleTurnRight = async () => {
    soundManager.playRobotStart();
    addLog(`Quay phải ${turnAngle}°`, 'action');
    await controller.turnRight(turnAngle);
  };

  const handleStop = async () => {
    soundManager.playRobotStop();
    addLog(`Dừng khẩn cấp Robot`, 'warning');
    await controller.stop();
  };

  const handleSpeedChange = (newSpeed: number) => {
    setRobotState((prev) => ({ ...prev, speed: newSpeed }));
    controller.setSpeed(newSpeed);
    addLog(`Đã cài đặt tốc độ: ${newSpeed}%`, 'info');
  };

  const handleLedChange = (color: LedColor) => {
    soundManager.playClick();
    setRobotState((prev) => ({ ...prev, led: color }));
    controller.setLED(color);
    addLog(`Đèn LED chuyển màu: ${color.toUpperCase()}`, 'info');
  };

  const handleBeepSound = () => {
    soundManager.playSensorBeep();
    addLog(`Phát âm thanh Cảnh báo Beep!`, 'sensor');
  };

  return (
    <div className="flex flex-col gap-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-base text-cyan-400 uppercase tracking-wide">🎮 Điều Khiển Trực Tiếp</h2>
        </div>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono border border-slate-700">
          Phím tắt: W, A, S, D | Space
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Arrow Directional Controller */}
        <div className="flex flex-col items-center justify-center bg-slate-950 p-4 rounded-2xl border border-slate-800 relative">
          <span className="text-xs font-semibold text-slate-400 mb-3 tracking-wider uppercase">Bảng Phím Hướng Robot</span>

          <div className="grid grid-cols-3 gap-3 w-56 h-56">
            <div></div>
            {/* FORWARD */}
            <button
              onClick={handleMoveForward}
              className={`flex flex-col items-center justify-center rounded-2xl font-bold text-sm transition-all transform active:scale-95 shadow-lg border ${
                activeKey === 'FWD'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-4 ring-cyan-500/30'
                  : 'bg-gradient-to-b from-cyan-600 to-cyan-700 text-white border-cyan-500 hover:from-cyan-500 hover:to-cyan-600'
              }`}
            >
              <ArrowUp className="w-7 h-7 mb-0.5" />
              <span>Tiến</span>
            </button>
            <div></div>

            {/* TURN LEFT */}
            <button
              onClick={handleTurnLeft}
              className={`flex flex-col items-center justify-center rounded-2xl font-bold text-sm transition-all transform active:scale-95 shadow-lg border ${
                activeKey === 'TL'
                  ? 'bg-purple-500 text-slate-950 border-purple-300 ring-4 ring-purple-500/30'
                  : 'bg-gradient-to-b from-purple-600 to-purple-700 text-white border-purple-500 hover:from-purple-500 hover:to-purple-600'
              }`}
            >
              <ArrowLeft className="w-7 h-7 mb-0.5" />
              <span>Trái</span>
            </button>

            {/* STOP EMERGENCY */}
            <button
              onClick={handleStop}
              className={`flex flex-col items-center justify-center rounded-2xl font-bold text-xs transition-all transform active:scale-95 shadow-lg border ${
                activeKey === 'STOP'
                  ? 'bg-red-500 text-slate-950 border-red-300 ring-4 ring-red-500/30'
                  : 'bg-gradient-to-b from-red-600 to-red-700 text-white border-red-500 hover:from-red-500 hover:to-red-600'
              }`}
            >
              <Square className="w-6 h-6 mb-1 fill-current" />
              <span>DỪNG</span>
            </button>

            {/* TURN RIGHT */}
            <button
              onClick={handleTurnRight}
              className={`flex flex-col items-center justify-center rounded-2xl font-bold text-sm transition-all transform active:scale-95 shadow-lg border ${
                activeKey === 'TR'
                  ? 'bg-purple-500 text-slate-950 border-purple-300 ring-4 ring-purple-500/30'
                  : 'bg-gradient-to-b from-purple-600 to-purple-700 text-white border-purple-500 hover:from-purple-500 hover:to-purple-600'
              }`}
            >
              <ArrowRight className="w-7 h-7 mb-0.5" />
              <span>Phải</span>
            </button>

            <div></div>
            {/* BACKWARD */}
            <button
              onClick={handleMoveBackward}
              className={`flex flex-col items-center justify-center rounded-2xl font-bold text-sm transition-all transform active:scale-95 shadow-lg border ${
                activeKey === 'BWD'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 ring-4 ring-cyan-500/30'
                  : 'bg-gradient-to-b from-cyan-600 to-cyan-700 text-white border-cyan-500 hover:from-cyan-500 hover:to-cyan-600'
              }`}
            >
              <ArrowDown className="w-7 h-7 mb-0.5" />
              <span>Lùi</span>
            </button>
            <div></div>
          </div>
        </div>

        {/* Right Column: Advanced Sliders & Parameters */}
        <div className="flex flex-col gap-4">
          {/* Speed Slider */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Tốc độ di chuyển
              </label>
              <span className="text-xs font-bold font-mono text-cyan-400">{robotState.speed}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={robotState.speed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between mt-2">
              {[25, 50, 75, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 text-[10px] rounded font-mono font-bold transition ${
                    robotState.speed === s ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

          {/* Distance Step Picker */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-purple-400" />
                Khoảng cách mỗi lệnh (cm)
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map((d) => (
                <button
                  key={d}
                  onClick={() => setDistanceStep(d)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition border ${
                    distanceStep === d
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {d} cm
                </button>
              ))}
            </div>
          </div>

          {/* Turn Angle Picker */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                Góc quay (Độ)
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[45, 90, 180, 360].map((a) => (
                <button
                  key={a}
                  onClick={() => setTurnAngle(a)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition border ${
                    turnAngle === a
                      ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Output Actions Bar (LED & Sound) */}
      <div className="flex flex-wrap items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Đèn LED:</span>
          {(['off', 'red', 'green', 'blue', 'yellow'] as LedColor[]).map((col) => (
            <button
              key={col}
              onClick={() => handleLedChange(col)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition border ${
                robotState.led === col
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {col === 'off' ? 'Tắt' : col === 'red' ? '🔴 Đỏ' : col === 'green' ? '🟢 Xanh lá' : col === 'blue' ? '🔵 Xanh dương' : '🟡 Vàng'}
            </button>
          ))}
        </div>

        <button
          onClick={handleBeepSound}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition"
        >
          <Volume2 className="w-4 h-4" />
          Phát Còi
        </button>
      </div>
    </div>
  );
};
