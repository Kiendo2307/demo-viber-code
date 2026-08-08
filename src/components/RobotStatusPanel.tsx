import React from 'react';
import { RobotState } from '../types';
import { Activity, Gauge, Compass, ShieldAlert, BatteryCharging, Zap, Eye } from 'lucide-react';

interface RobotStatusPanelProps {
  robotState: RobotState;
}

export const RobotStatusPanel: React.FC<RobotStatusPanelProps> = ({ robotState }) => {
  const getStatusBadge = () => {
    switch (robotState.status) {
      case 'RUNNING':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs rounded-full flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ĐANG CHẠY (RUNNING)
          </span>
        );
      case 'COLLIDED':
        return (
          <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-xs rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            VA CHẠM (COLLIDED)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold text-xs rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            HOÀN THÀNH (COMPLETED)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            SẴN SÀNG (IDLE)
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-xs text-cyan-400 uppercase tracking-wider">ROBOT STATUS (Trạng Thái Realtime)</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        {/* Speed & Angle */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> TỐC ĐỘ:
          </span>
          <span className="font-bold text-sm text-cyan-400">{robotState.speed}%</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-purple-400" /> TỌA ĐỘ / GÓC:
          </span>
          <span className="font-bold text-sm text-purple-300">
            ({Math.round(robotState.x)}, {Math.round(robotState.y)}) | {Math.round(robotState.angle)}°
          </span>
        </div>

        {/* Ultrasonic Sensor */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> CẢM BIẾN K.CÁCH:
          </span>
          <span className={`font-bold text-sm ${robotState.distanceSensor < 20 ? 'text-red-400 font-black' : 'text-amber-300'}`}>
            {robotState.distanceSensor} cm
          </span>
        </div>

        {/* Battery Level */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> PIN (BATTERY):
          </span>
          <div className="flex items-center gap-2">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${robotState.battery}%` }}
              ></div>
            </div>
            <span className="font-bold text-emerald-400">{robotState.battery}%</span>
          </div>
        </div>
      </div>

      {/* Extra Sensors Status Row */}
      <div className="grid grid-cols-3 gap-3 text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">Cảm biến màu:</span>
          <span className="font-bold uppercase text-white">
            {robotState.colorSensor ? (
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                {robotState.colorSensor}
              </span>
            ) : (
              'Không'
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 text-[11px]">Lệnh đã chạy:</span>
          <span className="font-bold text-amber-400">{robotState.executedCommands}</span>
        </div>

        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="text-slate-400 text-[11px]">Số lần va chạm:</span>
          <span className="font-bold text-red-400">{robotState.collisions}</span>
        </div>
      </div>
    </div>
  );
};
