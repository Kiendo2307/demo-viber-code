import React, { useEffect, useRef, useState } from 'react';
import { MapObject, Obstacle, RobotMap, RobotState } from '../types';
import { soundManager } from '../lib/sound';

interface RobotCanvasProps {
  map: RobotMap;
  robotState: RobotState;
  setRobotState: React.Dispatch<React.SetStateAction<RobotState>>;
  onCollectObject?: (obj: MapObject) => void;
  onCollision?: () => void;
  onReachFinish?: () => void;
  teacherMode?: boolean;
  onUpdateMap?: (updatedMap: RobotMap) => void;
}

export const RobotCanvas: React.FC<RobotCanvasProps> = ({
  map,
  robotState,
  setRobotState,
  onCollectObject,
  onCollision,
  onReachFinish,
  teacherMode = false,
  onUpdateMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedTool, setSelectedTool] = useState<'wall' | 'box' | 'gem' | 'finish' | 'start' | 'delete' | null>(null);

  // Wheel animation frame counter
  useEffect(() => {
    let animId: number;
    if (robotState.status === 'RUNNING') {
      const updateWheel = () => {
        setWheelRotation((prev) => (prev + robotState.speed * 0.1) % 360);
        animId = requestAnimationFrame(updateWheel);
      };
      animId = requestAnimationFrame(updateWheel);
    }
    return () => cancelAnimationFrame(animId);
  }, [robotState.status, robotState.speed]);

  // Raycast distance calculation function
  const calculateDistanceToObstacle = (
    rx: number,
    ry: number,
    angleDeg: number,
    obstacles: Obstacle[],
    mapSize: number
  ): number => {
    const rad = (angleDeg * Math.PI) / 180;
    const dirX = Math.cos(rad);
    const dirY = Math.sin(rad);

    let minDistance = mapSize; // Max distance

    // Check canvas boundaries
    if (dirX > 0) {
      minDistance = Math.min(minDistance, (mapSize - rx) / dirX);
    } else if (dirX < 0) {
      minDistance = Math.min(minDistance, -rx / dirX);
    }

    if (dirY > 0) {
      minDistance = Math.min(minDistance, (mapSize - ry) / dirY);
    } else if (dirY < 0) {
      minDistance = Math.min(minDistance, -ry / dirY);
    }

    // Raycast against rectangular obstacles
    for (const obs of obstacles) {
      const left = obs.x;
      const right = obs.x + obs.width;
      const top = obs.y;
      const bottom = obs.y + obs.height;

      // Check intersection with 4 line segments of obstacle box
      const intersections: number[] = [];

      // Vertical line X = left
      if (dirX !== 0) {
        const t = (left - rx) / dirX;
        if (t > 0) {
          const yHit = ry + t * dirY;
          if (yHit >= top && yHit <= bottom) intersections.push(t);
        }
      }
      // Vertical line X = right
      if (dirX !== 0) {
        const t = (right - rx) / dirX;
        if (t > 0) {
          const yHit = ry + t * dirY;
          if (yHit >= top && yHit <= bottom) intersections.push(t);
        }
      }
      // Horizontal line Y = top
      if (dirY !== 0) {
        const t = (top - ry) / dirY;
        if (t > 0) {
          const xHit = rx + t * dirX;
          if (xHit >= left && xHit <= right) intersections.push(t);
        }
      }
      // Horizontal line Y = bottom
      if (dirY !== 0) {
        const t = (bottom - ry) / dirY;
        if (t > 0) {
          const xHit = rx + t * dirX;
          if (xHit >= left && xHit <= right) intersections.push(t);
        }
      }

      if (intersections.length > 0) {
        const closestObsHit = Math.min(...intersections);
        minDistance = Math.min(minDistance, closestObsHit);
      }
    }

    // Convert pixel distance to simulated cm (e.g., 5 pixels = 1 cm)
    return Math.max(0, Math.round((minDistance - 25) / 5));
  };

  // Check collision & sensor states
  useEffect(() => {
    const dist = calculateDistanceToObstacle(
      robotState.x,
      robotState.y,
      robotState.angle,
      map.obstacles,
      map.gridSize
    );

    // Color sensor detection
    let detectedColor: string | null = null;
    for (const cz of map.colorZones) {
      if (
        robotState.x >= cz.x &&
        robotState.x <= cz.x + cz.width &&
        robotState.y >= cz.y &&
        robotState.y <= cz.y + cz.height
      ) {
        detectedColor = cz.color;
        break;
      }
    }

    // Line sensor detection
    let detectedLine = false;
    if (map.linePath && map.linePath.length > 1) {
      for (let i = 0; i < map.linePath.length - 1; i++) {
        const p1 = map.linePath[i];
        const p2 = map.linePath[i + 1];

        // Distance from point (x,y) to line segment (p1, p2)
        const A = robotState.x - p1.x;
        const B = robotState.y - p1.y;
        const C = p2.x - p1.x;
        const D = p2.y - p1.y;
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;

        let xx, yy;
        if (param < 0) {
          xx = p1.x;
          yy = p1.y;
        } else if (param > 1) {
          xx = p2.x;
          yy = p2.y;
        } else {
          xx = p1.x + param * C;
          yy = p1.y + param * D;
        }

        const dx = robotState.x - xx;
        const dy = robotState.y - yy;
        const distanceToLine = Math.sqrt(dx * dx + dy * dy);

        if (distanceToLine < 18) {
          detectedLine = true;
          break;
        }
      }
    }

    // Check collision with obstacles
    let hasCollision = false;
    const robotRadius = 22;

    // Boundary check
    if (
      robotState.x - robotRadius < 0 ||
      robotState.x + robotRadius > map.gridSize ||
      robotState.y - robotRadius < 0 ||
      robotState.y + robotRadius > map.gridSize
    ) {
      hasCollision = true;
    }

    // Obstacle box check
    for (const obs of map.obstacles) {
      if (
        robotState.x + robotRadius >= obs.x &&
        robotState.x - robotRadius <= obs.x + obs.width &&
        robotState.y + robotRadius >= obs.y &&
        robotState.y - robotRadius <= obs.y + obs.height
      ) {
        hasCollision = true;
        break;
      }
    }

    // Check gem collection
    map.mapObjects.forEach((obj) => {
      if (!obj.collected) {
        const dx = robotState.x - obj.x;
        const dy = robotState.y - obj.y;
        const distToObj = Math.sqrt(dx * dx + dy * dy);
        if (distToObj < robotRadius + obj.radius) {
          soundManager.playCollectGem();
          if (onCollectObject) onCollectObject(obj);
        }
      }
    });

    // Check finish area
    const dxFinish = robotState.x - map.finishArea.x;
    const dyFinish = robotState.y - map.finishArea.y;
    const distToFinish = Math.sqrt(dxFinish * dxFinish + dyFinish * dyFinish);

    if (distToFinish < map.finishArea.radius && robotState.status === 'RUNNING') {
      soundManager.playVictory();
      if (onReachFinish) onReachFinish();
    }

    if (hasCollision && robotState.status === 'RUNNING') {
      soundManager.playCollision();
      if (onCollision) onCollision();
    }

    setRobotState((prev) => ({
      ...prev,
      distanceSensor: dist,
      colorSensor: detectedColor,
      lineSensor: detectedLine,
    }));
  }, [robotState.x, robotState.y, robotState.angle, map]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = map.gridSize;
    ctx.clearRect(0, 0, size, size);

    // 1. Draw Grid Background
    ctx.fillStyle = '#0f172a'; // Slate 900 dark STEM lab style background
    ctx.fillRect(0, 0, size, size);

    // Draw Grid Lines & Coordinates
    ctx.lineWidth = 1;
    const step = 50;

    for (let x = 0; x <= size; x += step) {
      ctx.strokeStyle = x % 100 === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();

      if (x % 100 === 0 && x > 0 && x < size) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`${x}`, x + 4, 14);
      }
    }

    for (let y = 0; y <= size; y += step) {
      ctx.strokeStyle = y % 100 === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();

      if (y % 100 === 0 && y > 0 && y < size) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`${y}`, 4, y + 12);
      }
    }

    // 2. Draw Color Zones
    map.colorZones.forEach((cz) => {
      ctx.save();
      const colorMap: Record<string, string> = {
        red: 'rgba(239, 68, 68, 0.35)',
        green: 'rgba(34, 197, 94, 0.35)',
        blue: 'rgba(59, 130, 246, 0.35)',
        yellow: 'rgba(234, 179, 8, 0.35)',
      };
      ctx.fillStyle = colorMap[cz.color] || 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(cz.x, cz.y, cz.width, cz.height);
      ctx.strokeStyle = cz.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(cz.x, cz.y, cz.width, cz.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`MÀU: ${cz.color.toUpperCase()}`, cz.x + 8, cz.y + 20);
      ctx.restore();
    });

    // 3. Draw Black Line Path for Line Following
    if (map.linePath && map.linePath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#020617'; // Dark black line
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(map.linePath[0].x, map.linePath[0].y);
      for (let i = 1; i < map.linePath.length; i++) {
        ctx.lineTo(map.linePath[i].x, map.linePath[i].y);
      }
      ctx.stroke();

      // Outer line border for contrast
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(map.linePath[0].x, map.linePath[0].y);
      for (let i = 1; i < map.linePath.length; i++) {
        ctx.lineTo(map.linePath[i].x, map.linePath[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Start Position Indicator
    ctx.save();
    ctx.beginPath();
    ctx.arc(map.startPos.x, map.startPos.y, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('XUẤT PHÁT', map.startPos.x, map.startPos.y - 34);
    ctx.restore();

    // 5. Draw Finish Target Area
    ctx.save();
    const fa = map.finishArea;
    const time = Date.now() * 0.003;
    const pulse = Math.sin(time) * 4;

    ctx.beginPath();
    ctx.arc(fa.x, fa.y, fa.radius + pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(fa.x, fa.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 ĐÍCH (FINISH)', fa.x, fa.y - fa.radius - 10);
    ctx.restore();

    // 6. Draw Obstacles
    map.obstacles.forEach((obs) => {
      ctx.save();
      if (obs.type === 'wall') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // Diagonal stripes pattern
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 3;
        for (let i = -obs.height; i < obs.width; i += 16) {
          ctx.beginPath();
          ctx.moveTo(obs.x + i, obs.y);
          ctx.lineTo(obs.x + i + obs.height, obs.y + obs.height);
          ctx.stroke();
        }
      } else if (obs.type === 'box') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // Box X cross pattern
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.moveTo(obs.x + obs.width, obs.y);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.stroke();
      } else if (obs.type === 'cone') {
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#f97316';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      ctx.restore();
    });

    // 7. Draw Map Collectable Objects (Gems / Stars)
    map.mapObjects.forEach((obj) => {
      if (obj.collected) return;
      ctx.save();
      const pulseObj = Math.sin(Date.now() * 0.005) * 2;

      if (obj.type === 'gem') {
        // Diamond Gem shape
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y - obj.radius - pulseObj);
        ctx.lineTo(obj.x + obj.radius + pulseObj, obj.y);
        ctx.lineTo(obj.x, obj.y + obj.radius + pulseObj);
        ctx.lineTo(obj.x - obj.radius - pulseObj, obj.y);
        ctx.closePath();

        ctx.fillStyle = '#a855f7'; // Purple Gem
        ctx.fill();
        ctx.strokeStyle = '#f0abfc';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💎', obj.x, obj.y + 3);
      } else if (obj.type === 'star') {
        ctx.fillStyle = '#eab308'; // Gold Star
        ctx.font = '18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', obj.x, obj.y + 6);
      }
      ctx.restore();
    });

    // 8. Draw Robot Trail
    if (robotState.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 3;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(robotState.trail[0].x, robotState.trail[0].y);
      for (let i = 1; i < robotState.trail.length; i++) {
        ctx.lineTo(robotState.trail[i].x, robotState.trail[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 9. Draw Robot Sensor Beam Ray (Ultrasonic Beam Visualizer)
    ctx.save();
    ctx.translate(robotState.x, robotState.y);
    ctx.rotate((robotState.angle * Math.PI) / 180);

    const beamLen = Math.min(200, Math.max(20, robotState.distanceSensor * 5 + 25));
    const coneAngle = (25 * Math.PI) / 180;

    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, beamLen);
    if (robotState.distanceSensor < 20) {
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    } else {
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.05)');
    }

    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.arc(20, 0, beamLen, -coneAngle, coneAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = robotState.distanceSensor < 20 ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    ctx.restore();

    // 10. Draw Robot Vehicle Body
    ctx.save();
    ctx.translate(robotState.x, robotState.y);
    ctx.rotate((robotState.angle * Math.PI) / 180);

    // Side Tires (Left & Right Wheels)
    const tireWidth = 24;
    const tireHeight = 8;

    // Left Wheel
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-12, -22, tireWidth, tireHeight);
    ctx.strokeRect(-12, -22, tireWidth, tireHeight);

    // Right Wheel
    ctx.fillRect(-12, 14, tireWidth, tireHeight);
    ctx.strokeRect(-12, 14, tireWidth, tireHeight);

    // Wheel Tread Rotating Lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    const wheelOffset = (wheelRotation % 10) - 5;
    ctx.beginPath();
    ctx.moveTo(-10 + wheelOffset, -22);
    ctx.lineTo(-10 + wheelOffset, -14);
    ctx.moveTo(0 + wheelOffset, -22);
    ctx.lineTo(0 + wheelOffset, -14);
    ctx.moveTo(-10 + wheelOffset, 14);
    ctx.lineTo(-10 + wheelOffset, 22);
    ctx.moveTo(0 + wheelOffset, 14);
    ctx.lineTo(0 + wheelOffset, 22);
    ctx.stroke();

    // Main Body Chassis
    ctx.fillStyle = '#1e293b'; // Acrylic dark blue chassis
    ctx.strokeStyle = '#38bdf8'; // Glowing cyan accent
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(-20, -16, 38, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Front Ultrasonic Sensor Eyes (HC-SR04)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(16, -10, 6, 20);

    ctx.beginPath();
    ctx.arc(19, -5, 3.5, 0, Math.PI * 2);
    ctx.arc(19, 5, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#020617';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Status LED Bulb at center
    ctx.beginPath();
    ctx.arc(-2, 0, 5, 0, Math.PI * 2);

    const ledColors: Record<string, { fill: string; stroke: string }> = {
      off: { fill: '#475569', stroke: '#64748b' },
      red: { fill: '#ef4444', stroke: '#fca5a5' },
      green: { fill: '#22c55e', stroke: '#86efac' },
      blue: { fill: '#3b82f6', stroke: '#93c5fd' },
      yellow: { fill: '#eab308', stroke: '#fef08a' },
    };

    const curLed = ledColors[robotState.led] || ledColors.off;
    ctx.fillStyle = curLed.fill;
    ctx.fill();
    ctx.strokeStyle = curLed.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction Heading Arrow on roof
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, -6);
    ctx.lineTo(-1, 0);
    ctx.lineTo(-4, 6);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    ctx.restore();
  }, [robotState, map, wheelRotation]);

  // Click handler for Teacher Mode editing
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!teacherMode || !selectedTool || !onUpdateMap) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = map.gridSize / rect.width;
    const scaleY = map.gridSize / rect.height;

    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    if (selectedTool === 'wall') {
      const newObstacle: Obstacle = {
        id: `obs_${Date.now()}`,
        x: clickX - 25,
        y: clickY - 25,
        width: 50,
        height: 50,
        type: 'wall',
      };
      onUpdateMap({ ...map, obstacles: [...map.obstacles, newObstacle] });
    } else if (selectedTool === 'box') {
      const newObstacle: Obstacle = {
        id: `obs_${Date.now()}`,
        x: clickX - 20,
        y: clickY - 20,
        width: 40,
        height: 40,
        type: 'box',
      };
      onUpdateMap({ ...map, obstacles: [...map.obstacles, newObstacle] });
    } else if (selectedTool === 'gem') {
      const newObj: MapObject = {
        id: `gem_${Date.now()}`,
        x: clickX,
        y: clickY,
        radius: 15,
        type: 'gem',
        collected: false,
      };
      onUpdateMap({ ...map, mapObjects: [...map.mapObjects, newObj] });
    } else if (selectedTool === 'finish') {
      onUpdateMap({ ...map, finishArea: { x: clickX, y: clickY, radius: 40 } });
    } else if (selectedTool === 'start') {
      onUpdateMap({
        ...map,
        startPos: { x: clickX, y: clickY, angle: robotState.angle },
      });
      setRobotState((prev) => ({ ...prev, x: clickX, y: clickY }));
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-2xl w-full">
      {/* Map Header Status Bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-xl mb-3 border border-slate-800 text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-bold text-white">{map.name}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>X: <strong className="text-cyan-400">{Math.round(robotState.x)}</strong></span>
          <span>Y: <strong className="text-cyan-400">{Math.round(robotState.y)}</strong></span>
          <span>GÓC: <strong className="text-cyan-400">{Math.round(robotState.angle)}°</strong></span>
        </div>
      </div>

      {/* Main Canvas Element */}
      <div className="relative w-full max-w-[580px] aspect-square rounded-xl overflow-hidden border-2 border-slate-800 shadow-inner group">
        <canvas
          ref={canvasRef}
          width={map.gridSize}
          height={map.gridSize}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair object-contain bg-slate-950"
        />

        {/* Warning Badge Overlay when Obstacle is close */}
        {robotState.distanceSensor < 20 && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600/90 text-white font-bold text-xs rounded-full shadow-lg backdrop-blur-sm animate-bounce flex items-center gap-1.5 border border-red-400">
            <span>⚠️</span> PHÁT HIỆN VẬT CẢN ({robotState.distanceSensor} cm)
          </div>
        )}

        {/* Teacher Mode Editing Toolbar */}
        {teacherMode && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-cyan-500/40 p-1.5 rounded-xl shadow-2xl">
            <span className="text-[10px] font-bold text-cyan-400 px-2 uppercase">Chỉnh sửa:</span>
            <button
              onClick={() => setSelectedTool('wall')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                selectedTool === 'wall' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🧱 Bức tường
            </button>
            <button
              onClick={() => setSelectedTool('box')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                selectedTool === 'box' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📦 Hộp gỗ
            </button>
            <button
              onClick={() => setSelectedTool('gem')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                selectedTool === 'gem' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              💎 Ngọc quý
            </button>
            <button
              onClick={() => setSelectedTool('finish')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                selectedTool === 'finish' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🏁 Điểm Đích
            </button>
            <button
              onClick={() => setSelectedTool('start')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition ${
                selectedTool === 'start' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🚀 Đ.Xuất phát
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
