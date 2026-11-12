import { create } from 'zustand';

type MonitorNoticeState = {
  message: string | null;
  setMessage: (message: string) => void;
  clear: () => void;
};

export const useMonitorNotice = create<MonitorNoticeState>((set) => ({
  message: null,
  setMessage: (message) => set({ message }),
  clear: () => set({ message: null }),
}));
