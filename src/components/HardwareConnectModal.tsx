import React, { useState } from 'react';
import { RobotController } from '../lib/RobotController';
import { soundManager } from '../lib/sound';
import { Cpu, Usb, Bluetooth, CheckCircle2, AlertTriangle, Code, Copy, Check } from 'lucide-react';

interface HardwareConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  controller: RobotController;
}

export const HardwareConnectModal: React.FC<HardwareConnectModalProps> = ({
  isOpen,
  onClose,
  controller,
}) => {
  const [isConnected, setIsConnected] = useState(controller?.isPhysicalConnected() ?? false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleConnectSerial = async () => {
    soundManager.playClick();
    const success = await controller.connectWebSerial();
    setIsConnected(success);
    if (success) {
      soundManager.playVictory();
    }
  };

  const handleDisconnect = async () => {
    soundManager.playClick();
    await controller.disconnectPhysical();
    setIsConnected(false);
  };

  const arduinoCodeSnippet = `// 🤖 ROBOTICS LAB - ARDUINO / ESP32 FIRMWARE SKETCH
#include <WiFi.h>

#define MOTOR_LEFT_PWM  25
#define MOTOR_RIGHT_PWM 26
#define TRIG_PIN        12
#define ECHO_PIN        14

void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_LEFT_PWM, OUTPUT);
  pinMode(MOTOR_RIGHT_PWM, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("ROBOTICS_LAB_READY");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    if (cmd.startsWith("FWD")) {
      // Tiến
      digitalWrite(MOTOR_LEFT_PWM, HIGH);
      digitalWrite(MOTOR_RIGHT_PWM, HIGH);
    } else if (cmd.startsWith("STOP")) {
      digitalWrite(MOTOR_LEFT_PWM, LOW);
      digitalWrite(MOTOR_RIGHT_PWM, LOW);
    }
  }
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(arduinoCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-emerald-600 rounded-2xl shadow-lg">
              <Cpu className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">🔌 KẾT NỐI ROBOT THẬT (Hardware Bridge)</h3>
              <p className="text-xs text-slate-400">
                Kiến trúc sẵn sàng kết nối Robot vật lý qua Web Serial API (Cáp USB) hoặc Web Bluetooth với Arduino/ESP32.
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

        {/* Connection Status Box */}
        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            )}
            <div>
              <h4 className="font-bold text-sm text-white">
                Trạng thái: {isConnected ? 'ĐÃ KẾT NỐI ROBOT VẬT LÝ' : 'ĐANG DÙNG MÔ PHỎNG ẢO'}
              </h4>
              <p className="text-xs text-slate-400">
                {isConnected
                  ? 'Lệnh điều khiển và khối lệnh sẽ được truyền trực tiếp tới Robot thật!'
                  : 'Sẵn sàng kết nối qua cổng USB COM/Serial.'}
              </p>
            </div>
          </div>

          {!isConnected ? (
            <button
              onClick={handleConnectSerial}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Usb className="w-4 h-4" />
              Kết Nối Web Serial
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Ngắt Kết Nối
            </button>
          )}
        </div>

        {/* Arduino Firmware Code Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              Mã nguồn Firmware cho Arduino / ESP32:
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã sao chép' : 'Sao chép C++'}
            </button>
          </div>

          <pre className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48 leading-relaxed custom-scrollbar">
            {arduinoCodeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
