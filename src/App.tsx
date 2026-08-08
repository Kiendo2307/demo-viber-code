/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  CodeBlock,
  CommandLogItem,
  MapObject,
  RobotMap,
  RobotState,
  RobotStatus,
  SavedProgram,
  Challenge,
} from './types';
import { PRESET_MAPS } from './data/presetMaps';
import { ROBOT_CHALLENGES } from './data/challenges';
import { RobotController } from './lib/RobotController';
import { soundManager } from './lib/sound';

import { Header } from './components/Header';
import { RobotCanvas } from './components/RobotCanvas';
import { DirectControlPanel } from './components/DirectControlPanel';
import { BlockProgrammingPanel } from './components/BlockProgrammingPanel';
import { RobotStatusPanel } from './components/RobotStatusPanel';
import { CommandLogPanel } from './components/CommandLogPanel';

import { AIAssistantModal } from './components/AIAssistantModal';
import { ChallengeModal } from './components/ChallengeModal';
import { HardwareConnectModal } from './components/HardwareConnectModal';
import { TeacherModeModal } from './components/TeacherModeModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'control' | 'code'>('control');
  const [currentMap, setCurrentMap] = useState<RobotMap>(PRESET_MAPS[0]);
  const [teacherModeActive, setTeacherModeActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Initial Robot State
  const [robotState, setRobotState] = useState<RobotState>({
    x: PRESET_MAPS[0].startPos.x,
    y: PRESET_MAPS[0].startPos.y,
    angle: PRESET_MAPS[0].startPos.angle,
    speed: 65,
    battery: 87,
    led: 'off',
    status: 'IDLE',
    distanceSensor: 100,
    colorSensor: null,
    lineSensor: false,
    trail: [{ x: PRESET_MAPS[0].startPos.x, y: PRESET_MAPS[0].startPos.y }],
    executedCommands: 0,
    collisions: 0,
  });

  // Command Logs State
  const [logs, setLogs] = useState<CommandLogItem[]>([
    {
      id: 'l1',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      text: '🤖 Hệ thống Mô phỏng Robotics STEM đã khởi động sẵn sàng.',
      type: 'info',
    },
  ]);

  const addLog = (text: string, type: CommandLogItem['type'] = 'info') => {
    const newLog: CommandLogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      text,
      type,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Block Code State
  const [blocks, setBlocks] = useState<CodeBlock[]>([
    { id: 'b1', type: 'set_led', params: { color: 'green' } },
    { id: 'b2', type: 'move_forward', params: { distance: 50 } },
    { id: 'b3', type: 'turn_right', params: { angle: 90 } },
    { id: 'b4', type: 'move_forward', params: { distance: 30 } },
    { id: 'b5', type: 'stop', params: {} },
  ]);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Saved Programs in LocalStorage
  const [savedPrograms, setSavedPrograms] = useState<SavedProgram[]>(() => {
    try {
      const stored = localStorage.getItem('robot_saved_programs');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'default_1',
        name: 'Square Path (Lái hình vuông)',
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        blocks: [
          { id: 'p1', type: 'repeat', params: { times: 4 } },
        ],
      },
    ];
  });

  const handleSaveProgram = (name: string) => {
    const newProg: SavedProgram = {
      id: `prog_${Date.now()}`,
      name,
      updatedAt: new Date().toLocaleDateString('vi-VN'),
      blocks: [...blocks],
    };
    const updated = [newProg, ...savedPrograms];
    setSavedPrograms(updated);
    try {
      localStorage.setItem('robot_saved_programs', JSON.stringify(updated));
    } catch (e) {}
    addLog(`💾 Đã lưu chương trình "${name}" vào bộ nhớ!`, 'success');
  };

  const handleLoadProgram = (prog: SavedProgram) => {
    setBlocks([...prog.blocks]);
    addLog(`📂 Đã nạp chương trình "${prog.name}".`, 'info');
  };

  const handleDeleteProgram = (id: string) => {
    const updated = savedPrograms.filter((p) => p.id !== id);
    setSavedPrograms(updated);
    try {
      localStorage.setItem('robot_saved_programs', JSON.stringify(updated));
    } catch (e) {}
    addLog('🗑 Đã xóa chương trình.', 'info');
  };

  // Active Challenge State
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeVictory, setChallengeVictory] = useState<boolean>(false);

  // Modals Visibility
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false);
  const [showHardwareModal, setShowHardwareModal] = useState<boolean>(false);
  const [showTeacherModal, setShowTeacherModal] = useState<boolean>(false);

  // RobotController Instance
  const controllerRef = useRef<RobotController>(new RobotController());

  useEffect(() => {
    controllerRef.current.setVirtualCallback(async (action, params) => {
      // Virtual Robot Simulation Execution Handler
      setRobotState((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        let newAngle = prev.angle;
        let newLed = prev.led;
        let newSpeed = prev.speed;
        let newStatus: RobotStatus = 'RUNNING';

        const rad = (prev.angle * Math.PI) / 180;

        if (action === 'move_forward') {
          const distPx = (params?.distance || 20) * 5; // 1cm = 5px
          newX = Math.max(20, Math.min(currentMap.gridSize - 20, prev.x + Math.cos(rad) * distPx));
          newY = Math.max(20, Math.min(currentMap.gridSize - 20, prev.y + Math.sin(rad) * distPx));
        } else if (action === 'move_backward') {
          const distPx = (params?.distance || 20) * 5;
          newX = Math.max(20, Math.min(currentMap.gridSize - 20, prev.x - Math.cos(rad) * distPx));
          newY = Math.max(20, Math.min(currentMap.gridSize - 20, prev.y - Math.sin(rad) * distPx));
        } else if (action === 'turn_left') {
          const turn = params?.angle || 90;
          newAngle = (prev.angle - turn + 360) % 360;
        } else if (action === 'turn_right') {
          const turn = params?.angle || 90;
          newAngle = (prev.angle + turn) % 360;
        } else if (action === 'stop') {
          newStatus = 'IDLE';
        } else if (action === 'set_led') {
          newLed = params?.color || 'off';
        } else if (action === 'set_speed') {
          newSpeed = params?.speed || 65;
        }

        const newTrail = [...prev.trail, { x: newX, y: newY }];

        return {
          ...prev,
          x: newX,
          y: newY,
          angle: newAngle,
          led: newLed,
          speed: newSpeed,
          status: newStatus,
          trail: newTrail,
          executedCommands: prev.executedCommands + 1,
        };
      });

      return true;
    });
  }, [currentMap]);

  // Reset Robot Position
  const handleResetRobot = () => {
    setRobotState({
      x: currentMap.startPos.x,
      y: currentMap.startPos.y,
      angle: currentMap.startPos.angle,
      speed: 65,
      battery: 87,
      led: 'off',
      status: 'IDLE',
      distanceSensor: 100,
      colorSensor: null,
      lineSensor: false,
      trail: [{ x: currentMap.startPos.x, y: currentMap.startPos.y }],
      executedCommands: 0,
      collisions: 0,
    });
    setChallengeVictory(false);
    addLog('🔄 Đã đưa Robot về vị trí Xuất phát và reset cảm biến.', 'info');
  };

  // Change Map
  const handleSelectMap = (newMap: RobotMap) => {
    setCurrentMap(newMap);
    setRobotState({
      x: newMap.startPos.x,
      y: newMap.startPos.y,
      angle: newMap.startPos.angle,
      speed: 65,
      battery: 87,
      led: 'off',
      status: 'IDLE',
      distanceSensor: 100,
      colorSensor: null,
      lineSensor: false,
      trail: [{ x: newMap.startPos.x, y: newMap.startPos.y }],
      executedCommands: 0,
      collisions: 0,
    });
    setChallengeVictory(false);
    addLog(`🗺 Tải bản đồ "${newMap.name}".`, 'info');
  };

  // Gem Picked Handler
  const handleCollectObject = (obj: MapObject) => {
    setCurrentMap((prev) => ({
      ...prev,
      mapObjects: prev.mapObjects.map((o) => (o.id === obj.id ? { ...o, collected: true } : o)),
    }));
    addLog(`💎 Thu gom viên ngọc quý! (+100 điểm)`, 'success');
  };

  // Collision Event Handler
  const handleCollision = () => {
    setRobotState((prev) => ({
      ...prev,
      status: 'COLLIDED',
      collisions: prev.collisions + 1,
    }));
    addLog(`💥 Cảnh báo va chạm chướng ngại vật!`, 'warning');
  };

  // Reach Finish Target Event Handler
  const handleReachFinish = () => {
    setRobotState((prev) => ({ ...prev, status: 'COMPLETED' }));
    if (!challengeVictory) {
      setChallengeVictory(true);
      addLog(`🏁 XUẤT SẮC! Robot đã về đích thành công!`, 'success');
    }
  };

  // Challenge Selection
  const handleSelectChallenge = (ch: Challenge) => {
    setActiveChallenge(ch);
    const mapFound = PRESET_MAPS.find((m) => m.id === ch.mapId) || PRESET_MAPS[0];
    handleSelectMap(mapFound);
    addLog(`🏆 Nhận Thử thách Cấp độ ${ch.id}: "${ch.title}"!`, 'info');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* App Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMap={currentMap}
        onSelectMap={handleSelectMap}
        onOpenAIModal={() => setShowAIModal(true)}
        onOpenChallengeModal={() => setShowChallengeModal(true)}
        onOpenHardwareModal={() => setShowHardwareModal(true)}
        onOpenTeacherModal={() => setShowTeacherModal(true)}
        onResetRobot={handleResetRobot}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Body Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top Section: 2D Robot Simulation Arena (~55-60% width on Desktop) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <RobotCanvas
            map={currentMap}
            robotState={robotState}
            setRobotState={setRobotState}
            onCollectObject={handleCollectObject}
            onCollision={handleCollision}
            onReachFinish={handleReachFinish}
            teacherMode={teacherModeActive}
            onUpdateMap={setCurrentMap}
          />

          {/* Realtime Robot Telemetry Status Panel */}
          <RobotStatusPanel robotState={robotState} />

          {/* Activity Command Logs Panel */}
          <CommandLogPanel logs={logs} onClearLogs={() => setLogs([])} />
        </section>

        {/* Right Section: Controls & Programming Workspace Tabs */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {activeTab === 'control' ? (
            <DirectControlPanel
              controller={controllerRef.current}
              robotState={robotState}
              setRobotState={setRobotState}
              addLog={addLog}
            />
          ) : (
            <BlockProgrammingPanel
              controller={controllerRef.current}
              blocks={blocks}
              setBlocks={setBlocks}
              addLog={addLog}
              savedPrograms={savedPrograms}
              onSaveProgram={handleSaveProgram}
              onLoadProgram={handleLoadProgram}
              onDeleteProgram={handleDeleteProgram}
              isExecuting={isExecuting}
              setIsExecuting={setIsExecuting}
              activeBlockId={activeBlockId}
              setActiveBlockId={setActiveBlockId}
              onResetRobot={handleResetRobot}
            />
          )}
        </section>
      </main>

      {/* Challenge Victory Popup Modal */}
      {challengeVictory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 text-center max-w-md w-full shadow-2xl flex flex-col items-center gap-4 text-white animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center text-3xl animate-bounce">
              🏆
            </div>
            <h2 className="font-extrabold text-2xl text-emerald-400">CHIẾN THẮNG XUẤT SẮC!</h2>
            <p className="text-xs text-slate-300">
              Robot đã hoàn thành xuất sắc lộ trình và cán mốc điểm Đích an toàn!
            </p>

            <div className="w-full bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono grid grid-cols-2 gap-2 text-slate-300">
              <div>
                Số lệnh đã dùng: <strong className="text-cyan-400">{robotState.executedCommands}</strong>
              </div>
              <div>
                Số lần va chạm: <strong className="text-emerald-400">{robotState.collisions}</strong>
              </div>
            </div>

            <button
              onClick={() => setChallengeVictory(false)}
              className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              TIẾP TỤC THỰC HÀNH
            </button>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        currentMap={currentMap}
        onApplyBlocks={(newBlocks, explanation) => {
          setBlocks(newBlocks);
          setActiveTab('code');
          addLog(`🤖 Gemini AI: "${explanation}"`, 'success');
        }}
      />

      {/* Challenge Selection Modal */}
      <ChallengeModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        onSelectChallenge={handleSelectChallenge}
        activeChallenge={activeChallenge}
      />

      {/* Hardware Web Serial Bridge Modal */}
      <HardwareConnectModal
        isOpen={showHardwareModal}
        onClose={() => setShowHardwareModal(false)}
        controller={controllerRef.current}
      />

      {/* Teacher Map Editor Modal */}
      <TeacherModeModal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        currentMap={currentMap}
        onUpdateMap={setCurrentMap}
        teacherModeActive={teacherModeActive}
        setTeacherModeActive={setTeacherModeActive}
      />
    </div>
  );
}
