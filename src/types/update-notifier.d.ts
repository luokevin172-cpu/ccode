declare module 'update-notifier' {
  interface Options {
    pkg: { name: string; version: string };
    updateCheckInterval?: number;
  }
  interface NotifyOptions {
    isGlobal?: boolean;
  }
  interface Notifier {
    notify(options?: NotifyOptions): void;
  }
  export default function updateNotifier(options: Options): Notifier;
}
