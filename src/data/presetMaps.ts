import { RobotMap } from '../types';

export const PRESET_MAPS: RobotMap[] = [
  {
    id: 'map_1',
    name: 'Map 1 – Di chuyển cơ bản',
    description: 'Sân tập căn bản: Điều khiển robot từ điểm Xuất phát (Start) đến điểm Đích (Finish).',
    gridSize: 600,
    startPos: { x: 80, y: 300, angle: 0 },
    finishArea: { x: 500, y: 300, radius: 40 },
    obstacles: [],
    mapObjects: [
      { id: 'm1_star1', x: 290, y: 300, radius: 15, type: 'star', collected: false },
    ],
    colorZones: [
      { id: 'cz_green', x: 250, y: 250, width: 80, height: 100, color: 'green' }
    ]
  },
  {
    id: 'map_2',
    name: 'Map 2 – Vượt chướng ngại vật',
    description: 'Thử thách lái robot khéo léo qua các khối vật cản để tới đích an toàn.',
    gridSize: 600,
    startPos: { x: 70, y: 100, angle: 90 },
    finishArea: { x: 500, y: 500, radius: 45 },
    obstacles: [
      { id: 'obs_1', x: 180, y: 80, width: 40, height: 260, type: 'wall' },
      { id: 'obs_2', x: 340, y: 250, width: 40, height: 280, type: 'wall' },
      { id: 'obs_3', x: 100, y: 400, width: 120, height: 40, type: 'box' },
    ],
    mapObjects: [
      { id: 'm2_gem1', x: 100, y: 250, radius: 14, type: 'gem', collected: false },
      { id: 'm2_gem2', x: 270, y: 150, radius: 14, type: 'gem', collected: false },
      { id: 'm2_gem3', x: 270, y: 450, radius: 14, type: 'gem', collected: false },
    ],
    colorZones: [
      { id: 'cz_yellow', x: 320, y: 100, width: 90, height: 90, color: 'yellow' },
      { id: 'cz_red', x: 100, y: 480, width: 90, height: 80, color: 'red' }
    ]
  },
  {
    id: 'map_3',
    name: 'Map 3 – Mê cung Robotics',
    description: 'Mê cung phức tạp với các lối đi hẹp. Sử dụng cảm biến khoảng cách để tìm đường ra!',
    gridSize: 600,
    startPos: { x: 70, y: 70, angle: 0 },
    finishArea: { x: 520, y: 520, radius: 40 },
    obstacles: [
      // Top wall
      { id: 'm3_w1', x: 150, y: 0, width: 30, height: 200, type: 'wall' },
      { id: 'm3_w2', x: 280, y: 120, width: 220, height: 30, type: 'wall' },
      { id: 'm3_w3', x: 0, y: 280, width: 280, height: 30, type: 'wall' },
      { id: 'm3_w4', x: 380, y: 280, width: 30, height: 200, type: 'wall' },
      { id: 'm3_w5', x: 140, y: 400, width: 160, height: 30, type: 'wall' },
      { id: 'm3_w6', x: 480, y: 200, width: 30, height: 200, type: 'wall' }
    ],
    mapObjects: [
      { id: 'm3_gem1', x: 220, y: 70, radius: 14, type: 'gem', collected: false },
      { id: 'm3_gem2', x: 70, y: 350, radius: 14, type: 'gem', collected: false },
      { id: 'm3_gem3', x: 300, y: 340, radius: 14, type: 'gem', collected: false },
    ],
    colorZones: [
      { id: 'cz_blue', x: 220, y: 200, width: 80, height: 70, color: 'blue' }
    ]
  },
  {
    id: 'map_4',
    name: 'Map 4 – Dò đường Line Follower',
    description: 'Mô phỏng bài toán Robot dò đường màu đen tiêu chuẩn trong các kỳ thi Robotics quốc tế.',
    gridSize: 600,
    startPos: { x: 80, y: 120, angle: 0 },
    finishArea: { x: 500, y: 480, radius: 45 },
    obstacles: [
      { id: 'm4_cone1', x: 320, y: 280, width: 30, height: 30, type: 'cone' }
    ],
    mapObjects: [
      { id: 'm4_star1', x: 300, y: 120, radius: 14, type: 'star', collected: false },
      { id: 'm4_star2', x: 480, y: 280, radius: 14, type: 'star', collected: false },
      { id: 'm4_star3', x: 200, y: 480, radius: 14, type: 'star', collected: false },
    ],
    colorZones: [
      { id: 'cz_green_m4', x: 440, y: 240, width: 80, height: 80, color: 'green' }
    ],
    linePath: [
      { x: 80, y: 120 },
      { x: 300, y: 120 },
      { x: 480, y: 120 },
      { x: 480, y: 280 },
      { x: 480, y: 480 },
      { x: 200, y: 480 },
      { x: 500, y: 480 }
    ]
  },
  {
    id: 'map_5',
    name: 'Map 5 – Thu gom vật thể STEM',
    description: 'Nhiệm vụ đặc biệt: Thu thập đủ 5 ngọc quý và năng lượng rải rác trên sân trước khi tới trạm nạp.',
    gridSize: 600,
    startPos: { x: 300, y: 300, angle: 270 },
    finishArea: { x: 520, y: 80, radius: 45 },
    obstacles: [
      { id: 'm5_obs1', x: 200, y: 180, width: 40, height: 40, type: 'box' },
      { id: 'm5_obs2', x: 360, y: 180, width: 40, height: 40, type: 'box' },
      { id: 'm5_obs3', x: 200, y: 380, width: 40, height: 40, type: 'box' },
      { id: 'm5_obs4', x: 360, y: 380, width: 40, height: 40, type: 'box' },
    ],
    mapObjects: [
      { id: 'm5_gem1', x: 100, y: 100, radius: 15, type: 'gem', collected: false },
      { id: 'm5_gem2', x: 500, y: 500, radius: 15, type: 'gem', collected: false },
      { id: 'm5_gem3', x: 100, y: 500, radius: 15, type: 'gem', collected: false },
      { id: 'm5_gem4', x: 300, y: 100, radius: 15, type: 'gem', collected: false },
      { id: 'm5_gem5', x: 300, y: 500, radius: 15, type: 'gem', collected: false },
    ],
    colorZones: [
      { id: 'cz_blue_5', x: 80, y: 80, width: 80, height: 80, color: 'blue' },
      { id: 'cz_yellow_5', x: 460, y: 460, width: 80, height: 80, color: 'yellow' }
    ]
  }
];
