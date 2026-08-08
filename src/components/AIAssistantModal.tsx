import React, { useState } from 'react';
import { CodeBlock, RobotMap } from '../types';
import { soundManager } from '../lib/sound';
import { Bot, Sparkles, Send, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMap: RobotMap;
  onApplyBlocks: (blocks: CodeBlock[], explanation: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentMap,
  onApplyBlocks,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    explanation: string;
    blocks: CodeBlock[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setAiResponse(null);
    soundManager.playClick();

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          currentMap: { name: currentMap.name, obstacles: currentMap.obstacles.length },
        }),
      });

      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else if (data.data) {
        setAiResponse(data.data);
      }
    } catch (err: any) {
      setErrorMsg('Không thể kết nối đến AI Assistant. Vui lòng kiểm tra lại kết nối server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (aiResponse) {
      soundManager.playVictory();
      onApplyBlocks(aiResponse.blocks, aiResponse.explanation);
      onClose();
    }
  };

  const PRESET_PROMPTS = [
    'Cho robot di chuyển hình vuông kích thước 50 cm',
    'Lập trình robot né vật cản tự động khi phát hiện chướng ngại',
    'Bật đèn LED xanh lá, phát còi và tiến 100 cm về đích',
    'Thu gom toàn bộ ngọc quý trên bản đồ',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-5 text-white animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                🤖 Trợ Lý AI Lập Trình STEM
                <span className="text-[10px] bg-purple-950 text-purple-300 font-mono px-2 py-0.5 rounded-full border border-purple-800">
                  Powered by Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Nhập yêu cầu bằng tiếng Việt tự nhiên để AI tự động thiết kế khối lệnh cho robot!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptInput(p);
                handleSendPrompt(p);
              }}
              className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{p}</span>
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <input
            type="text"
            placeholder="Ví dụ: Lập trình robot đi hình tam giác hoặc tự phát hiện vật cản..."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            className="w-full bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder-slate-500"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={isLoading || !promptInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition shrink-0"
          >
            {isLoading ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi AI
              </>
            )}
          </button>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* AI Result Card */}
        {aiResponse && (
          <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-2xl border border-purple-900/50">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              AI đã sinh chương trình thành công:
            </div>
            <p className="text-xs text-slate-300 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              "{aiResponse.explanation}"
            </p>

            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {aiResponse.blocks.map((b, idx) => (
                <div key={idx} className="text-xs font-mono bg-slate-900 p-2 rounded-lg border border-slate-800 text-cyan-300 flex items-center justify-between">
                  <span>
                    #{idx + 1} {b.type.toUpperCase()}
                  </span>
                  <span className="text-slate-400">{JSON.stringify(b.params)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleApply}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition transform active:scale-98"
            >
              <span>NẠP CHƯƠNG TRÌNH VÀO VÙNG LẬP TRÌNH</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
