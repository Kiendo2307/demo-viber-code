export type LedColor = 'off' | 'red' | 'green' | 'blue' | 'yellow';

export type RobotStatus = 'IDLE' | 'RUNNING' | 'COLLIDED' | 'COMPLETED' | 'PAUSED';

export interface RobotState {
  x: number; // in grid pixels
  y: number;
  angle: number; // in degrees, 0 = facing right/East, 90 = facing down/South, 180 = West, 270 = North
  speed: number; // 0 - 100 %
  battery: number; // 0 - 100 %
  led: LedColor;
  status: RobotStatus;
  distanceSensor: number; // in cm
  colorSensor: string | null; // e.g. 'red', 'green', 'blue', 'yellow', or null
  lineSensor: boolean; // detected black line
  trail: Array<{ x: number; y: number }>;
  executedCommands: number;
  collisions: number;
}

export type ObstacleType = 'wall' | 'box' | 'cone';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  color?: string;
}

export type MapObjectType = 'gem' | 'star' | 'trash' | 'checkpoint';

export interface MapObject {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: MapObjectType;
  collected: boolean;
}

export interface ColorZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: 'red' | 'green' | 'blue' | 'yellow';
}

export interface LinePathPoint {
  x: number;
  y: number;
}

export interface RobotMap {
  id: string;
  name: string;
  description: string;
  gridSize: number; // e.g. 500x500
  startPos: { x: number; y: number; angle: number };
  finishArea: { x: number; y: number; radius: number };
  obstacles: Obstacle[];
  mapObjects: MapObject[];
  colorZones: ColorZone[];
  linePath?: LinePathPoint[];
}

export type BlockCategory = 'motion' | 'control' | 'sensor' | 'output';

export type BlockType =
  | 'move_forward'
  | 'move_backward'
  | 'turn_left'
  | 'turn_right'
  | 'stop'
  | 'set_led'
  | 'play_sound'
  | 'repeat'
  | 'if_obstacle'
  | 'if_color';

export interface CodeBlock {
  id: string;
  type: BlockType;
  params: Record<string, any>;
  body?: CodeBlock[];
  elseBody?: CodeBlock[];
}

export interface CommandLogItem {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'action' | 'warning' | 'success' | 'sensor';
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  goal: string;
  mapId: string;
  maxTime: number; // in seconds
  minStars: number;
  targetScore: number;
  requirements: {
    collectGems?: number;
    reachFinish?: boolean;
    maxCollisions?: number;
    maxBlocks?: number;
    lineFollow?: boolean;
  };
}

export interface SavedProgram {
  id: string;
  name: string;
  updatedAt: string;
  blocks: CodeBlock[];
}
