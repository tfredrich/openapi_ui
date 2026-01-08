import { create } from "zustand";
import { ConsoleConfig } from "../../schemas/config.schema";

type ConfigState = {
  config: ConsoleConfig | null;
  setConfig: (config: ConsoleConfig) => void;
};

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
}));
