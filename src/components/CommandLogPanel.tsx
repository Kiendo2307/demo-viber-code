import React from 'react';
import { CommandLogItem } from '../types';
import { Terminal, Trash2, Download } from 'lucide-react';

interface CommandLogPanelProps {
  logs: CommandLogItem[];
  onClearLogs: () => void;
}

export const CommandLogPanel: React.FC<CommandLogPanelProps> = ({ logs, onClearLogs }) => {
  const handleExportLogs = () => {
    const textContent = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robot_command_log_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTypeStyle = (type: CommandLogItem['type']) => {
    switch (type) {
      case 'action':
        return 'text-cyan-400 font-semibold';
      case 'warning':
        return 'text-red-400 font-bold';
      case 'success':
        return 'text-emerald-400 font-bold';
      case 'sensor':
        return 'text-purple-400 font-semibold';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-xs text-cyan-400 uppercase tracking-wider">
            COMMAND LOG (Lịch Sử Hoạt Động - {logs.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg disabled:opacity-40 transition"
            title="Tải lịch sử file .txt"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg disabled:opacity-40 transition"
            title="Xóa lịch sử log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-40 overflow-y-auto font-mono text-[11px] flex flex-col gap-1.5 custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic py-3 text-center">Chưa có nhật ký lệnh nào.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-tight">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className={getTypeStyle(log.type)}>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
