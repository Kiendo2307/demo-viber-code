import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Assistant endpoint using Gemini
  app.post('/api/ai-assistant', async (req, res) => {
    try {
      const { prompt, currentMap, challenges } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Nội dung yêu cầu không hợp lệ' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng cài đặt key trong bảng Secrets.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `Bạn là Trợ lý AI Giáo dục STEM & Robotics dành cho học sinh.
Nhiệm vụ của bạn là đọc yêu cầu bằng tiếng Việt của học sinh và chuyển đổi thành danh sách khối lệnh (Blocks) để điều khiển Robot trong môi trường mô phỏng 2D.

Hệ thống hỗ trợ các loại khối lệnh (blocks) sau:
1. move_forward (tiến) - params: { distance: number } (đơn vị cm: 10, 20, 30, 50, 100)
2. move_backward (lùi) - params: { distance: number } (đơn vị cm: 10, 20, 30, 50, 100)
3. turn_left (quay trái) - params: { angle: number } (góc: 45, 90, 180)
4. turn_right (quay phải) - params: { angle: number } (góc: 45, 90, 180)
5. stop (dừng) - params: {}
6. set_led (đèn LED) - params: { color: 'green' | 'red' | 'blue' | 'yellow' | 'off' }
7. play_sound (phát âm thanh) - params: { sound: 'beep' | 'cheer' | 'warning' }
8. repeat (lặp lại) - params: { times: number, body: Array<Block> }
9. if_obstacle (nếu có vật cản) - params: { distanceThreshold: number (ví dụ 30), thenBody: Array<Block>, elseBody?: Array<Block> }
10. if_color (nếu cảm biến màu phát hiện màu) - params: { color: 'red' | 'green' | 'blue' | 'yellow', thenBody: Array<Block> }

Hãy phản hồi DUY NHẤT một chuỗi JSON chuẩn theo cấu trúc:
{
  "explanation": "Lời giải thích ngắn gọn, khích lệ học sinh bằng tiếng Việt (1-2 câu)",
  "blocks": [
    {
      "id": "chuỗi ngẫu nhiên",
      "type": "tên_loại_block",
      "params": { ...các tham số }
    }
  ]
}
Ví dụ với yêu cầu "đi hình vuông 50cm":
Trả về block repeat times 4 với body là [move_forward 50cm, turn_right 90°].`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Yêu cầu từ học sinh: "${prompt}"\nBản đồ hiện tại: ${JSON.stringify(currentMap || {})}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const textOutput = response.text || '';
      let parsed;
      try {
        parsed = JSON.parse(textOutput);
      } catch (err) {
        parsed = {
          explanation: textOutput,
          blocks: [
            { id: 'b1', type: 'move_forward', params: { distance: 50 } },
            { id: 'b2', type: 'turn_right', params: { angle: 90 } },
          ],
        };
      }

      return res.json({ success: true, data: parsed });
    } catch (error: any) {
      console.error('Gemini AI Assistant error:', error);
      return res.status(500).json({
        error: error.message || 'Lỗi khi kết nối với AI Assistant',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🤖 STEM Robotics Lab Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
