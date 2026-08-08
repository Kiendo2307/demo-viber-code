import React, { useState } from 'react';
import { BlockType, CodeBlock, SavedProgram } from '../types';
import { RobotController } from '../lib/RobotController';
import { soundManager } from '../lib/sound';
import {
  Play,
  Square,
  Trash2,
  Save,
  FolderOpen,
  Plus,
  Repeat,
  Compass,
  Volume2,
  Lightbulb,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BlockProgrammingPanelProps {
  controller: RobotController;
  blocks: CodeBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<CodeBlock[]>>;
  addLog: (text: string, type?: 'info' | 'action' | 'warning' | 'success' | 'sensor') => void;
  savedPrograms: SavedProgram[];
  onSaveProgram: (name: string) => void;
  onLoadProgram: (program: SavedProgram) => void;
  onDeleteProgram: (id: string) => void;
  isExecuting: boolean;
  setIsExecuting: React.Dispatch<React.SetStateAction<boolean>>;
  activeBlockId: string | null;
  setActiveBlockId: React.Dispatch<React.SetStateAction<string | null>>;
  onResetRobot: () => void;
}

export const BlockProgrammingPanel: React.FC<BlockProgrammingPanelProps> = ({
  controller,
  blocks,
  setBlocks,
  addLog,
  savedPrograms,
  onSaveProgram,
  onLoadProgram,
  onDeleteProgram,
  isExecuting,
  setIsExecuting,
  activeBlockId,
  setActiveBlockId,
  onResetRobot,
}) => {
  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Available Block Prototypes to add
  const BLOCK_PALETTE: Array<{
    type: BlockType;
    category: 'motion' | 'control' | 'sensor' | 'output';
    title: string;
    defaultParams: Record<string, any>;
    bgClass: string;
  }> = [
    {
      type: 'move_forward',
      category: 'motion',
      title: 'Tiến',
      defaultParams: { distance: 20 },
      bgClass: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    },
    {
      type: 'move_backward',
      category: 'motion',
      title: 'Lùi',
      defaultParams: { distance: 20 },
      bgClass: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    },
    {
      type: 'turn_left',
      category: 'motion',
      title: 'Quay trái',
      defaultParams: { angle: 90 },
      bgClass: 'bg-purple-600 hover:bg-purple-500 text-white',
    },
    {
      type: 'turn_right',
      category: 'motion',
      title: 'Quay phải',
      defaultParams: { angle: 90 },
      bgClass: 'bg-purple-600 hover:bg-purple-500 text-white',
    },
    {
      type: 'stop',
      category: 'motion',
      title: 'Dừng lại',
      defaultParams: {},
      bgClass: 'bg-red-600 hover:bg-red-500 text-white',
    },
    {
      type: 'repeat',
      category: 'control',
      title: 'Lặp lại N lần',
      defaultParams: { times: 4 },
      bgClass: 'bg-amber-600 hover:bg-amber-500 text-white',
    },
    {
      type: 'if_obstacle',
      category: 'sensor',
      title: 'Nếu gặp vật cản (< 25cm)',
      defaultParams: { threshold: 25 },
      bgClass: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    {
      type: 'set_led',
      category: 'output',
      title: 'Bật Đèn LED',
      defaultParams: { color: 'green' },
      bgClass: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
    {
      type: 'play_sound',
      category: 'output',
      title: 'Phát Âm Thanh',
      defaultParams: { sound: 'beep' },
      bgClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    },
  ];

  const addBlockToWorkspace = (item: (typeof BLOCK_PALETTE)[0]) => {
    soundManager.playClick();
    const newBlock: CodeBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: item.type,
      params: { ...item.defaultParams },
      body: item.type === 'repeat' || item.type === 'if_obstacle' ? [] : undefined,
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const removeBlock = (id: string) => {
    soundManager.playClick();
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBlockParam = (id: string, paramKey: string, value: any) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return { ...b, params: { ...b.params, [paramKey]: value } };
        }
        return b;
      })
    );
  };

  // Execute Block Code Sequence sequentially
  const handleRunProgram = async () => {
    if (blocks.length === 0) {
      addLog('Chưa có khối lệnh nào trong vùng Lập trình!', 'warning');
      return;
    }

    setIsExecuting(true);
    addLog('▶ Bắt đầu chạy chương trình khối lệnh...', 'info');
    soundManager.playRobotStart();

    const executeBlockList = async (blockList: CodeBlock[]) => {
      for (const block of blockList) {
        if (!isExecuting && activeBlockId === 'STOPPED') break;

        setActiveBlockId(block.id);

        if (block.type === 'move_forward') {
          addLog(`Thực thi Lệnh: Tiến ${block.params.distance} cm`, 'action');
          await controller.moveForward(Number(block.params.distance));
          await new Promise((r) => setTimeout(r, 400));
        } else if (block.type === 'move_backward') {
          addLog(`Thực thi Lệnh: Lùi ${block.params.distance} cm`, 'action');
          await controller.moveBackward(Number(block.params.distance));
          await new Promise((r) => setTimeout(r, 400));
        } else if (block.type === 'turn_left') {
          addLog(`Thực thi Lệnh: Quay trái ${block.params.angle}°`, 'action');
          await controller.turnLeft(Number(block.params.angle));
          await new Promise((r) => setTimeout(r, 400));
        } else if (block.type === 'turn_right') {
          addLog(`Thực thi Lệnh: Quay phải ${block.params.angle}°`, 'action');
          await controller.turnRight(Number(block.params.angle));
          await new Promise((r) => setTimeout(r, 400));
        } else if (block.type === 'stop') {
          addLog('Thực thi Lệnh: Dừng robot', 'warning');
          await controller.stop();
        } else if (block.type === 'set_led') {
          addLog(`Thực thi Lệnh: Đèn LED -> ${block.params.color}`, 'info');
          await controller.setLED(block.params.color);
        } else if (block.type === 'play_sound') {
          addLog(`Thực thi Lệnh: Âm thanh ${block.params.sound}`, 'sensor');
          soundManager.playSensorBeep();
        } else if (block.type === 'repeat') {
          const times = Number(block.params.times) || 1;
          addLog(`Bắt đầu vòng lặp ${times} lần...`, 'info');
          for (let i = 0; i < times; i++) {
            if (block.body && block.body.length > 0) {
              await executeBlockList(block.body);
            } else {
              // Default fallback inside repeat if empty body
              await controller.moveForward(20);
              await controller.turnRight(90);
            }
          }
        } else if (block.type === 'if_obstacle') {
          const dist = await controller.readDistance();
          if (dist < (block.params.threshold || 25)) {
            addLog(`⚠️ Cảm biến phát hiện vật cản (${dist}cm < ${block.params.threshold}cm). Thực thi rẽ tránh!`, 'warning');
            if (block.body && block.body.length > 0) {
              await executeBlockList(block.body);
            } else {
              await controller.turnRight(90);
              await controller.moveForward(20);
            }
          } else {
            addLog(`An toàn (Khoảng cách ${dist}cm >= ${block.params.threshold}cm).`, 'info');
          }
        }
      }
    };

    try {
      await executeBlockList(blocks);
      addLog('✅ Hoàn thành toàn bộ chương trình!', 'success');
      soundManager.playVictory();
    } catch (err) {
      addLog('Đã dừng chương trình.', 'warning');
    } finally {
      setIsExecuting(false);
      setActiveBlockId(null);
    }
  };

  const handleStopProgram = async () => {
    setIsExecuting(false);
    setActiveBlockId('STOPPED');
    await controller.stop();
    soundManager.playRobotStop();
    addLog('⏹ Đã dừng chương trình khối lệnh.', 'warning');
  };

  const handleClearWorkspace = () => {
    soundManager.playClick();
    setBlocks([]);
    addLog('🧹 Đã xóa sạch vùng Lập trình.', 'info');
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="font-bold text-base text-purple-400 uppercase tracking-wide">💻 Lập Trình Khối Lệnh STEM</h2>
        </div>

        {/* Top Program Actions */}
        <div className="flex items-center gap-2">
          {!isExecuting ? (
            <button
              onClick={handleRunProgram}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              CHẠY CHƯƠNG TRÌNH
            </button>
          ) : (
            <button
              onClick={handleStopProgram}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              DỪNG CHƯƠNG TRÌNH
            </button>
          )}

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Save className="w-4 h-4" />
            Lưu
          </button>

          <button
            onClick={() => setShowLoadModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <FolderOpen className="w-4 h-4" />
            Mở ({savedPrograms.length})
          </button>

          <button
            onClick={handleClearWorkspace}
            className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-red-950/50 text-red-400 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Trash2 className="w-4 h-4" />
            Xóa hết
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column: Palette Blocks Picker */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh Mục Khối Lệnh (Bấm để thêm)</span>

          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {BLOCK_PALETTE.map((item, idx) => (
              <button
                key={idx}
                onClick={() => addBlockToWorkspace(item)}
                className={`flex items-center justify-between p-2.5 rounded-xl font-medium text-xs shadow transition transform hover:scale-[1.02] active:scale-95 ${item.bgClass}`}
              >
                <div className="flex items-center gap-2">
                  {item.category === 'motion' && <Compass className="w-4 h-4" />}
                  {item.category === 'control' && <Repeat className="w-4 h-4" />}
                  {item.category === 'sensor' && <ShieldAlert className="w-4 h-4" />}
                  {item.category === 'output' && <Lightbulb className="w-4 h-4" />}
                  <span>{item.title}</span>
                </div>
                <Plus className="w-4 h-4 opacity-80" />
              </button>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Code Workspace */}
        <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 min-h-[320px]">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Vùng Lập Trình (Workspace)</span>
            <span className="text-[11px] text-slate-400 font-mono">Tổng khối: {blocks.length}</span>
          </div>

          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2 border-2 border-dashed border-slate-800 rounded-xl">
              <Sparkles className="w-8 h-8 opacity-40 text-purple-400" />
              <p className="text-xs">Chưa có khối lệnh nào. Nhấn các nút khối lệnh ở cột bên trái để thiết kế chương trình!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    activeBlockId === block.id
                      ? 'bg-purple-950/80 border-purple-400 shadow-lg ring-2 ring-purple-500/50 scale-[1.01]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-purple-300">
                      {index + 1}
                    </span>

                    {/* Block parameters controls */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      {block.type === 'move_forward' && (
                        <>
                          <span className="text-cyan-400">TIẾN</span>
                          <input
                            type="number"
                            value={block.params.distance}
                            onChange={(e) => updateBlockParam(block.id, 'distance', e.target.value)}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-center font-mono text-cyan-300"
                          />
                          <span>cm</span>
                        </>
                      )}

                      {block.type === 'move_backward' && (
                        <>
                          <span className="text-cyan-400">LÙI</span>
                          <input
                            type="number"
                            value={block.params.distance}
                            onChange={(e) => updateBlockParam(block.id, 'distance', e.target.value)}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-center font-mono text-cyan-300"
                          />
                          <span>cm</span>
                        </>
                      )}

                      {block.type === 'turn_left' && (
                        <>
                          <span className="text-purple-400">QUAY TRÁI</span>
                          <select
                            value={block.params.angle}
                            onChange={(e) => updateBlockParam(block.id, 'angle', e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 font-mono text-purple-300"
                          >
                            <option value="45">45°</option>
                            <option value="90">90°</option>
                            <option value="180">180°</option>
                          </select>
                        </>
                      )}

                      {block.type === 'turn_right' && (
                        <>
                          <span className="text-purple-400">QUAY PHẢI</span>
                          <select
                            value={block.params.angle}
                            onChange={(e) => updateBlockParam(block.id, 'angle', e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 font-mono text-purple-300"
                          >
                            <option value="45">45°</option>
                            <option value="90">90°</option>
                            <option value="180">180°</option>
                          </select>
                        </>
                      )}

                      {block.type === 'stop' && <span className="text-red-400 font-bold">DỪNG LẠI</span>}

                      {block.type === 'repeat' && (
                        <>
                          <span className="text-amber-400 font-bold">LẶP LAI</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={block.params.times}
                            onChange={(e) => updateBlockParam(block.id, 'times', e.target.value)}
                            className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-center font-mono text-amber-300"
                          />
                          <span>lần [Tiến + Quay phải 90°]</span>
                        </>
                      )}

                      {block.type === 'if_obstacle' && (
                        <>
                          <span className="text-emerald-400 font-bold">NẾU VẬT CẢN &lt;</span>
                          <input
                            type="number"
                            value={block.params.threshold}
                            onChange={(e) => updateBlockParam(block.id, 'threshold', e.target.value)}
                            className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-center font-mono text-emerald-300"
                          />
                          <span>cm ➔ RẼ TRÁNH NÉ</span>
                        </>
                      )}

                      {block.type === 'set_led' && (
                        <>
                          <span className="text-blue-400">ĐÈN LED ➔</span>
                          <select
                            value={block.params.color}
                            onChange={(e) => updateBlockParam(block.id, 'color', e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 font-mono text-blue-300"
                          >
                            <option value="green">Xanh lá</option>
                            <option value="red">Đỏ</option>
                            <option value="blue">Xanh dương</option>
                            <option value="yellow">Vàng</option>
                            <option value="off">Tắt LED</option>
                          </select>
                        </>
                      )}

                      {block.type === 'play_sound' && (
                        <>
                          <span className="text-indigo-400">ÂM THANH ➔</span>
                          <select
                            value={block.params.sound}
                            onChange={(e) => updateBlockParam(block.id, 'sound', e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 font-mono text-indigo-300"
                          >
                            <option value="beep">Tiếng Beep</option>
                            <option value="cheer">Chúc mừng</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeBlock(block.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Program Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full flex flex-col gap-4">
            <h3 className="font-bold text-lg text-cyan-400">💾 Lưu Chương Trình Khối Lệnh</h3>
            <p className="text-xs text-slate-300">Đặt tên cho bài lập trình robot để lưu vào kho bộ nhớ trình duyệt.</p>
            <input
              type="text"
              placeholder="Ví dụ: Robot Lái Hình Vuông 01..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (saveName.trim()) {
                    onSaveProgram(saveName.trim());
                    setSaveName('');
                    setShowSaveModal(false);
                  }
                }}
                className="px-4 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl"
              >
                Lưu vào máy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Program Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-lg w-full flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-lg text-amber-400">📂 Thư Viện Chương Trình Đã Lưu</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {savedPrograms.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Chưa có chương trình nào được lưu.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {savedPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{prog.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Lưu ngày {prog.updatedAt} • {prog.blocks.length} khối lệnh
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadProgram(prog);
                          setShowLoadModal(false);
                        }}
                        className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-500"
                      >
                        Nạp
                      </button>
                      <button
                        onClick={() => onDeleteProgram(prog.id)}
                        className="p-1.5 bg-slate-800 text-red-400 rounded-lg hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
