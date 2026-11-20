import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { RawNotification } from './types';
import { processNotification, ProcessedCaptureResult } from './parserEngine';

const { SmartCaptureModule } = NativeModules;

export interface SmartCaptureDiagnostics {
  isServiceAvailable: boolean;
  isPermissionGranted: boolean;
  supportedPackagesCount: number;
}

export class SmartCaptureBridgeService {
  private static emitter: NativeEventEmitter | null = null;
  private static subscription: any = null;

  static isAvailable(): boolean {
    return Platform.OS === 'android' && !!SmartCaptureModule;
  }

  static async checkPermission(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await SmartCaptureModule.isPermissionGranted();
    } catch (e) {
      console.warn('SmartCapture checkPermission failed:', e);
      return false;
    }
  }

  static async openSettings(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await SmartCaptureModule.openNotificationSettings();
    } catch (e) {
      console.warn('SmartCapture openSettings failed:', e);
      return false;
    }
  }

  /**
   * Reads buffered notifications stored while app was in background or closed.
   */
  static async syncBufferedNotifications(
    onProcessed?: (result: ProcessedCaptureResult) => void
  ): Promise<ProcessedCaptureResult[]> {
    if (!this.isAvailable()) return [];

    try {
      const items: RawNotification[] = await SmartCaptureModule.getPendingNotifications();
      const results: ProcessedCaptureResult[] = [];

      for (const item of items) {
        const res = await processNotification(item);
        results.push(res);
        if (onProcessed) onProcessed(res);
      }

      return results;
    } catch (e) {
      console.warn('SmartCapture syncBufferedNotifications failed:', e);
      return [];
    }
  }

  /**
   * Starts listening to live notifications dispatched from Android native service.
   */
  static startLiveListener(
    onCapture: (res: ProcessedCaptureResult) => void
  ): () => void {
    if (!this.isAvailable()) return () => {};

    if (!this.emitter) {
      this.emitter = new NativeEventEmitter(SmartCaptureModule);
    }

    if (this.subscription) {
      this.subscription.remove();
    }

    this.subscription = this.emitter.addListener(
      'onSmartCaptureNotification',
      async (raw: any) => {
        try {
          const res = await processNotification(raw);
          onCapture(res);
        } catch (err) {
          console.warn('SmartCapture live event error:', err);
        }
      }
    );

    return () => {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
    };
  }
}
