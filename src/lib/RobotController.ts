import { LedColor } from '../types';

export interface RobotControllerHardwareInterface {
  moveForward(distanceCm: number, speedPercent: number): Promise<void>;
  moveBackward(distanceCm: number, speedPercent: number): Promise<void>;
  turnLeft(angleDeg: number): Promise<void>;
  turnRight(angleDeg: number): Promise<void>;
  stop(): Promise<void>;
  setSpeed(speedPercent: number): Promise<void>;
  setLED(color: LedColor): Promise<void>;
  readDistance(): Promise<number>;
}

export class RobotController {
  private physicalConnected: boolean = false;
  private serialPort: any = null;
  private writer: any = null;
  private speed: number = 65;
  private virtualCallback?: (action: string, params?: any) => Promise<any>;

  constructor(virtualCallback?: (action: string, params?: any) => Promise<any>) {
    this.virtualCallback = virtualCallback;
  }

  public setVirtualCallback(cb: (action: string, params?: any) => Promise<any>) {
    this.virtualCallback = cb;
  }

  public isPhysicalConnected(): boolean {
    return this.physicalConnected;
  }

  public async connectWebSerial(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      try {
        this.serialPort = await (navigator as any).serial.requestPort();
        await this.serialPort.open({ baudRate: 115200 });
        const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(this.serialPort.writable);
        this.writer = textEncoder.writable.getWriter();
        this.physicalConnected = true;
        await this.sendCommand('CONNECT:OK\n');
        return true;
      } catch (err) {
        console.warn('Web Serial connection cancelled or failed:', err);
        return false;
      }
    } else {
      console.warn('Web Serial API not supported in this browser environment.');
      return false;
    }
  }

  public async disconnectPhysical() {
    if (this.writer) {
      await this.sendCommand('STOP\n');
      this.writer.releaseLock();
    }
    if (this.serialPort) {
      await this.serialPort.close();
    }
    this.physicalConnected = false;
    this.serialPort = null;
    this.writer = null;
  }

  private async sendCommand(cmd: string) {
    if (this.physicalConnected && this.writer) {
      try {
        await this.writer.write(cmd);
      } catch (e) {
        console.error('Failed to write to Serial port:', e);
      }
    }
  }

  // --- Abstraction Methods called by Direct Controls and Block Executor ---

  public async moveForward(distanceCm: number = 20): Promise<void> {
    if (this.physicalConnected) {
      await this.sendCommand(`FWD:${distanceCm}:${this.speed}\n`);
    }
    if (this.virtualCallback) {
      await this.virtualCallback('move_forward', { distance: distanceCm, speed: this.speed });
    }
  }

  public async moveBackward(distanceCm: number = 20): Promise<void> {
    if (this.physicalConnected) {
      await this.sendCommand(`BWD:${distanceCm}:${this.speed}\n`);
    }
    if (this.virtualCallback) {
      await this.virtualCallback('move_backward', { distance: distanceCm, speed: this.speed });
    }
  }

  public async turnLeft(angleDeg: number = 90): Promise<void> {
    if (this.physicalConnected) {
      await this.sendCommand(`TL:${angleDeg}:${this.speed}\n`);
    }
    if (this.virtualCallback) {
      await this.virtualCallback('turn_left', { angle: angleDeg, speed: this.speed });
    }
  }

  public async turnRight(angleDeg: number = 90): Promise<void> {
    if (this.physicalConnected) {
      await this.sendCommand(`TR:${angleDeg}:${this.speed}\n`);
    }
    if (this.virtualCallback) {
      await this.virtualCallback('turn_right', { angle: angleDeg, speed: this.speed });
    }
  }

  public async stop(): Promise<void> {
    if (this.physicalConnected) {
      await this.sendCommand(`STOP\n`);
    }
    if (this.virtualCallback) {
      await this.virtualCallback('stop');
    }
  }

  public async setSpeed(speedPercent: number): Promise<void> {
    this.speed = Math.max(10, Math.min(100, speedPercent));
    if (this.physicalConnected) {
      await this.sendCommand(`SPD:${this.speed}\n`);
    }
    if (this.virtualCallback) {
      await this.virtualCallback('set_speed', { speed: this.speed });
    }
  }

  public async setLED(color: LedColor): Promise<void> {
    if (this.physicalConnected) {
      await this.sendCommand(`LED:${color.toUpperCase()}\n`);
    }
    if (this.virtualCallback) {
      await this.virtualCallback('set_led', { color });
    }
  }

  public async readDistance(): Promise<number> {
    if (this.virtualCallback) {
      const dist = await this.virtualCallback('read_distance');
      return typeof dist === 'number' ? dist : 999;
    }
    return 999;
  }
}
