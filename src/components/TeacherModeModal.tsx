import React from 'react';
import { RobotMap } from '../types';
import { soundManager } from '../lib/sound';
import { UserCheck, Edit, Plus, RotateCcw, Save, Shield, Award } from 'lucide-react';

interface TeacherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMap: RobotMap;
  onUpdateMap: (map: RobotMap) => void;
  teacherModeActive: boolean;
  setTeacherModeActive: (active: boolean) => void;
}

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  isOpen,
  onClose,
  currentMap,
  onUpdateMap,
  teacherModeActive,
  setTeacherModeActive,
}) => {
  if (!isOpen) return null;

  const handleToggleTeacherMode = () => {
    soundManager.playClick();
    setTeacherModeActive(!teacherModeActive);
  };

  const handleResetMapToDefault = () => {
    soundManager.playClick();
    onUpdateMap({
      ...currentMap,
      obstacles: [],
      mapObjects: [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">👨‍🏫 Chế Độ Giáo Viên (Teacher Mode)</h3>
              <p className="text-xs text-slate-400">
                Cho phép giáo viên thiết kế bản đồ, đặt vật cản, điểm xuất phát và giao bài tập cho học sinh.
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

        {/* Mode Toggle Switch */}
        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <h4 className="font-bold text-sm text-white">Chế độ Chỉnh Sửa Sân Chơi</h4>
            <p className="text-xs text-slate-400">
              Bật công cụ để bấm trực tiếp lên màn hình mô phỏng 2D và tạo vật cản.
            </p>
          </div>
          <button
            onClick={handleToggleTeacherMode}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-lg transition ${
              teacherModeActive
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {teacherModeActive ? 'BẬT (Đang chỉnh sửa)' : 'TẮT'}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 text-xs text-slate-300">
          <h5 className="font-bold text-cyan-400 uppercase tracking-wider">Hướng dẫn thiết kế bài giảng:</h5>
          <ul className="list-disc list-inside flex flex-col gap-1 text-slate-400">
            <li>Bật thanh công cụ Chỉnh sửa trên sân chơi 2D.</li>
            <li>Bấm chọn loại vật cản: Bức tường, Hộp gỗ hoặc Ngọc quý.</li>
            <li>Bấm vào bất kỳ đâu trên sân chơi 2D để đặt vật thể vào vị trí đó.</li>
            <li>Thiết lập điểm Xuất phát hoặc Điểm đích mới.</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleResetMapToDefault}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-red-950 text-red-400 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Xóa sạch vật cản trên sân
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
